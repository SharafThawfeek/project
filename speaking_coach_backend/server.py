from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import crud, models
from pydantic import BaseModel
from auth import create_access_token, get_current_user
from crud import verify_password
from orchestrator import orchestrate_analysis
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from agents.chatbot import create_chatbot
from agents.speech_generator import create_speech_generator
from agents.speech_generator import estimate_word_count
import os, tempfile

# ------------------------------------------------
# 🌍 Setup
# ------------------------------------------------
load_dotenv()
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Speaking Coach API", version="2.0")

# ✅ Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production: ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------
# 🗄️ Database Dependency
# ------------------------------------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------------------------------
# 📦 Schemas
# ------------------------------------------------
class UserSignup(BaseModel):
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class SpeechInput(BaseModel):
    transcript: str


class ChatRequest(BaseModel):
    session_id: str
    message: str


# ------------------------------------------------
# 🧠 Groq Whisper Setup
# ------------------------------------------------
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ------------------------------------------------
# 🧱 ROUTES
# ------------------------------------------------

# ✅ User Signup
@app.post("/signup")
def signup(user: UserSignup, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, user.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = crud.create_user(db, user.username, user.email, user.password)
    return {
        "id": new_user.id,
        "username": new_user.username,
        "email": new_user.email,
    }


# ✅ User Login
@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, user.email)
    if not db_user or not verify_password(user.password, db_user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}


# ✅ Analyze Speech (Text Input)
@app.post("/analyze")
def analyze(
    speech: SpeechInput,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_user = crud.get_user_by_email(db, current_user)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    try:
        feedback = orchestrate_analysis(speech.transcript)
        speech_id = crud.save_speech(db, db_user.id, speech.transcript, feedback)
        return {"speech_id": speech_id, "feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


# ✅ Analyze Recorded Audio (Groq Whisper)
@app.post("/analyze_audio")
async def analyze_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_user = crud.get_user_by_email(db, current_user)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as audio_file:
            result = groq_client.audio.transcriptions.create(
                file=audio_file,
                model="whisper-large-v3",
            )
        transcript = result.text.strip()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")
    finally:
        os.remove(tmp_path)

    feedback = orchestrate_analysis(transcript)
    speech_id = crud.save_speech(db, db_user.id, transcript, feedback)

    return {"speech_id": speech_id, "transcript": transcript, "feedback": feedback}


# ✅ User History
@app.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_user = crud.get_user_by_email(db, current_user)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    speeches = crud.get_user_speeches(db, db_user.id)
    return {
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "email": db_user.email,
        },
        "speeches": speeches,
    }


# ✅ Analytics
@app.get("/analytics")
def analytics(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_user = crud.get_user_by_email(db, current_user)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    analytics_data = crud.get_user_analytics(db, db_user.id)
    return analytics_data


# ✅ Progress Tracking
@app.get("/progress")
def progress(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user),
):
    db_user = crud.get_user_by_email(db, current_user)
    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    progress_data = crud.get_progress_over_time(db, db_user.id)
    return {
        "user": db_user.username,
        "total_sessions": len(progress_data),
        "progress": progress_data or [],
    }


# ✅ Chatbot
chatbot = create_chatbot()

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Intelligent chatbot endpoint that handles contextual dialogue.
    """
    try:
        response = chatbot.invoke(
            {"input": request.message},
            config={"configurable": {"session_id": request.session_id}},
        )
        return {"answer": response.get("answer", "⚠️ No response from AI.")}
    except Exception as e:
        print("❌ Chatbot Error:", e)
        return {"error": str(e)}


# ✅ Speech Generator
speech_llm = create_speech_generator()

@app.post("/generate-speech")
async def generate_speech(request: Request):
    data = await request.json()
    user_input = data.get("input", "")
    session_id = data.get("session_id", "default")

    if not user_input:
        raise HTTPException(status_code=400, detail="No input provided.")

    # 🧮 Convert duration to word count
    target_words = estimate_word_count(user_input)
    user_input += f" (Please write approximately {target_words} words.)"

    response = speech_llm.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}},
    )

    answer = response.get("answer") if isinstance(response, dict) else getattr(response, "content", str(response))
    return {"answer": answer.strip()}

@app.put("/update_profile")
def update_profile(data: dict, current_user: dict = Depends(get_current_user)):
    username = data.get("username")
    email = data.get("email")
    # ✅ Update user in database (example)
    user = db["users"].find_one_and_update(
        {"_id": current_user["_id"]},
        {"$set": {"username": username, "email": email}},
        return_document=True,
    )
    return {"message": "Profile updated", "user": user}

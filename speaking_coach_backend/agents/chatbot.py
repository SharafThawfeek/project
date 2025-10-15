from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_loaders.text import TextLoader
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain, create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_huggingface import HuggingFaceEmbeddings
import os
from dotenv import load_dotenv

# 🔹 Load API keys
load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
os.environ["HF_TOKEN"] = os.getenv("HF_TOKEN")

def create_chatbot():
    """Create the OpenSpeak AI Coach Chatbot with contextual memory and retrieval."""
    
    # 🧠 Step 1: Initialize Groq LLM
    llm = ChatGroq(
        groq_api_key=groq_api_key,
        model="mixtral-8x7b-32768",  # ✅ Correct and active model
        temperature=0.3,
    )

    # 🗂 Step 2: Load context
    context_path = os.path.join(os.path.dirname(__file__), "context.txt")
    if not os.path.exists(context_path):
        raise FileNotFoundError(f"❌ context.txt not found at {context_path}")

    loader = TextLoader(context_path, encoding="utf-8")
    docs = loader.load()

    # 🔹 Split into chunks for better retrieval
    splitter = RecursiveCharacterTextSplitter(chunk_size=900, chunk_overlap=200)
    splits = splitter.split_documents(docs)

    # 🔍 Step 3: Create embeddings & vector DB
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    vector_db = Chroma.from_documents(
        embedding=embeddings,
        documents=splits,
        collection_name="openspeak-chatbot",
        persist_directory="./.chroma_chatbot"
    )

    retriever = vector_db.as_retriever(search_kwargs={"k": 4})

    # 🧾 Step 4: Reformulation prompt (history-aware)
    reformulate_prompt = (
        "Given the chat history and the latest user question, "
        "rephrase the question into a standalone, clear query without answering it. "
        "Keep it short and unambiguous."
    )

    ref_prompt = ChatPromptTemplate.from_messages([
        ("system", reformulate_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ])

    history_aware_retriever = create_history_aware_retriever(llm, retriever, ref_prompt)

    # 💬 Step 5: System prompt for chatbot personality
    system_prompt = (
        "You are OpenSpeak — a professional AI Speaking Coach. "
        "You help users improve public speaking, analyze their speech, and use the AI platform effectively. "
        "Use the retrieved knowledge below to answer clearly and helpfully. "
        "Never mention the context or retrieval. "
        "Keep answers concise, structured, and encouraging. "
        "If the user asks for help, provide step-by-step guidance. "
        "\n\nContext:\n{context}"
    )

    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "{input}"),
    ])

    doc_chain = create_stuff_documents_chain(llm, qa_prompt)
    rag_chain = create_retrieval_chain(history_aware_retriever, doc_chain)

    # 🧩 Step 6: Session-based memory
    session_store = {}

    def get_session_history(session_id: str) -> BaseChatMessageHistory:
        if session_id not in session_store:
            session_store[session_id] = ChatMessageHistory()
        return session_store[session_id]

    conversational_chain = RunnableWithMessageHistory(
        rag_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    )

    print("✅ OpenSpeak Chatbot Initialized (Groq: mixtral-8x7b-32768)")
    return conversational_chain

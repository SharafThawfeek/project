from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain.prompts import ChatPromptTemplate,MessagesPlaceholder
from langchain_community.document_loaders.text import TextLoader
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables import RunnableWithMessageHistory
from langchain_groq import ChatGroq
from langchain.chains import create_retrieval_chain,create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_huggingface import HuggingFaceEmbeddings


import os 
from dotenv import load_dotenv

load_dotenv()
groq_api_key = os.getenv("GROQ_API_KEY")
os.environ["HF_TOKEN"]=os.getenv("HF_TOKEN")


def create_chatbot():
    llm=ChatGroq(groq_api_key=groq_api_key,model="Gemma2-9b-It")
    
    loader = TextLoader("context.txt", encoding="utf-8")
    docs=loader.load()
    splitter=RecursiveCharacterTextSplitter(chunk_size=800,chunk_overlap=200)
    splits=splitter.split_documents(docs)
    
    embeddings=HuggingFaceEmbeddings(model="all-MiniLM-L6-v2")
    vector_db=Chroma.from_documents(embedding=embeddings,documents=splits)
    
    retriever=vector_db.as_retriever()
    q_prompt=(
        "Given a chat history and the latest user question,"
        "which might reference context in chat histroy,"
        "reformulate it into a standalone question that can be understood,"
        "without the chat history, do not answer the question,"
        "just reformulate it if needed"
        )
    
    ref_prompt=ChatPromptTemplate.from_messages(
        [
            ("system",q_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human","{input}"),
        ]
    )

    history_ret=create_history_aware_retriever(llm,retriever,ref_prompt)

    system_prompt = (
        "You are an intelligent AI assistant designed to help users understand and use the AI Speaking Coach platform. "
        "You specialize in answering questions about public speaking, voice analysis, grammar feedback, and how to use different agents or features of the system. "
        "Always use the retrieved context below to provide accurate and relevant answers. "
        "Never mention or reference the context itself. "
        "Be clear, direct, and confident in your responses. "
        "If the user asks for guidance, explain it step-by-step. "
        "Keep sentences short and professional. "
        "Avoid filler phrases like 'according to the context' or 'as mentioned earlier.' "
        "If the question is unclear, politely ask for clarification. "
        "End responses with encouragement or a helpful tip when appropriate. "
        "\n\nRetrieved context:\n{context}"
    )


    prompt=ChatPromptTemplate.from_messages(
        [
            ("system",system_prompt),
            ("human","{input}"),
        ]
    )

    doc_chain=create_stuff_documents_chain(llm,prompt)
    ret_chain=create_retrieval_chain(history_ret,doc_chain)

    store={}
    def get_session_history(session_id: str)-> BaseChatMessageHistory:
        if session_id not in store:
            store[session_id]=ChatMessageHistory()
        return store[session_id]
    
    conversational_rag_chain=RunnableWithMessageHistory(
        ret_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
        )
    
    return conversational_rag_chain




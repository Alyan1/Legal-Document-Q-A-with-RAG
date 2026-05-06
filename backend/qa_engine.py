import os
from dotenv import load_dotenv
from google import genai
from backend.database import collection, embedding_model

# Load the .env file to get your GEMINI_API_KEY
load_dotenv()

# Initialize the Google GenAI Client
client = genai.Client()


def search_documents(query: str, n_results: int = 3, filename: str = None) -> list[str]:
    """
    Embeds the user's question and searches ChromaDB for the most relevant text chunks.
    Optionally filters by a specific filename.
    """
    print(f"Searching database for: '{query}'")

    # 1. Convert the question into an embedding
    query_embedding = embedding_model.encode(query).tolist()

    # 2. Query ChromaDB with or without the metadata filter
    if filename and filename != "All Documents":
        print(f"Applying filter: Only searching inside '{filename}'")
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where={"source": filename}  # <-- THIS IS THE MAGIC FILTER
        )
    else:
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )

    # Flatten the results
    if results['documents'] and results['documents'][0]:
        return results['documents'][0]
    else:
        return []


def ask_question(query: str, filename: str = None) -> dict:
    """
    The main RAG pipeline: Retrieves context, builds the prompt, and asks Gemini.
    """
    # 1. Retrieve the relevant chunks, passing the filename filter down
    relevant_chunks = search_documents(query, filename=filename)

    if not relevant_chunks:
        return {
            "answer": f"I couldn't find any relevant information regarding your question in the selected document(s).",
            "sources": []
        }

    # 2. Combine the chunks into a single context string
    context = "\n\n---\n\n".join(relevant_chunks)

    # 3. Build the strict prompt
    prompt = f"""
    You are a highly accurate, multilingual document assistant. 
    Answer the user's question based ONLY on the context provided below. 
    If the context does not contain the answer, say "I cannot answer this based on the provided documents."
    Do not use outside knowledge. Answer in the same language as the user's question.

    Context:
    {context}

    Question: {query}
    """

    # 4. Generate the answer using Gemini
    print("Generating answer with Gemini 2.5 Flash...")
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=prompt
    )

    return {
        "answer": response.text,
        "sources": relevant_chunks
    }
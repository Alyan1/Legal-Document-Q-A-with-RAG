import chromadb
from sentence_transformers import SentenceTransformer

# 1. Initialize the Multilingual Embedding Model
# We load this globally so it only downloads/loads once when the server starts.
print("Loading multilingual embedding model... (This might take a minute the first time)")
embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# 2. Initialize ChromaDB
# PersistentClient saves your database to a local folder so you don't lose data when you restart.
chroma_client = chromadb.PersistentClient(path="./chroma_data")

# Create a collection (think of this as a table in a database)
collection = chroma_client.get_or_create_collection(name="multilingual_documents")


def add_documents_to_db(chunks: list[str], filename: str) -> int:
    """
    Takes a list of text chunks, converts them to vector embeddings,
    and saves them to the local ChromaDB.
    """
    if not chunks:
        return 0

    print(f"Embedding {len(chunks)} chunks for {filename}...")

    # Generate embeddings using the local model
    # .tolist() is required because ChromaDB expects standard Python lists, not numpy arrays
    embeddings = embedding_model.encode(chunks).tolist()

    # Create unique IDs and metadata for each chunk
    ids = [f"{filename}_chunk_{i}" for i in range(len(chunks))]
    metadatas = [{"source": filename} for _ in range(len(chunks))]

    # Insert into ChromaDB
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
        ids=ids
    )

    print(f"Successfully added {len(chunks)} chunks to the database.")
    return len(chunks)

def delete_document_from_db(filename: str) -> bool:
    """
    Deletes all vector chunks associated with a specific filename from ChromaDB.
    """
    try:
        print(f"Deleting document '{filename}' from database...")
        collection.delete(
            where={"source": filename}
        )
        return True
    except Exception as e:
        print(f"Error deleting document: {e}")
        return False
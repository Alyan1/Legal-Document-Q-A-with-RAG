import io
import pdfplumber


def extract_and_chunk_pdf(file_bytes: bytes) -> list[str]:
    """
    Reads a PDF from a byte stream, extracts the text page by page,
    and chunks it into paragraphs.
    """
    chunks = []

    # Open the PDF directly from the byte stream
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            text = page.extract_text()

            if text:
                # Basic chunking strategy: Split by double newlines to isolate paragraphs
                paragraphs = text.split('\n\n')

                for p in paragraphs:
                    cleaned_p = p.strip()

                    # Filter out tiny, meaningless chunks (like isolated numbers or symbols)
                    if len(cleaned_p) > 20:
                        # Replace internal single newlines with spaces so sentences flow naturally
                        cleaned_p = cleaned_p.replace('\n', ' ')
                        chunks.append(cleaned_p)

    return chunks

# --- Optional: Local Test Block ---
# If you want to test this immediately without building the API yet,
# drop a PDF named 'test.pdf' in your folder and uncomment the code below:

# if __name__ == "__main__":
#     with open("G.K ABOUT PAKISTAN.pdf", "rb") as f:
#         sample_bytes = f.read()
#         result = extract_and_chunk_pdf(sample_bytes)
#         print(f"Successfully extracted {len(result)} chunks!")
#         if result:
#             print("--- Preview of Chunk 1 ---")
#             print(result[0])  
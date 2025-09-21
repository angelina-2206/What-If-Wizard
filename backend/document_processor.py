"""
Hybrid Document Processor for What If Wizard
Uses ByteZ API for LLM and handles embeddings with fallback options
"""

import os
import uuid
import PyPDF2
from typing import List, Dict, Any
import chromadb
from chromadb.config import Settings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
import numpy as np
from sentence_transformers import SentenceTransformer
import warnings
warnings.filterwarnings("ignore")


class HybridDocumentProcessor:
    """Handles document processing with ByteZ LLM and fallback embedding options."""
    
    def __init__(self):
        """Initialize the hybrid document processor."""
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Try to initialize embeddings with fallback options
        self.embeddings = self._initialize_embeddings()
        
        # Initialize text splitter for chunking documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Store active collections
        self.collections = {}
        
        print(f"✅ Hybrid Document Processor initialized with {type(self.embeddings).__name__}")
    
    def _initialize_embeddings(self):
        """Initialize embeddings with fallback options."""
        # Option 1: Try OpenAI embeddings if key is valid
        openai_key = os.getenv('OPENAI_API_KEY')
        if openai_key and not openai_key.startswith('sk-abcdef') and len(openai_key) > 20:
            try:
                print("🔄 Trying OpenAI embeddings...")
                embeddings = OpenAIEmbeddings(model="text-embedding-ada-002")
                # Test with a simple embedding
                test_embedding = embeddings.embed_query("test")
                if len(test_embedding) > 0:
                    print("✅ OpenAI embeddings initialized successfully")
                    return embeddings
            except Exception as e:
                print(f"⚠️ OpenAI embeddings failed: {str(e)}")
        
        # Option 2: Try ByteZ API for embeddings (if they support it)
        bytez_key = os.getenv('BYTEZ_API_KEY')
        if bytez_key:
            try:
                print("🔄 Trying ByteZ API for embeddings...")
                embeddings = OpenAIEmbeddings(
                    model="text-embedding-ada-002",
                    openai_api_base="https://api.bytez.com/v1",
                    openai_api_key=bytez_key
                )
                # Test with a simple embedding
                test_embedding = embeddings.embed_query("test")
                if len(test_embedding) > 0:
                    print("✅ ByteZ embeddings initialized successfully")
                    return embeddings
            except Exception as e:
                print(f"⚠️ ByteZ embeddings failed: {str(e)}")
        
        # Option 3: Fallback to local sentence-transformers
        try:
            print("🔄 Falling back to local SentenceTransformer...")
            return LocalEmbeddings()
        except Exception as e:
            print(f"⚠️ Local embeddings failed: {str(e)}")
        
        # Option 4: Final fallback to simple embeddings
        print("⚠️ Using simple hash-based embeddings as final fallback")
        return SimpleEmbeddings()
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from a PDF file."""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                
                # Extract text from each page
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text.strip():  # Only add non-empty pages
                        text += f"\n--- Page {page_num + 1} ---\n"
                        text += page_text + "\n"
            
            if not text.strip():
                raise ValueError("No text could be extracted from the PDF")
            
            return text.strip()
        
        except Exception as e:
            raise Exception(f"Error extracting text from PDF: {str(e)}")
    
    def chunk_text(self, text: str) -> List[str]:
        """Split text into chunks for vector storage."""
        chunks = self.text_splitter.split_text(text)
        return [chunk.strip() for chunk in chunks if chunk.strip()]
    
    def process_document(self, file_path: str, filename: str) -> str:
        """Process a document: extract text, chunk it, and store in vector database."""
        try:
            # Generate unique document ID
            document_id = str(uuid.uuid4())
            
            # Extract text from PDF
            print(f"Extracting text from {filename}...")
            text = self.extract_text_from_pdf(file_path)
            
            # Chunk the text
            print(f"Chunking text into smaller segments...")
            chunks = self.chunk_text(text)
            print(f"Created {len(chunks)} text chunks")
            
            # Create collection name (sanitize filename)
            collection_name = f"doc_{document_id.replace('-', '_')}"
            
            # Create ChromaDB collection
            collection = self.client.create_collection(
                name=collection_name,
                metadata={"filename": filename, "document_id": document_id}
            )
            
            # Prepare documents with metadata
            documents = []
            metadatas = []
            ids = []
            
            for i, chunk in enumerate(chunks):
                documents.append(chunk)
                metadatas.append({
                    "document_id": document_id,
                    "filename": filename,
                    "chunk_index": i,
                    "chunk_count": len(chunks)
                })
                ids.append(f"{document_id}_chunk_{i}")
            
            # Add documents to collection with embeddings
            print("Computing embeddings and storing in vector database...")
            
            # Get embeddings for all chunks
            if hasattr(self.embeddings, 'embed_documents'):
                embeddings = self.embeddings.embed_documents(documents)
            else:
                embeddings = [self.embeddings.embed_query(doc) for doc in documents]
            
            # Add to ChromaDB
            collection.add(
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            # Store collection reference
            self.collections[document_id] = collection
            
            print(f"Document {filename} processed successfully with ID: {document_id}")
            return document_id
        
        except Exception as e:
            raise Exception(f"Error processing document {filename}: {str(e)}")
    
    def get_collection(self, document_id: str):
        """Get the ChromaDB collection for a document."""
        if document_id in self.collections:
            return self.collections[document_id]
        
        # Try to retrieve existing collection
        collection_name = f"doc_{document_id.replace('-', '_')}"
        try:
            collection = self.client.get_collection(name=collection_name)
            self.collections[document_id] = collection
            return collection
        except Exception:
            raise ValueError(f"No collection found for document ID: {document_id}")
    
    def search_similar_chunks(self, query: str, document_id: str, k: int = 5) -> List[Dict[str, Any]]:
        """Search for similar chunks in the document."""
        try:
            collection = self.get_collection(document_id)
            
            # Get query embedding
            query_embedding = self.embeddings.embed_query(query)
            
            # Search for similar chunks
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=k,
                include=["documents", "metadatas", "distances"]
            )
            
            # Format results
            formatted_results = []
            for i in range(len(results['documents'][0])):
                formatted_results.append({
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                    'similarity_score': 1 - results['distances'][0][i],  # Convert distance to similarity
                    'chunk_index': results['metadatas'][0][i].get('chunk_index', i)
                })
            
            # Sort by similarity score (highest first)
            formatted_results.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            return formatted_results
        
        except Exception as e:
            raise Exception(f"Error searching document: {str(e)}")
    
    def clear_document(self, document_id: str) -> bool:
        """Clear/delete a document from the vector store."""
        try:
            collection_name = f"doc_{document_id.replace('-', '_')}"
            
            # Delete the collection
            self.client.delete_collection(name=collection_name)
            
            # Remove from local storage
            if document_id in self.collections:
                del self.collections[document_id]
            
            print(f"Document {document_id} cleared successfully")
            return True
        
        except Exception as e:
            print(f"Error clearing document {document_id}: {str(e)}")
            return False


class LocalEmbeddings:
    """Local embeddings using sentence-transformers."""
    
    def __init__(self):
        try:
            # Use a lightweight model for embeddings
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✅ Local SentenceTransformer model loaded")
        except Exception as e:
            print(f"❌ Failed to load SentenceTransformer: {e}")
            raise
    
    def embed_query(self, text: str) -> List[float]:
        """Embed a single text."""
        embedding = self.model.encode(text)
        return embedding.tolist()
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple documents."""
        embeddings = self.model.encode(texts)
        return embeddings.tolist()


class SimpleEmbeddings:
    """Simple hash-based embeddings as final fallback."""
    
    def __init__(self):
        print("⚠️ Using simple hash-based embeddings (limited functionality)")
    
    def embed_query(self, text: str) -> List[float]:
        """Create a simple hash-based embedding."""
        import hashlib
        
        # Create a simple vector based on text characteristics
        text_hash = hashlib.md5(text.encode()).hexdigest()
        
        # Convert hash to a fixed-size vector (384 dimensions to match sentence transformers)
        vector = []
        for i in range(0, len(text_hash), 2):
            hex_pair = text_hash[i:i+2]
            vector.append(int(hex_pair, 16) / 255.0)  # Normalize to 0-1
        
        # Pad or truncate to 384 dimensions
        while len(vector) < 384:
            vector.extend(vector[:384-len(vector)])
        
        return vector[:384]
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Embed multiple documents."""
        return [self.embed_query(text) for text in texts]
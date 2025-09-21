"""
Document Processor for What If Wizard
Handles PDF text extraction and vector storage using ChromaDB
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


class DocumentProcessor:
    """Handles document processing, text extraction, and vector storage."""
    
    def __init__(self):
        """Initialize the document processor with ChromaDB and OpenAI embeddings."""
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        
        # Initialize OpenAI embeddings
        self.embeddings = OpenAIEmbeddings(
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        
        # Initialize text splitter for chunking documents
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        
        # Store active collections
        self.collections = {}
    
    def extract_text_from_pdf(self, file_path: str) -> str:
        """
        Extract text from a PDF file.
        
        Args:
            file_path (str): Path to the PDF file
            
        Returns:
            str: Extracted text from the PDF
        """
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
        """
        Split text into chunks for vector storage.
        
        Args:
            text (str): Text to be chunked
            
        Returns:
            List[str]: List of text chunks
        """
        chunks = self.text_splitter.split_text(text)
        return [chunk.strip() for chunk in chunks if chunk.strip()]
    
    def process_document(self, file_path: str, filename: str) -> str:
        """
        Process a document: extract text, chunk it, and store in vector database.
        
        Args:
            file_path (str): Path to the document file
            filename (str): Original filename
            
        Returns:
            str: Document ID for future reference
        """
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
            embeddings = self.embeddings.embed_documents(documents)
            
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
        """
        Get the ChromaDB collection for a document.
        
        Args:
            document_id (str): Document ID
            
        Returns:
            Collection: ChromaDB collection
        """
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
        """
        Search for similar chunks in the document.
        
        Args:
            query (str): Search query
            document_id (str): Document ID to search in
            k (int): Number of similar chunks to return
            
        Returns:
            List[Dict[str, Any]]: List of similar chunks with metadata
        """
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
        """
        Clear/delete a document from the vector store.
        
        Args:
            document_id (str): Document ID to clear
            
        Returns:
            bool: True if successful
        """
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
    
    def get_document_stats(self, document_id: str) -> Dict[str, Any]:
        """
        Get statistics about a processed document.
        
        Args:
            document_id (str): Document ID
            
        Returns:
            Dict[str, Any]: Document statistics
        """
        try:
            collection = self.get_collection(document_id)
            count = collection.count()
            
            # Get collection metadata
            collection_info = collection.get(limit=1, include=["metadatas"])
            metadata = collection_info['metadatas'][0] if collection_info['metadatas'] else {}
            
            return {
                'document_id': document_id,
                'filename': metadata.get('filename', 'Unknown'),
                'chunk_count': count,
                'total_chunks': metadata.get('chunk_count', count)
            }
        
        except Exception as e:
            raise Exception(f"Error getting document stats: {str(e)}")
"""
Question Answerer for What If Wizard
Handles RAG (Retrieval-Augmented Generation) question answering using OpenAI
"""

import os
from typing import Dict, List, Any
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from document_processor import DocumentProcessor


class QuestionAnswerer:
    """Handles question answering using RAG with OpenAI."""
    
    def __init__(self):
        """Initialize the question answerer with OpenAI chat model."""
        # Initialize OpenAI chat model
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.1,  # Low temperature for more factual responses
            openai_api_key=os.getenv('OPENAI_API_KEY')
        )
        
        # Initialize document processor for retrieval
        self.document_processor = DocumentProcessor()
        
        # Create prompt template for legal document Q&A
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", self._get_system_prompt()),
            ("human", self._get_human_prompt())
        ])
    
    def _get_system_prompt(self) -> str:
        """Get the system prompt for legal document analysis."""
        return """You are a specialized AI legal assistant called "What If Wizard" that helps users understand legal documents by answering questions based on the document's content.

Your role is to:
1. Analyze the provided document excerpts carefully
2. Answer questions based ONLY on the information contained in the document
3. Provide clear, accurate, and helpful responses about legal terms, obligations, and conditions
4. Handle "what-if" scenarios by explaining how different situations would be addressed according to the document
5. Cite specific sections or clauses when possible

Important guidelines:
- Base your answers EXCLUSIVELY on the provided document content
- If information is not in the document, clearly state that it's not covered
- Use clear, plain language that non-lawyers can understand
- Be precise about what the document says vs. what it doesn't address
- For conditional questions, explain the relevant clauses and their implications
- Never provide general legal advice - only explain what the specific document states

If you cannot find relevant information in the provided excerpts, say so clearly and suggest the user might need to consult other parts of the document or seek legal counsel."""
    
    def _get_human_prompt(self) -> str:
        """Get the human prompt template."""
        return """Based on the following excerpts from a legal document, please answer the question below.

Document excerpts:
{context}

Question: {question}

Please provide a clear, accurate answer based on the document content. If the information needed to answer the question is not present in the provided excerpts, please state that clearly."""
    
    def answer_question(self, question: str, document_id: str) -> Dict[str, Any]:
        """
        Answer a question about a document using RAG.
        
        Args:
            question (str): The question to answer
            document_id (str): ID of the document to search in
            
        Returns:
            Dict[str, Any]: Answer with sources and confidence
        """
        try:
            # Retrieve relevant document chunks
            relevant_chunks = self.document_processor.search_similar_chunks(
                query=question,
                document_id=document_id,
                k=5  # Get top 5 most relevant chunks
            )
            
            if not relevant_chunks:
                return {
                    'answer': "I couldn't find relevant information in the document to answer your question. Please make sure the document has been properly processed.",
                    'sources': [],
                    'confidence': 'low'
                }
            
            # Combine relevant chunks into context
            context_parts = []
            sources = []
            
            for i, chunk in enumerate(relevant_chunks):
                # Only include chunks with reasonable similarity
                if chunk['similarity_score'] > 0.3:  # Threshold for relevance
                    context_parts.append(f"[Excerpt {i+1}]\n{chunk['content']}")
                    sources.append({
                        'chunk_index': chunk['chunk_index'],
                        'similarity_score': chunk['similarity_score'],
                        'content_preview': chunk['content'][:200] + "..." if len(chunk['content']) > 200 else chunk['content']
                    })
            
            if not context_parts:
                return {
                    'answer': "I couldn't find sufficiently relevant information in the document to answer your question confidently.",
                    'sources': [],
                    'confidence': 'low'
                }
            
            context = "\n\n".join(context_parts)
            
            # Generate answer using the language model
            prompt = self.prompt_template.format_messages(
                context=context,
                question=question
            )
            
            response = self.llm.invoke(prompt)
            answer = response.content
            
            # Determine confidence based on similarity scores
            avg_similarity = sum(chunk['similarity_score'] for chunk in relevant_chunks[:3]) / min(3, len(relevant_chunks))
            confidence = self._determine_confidence(avg_similarity, len(context_parts))
            
            return {
                'answer': answer,
                'sources': sources,
                'confidence': confidence,
                'context_chunks_used': len(context_parts)
            }
        
        except Exception as e:
            return {
                'answer': f"I encountered an error while processing your question: {str(e)}",
                'sources': [],
                'confidence': 'low'
            }
    
    def _determine_confidence(self, avg_similarity: float, num_sources: int) -> str:
        """
        Determine confidence level based on similarity scores and number of sources.
        
        Args:
            avg_similarity (float): Average similarity score of retrieved chunks
            num_sources (int): Number of relevant sources found
            
        Returns:
            str: Confidence level (high, medium, low)
        """
        if avg_similarity > 0.8 and num_sources >= 3:
            return 'high'
        elif avg_similarity > 0.6 and num_sources >= 2:
            return 'medium'
        else:
            return 'low'
    
    def get_suggested_questions(self, document_id: str) -> List[str]:
        """
        Generate suggested questions based on document content.
        
        Args:
            document_id (str): Document ID
            
        Returns:
            List[str]: List of suggested questions
        """
        # Get a sample of document content
        try:
            collection = self.document_processor.get_collection(document_id)
            sample_results = collection.get(limit=3, include=["documents"])
            
            if not sample_results['documents']:
                return self._get_generic_legal_questions()
            
            sample_content = " ".join(sample_results['documents'])
            
            # Create prompt for generating questions
            question_prompt = f"""Based on this legal document excerpt, suggest 5 relevant questions that someone might ask about this document:

{sample_content[:2000]}

Generate practical, specific questions that would help someone understand their rights, obligations, and "what-if" scenarios related to this document. Format as a simple list."""
            
            response = self.llm.invoke([("human", question_prompt)])
            
            # Parse the response to extract questions
            suggested_questions = []
            for line in response.content.split('\n'):
                line = line.strip()
                if line and (line.startswith('-') or line.startswith('•') or line[0].isdigit()):
                    # Clean up the question
                    question = line.lstrip('- •0123456789. ')
                    if question.endswith('?'):
                        suggested_questions.append(question)
            
            return suggested_questions[:5] if suggested_questions else self._get_generic_legal_questions()
        
        except Exception:
            return self._get_generic_legal_questions()
    
    def _get_generic_legal_questions(self) -> List[str]:
        """Return generic legal document questions."""
        return [
            "What are my main obligations under this document?",
            "What happens if I breach the terms of this agreement?",
            "What are the termination conditions?",
            "What fees or payments are required?",
            "What are the key dates and deadlines I need to know about?"
        ]
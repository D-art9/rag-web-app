/**
 * RAG Pipeline Configuration
 */
export const RAGConfig = {
    // Threshold for retrieval confidence (0.0 to 1.0)
    // Research shows all-MiniLM-L6-v2 produces mean scores of 0.37-0.41
    // Lowering to 0.15 to ensure recall for user's specific content type
    // We rely on the LLM to filter out irrelevant context if needed
    confidenceThreshold: 0.15,

    // Fallback response for low-confidence queries
    fallbackMessage: "I couldn't find relevant information about that in this video.",
};

export default RAGConfig;

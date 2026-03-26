/**
 * RAG Pipeline Configuration
 */
export const RAGConfig = {
    // Threshold for retrieval confidence (0.0 to 1.0)
    // all-MiniLM-L6-v2 produces mean scores of 0.37–0.41 on matched content.
    // 0.08 ensures we catch relevant content while rejecting totally unrelated queries.
    confidenceThreshold: 0.08,

    // Fallback response when no relevant content is found
    fallbackMessage: "I couldn't find relevant information about that in this video.",
};

export default RAGConfig;

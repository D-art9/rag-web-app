import axios from 'axios';

export interface NewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

export const newsService = {
    /**
     * Fetches top headlines for a specific category using GNews API.
     */
    fetchNewsByCategory: async (category: string): Promise<NewsArticle[]> => {
        const apiKey = process.env.GNEWS_API_KEY;
        if (!apiKey) {
            console.warn('[NEWS_SERVICE] GNEWS_API_KEY is not defined in environment variables. Returning empty articles.');
            return [];
        }

        const validCategories = ['general', 'world', 'nation', 'business', 'technology', 'entertainment', 'sports', 'science', 'health'];
        const targetCategory = validCategories.includes(category) ? category : 'general';

        console.log(`[NEWS_SERVICE] Fetching GNews articles for category: ${targetCategory}`);

        try {
            const response = await axios.get('https://gnews.io/api/v4/top-headlines', {
                params: {
                    category: targetCategory,
                    lang: 'en',
                    max: 4, // Get top 4 articles
                    apikey: apiKey
                },
                timeout: 10000
            });

            if (response.data && Array.isArray(response.data.articles)) {
                return response.data.articles as NewsArticle[];
            }
            return [];
        } catch (error: any) {
            console.error('[NEWS_SERVICE] Error fetching news:', error.message);
            return [];
        }
    }
};

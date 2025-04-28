import { getAllUnexpectedInsights, getTopicCategories } from '@/lib/dataUtils';
import InsightsList from './InsightsList';

// Server component to fetch data
export default async function UnexpectedInsightsPage() {
  const [insights, topicCategories] = await Promise.all([
    getAllUnexpectedInsights(),
    getTopicCategories()
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Unexpected <span className="text-yellow-300">Insights</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-green-100">
            Surprising discoveries and unexpected learnings from my projects, products, and research.
            These represent the serendipitous findings that often lead to new directions.
          </p>
        </div>
      </div>

      {/* Insights List Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <InsightsList insights={insights} topicCategories={topicCategories} />
        </div>
      </div>
    </main>
  );
}

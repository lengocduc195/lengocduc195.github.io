import { getAllNotableObservations, getTopicCategories } from '@/lib/dataUtils';
import ObservationsList from './ObservationsList';

// Server component to fetch data
export default async function NotableObservationsPage() {
  const [observations, topicCategories] = await Promise.all([
    getAllNotableObservations(),
    getTopicCategories()
  ]);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Notable <span className="text-yellow-300">Observations</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-blue-100">
            Key insights and observations from various projects, products, and blogs.
            These represent important findings and lessons learned throughout my work.
          </p>
        </div>
      </div>

      {/* Observations List Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <ObservationsList observations={observations} topicCategories={topicCategories} />
        </div>
      </div>
    </main>
  );
}

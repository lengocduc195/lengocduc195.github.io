import { getPublications } from '@/lib/dataUtils';
import PublicationList from './PublicationList';

// Thay thế bằng tên của bạn để highlight và sort
const YOUR_NAME = "Duc Le";

export default async function PublicationsPage() {
  const initialPublications = await getPublications();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            Academic <span className="text-yellow-300">Publications</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-green-100">
            Explore my research contributions to the academic community.
            Each publication represents a significant advancement in knowledge and understanding.
          </p>
        </div>
      </div>

      {/* Publications List Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <PublicationList initialPublications={initialPublications} yourName={YOUR_NAME} />
        </div>
      </div>
    </main>
  );
}
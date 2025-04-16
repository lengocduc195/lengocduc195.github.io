import { getBlogs } from '@/lib/dataUtils';
import BlogList from './BlogList';

export default async function BlogsPage() {
  const initialBlogs = await getBlogs();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            My <span className="text-yellow-300">Blog</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-pink-100">
            Thoughts, tutorials, and insights on technology, research, and personal development.
            Join me on my journeys of continuous learning and exploration.
          </p>
        </div>
      </div>

      {/* Blog List Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          <BlogList initialBlogs={initialBlogs} />
        </div>
      </div>
    </main>
  );
}
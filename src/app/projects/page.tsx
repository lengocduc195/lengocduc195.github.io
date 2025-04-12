import { getProjects } from '@/lib/dataUtils';
import ProjectList from './ProjectList'; // Import Client Component

export default async function ProjectsPage() {
  // Server Component: Tải dữ liệu ban đầu
  const initialProjects = await getProjects();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            My <span className="text-yellow-300">Projects</span>
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto text-blue-100">
            Explore my portfolio of projects spanning various technologies and domains.
            Each project represents a unique challenge and learning experience.
          </p>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="container mx-auto px-4 py-12 -mt-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
          {/* Truyền dữ liệu vào Client Component để xử lý UI động */}
          <ProjectList initialProjects={initialProjects} />
        </div>
      </div>
    </main>
  );
}
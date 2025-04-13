'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Project } from '@/lib/dataUtils';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const router = useRouter();

  // Tạo slug từ title hoặc id
  let slug: string | null = null;
  if (typeof project.title === 'string' && project.title.trim() !== '') {
    slug = project.title.toLowerCase().replace(/\s+/g, '-');
  } else if (project.id !== null && project.id !== undefined) {
    slug = project.id.toString();
  }

  const itemKey = project.id?.toString() ?? slug ?? `project-fallback-${Math.random()}`;

  // Xử lý khi click vào project
  const handleProjectClick = (slug: string | null) => {
    if (slug) {
      router.push(`/projects/${slug}`);
    }
  };

  return (
    <div
      key={itemKey}
      className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transform hover:-translate-y-1"
    >
      {/* Project Header */}
      <div className="relative">
        {/* Featured Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600 relative cursor-pointer" onClick={() => handleProjectClick(slug)}>
          {project.main_image && project.main_image.url ? (
            <div className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${project.main_image.url})`
              }}
            />
          ) : project.images && Array.isArray(project.images) && project.images.length > 0 ? (
            <div className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${typeof project.images[0] === 'string'
                  ? project.images[0]
                  : project.images[0]?.url || '/images/project-placeholder.jpg'})`
              }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-30">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Project Content */}
      <div
        className="p-6 flex-grow flex flex-col cursor-pointer"
        onClick={() => handleProjectClick(slug)}
      >
        <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.title ?? 'Unnamed Project'}
        </h2>
        
        {/* Topics Row */}
        {Array.isArray(project.topics) && project.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center mr-2">
              <svg className="w-4 h-4 mr-1 text-pink-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Topics:</span>
            </div>
            {project.topics.map((topic) => (
              typeof topic === 'string' && (
                <span
                  key={topic}
                  className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/projects?topic=${encodeURIComponent(topic)}`);
                  }}
                  title={`Filter by topic: ${topic}`}
                >
                  {topic}
                </span>
              )
            ))}
          </div>
        )}

        {/* Metadata Column: Company, Lab, Date */}
        <div className="flex flex-col gap-2 mb-3 text-sm">
          {/* Company Badge */}
          {project.company && (
            <span className="inline-flex items-center text-gray-600 dark:text-gray-300">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{project.company}</span>
            </span>
          )}

          {/* Lab Badge */}
          {project.lab && (
            <span className="inline-flex items-center text-gray-600 dark:text-gray-300 pl-5">
              <svg className="w-4 h-4 mr-1 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.168 1.168a4 4 0 00-2.278.584l-.995-.995a3 3 0 00.111-3.678L8 6.172zm2.757 6.192l1.586-1.586a2 2 0 012.828 0l1.586 1.586a2 2 0 010 2.828l-1.586 1.586a2 2 0 01-2.828 0l-1.586-1.586a2 2 0 010-2.828z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{project.lab}</span>
            </span>
          )}

          {/* Date Badge */}
          {project.date && (
            <span className="inline-flex items-center text-gray-600 dark:text-gray-300 pl-5">
              <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </span>
          )}
        </div>

        {/* Tags */}
        {Array.isArray(project.tags) && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center mr-2">
              <svg className="w-4 h-4 mr-1 text-indigo-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tags:</span>
            </div>
            {project.tags.map((tag) => (
              typeof tag === 'string' && (
                <span
                  key={tag}
                  className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-indigo-900 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/projects?search=${encodeURIComponent(tag)}`);
                  }}
                  title={`Search for: ${tag}`}
                >
                  {tag}
                </span>
              )
            ))}
          </div>
        )}

        <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
          {project.description ?? 'No description available.'}
        </p>

        {/* Technologies */}
        {Array.isArray(project.technologies) && project.technologies.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Technologies:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                typeof tech === 'string' && (
                  <span
                    key={tech}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/projects?technology=${encodeURIComponent(tech)}`);
                    }}
                    title={`Filter by technology: ${tech}`}
                  >
                    {tech}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleProjectClick(slug);
            }}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 text-sm font-medium shadow-md hover:shadow-lg w-full"
          >
            View Details
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

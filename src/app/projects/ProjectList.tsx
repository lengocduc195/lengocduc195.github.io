'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Project } from '@/lib/dataUtils'; // Import kiểu Project

interface ProjectListProps {
  initialProjects: Project[];
}

export default function ProjectList({ initialProjects }: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'date_desc' | 'date_asc' | 'name_asc'>('date_desc');

  const filteredAndSortedProjects = useMemo(() => {
    // Đảm bảo initialProjects là một mảng trước khi lọc
    if (!Array.isArray(initialProjects)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = initialProjects.filter(project => {
      // Kiểm tra kỹ lưỡng trước khi truy cập thuộc tính và gọi toLowerCase
      const nameMatch = typeof project.name === 'string' && project.name.toLowerCase().includes(lowerSearchTerm);
      const descMatch = typeof project.description === 'string' && project.description.toLowerCase().includes(lowerSearchTerm);
      const techMatch = Array.isArray(project.technologies) && project.technologies.some(
        tech => typeof tech === 'string' && tech.toLowerCase().includes(lowerSearchTerm)
      );
      return nameMatch || descMatch || techMatch;
    });

    // Sắp xếp
    switch (sortCriteria) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'name_asc':
        // Đảm bảo name là string trước khi so sánh
        filtered.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
        break;
      case 'date_desc':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return filtered;
  }, [initialProjects, searchTerm, sortCriteria]);

  return (
    <div>
      {/* Thanh tìm kiếm và sắp xếp */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name, description, or technology..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
          </div>
          <select
            value={sortCriteria}
            onChange={(e) => setSortCriteria(e.target.value as typeof sortCriteria)}
            className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm"
          >
            <option value="date_desc">Sort by Date (Newest)</option>
            <option value="date_asc">Sort by Date (Oldest)</option>
            <option value="name_asc">Sort by Name (A-Z)</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Danh sách dự án */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v4M9 12h6" />
          </svg>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No projects match your criteria</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Showing {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
            {searchTerm && <span> matching "{searchTerm}"</span>}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProjects.map((project) => {
              const displayTags = project.tags ?? project.technologies;

              // Chỉ sử dụng ID làm slug để đảm bảo tính nhất quán với trang chi tiết
              let slug: string | null = null;
              if (project.id !== null && project.id !== undefined) {
                slug = project.id.toString();
              }

              // Nếu không tạo được slug hợp lệ, không render Link
              const projectDetailUrl = slug ? `/projects/${slug}` : null;
              // Key nên luôn dùng ID nếu có, nếu không thì mới fallback
              const itemKey = project.id?.toString() ?? slug ?? `project-fallback-${Math.random()}`; // Dùng random ở đây ít ảnh hưởng hơn

              // Xác định màu gradient dựa trên tags hoặc technologies
              let gradientClass = "from-blue-500 to-indigo-600";
              if (Array.isArray(displayTags) && displayTags.length > 0) {
                const firstTag = displayTags[0].toLowerCase();
                if (firstTag.includes('react') || firstTag.includes('javascript')) {
                  gradientClass = "from-blue-400 to-cyan-500";
                } else if (firstTag.includes('python') || firstTag.includes('data')) {
                  gradientClass = "from-green-500 to-teal-500";
                } else if (firstTag.includes('design') || firstTag.includes('ui')) {
                  gradientClass = "from-purple-500 to-pink-500";
                } else if (firstTag.includes('mobile') || firstTag.includes('app')) {
                  gradientClass = "from-orange-500 to-red-500";
                } else if (firstTag.includes('ai') || firstTag.includes('machine')) {
                  gradientClass = "from-indigo-500 to-purple-600";
                }
              }

              return (
                <div key={itemKey} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transform hover:-translate-y-1">
                  {/* Project Header with Gradient */}
                  <div className={`bg-gradient-to-r ${gradientClass} p-6 relative`}>
                    <div className="absolute top-0 right-0 mt-4 mr-4">
                      {project.date && (
                        <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                          {new Date(project.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                    <h2 className="text-xl font-bold mb-2 text-white">
                      {/* Chỉ render Link nếu có URL hợp lệ */}
                      {projectDetailUrl ? (
                        <Link href={projectDetailUrl} className="hover:text-white/90 transition-colors">
                          {project.title ?? project.name ?? 'Unnamed Project'}
                        </Link>
                      ) : (
                        <span>{project.title ?? project.name ?? 'Unnamed Project'}</span>
                      )}
                    </h2>
                    {/* Kiểm tra project.technologies là mảng */}
                    {Array.isArray(displayTags) && displayTags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {displayTags.slice(0, 3).map((tag) => (
                          typeof tag === 'string' && (
                            <span
                              key={tag}
                              className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                setSearchTerm(tag);
                              }}
                            >
                              {tag}
                            </span>
                          )
                        ))}
                        {displayTags.length > 3 && (
                          <span className="bg-white/10 text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            +{displayTags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Project Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
                      {project.description ?? 'No description available.'}
                    </p>

                    {/* Project Links */}
                    <div className="mt-auto pt-4 flex justify-between items-center">
                      {/* Chỉ render Link nếu có URL hợp lệ */}
                      {projectDetailUrl ? (
                        <Link
                          href={projectDetailUrl}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          View Project
                          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-sm italic">Details unavailable</span>
                      )}

                      {/* External Links */}
                      <div className="flex space-x-2">
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="GitHub Repository"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                        {(project.demoUrl || project.liveUrl) && (
                          <a
                            href={project.demoUrl || project.liveUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                            title="Live Demo"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
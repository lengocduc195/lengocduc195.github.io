'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/lib/dataUtils'; // Import kiểu Project
import ProjectCard from '@/components/ProjectCard';

interface ProjectListProps {
  initialProjects: Project[];
}

export default function ProjectList({ initialProjects }: ProjectListProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'date_desc' | 'date_asc' | 'name_asc'>('date_desc');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  // Lấy tất cả các topics từ projects
  const allTopics = useMemo(() => {
    if (!Array.isArray(initialProjects)) return [];

    const topicsSet = new Set<string>();

    initialProjects.forEach(project => {
      if (Array.isArray(project.topics)) {
        project.topics.forEach(topic => {
          if (typeof topic === 'string') {
            topicsSet.add(topic);
          }
        });
      }
    });

    return Array.from(topicsSet).sort();
  }, [initialProjects]);

  // Lấy tất cả các technologies từ projects
  const allTechnologies = useMemo(() => {
    if (!Array.isArray(initialProjects)) return [];

    const techSet = new Set<string>();

    initialProjects.forEach(project => {
      if (Array.isArray(project.technologies)) {
        project.technologies.forEach(tech => {
          if (typeof tech === 'string') {
            techSet.add(tech);
          }
        });
      }
    });

    return Array.from(techSet).sort();
  }, [initialProjects]);

  // Lọc và sắp xếp projects
  const filteredAndSortedProjects = useMemo(() => {
    // Đảm bảo initialProjects là một mảng trước khi lọc
    if (!Array.isArray(initialProjects)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    // Lọc theo search term
    let filtered = initialProjects.filter(project => {
      // Tìm kiếm trong title
      const titleMatch = project.title?.toLowerCase().includes(lowerSearchTerm);

      // Tìm kiếm trong description
      const descriptionMatch = project.description?.toLowerCase().includes(lowerSearchTerm);

      // Tìm kiếm trong company
      const companyMatch = project.company?.toLowerCase().includes(lowerSearchTerm);

      // Tìm kiếm trong lab
      const labMatch = project.lab?.toLowerCase().includes(lowerSearchTerm);

      // Tìm kiếm trong tags
      const tagsMatch = Array.isArray(project.tags) && project.tags.some(tag =>
        typeof tag === 'string' && tag.toLowerCase().includes(lowerSearchTerm)
      );

      // Tìm kiếm trong topics
      const topicsMatch = Array.isArray(project.topics) && project.topics.some(topic =>
        typeof topic === 'string' && topic.toLowerCase().includes(lowerSearchTerm)
      );

      // Tìm kiếm trong technologies
      const techMatch = Array.isArray(project.technologies) && project.technologies.some(tech =>
        typeof tech === 'string' && tech.toLowerCase().includes(lowerSearchTerm)
      );

      return titleMatch || descriptionMatch || companyMatch || labMatch || tagsMatch || topicsMatch || techMatch;
    });

    // Lọc theo topics
    if (selectedTopics.length > 0) {
      filtered = filtered.filter(project => {
        return Array.isArray(project.topics) && selectedTopics.every(selectedTopic =>
          project.topics.some(topic => typeof topic === 'string' && topic === selectedTopic)
        );
      });
    }

    // Lọc theo technologies
    if (selectedTechnologies.length > 0) {
      filtered = filtered.filter(project => {
        return Array.isArray(project.technologies) && selectedTechnologies.every(selectedTech =>
          project.technologies.some(tech => typeof tech === 'string' && tech === selectedTech)
        );
      });
    }

    // Sắp xếp
    switch (sortCriteria) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'name_asc':
        filtered.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
        break;
      case 'date_desc':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return filtered;
  }, [initialProjects, searchTerm, sortCriteria, selectedTopics, selectedTechnologies]);

  // Hàm xử lý chuyển hướng đến trang chi tiết dự án
  const handleProjectClick = (slug: string | null) => {
    if (slug) {
      router.push(`/projects/${slug}`);
    }
  };

  return (
    <div>
      {/* Search and Sort Controls */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
        <div className="flex-grow relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search projects by title, description, or tag..."
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

      {/* Filters Section */}
      <div className="mb-8">
        <div className="bg-gray-50 dark:bg-gray-900 p-5 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h3>
            {(selectedTopics.length > 0 || selectedTechnologies.length > 0) && (
              <button
                onClick={() => {
                  setSelectedTopics([]);
                  setSelectedTechnologies([]);
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Two-column layout for filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Topics Filter - Left Column */}
            {allTopics.length > 0 && (
              <div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Topics
                      {selectedTopics.length > 0 && (
                        <span className="ml-2 text-xs bg-pink-100 text-pink-800 py-1 px-2 rounded-full dark:bg-pink-900 dark:text-pink-200">
                          {selectedTopics.length}
                        </span>
                      )}
                    </h4>
                    {selectedTopics.length > 0 && (
                      <button
                        onClick={() => setSelectedTopics([])}
                        className="text-xs text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Projects must contain all selected topics
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTopics.map(topic => (
                    <button
                      key={topic}
                      onClick={() => {
                        setSelectedTopics(prev => {
                          const newTopics = prev.includes(topic)
                            ? prev.filter(t => t !== topic)
                            : [...prev, topic];
                          return newTopics;
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedTopics.includes(topic)
                          ? 'bg-pink-600 text-white hover:bg-pink-700'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Technologies Filter - Right Column */}
            {allTechnologies.length > 0 && (
              <div>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Technologies
                      {selectedTechnologies.length > 0 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full dark:bg-blue-900 dark:text-blue-200">
                          {selectedTechnologies.length}
                        </span>
                      )}
                    </h4>
                    {selectedTechnologies.length > 0 && (
                      <button
                        onClick={() => setSelectedTechnologies([])}
                        className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Projects must contain all selected technologies
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTechnologies.map(tech => (
                    <button
                      key={tech}
                      onClick={() => {
                        setSelectedTechnologies(prev => {
                          const newTechs = prev.includes(tech)
                            ? prev.filter(t => t !== tech)
                            : [...prev, tech];
                          return newTechs;
                        });
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedTechnologies.includes(tech)
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredAndSortedProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No projects match your criteria</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedTopics([]);
              setSelectedTechnologies([]);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Showing {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
            {searchTerm && <span> matching "{searchTerm}"</span>}
            {selectedTopics.length > 0 && (
              <span> in topics: {selectedTopics.map((topic, index) => (
                <span key={topic}>
                  <span className="text-pink-600 dark:text-pink-400 font-medium">{topic}</span>
                  {index < selectedTopics.length - 1 ? ', ' : ''}
                </span>
              ))}</span>
            )}
            {selectedTechnologies.length > 0 && (
              <span> with technologies: {selectedTechnologies.map((tech, index) => (
                <span key={tech}>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">{tech}</span>
                  {index < selectedTechnologies.length - 1 ? ', ' : ''}
                </span>
              ))}</span>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAndSortedProjects.map((project) => (
              <ProjectCard key={project.id || `project-${Math.random()}`} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Blog } from '@/lib/dataUtils';

interface BlogListProps {
  initialBlogs: Blog[];
}

export default function BlogList({ initialBlogs }: BlogListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState<'date_desc' | 'date_asc' | 'title_asc'>('date_desc');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  // Lấy tất cả các topics từ blogs
  const allTopics = useMemo(() => {
    if (!Array.isArray(initialBlogs)) return [];

    const topicsSet = new Set<string>();

    initialBlogs.forEach(blog => {
      if (Array.isArray(blog.topics)) {
        blog.topics.forEach(topic => {
          if (typeof topic === 'string') {
            topicsSet.add(topic);
          }
        });
      }
    });

    return Array.from(topicsSet).sort();
  }, [initialBlogs]);

  // Lấy tất cả các technologies từ blogs
  const allTechnologies = useMemo(() => {
    if (!Array.isArray(initialBlogs)) return [];

    const techSet = new Set<string>();

    initialBlogs.forEach(blog => {
      if (Array.isArray(blog.technologies)) {
        blog.technologies.forEach(tech => {
          if (typeof tech === 'string') {
            techSet.add(tech);
          }
        });
      }
    });

    return Array.from(techSet).sort();
  }, [initialBlogs]);

  const filteredAndSortedBlogs = useMemo(() => {
    if (!Array.isArray(initialBlogs)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = initialBlogs.filter(blog => {
      // Lọc theo search term
      const titleMatch = typeof blog.title === 'string' && blog.title.toLowerCase().includes(lowerSearchTerm);
      const descriptionMatch = typeof blog.description === 'string' && blog.description.toLowerCase().includes(lowerSearchTerm);
      const contentMatch = typeof blog.content === 'string' && blog.content.toLowerCase().includes(lowerSearchTerm);
      const topicMatch = Array.isArray(blog.topics) && blog.topics.some(
        topic => typeof topic === 'string' && topic.toLowerCase().includes(lowerSearchTerm)
      );
      const techMatch = Array.isArray(blog.technologies) && blog.technologies.some(
        tech => typeof tech === 'string' && tech.toLowerCase().includes(lowerSearchTerm)
      );
      // Giữ lại các trường cũ để tương thích ngược
      const excerptMatch = typeof blog.excerpt === 'string' && blog.excerpt.toLowerCase().includes(lowerSearchTerm);
      const tagMatch = Array.isArray(blog.tags) && blog.tags.some(
        tag => typeof tag === 'string' && tag.toLowerCase().includes(lowerSearchTerm)
      );
      const keywordMatch = Array.isArray(blog.keywords) && blog.keywords.some(
        keyword => typeof keyword === 'string' && keyword.toLowerCase().includes(lowerSearchTerm)
      );
      const categoryMatch = typeof blog.category === 'string' && blog.category.toLowerCase().includes(lowerSearchTerm);

      const searchMatch = titleMatch || descriptionMatch || contentMatch || topicMatch || techMatch || excerptMatch || tagMatch || keywordMatch || categoryMatch;

      // Lọc theo topics đã chọn
      // Nếu không có topic nào được chọn, hiển thị tất cả
      // Nếu có topics được chọn, kiểm tra xem blog có chứa ít nhất một topic đã chọn không
      let topicsMatch = selectedTopics.length === 0;
      if (!topicsMatch && Array.isArray(blog.topics)) {
        // Lọc các topic hợp lệ (string) từ blog
        const validTopics = blog.topics.filter(topic => typeof topic === 'string');
        // Kiểm tra xem blog có chứa tất cả các topic được chọn không
        topicsMatch = true; // Giả sử ban đầu là khớp

        for (const selectedTopic of selectedTopics) {
          // Nếu blog không chứa một trong các topic được chọn, đánh dấu không khớp
          if (!validTopics.includes(selectedTopic)) {
            topicsMatch = false;
            break;
          }
        }
      }

      // Lọc theo technologies đã chọn
      // Tương tự như với topics
      console.log("selectedTechnologies  --- ", selectedTechnologies)
      let technologiesMatch = selectedTechnologies.length === 0;
      console.log("blog.technologies  --- ", blog.technologies)
      if (!technologiesMatch && Array.isArray(blog.technologies)) {
        // Lọc các technology hợp lệ (string) từ blog
        const validTechs = blog.technologies.filter(tech => typeof tech === 'string');
        console.log("validTechs  --- ", validTechs)
        // Kiểm tra xem blog có chứa tất cả các technology được chọn không
        technologiesMatch = true; // Giả sử ban đầu là khớp

        for (const selectedTech of selectedTechnologies) {
          // Nếu blog không chứa một trong các technology được chọn, đánh dấu không khớp
          if (!validTechs.includes(selectedTech)) {
            technologiesMatch = false;
            break;
          }
        }
      }
      // Đã xóa các log debug
      return searchMatch && topicsMatch && technologiesMatch;
    });

    switch (sortCriteria) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'title_asc':
        filtered.sort((a, b) => (a.title ?? '').localeCompare(b.title ?? ''));
        break;
      case 'date_desc':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return filtered;
  }, [initialBlogs, searchTerm, sortCriteria, selectedTopics, selectedTechnologies]);

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
            placeholder="Search by title, excerpt, tags, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 shadow-sm"
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
            className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200 shadow-sm"
          >
            <option value="date_desc">Sort by Date (Newest)</option>
            <option value="date_asc">Sort by Date (Oldest)</option>
            <option value="title_asc">Sort by Title (A-Z)</option>
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
                        <span className="ml-2 bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
                          {selectedTopics.length} selected
                        </span>
                      )}
                    </h4>
                    {selectedTopics.length > 0 && (
                      <button
                        onClick={() => setSelectedTopics([])}
                        className="text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Blogs must contain all selected topics
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
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Technologies
                      {selectedTechnologies.length > 0 && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                          {selectedTechnologies.length} selected
                        </span>
                      )}
                    </h4>
                    {selectedTechnologies.length > 0 && (
                      <button
                        onClick={() => setSelectedTechnologies([])}
                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Blogs must contain all selected technologies
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

      {filteredAndSortedBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No blog posts match your criteria</p>
          <div className="space-y-2 mb-4 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm && (
              <p>Search term: <span className="font-medium">"{searchTerm}"</span></p>
            )}
            {selectedTopics.length > 0 && (
              <p>Selected topics: <span className="font-medium">{selectedTopics.join(', ')}</span></p>
            )}
            {selectedTechnologies.length > 0 && (
              <p>Selected technologies: <span className="font-medium">{selectedTechnologies.join(', ')}</span></p>
            )}
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Search
              </button>
            )}
            {selectedTopics.length > 0 && (
              <button
                onClick={() => setSelectedTopics([])}
                className="px-4 py-2 bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 rounded-md hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors"
              >
                Clear Topics
              </button>
            )}
            {selectedTechnologies.length > 0 && (
              <button
                onClick={() => setSelectedTechnologies([])}
                className="px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              >
                Clear Technologies
              </button>
            )}
            {(searchTerm || selectedTopics.length > 0 || selectedTechnologies.length > 0) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTopics([]);
                  setSelectedTechnologies([]);
                }}
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Showing {filteredAndSortedBlogs.length} blog post{filteredAndSortedBlogs.length !== 1 ? 's' : ''}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredAndSortedBlogs.map((blog) => {
              // Tạo slug chỉ dựa trên ID của blog
              let slug: string | null = null;
              if (blog.id !== null && blog.id !== undefined) {
                slug = blog.id.toString();
              }
              const blogDetailUrl = slug ? `/blogs/${slug}` : null;
              const itemKey = blog.id?.toString() ?? slug ?? `blog-fallback-${Math.random()}`;
              const externalUrl = typeof blog.url === 'string' && !blog.url.startsWith('/') ? blog.url : null;

              return (
                <article
                  key={itemKey}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 transform hover:-translate-y-1 cursor-pointer"
                  onClick={() => {
                    if (blogDetailUrl) {
                      window.location.href = blogDetailUrl;
                    } else if (externalUrl) {
                      window.open(externalUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  {/* Blog Header */}
                  <div className="relative">
                    {/* Featured Image */}
                    <div className="h-48 bg-gradient-to-r from-pink-500 to-purple-600 relative">
                      {blog.main_image && blog.main_image.url ? (
                        <div className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${blog.main_image.url})`
                          }}
                        />
                      ) : blog.images && Array.isArray(blog.images) && blog.images.length > 0 ? (
                        <div className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${typeof blog.images[0] === 'string'
                              ? blog.images[0]
                              : blog.images[0]?.url || '/images/blog-placeholder.jpg'})`
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-opacity-30">
                          <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      {/* Không hiển thị badges ở đây nữa */}
                    </div>
                  </div>

                  {/* Blog Content */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                      {blogDetailUrl ? (
                        <Link href={blogDetailUrl}>
                          {blog.title ?? 'Untitled Blog Post'}
                        </Link>
                      ) : externalUrl ? (
                        <Link href={externalUrl} target="_blank" rel="noopener noreferrer">
                          {blog.title ?? 'Untitled Blog Post'}
                        </Link>
                      ) : (
                        <span>{blog.title ?? 'Untitled Blog Post'}</span>
                      )}
                    </h2>

                    {/* Topics Row - Hiển thị ngay dưới tiêu đề */}
                    {Array.isArray(blog.topics) && blog.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center mr-2">
                          <svg className="w-4 h-4 mr-1 text-pink-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Topics:</span>
                        </div>
                        {blog.topics.map((topic) => (
                          typeof topic === 'string' && (
                            <span
                              key={topic}
                              className={`bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors cursor-pointer ${selectedTopics.includes(topic) ? 'ring-2 ring-pink-500 dark:ring-pink-400' : ''}`}
                              onClick={(e) => {
                                e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền đến card
                                setSelectedTopics(prev =>
                                  prev.includes(topic)
                                    ? prev.filter(t => t !== topic)
                                    : [...prev, topic]
                                );
                              }}
                              title={`Filter by topic: ${topic}`}
                            >
                              {topic}
                            </span>
                          )
                        ))}
                      </div>
                    )}

                    {/* Metadata Row: Date and Reading Time */}
                    <div className="flex flex-wrap items-center gap-2 mb-3 text-sm">
                      {/* Date Badge */}
                      {blog.date && (
                        <span className="inline-flex items-center text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      )}

                      {/* Reading Time */}
                      {blog.readingTime && (
                        <span className="inline-flex items-center text-gray-500 dark:text-gray-400">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          {blog.readingTime}
                        </span>
                      )}
                    </div>

                    {/* Description/Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
                      {blog.description || blog.excerpt ||
                        (blog.content && typeof blog.content === 'string'
                          ? blog.content.substring(0, 150) + '...'
                          : Array.isArray(blog.content) && blog.content.length > 0 && blog.content[0].type === 'text' && blog.content[0].text
                            ? blog.content[0].text.substring(0, 150) + '...'
                            : 'No description available.'
                        ) || 'No description available.'}
                    </p>

                    {/* Technologies */}
                    {Array.isArray(blog.technologies) && blog.technologies.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center mb-2">
                          <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Technologies:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {blog.technologies.map((tech) => (
                            typeof tech === 'string' && (
                              <span
                                key={tech}
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền đến card
                                  setSelectedTechnologies(prev =>
                                    prev.includes(tech)
                                      ? prev.filter(t => t !== tech)
                                      : [...prev, tech]
                                  );
                                }}
                              >
                                {tech}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* External Links Row */}
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex flex-wrap gap-2 justify-end">
                        {/* YouTube Demo */}
                        {blog.videoUrl && (
                          <a
                            href={blog.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-medium rounded-full hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 shadow-md hover:shadow-lg"
                            title="Watch video demo on YouTube"
                          >
                            <svg className="inline-block w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                            </svg>
                            YouTube Demo
                          </a>
                        )}

                        {/* GitHub Repository */}
                        {blog.githubUrl && (
                          <a
                            href={blog.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-700 to-gray-900 text-white text-xs font-medium rounded-full hover:from-gray-800 hover:to-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 shadow-md hover:shadow-lg"
                            title="View source code"
                          >
                            <svg className="inline-block w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
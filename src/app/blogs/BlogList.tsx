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

  const filteredAndSortedBlogs = useMemo(() => {
    if (!Array.isArray(initialBlogs)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = initialBlogs.filter(blog => {
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

      return titleMatch || descriptionMatch || contentMatch || topicMatch || techMatch || excerptMatch || tagMatch || keywordMatch || categoryMatch;
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
  }, [initialBlogs, searchTerm, sortCriteria]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
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

      {filteredAndSortedBlogs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No blog posts match your criteria</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Showing {filteredAndSortedBlogs.length} blog post{filteredAndSortedBlogs.length !== 1 ? 's' : ''}
            {searchTerm && <span> matching "{searchTerm}"</span>}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredAndSortedBlogs.map((blog) => {
              let slug: string | null = null;
              if (typeof blog.url === 'string' && blog.url.startsWith('/blog/')) {
                slug = blog.url.substring(6);
              } else if (typeof blog.title === 'string' && blog.title.trim() !== '') {
                slug = blog.title.toLowerCase().replace(/\s+/g, '-');
              } else if (blog.id !== null && blog.id !== undefined) {
                slug = blog.id.toString();
              }
              const blogDetailUrl = slug ? `/blogs/${slug}` : null;
              const itemKey = blog.id?.toString() ?? slug ?? `blog-fallback-${Math.random()}`;
              const externalUrl = typeof blog.url === 'string' && !blog.url.startsWith('/') ? blog.url : null;

              return (
                <article key={itemKey} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 transform hover:-translate-y-1">
                  {/* Blog Header */}
                  <div className="relative">
                    {/* Featured Image */}
                    <div className="h-48 bg-gradient-to-r from-pink-500 to-purple-600 relative">
                      {blog.images && Array.isArray(blog.images) && blog.images.length > 0 ? (
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

                      {/* Topics Badge */}
                      {blog.topics && blog.topics.length > 0 && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            {blog.topics[0]}
                          </span>
                        </div>
                      )}

                      {/* Date Badge */}
                      {blog.date && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
                            {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
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

                    {/* Reading Time */}
                    {blog.readingTime && (
                      <div className="mb-3 flex items-center text-gray-500 dark:text-gray-400 text-sm">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        {blog.readingTime}
                      </div>
                    )}

                    {/* Description/Excerpt */}
                    <p className="text-gray-600 dark:text-gray-300 mb-4 flex-grow line-clamp-3">
                      {blog.description || blog.excerpt || (blog.content && blog.content.substring(0, 150) + '...') || 'No description available.'}
                    </p>

                    {/* Topics or Tags */}
                    {(Array.isArray(blog.topics) && blog.topics.length > 0) || (Array.isArray(blog.tags) && blog.tags.length > 0) ? (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {/* Show topics first if available */}
                        {Array.isArray(blog.topics) && blog.topics.map((topic) => (
                          typeof topic === 'string' && (
                            <span
                              key={topic}
                              className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-pink-900 dark:text-pink-300 hover:bg-pink-200 dark:hover:bg-pink-800 transition-colors cursor-pointer"
                              onClick={() => setSearchTerm(topic)}
                            >
                              #{topic}
                            </span>
                          )
                        ))}

                        {/* Show tags if topics not available or as additional items */}
                        {Array.isArray(blog.tags) && blog.tags.map((tag) => (
                          typeof tag === 'string' && (
                            <span
                              key={tag}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                              onClick={() => setSearchTerm(tag)}
                            >
                              #{tag}
                            </span>
                          )
                        ))}
                      </div>
                    ) : null}

                    {/* Read More Button */}
                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
                      {blogDetailUrl ? (
                        <Link
                          href={blogDetailUrl}
                          className="inline-flex items-center text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors"
                        >
                          Read More
                          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      ) : externalUrl ? (
                        <a
                          href={externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300 font-medium transition-colors"
                        >
                          Read Original
                          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-sm italic">Details unavailable</span>
                      )}
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
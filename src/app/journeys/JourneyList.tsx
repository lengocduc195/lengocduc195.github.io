'use client';

import { useState, useMemo } from 'react';
import type { JourneyEntry } from '@/lib/dataUtils';
import Link from 'next/link';

interface JourneyListProps {
  initialJourneys: JourneyEntry[];
}

type SortCriteria = 'date_desc' | 'date_asc' | 'category_asc';

export default function JourneyList({ initialJourneys }: JourneyListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('date_desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all'); // Thêm state cho category filter

  // Lấy danh sách category duy nhất để tạo bộ lọc
  const categories = useMemo(() => {
    if (!Array.isArray(initialJourneys)) return ['all'];
    const uniqueCategories = new Set<string>(initialJourneys.map(j => j.category).filter(Boolean));
    return ['all', ...Array.from(uniqueCategories).sort()];
  }, [initialJourneys]);

  const filteredAndSortedJourneys = useMemo(() => {
    if (!Array.isArray(initialJourneys)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = initialJourneys
      // Lọc theo category trước
      .filter(j => selectedCategory === 'all' || j.category === selectedCategory)
      // Sau đó lọc theo search term
      .filter(j => {
        const titleMatch = typeof j.title === 'string' && j.title.toLowerCase().includes(lowerSearchTerm);
        const descMatch = typeof j.description === 'string' && j.description.toLowerCase().includes(lowerSearchTerm);
        const tagMatch = Array.isArray(j.tags) && j.tags.some(
          tag => typeof tag === 'string' && tag.toLowerCase().includes(lowerSearchTerm)
        );
        const categoryMatch = typeof j.category === 'string' && j.category.toLowerCase().includes(lowerSearchTerm);
        return titleMatch || descMatch || tagMatch || categoryMatch;
      });

    switch (sortCriteria) {
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'category_asc':
         filtered.sort((a, b) => (a.category ?? '').localeCompare(b.category ?? ''));
         // Có thể thêm sắp xếp phụ theo date nếu category giống nhau
         // filtered.sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '') || new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date_desc':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return filtered;
  }, [initialJourneys, searchTerm, sortCriteria, selectedCategory]);

  return (
    <div>
      {/* Thanh tìm kiếm, sắp xếp và lọc category */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center gap-4">
        <input
          type="text"
          placeholder="Search journey entries..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
         <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
          ))}
        </select>
        <select
          value={sortCriteria}
          onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
          className="px-4 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="date_desc">Sort by Date (Newest)</option>
          <option value="date_asc">Sort by Date (Oldest)</option>
          <option value="category_asc">Sort by Category (A-Z)</option>
        </select>
      </div>

      {/* Timeline hoặc danh sách Journey */}
      {filteredAndSortedJourneys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-center text-gray-500 text-lg">No journey entries match your criteria.</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSortCriteria('date_desc');
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="relative border-l-4 border-blue-500 dark:border-blue-700 ml-6 space-y-12">
          {filteredAndSortedJourneys.map((entry, index) => {
             // Tạo slug từ title hoặc id. Trả về null nếu không có định danh hợp lệ.
            let slug: string | null = null;
            if (typeof entry.title === 'string' && entry.title.trim() !== '') {
              slug = entry.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            } else if (entry.id !== null && entry.id !== undefined) {
              slug = entry.id.toString();
            }
            const journeyDetailUrl = slug ? `/journey/${slug}` : null;
            const itemKey = entry.id?.toString() ?? slug ?? `journey-fallback-${index}`;

            // Chọn icon dựa trên category
            let categoryIcon = (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4Zm-7 12H7v-2h6v2Zm3-4H7v-2h9v2Zm0-4H7V8h9v2Z"/>
              </svg>
            );

            if (entry.category === 'Education') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              );
            } else if (entry.category === 'Career') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              );
            } else if (entry.category === 'Volunteer') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              );
            } else if (entry.category === 'Family') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              );
            } else if (entry.category === 'Relocation') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              );
            }

            // Tạo màu gradient dựa trên category
            let gradientClass = "from-blue-500 to-purple-500";
            if (entry.category === 'Education') gradientClass = "from-blue-500 to-cyan-400";
            if (entry.category === 'Career') gradientClass = "from-purple-500 to-pink-500";
            if (entry.category === 'Volunteer') gradientClass = "from-green-500 to-emerald-400";
            if (entry.category === 'Family') gradientClass = "from-red-500 to-orange-400";
            if (entry.category === 'Relocation') gradientClass = "from-amber-500 to-yellow-400";

            return (
                <div key={itemKey} className="ml-10 relative group">
                  {/* Timeline dot with animation */}
                  <span className={`absolute flex items-center justify-center w-8 h-8 bg-gradient-to-br ${gradientClass} rounded-full -left-12 ring-4 ring-white dark:ring-gray-900 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white">
                      {categoryIcon}
                    </span>
                  </span>

                  {/* Timeline connector line with animation */}
                  <span className="absolute w-3 h-3 bg-blue-500 rounded-full -left-9 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                  {/* Content card with hover effect */}
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1">
                    <div className="flex flex-wrap items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {journeyDetailUrl ? (
                          <Link href={journeyDetailUrl}>
                            {entry.title ?? 'Untitled Entry'}
                          </Link>
                        ) : (
                          <span>{entry.title ?? 'Untitled Entry'}</span>
                        )}
                      </h3>
                      {entry.category && (
                        <span className={`bg-gradient-to-r ${gradientClass} text-white text-sm font-medium px-3 py-1 rounded-full shadow-sm`}>
                          {entry.category}
                        </span>
                      )}
                    </div>

                    {/* Date and author with icon */}
                    <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <time className="text-sm">{entry.date ?? 'N/A'}</time>
                      {entry.author && (
                        <>
                          <span className="text-gray-400">•</span>
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm">
                              {Array.isArray(entry.author) ? entry.author.join(', ') : entry.author}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Description with line clamp */}
                    <p className="mb-4 text-gray-600 dark:text-gray-300 line-clamp-3">
                      {entry.description ?? 'No description available.'}
                    </p>

                    {/* Tags with hover effect */}
                    {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {entry.tags.map((tag) => (
                          typeof tag === 'string' && (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                              onClick={() => setSearchTerm(tag)}
                            >
                              #{tag}
                            </span>
                          )
                        ))}
                      </div>
                    )}

                    {/* Read more button with animation */}
                    {journeyDetailUrl && (
                      <div className="mt-4">
                        <Link
                          href={journeyDetailUrl}
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-full hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Read More
                          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
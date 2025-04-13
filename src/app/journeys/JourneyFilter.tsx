'use client';

import { useState, useEffect, useMemo } from 'react';
import { JourneyEntry } from '@/lib/dataUtils';
import Link from 'next/link';

type SortCriteria = 'date_desc' | 'date_asc' | 'category_asc';

interface JourneyFilterProps {
  journeys: JourneyEntry[];
}

export default function JourneyFilter({ journeys }: JourneyFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('date_desc');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filteredJourneys, setFilteredJourneys] = useState<JourneyEntry[]>(journeys);

  // Get unique categories for filter
  const categories = useMemo(() => {
    if (!Array.isArray(journeys)) return ['all'];
    const uniqueCategories = new Set<string>(journeys.map(j => j.category).filter(Boolean));
    return ['all', ...Array.from(uniqueCategories).sort()];
  }, [journeys]);

  // Filter and sort journeys when criteria change
  useEffect(() => {
    if (!Array.isArray(journeys)) {
      setFilteredJourneys([]);
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = journeys
      // Filter by category first
      .filter(j => selectedCategory === 'all' || j.category === selectedCategory)
      // Then filter by search term
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
        break;
      case 'date_desc':
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    setFilteredJourneys(filtered);
  }, [journeys, searchTerm, sortCriteria, selectedCategory]);

  return (
    <>
      {/* Search, sort, and filter controls */}
      <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl shadow-md">
        <div className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search journey entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="appearance-none w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-10"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <div className="relative">
                <select
                  value={sortCriteria}
                  onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
                  className="appearance-none w-full px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 pr-10"
                >
                  <option value="date_desc">Date (Newest First)</option>
                  <option value="date_asc">Date (Oldest First)</option>
                  <option value="category_asc">Category (A-Z)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* No results message */}
      {filteredJourneys.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800/30 rounded-xl">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-full shadow-md mb-6">
            <svg className="w-20 h-20 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">No Results Found</h3>
          <p className="text-center text-gray-500 dark:text-gray-400 text-lg max-w-md mb-6">
            We couldn't find any journey entries that match your search criteria.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSortCriteria('date_desc');
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Timeline Journey List */
        <div className="relative border-l-4 border-blue-500 dark:border-blue-700 ml-6 space-y-12">
          {/* Timeline decorative elements */}
          <div className="absolute -left-3 -top-3 w-6 h-6 bg-blue-500 dark:bg-blue-700 rounded-full shadow-md z-10"></div>
          <div className="absolute -left-3 -bottom-3 w-6 h-6 bg-blue-500 dark:bg-blue-700 rounded-full shadow-md z-10"></div>
          
          {filteredJourneys.map((journey, index) => {
            // Create slug from title or id
            let slug = '';
            if (typeof journey.title === 'string' && journey.title.trim() !== '') {
              slug = journey.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            } else if (journey.id) {
              slug = journey.id.toString();
            }
            
            // Choose gradient color based on category
            let gradientClass = "from-blue-500 to-purple-500";
            if (journey.category === 'Education') gradientClass = "from-blue-500 to-cyan-400";
            if (journey.category === 'Career') gradientClass = "from-purple-500 to-pink-500";
            if (journey.category === 'Volunteer') gradientClass = "from-green-500 to-emerald-400";
            if (journey.category === 'Family') gradientClass = "from-red-500 to-orange-400";
            if (journey.category === 'Relocation') gradientClass = "from-amber-500 to-yellow-400";
            
            // Choose icon based on category
            let categoryIcon = (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4Zm-7 12H7v-2h6v2Zm3-4H7v-2h9v2Zm0-4H7V8h9v2Z"/>
              </svg>
            );

            if (journey.category === 'Education') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                </svg>
              );
            } else if (journey.category === 'Career') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                </svg>
              );
            } else if (journey.category === 'Volunteer') {
              categoryIcon = (
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              );
            }
            
            // Add animation delay based on index for staggered appearance
            const animationDelay = `${index * 0.1}s`;
            
            return (
              <div key={journey.id || index} className="ml-10 relative group" style={{ animationDelay }}>
                {/* Timeline dot with animation */}
                <span className={`absolute flex items-center justify-center w-10 h-10 bg-gradient-to-br ${gradientClass} rounded-full -left-14 ring-4 ring-white dark:ring-gray-900 shadow-lg group-hover:scale-110 transition-all duration-300 z-10`}>
                  <span className="text-white">
                    {categoryIcon}
                  </span>
                </span>

                {/* Animated pulse effect around timeline dot */}
                <span className={`absolute w-10 h-10 -left-14 rounded-full bg-gradient-to-br ${gradientClass} opacity-30 animate-ping`} 
                  style={{ animationDuration: '3s', animationIterationCount: 'infinite' }}></span>

                {/* Timeline connector line with animation */}
                <span className="absolute w-3 h-3 bg-blue-500 rounded-full -left-10 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>

                {/* Content card with hover effect and clickable area */}
                <Link href={`/journeys/${slug}`}>
                  <div className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer">
                    <div className="flex flex-wrap items-start justify-between mb-3 gap-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {journey.title || 'Untitled Journey'}
                      </h3>
                      
                      {journey.category && (
                        <span className={`bg-gradient-to-r ${gradientClass} text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-md`}>
                          {journey.category}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3 text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <time className="text-sm">{journey.date || 'N/A'}</time>
                    </div>
                    
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {journey.description || 'No description available.'}
                    </p>
                    
                    {journey.tags && journey.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {journey.tags.map((tag) => (
                          typeof tag === 'string' && (
                            <span
                              key={tag}
                              className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1.5 rounded-full dark:bg-gray-700 dark:text-gray-300"
                              onClick={(e) => {
                                e.preventDefault();
                                setSearchTerm(tag);
                              }}
                            >
                              #{tag}
                            </span>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

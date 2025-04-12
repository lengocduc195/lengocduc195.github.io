'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { Publication } from '@/lib/dataUtils'; // Import kiểu Publication

interface PublicationListProps {
  initialPublications: Publication[];
  yourName: string; // Tên của bạn để lọc tác giả chính
}

type SortCriteria = 'year_desc' | 'year_asc' | 'rank' | 'first_author';

export default function PublicationList({ initialPublications, yourName }: PublicationListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('year_desc');

  // Định nghĩa rankOrder ở ngoài để không cần đưa vào dependencies của useMemo
  const rankOrder: { [key: string]: number } = useMemo(() => ({
    'CORE A*': 1,
    'Q1': 2,
    'CORE A': 3,
    'Q2': 4,
    // Thêm các rank khác nếu cần
  }), []);

  // Tính toán lowerYourName một lần bên ngoài useMemo
  const lowerYourName = useMemo(() => yourName.toLowerCase(), [yourName]);

  const filteredAndSortedPublications = useMemo(() => {
    // Đảm bảo initialPublications là một mảng
    if (!Array.isArray(initialPublications)) return [];

    const lowerSearchTerm = searchTerm.toLowerCase();

    let filtered = initialPublications.filter(pub => {
      // Kiểm tra kỹ lưỡng trước khi truy cập
      const titleMatch = typeof pub.title === 'string' && pub.title.toLowerCase().includes(lowerSearchTerm);
      const venueMatch = typeof pub.venue === 'string' && pub.venue.toLowerCase().includes(lowerSearchTerm);
      const authorMatch = Array.isArray(pub.authors) && pub.authors.some(
        author => typeof author === 'string' && author.toLowerCase().includes(lowerSearchTerm)
      );
      const techMatch = Array.isArray(pub.technologies) && pub.technologies.some(
        tech => typeof tech === 'string' && tech.toLowerCase().includes(lowerSearchTerm)
      );
      const topicMatch = Array.isArray(pub.topics) && pub.topics.some(
        topic => typeof topic === 'string' && topic.toLowerCase().includes(lowerSearchTerm)
      );
      return titleMatch || venueMatch || authorMatch || techMatch || topicMatch;
    });

    // Sắp xếp
    switch (sortCriteria) {
      case 'year_asc':
        filtered.sort((a, b) => (a.year ?? 0) - (b.year ?? 0));
        break;
      case 'rank':
        filtered.sort((a, b) => {
          const rankA = (typeof a.rank === 'string' ? rankOrder[a.rank] : undefined) ?? 99;
          const rankB = (typeof b.rank === 'string' ? rankOrder[b.rank] : undefined) ?? 99;
          if (rankA !== rankB) {
            return rankA - rankB;
          }
          return (b.year ?? 0) - (a.year ?? 0);
        });
        break;
      case 'first_author':
        filtered.sort((a, b) => {
          const isFirstA = a.isFirstAuthor === true || (Array.isArray(a.authors) && a.authors.length > 0 && typeof a.authors[0] === 'string' && a.authors[0].toLowerCase() === lowerYourName);
          const isFirstB = b.isFirstAuthor === true || (Array.isArray(b.authors) && b.authors.length > 0 && typeof b.authors[0] === 'string' && b.authors[0].toLowerCase() === lowerYourName);
          if (isFirstA !== isFirstB) {
            return isFirstB ? 1 : -1;
          }
          return (b.year ?? 0) - (a.year ?? 0);
        });
        break;
      case 'year_desc':
      default:
        filtered.sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
        break;
    }
    return filtered;
  }, [initialPublications, searchTerm, sortCriteria, lowerYourName, rankOrder]);

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
            placeholder="Search by title, venue, author, or technology..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
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
            onChange={(e) => setSortCriteria(e.target.value as SortCriteria)}
            className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg appearance-none dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 shadow-sm"
          >
            <option value="year_desc">Sort by Year (Newest)</option>
            <option value="year_asc">Sort by Year (Oldest)</option>
            <option value="rank">Sort by Rank (Highest)</option>
            <option value="first_author">Sort by My First Author</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Danh sách Publications */}
      {filteredAndSortedPublications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">No publications match your criteria</p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Showing {filteredAndSortedPublications.length} publication{filteredAndSortedPublications.length !== 1 ? 's' : ''}
            {searchTerm && <span> matching "{searchTerm}"</span>}
          </p>

          <ul className="space-y-6">
            {filteredAndSortedPublications.map((pub) => {
              // Tạo slug từ title hoặc id
              let slug: string | null = null;
              if (typeof pub.title === 'string' && pub.title.trim() !== '') {
                // Tạo slug an toàn hơn cho URL
                slug = pub.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
              } else if (pub.id !== null && pub.id !== undefined) {
                slug = pub.id.toString();
              }
              const publicationDetailUrl = slug ? `/publications/${slug}` : null;
              const itemKey = pub.id?.toString() ?? slug ?? `pub-fallback-${Math.random()}`;
              const publicationLink = pub.url ?? pub.link;
              const displayTags = pub.tags ?? pub.technologies;

              // Xác định nếu là tác giả đầu tiên
              const isFirstAuthor = pub.isFirstAuthor === true ||
                (Array.isArray(pub.authors) && pub.authors.length > 0 &&
                 typeof pub.authors[0] === 'string' && pub.authors[0].toLowerCase() === lowerYourName);

              return (
                <li key={itemKey} className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 transform hover:-translate-y-1">
                  <div className="p-6">
                    {/* Publication Header with Year and Rank */}
                    <div className="flex flex-wrap justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="bg-green-600 text-white text-lg font-bold px-3 py-1 rounded-md">
                          {pub.year ?? 'N/A'}
                        </div>
                        {typeof pub.rank === 'string' && pub.rank && (
                          <div className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded dark:bg-blue-900 dark:text-blue-300">
                            {pub.rank}
                          </div>
                        )}
                        {isFirstAuthor && (
                          <div className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-1 rounded dark:bg-yellow-900 dark:text-yellow-300 flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                              <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
                            </svg>
                            First Author
                          </div>
                        )}
                      </div>

                      {typeof pub.doi === 'string' && pub.doi && (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors text-sm flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                          DOI: {pub.doi}
                        </a>
                      )}
                    </div>

                    {/* Publication Title */}
                    <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {publicationDetailUrl ? (
                        <Link href={publicationDetailUrl}>
                          {pub.title ?? 'Untitled Publication'}
                        </Link>
                      ) : (
                        <span>{pub.title ?? 'Untitled Publication'}</span>
                      )}
                    </h2>

                    {/* Authors with highlighting */}
                    {Array.isArray(pub.authors) && pub.authors.length > 0 && (
                      <div className="mb-3">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Authors:</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          {pub.authors.map((author, index) => (
                            typeof author === 'string' && (
                              <span
                                key={index}
                                className={`${author.toLowerCase() === lowerYourName ? 'font-bold text-green-600 dark:text-green-400' : ''}`}
                              >
                                {author}{index < pub.authors.length - 1 ? ', ' : ''}
                              </span>
                            )
                          ))}
                        </p>
                      </div>
                    )}

                    {/* Venue */}
                    <div className="mb-4">
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Published in:</h3>
                      <p className="text-gray-700 dark:text-gray-300 italic">
                        {pub.venue ?? 'Unknown Venue'}
                      </p>
                    </div>

                    {/* Topics */}
                    {Array.isArray(pub.topics) && pub.topics.length > 0 ? (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Topics:</h3>
                        <div className="flex flex-wrap gap-2">
                          {pub.topics.map((topic) => (
                            typeof topic === 'string' && (
                              <span
                                key={topic}
                                className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
                                onClick={() => setSearchTerm(topic)}
                              >
                                {topic}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    ) : Array.isArray(displayTags) && displayTags.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Keywords:</h3>
                        <div className="flex flex-wrap gap-2">
                          {displayTags.map((tag) => (
                            typeof tag === 'string' && (
                              <span
                                key={tag}
                                className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full dark:bg-green-900 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 transition-colors cursor-pointer"
                                onClick={() => setSearchTerm(tag)}
                              >
                                {tag}
                              </span>
                            )
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                      {publicationDetailUrl ? (
                        <Link
                          href={publicationDetailUrl}
                          className="inline-flex items-center text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 font-medium transition-colors"
                        >
                          View Details
                          <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </Link>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-sm italic">Details unavailable</span>
                      )}

                      {typeof pub.doi === 'string' && pub.doi ? (
                        <a
                          href={`https://doi.org/${pub.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm font-medium rounded-full hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Read Paper (DOI)
                          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      ) : publicationLink && (
                        <a
                          href={publicationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 text-white text-sm font-medium rounded-full hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          Read Paper
                          <svg className="ml-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
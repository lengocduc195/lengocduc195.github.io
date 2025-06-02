import { getJourneys } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ImageViewerScript from './ImageViewerScript';
import FormattedText from '../components/FormattedText';

interface JourneyDetailPageProps {
  params: { slug: string };
}

async function getJourneyDetails(slug: string) {
  const allJourneys = await getJourneys();

  // Tìm journey theo slug (từ title hoặc id)
  const entry = allJourneys.find(j => {
    // Kiểm tra nếu slug khớp với id
    if (j.id?.toString() === slug) return true;

    // Kiểm tra nếu slug khớp với title đã được chuyển đổi
    if (typeof j.title === 'string') {
      const titleSlug = j.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      return titleSlug === slug;
    }

    return false;
  });

  return entry;
}

export async function generateStaticParams() {
  const journeys = await getJourneys();
  if (!Array.isArray(journeys)) return [];

  return journeys.map((entry) => {
    let slug: string | null = null;
    if (typeof entry.title === 'string' && entry.title.trim() !== '') {
      slug = entry.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    } else if (entry.id !== null && entry.id !== undefined) {
      slug = entry.id.toString();
    }
    return slug ? { slug } : null;
  }).filter(Boolean);
}

export default async function JourneyDetailPage({ params }: JourneyDetailPageProps) {
  // Đảm bảo params được await trước khi sử dụng
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const entry = await getJourneyDetails(slug);

  if (!entry) {
    notFound();
  }

  // Chọn màu gradient dựa trên category
  let gradientClass = "from-blue-500 to-purple-500";
  if (entry.category === 'Education') gradientClass = "from-blue-500 to-cyan-400";
  if (entry.category === 'Career') gradientClass = "from-purple-500 to-pink-500";
  if (entry.category === 'Volunteer') gradientClass = "from-green-500 to-emerald-400";
  if (entry.category === 'Family') gradientClass = "from-red-500 to-orange-400";
  if (entry.category === 'Relocation') gradientClass = "from-amber-500 to-yellow-400";
  if (entry.category === 'Travel') gradientClass = "from-purple-500 to-pink-500";

  return (
    <div className="container mx-auto px-4 py-12">
      <ImageViewerScript />
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <div className="relative mb-4">
          {entry.category && (
            <span className={`absolute top-0 right-0 bg-gradient-to-r ${gradientClass} text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-md`}>
              {entry.category}
            </span>
          )}
          <div className="pr-24">
            <h1 className="text-3xl font-bold">{entry.title || 'Untitled Journey'}</h1>
          </div>
        </div>
        <div className="flex items-center mb-4 text-gray-600">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
          {entry.start_date && entry.end_date ? (
            (() => {
              const startDate = new Date(entry.start_date);
              const endDate = new Date(entry.end_date);
              const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return (
                <div className="flex flex-col">
                  <p className="text-blue-600 dark:text-blue-400 font-medium">
                    {startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    <span className="font-medium">Duration:</span> {diffDays} day{diffDays !== 1 ? 's' : ''}
                  </p>
                </div>
              );
            })()
          ) : entry.start_date ? (
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              Started on {new Date(entry.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          ) : entry.date ? (
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {new Date(entry.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          ) : (
            <p>No date information available</p>
          )}
        </div>

        {entry.description && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4 py-2">
              {entry.description}
            </p>
          </div>
        )}



        {/* Display sections if available */}
        {Array.isArray(entry.sections) && entry.sections.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Journey Details
            </h2>
            <div className="space-y-12">
              {entry.sections.map((section: any, sectionIndex: number) => (
                <div key={sectionIndex} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600 dark:text-blue-400 border-b border-gray-200 dark:border-gray-700 pb-2">
                    {section.title}
                  </h3>
                  <div className="space-y-6">
                    {Array.isArray(section.content) && section.content.map((block: any, blockIndex: number) => {
                      if (block.type === 'text') {
                        return (
                          <div key={blockIndex} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                            <FormattedText
                              text={block.text}
                              className="text-gray-700 dark:text-gray-300 leading-relaxed"
                            />
                          </div>
                        );
                      } else if (block.type === 'quote') {
                        return (
                          <div key={blockIndex} className="my-6">
                            <blockquote className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-4 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-md shadow-sm">
                              <p className="text-lg italic text-gray-700 dark:text-gray-300 font-medium mb-2">"{block.text}"</p>
                              {block.author && (
                                <footer className="text-right text-gray-600 dark:text-gray-400">
                                  — <cite>{block.author}</cite>
                                </footer>
                              )}
                            </blockquote>
                            {block.context && (
                              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm pl-6">
                                {block.context}
                              </p>
                            )}
                          </div>
                        );
                      } else if (block.type === 'image') {
                        return (
                          <div key={blockIndex} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                            <div className="relative overflow-hidden">
                              <img
                                src={block.url}
                                alt={block.caption || 'Memory Image'}
                                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105 zoomable-image"
                                data-caption={block.caption}
                              />
                            </div>
                            {block.caption && (
                              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-gray-700 dark:text-gray-300 italic flex items-start">
                                  <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                  </svg>
                                  <span>{block.caption}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : entry.content ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
              </svg>
              Journey Details
            </h2>
            <div className="prose max-w-none">
              {Array.isArray(entry.content) ? (
                <div className="space-y-8">
                  {entry.content.map((block: any, index: number) => {
                    if (block.type === 'text') {
                      return (
                        <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
                          <FormattedText
                            text={block.text}
                            className="text-gray-700 dark:text-gray-300 leading-relaxed"
                          />
                        </div>
                      );
                    } else if (block.type === 'quote') {
                      return (
                        <div key={index} className="my-6">
                          <blockquote className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-4 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-md shadow-sm">
                            <p className="text-lg italic text-gray-700 dark:text-gray-300 font-medium mb-2">"{block.text}"</p>
                            {block.author && (
                              <footer className="text-right text-gray-600 dark:text-gray-400">
                                — <cite>{block.author}</cite>
                              </footer>
                            )}
                          </blockquote>
                          {block.context && (
                            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm pl-6">
                              {block.context}
                            </p>
                          )}
                        </div>
                      );
                    } else if (block.type === 'image') {
                      return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                          <div className="relative overflow-hidden">
                            <img
                              src={block.url}
                              alt={block.caption || 'Memory Image'}
                              className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105 zoomable-image"
                              data-caption={block.caption}
                            />
                          </div>
                          {block.caption && (
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-gray-700 dark:text-gray-300 italic flex items-start">
                                <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                  <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                <span>{block.caption}</span>
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : typeof entry.content === 'string' ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <FormattedText
                    text={entry.content}
                    className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-lg text-gray-500 dark:text-gray-400 italic">No further details available.</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Display itinerary if available */}
        {Array.isArray(entry.itinerary) && entry.itinerary.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Itinerary
            </h2>
            <div className="space-y-4">
              {entry.itinerary.map((day: any, index: number) => (
                <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      {day.day}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{day.title}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(day.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {Array.isArray(day.activities) && day.activities.length > 0 && (
                    <ul className="ml-11 mt-2 space-y-1 text-gray-700 dark:text-gray-300 list-disc">
                      {day.activities.map((activity: string, actIndex: number) => (
                        <li key={actIndex}>{activity}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Display practical info if available */}
        {entry.practical_info && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Practical Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Accommodation */}
              {entry.practical_info.accommodation && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-medium text-lg mb-2 text-blue-600 dark:text-blue-400">Accommodation</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Name:</span> {entry.practical_info.accommodation.name}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Address:</span> {entry.practical_info.accommodation.address}
                    </p>
                    {entry.practical_info.accommodation.notes && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Notes:</span> {entry.practical_info.accommodation.notes}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Budget */}
              {entry.practical_info.budget && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-medium text-lg mb-2 text-blue-600 dark:text-blue-400">Budget</h3>
                  <div className="space-y-1">
                    {Object.entries(entry.practical_info.budget).map(([key, value]: [string, any], index: number) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700 dark:text-gray-300 capitalize">{key === 'total' ? <strong>Total</strong> : key}</span>
                        <span className={`font-medium ${key === 'total' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transportation */}
              {Array.isArray(entry.practical_info.transportation) && entry.practical_info.transportation.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-medium text-lg mb-2 text-blue-600 dark:text-blue-400">Transportation</h3>
                  <div className="space-y-3">
                    {entry.practical_info.transportation.map((transport: any, index: number) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{transport.type}</p>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">{transport.details}</p>
                        {transport.date && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {new Date(transport.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        )}
                        {transport.notes && (
                          <p className="text-gray-500 dark:text-gray-400 text-xs italic mt-1">{transport.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {Array.isArray(entry.practical_info.tips) && entry.practical_info.tips.length > 0 && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="font-medium text-lg mb-2 text-blue-600 dark:text-blue-400">Travel Tips</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {entry.practical_info.tips.map((tip: string, index: number) => (
                      <li key={index} className="text-gray-700 dark:text-gray-300">{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Display Memories Gallery at the end */}
        {Array.isArray(entry.images) && entry.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              Memories Gallery
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {entry.images.map((image, index) => {
                const imgSrc = typeof image === 'string' ? image : image.url;
                const imgAlt = typeof image === 'string' ? entry.title : (image.caption || entry.title);
                const caption = typeof image !== 'string' ? image.caption : null;

                if (!imgSrc) return null;

                return (
                  <div key={index} className="overflow-hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                    <div className="relative overflow-hidden">
                      <img
                        src={imgSrc}
                        alt={imgAlt}
                        className="w-full h-64 object-cover object-center transition-transform duration-500 hover:scale-105 zoomable-image"
                        data-caption={caption}
                      />
                    </div>
                    {caption && (
                      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-gray-700 dark:text-gray-300 italic">
                          <svg className="w-4 h-4 inline-block mr-1 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          {caption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {(Array.isArray(entry.related) && entry.related.length > 0) || (Array.isArray(entry.links) && entry.links.length > 0) ? (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Links & Resources</h2>

            {Array.isArray(entry.related) && entry.related.length > 0 && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Related Content</h3>
                <ul className="space-y-2">
                  {entry.related.map((link: any, index: number) => (
                    <li key={index}>
                      <Link
                        href={link.url}
                        target={!link.url.startsWith('/') ? "_blank" : undefined}
                        rel={!link.url.startsWith('/') ? "noopener noreferrer" : undefined}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(entry.links) && entry.links.length > 0 && (
              <div>
                <h3 className="font-medium mb-2">External Resources</h3>
                <ul className="space-y-2">
                  {entry.links.map((link: any, index: number) => (
                    <li key={index}>
                      <Link
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline"
                      >
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Link href="/journeys" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors hover:underline">
            ← Back to Journeys
          </Link>
        </div>
      </div>
    </div>
  );
}

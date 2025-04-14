import { getJourneys } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold mb-4">{entry.title || 'Untitled Journey'}</h1>
        <p className="text-gray-600 mb-4">{entry.date || 'No date'}</p>
        {entry.category && (
          <div className="mb-4">
            <span className={`bg-gradient-to-r ${gradientClass} text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-md`}>
              {entry.category}
            </span>
          </div>
        )}

        {entry.description && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Overview</h2>
            <p className="text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4 py-2">
              {entry.description}
            </p>
          </div>
        )}

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
                        className="w-full h-64 object-cover object-center transition-transform duration-500 hover:scale-105"
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

        {entry.content && (
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
                          <p className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">{block.text}</p>
                        </div>
                      );
                    } else if (block.type === 'image') {
                      return (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                          <div className="relative overflow-hidden">
                            <img
                              src={block.url}
                              alt={block.caption || 'Memory Image'}
                              className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
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
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{entry.content}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-lg text-gray-500 dark:text-gray-400 italic">No further details available.</p>
                </div>
              )}
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

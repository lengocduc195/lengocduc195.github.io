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
  const entry = await getJourneyDetails(params.slug);

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

  return (
    <main className="container mx-auto px-4 py-12">
      {/* Header with gradient background */}
      <div className={`bg-gradient-to-r ${gradientClass} rounded-t-xl shadow-lg p-8 md:p-12 mb-8 text-white`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-white/80 mb-4">
            <Link href="/journey" className="hover:text-white transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Journey</span>
            </Link>
            <span>•</span>
            {entry.category && <span>{entry.category}</span>}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-white drop-shadow-md">
            {entry.title ?? 'Untitled Journey Entry'}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/90">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <time>{entry.date ?? 'N/A'}</time>
            </div>

            {entry.author && (
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>
                  {Array.isArray(entry.author) ? entry.author.join(', ') : entry.author}
                </span>
              </div>
            )}

            {Array.isArray(entry.tags) && entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {entry.tags.map((tag) => (
                  typeof tag === 'string' && (
                    <span key={tag} className="bg-white/20 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full hover:bg-white/30 transition-colors">
                      #{tag}
                    </span>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-b-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
        {/* Hiển thị Description */}
        {entry.description && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Overview</h2>
            <p className={`text-lg text-gray-600 dark:text-gray-300 border-l-4 border-blue-500 pl-4 py-2`}>
              {entry.description}
            </p>
          </div>
        )}

        {/* Hiển thị hình ảnh nếu có */}
        {Array.isArray(entry.images) && entry.images.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry.images.map((image, index) => {
                const imgSrc = typeof image === 'string' ? image : image.url;
                const imgAlt = typeof image === 'string' ? entry.title : (image.caption || entry.title);

                if (!imgSrc) return null;

                return (
                  <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 group">
                    <img
                      src={imgSrc}
                      alt={imgAlt}
                      className="w-full h-64 object-cover object-center transform group-hover:scale-105 transition-transform duration-500"
                    />
                    {typeof image !== 'string' && image.caption && (
                      <div className="p-2 bg-gray-100 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300">
                        {image.caption}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hiển thị content chi tiết nếu có trong file JSON */}
        {entry.content && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Details</h2>
            <div className="prose dark:prose-invert max-w-none prose-lg prose-blue prose-img:rounded-xl prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">
              {Array.isArray(entry.content) ? (
                entry.content.map((block: any, index: number) => (
                  <div key={index} className="mb-6">
                    {block.type === 'text' && <p className="whitespace-pre-line">{block.text}</p>}
                    {block.type === 'image' && (
                      <figure>
                        <img src={block.url} alt={block.caption || 'Image'} className="w-full h-auto rounded-lg shadow-md" />
                        {block.caption && <figcaption className="text-center text-sm text-gray-500 mt-2">{block.caption}</figcaption>}
                      </figure>
                    )}
                  </div>
                ))
              ) : typeof entry.content === 'string' ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner">
                  <p className="whitespace-pre-wrap">{entry.content}</p>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-lg text-gray-500 dark:text-gray-400 italic">No further details available.</p>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Related and External Links Section */}
        {(Array.isArray(entry.related) && entry.related.length > 0) || (Array.isArray(entry.links) && entry.links.length > 0) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Related Content */}
            {Array.isArray(entry.related) && entry.related.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  Related Content
                </h3>
                <ul className="space-y-2">
                  {entry.related.map((link: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
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

            {/* External Links */}
            {Array.isArray(entry.links) && entry.links.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="font-semibold mb-4 text-lg text-gray-900 dark:text-white flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                  </svg>
                  External Resources
                </h3>
                <ul className="space-y-2">
                  {entry.links.map((link: any, index: number) => (
                    <li key={index} className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                        <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                      </svg>
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

        {/* Navigation buttons */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <Link
            href="/journey"
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Journey
          </Link>

          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
        </div>
      </article>
    </main>
  );
}

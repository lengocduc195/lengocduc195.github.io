import { getPublications, createSlug } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CitationWithCopy from '@/components/CitationWithCopy';
import PublicationImageViewer from '@/components/PublicationImageViewer';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Helper Component để render Links (tránh lặp code)
const RelatedLinksSection: React.FC<{ title: string, links: { title: string, url: string }[] | undefined }> = ({ title, links }) => {
  if (!Array.isArray(links) || links.length === 0) return null;

  return (
    <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">{title}</h3>
      <ul className="list-disc list-inside space-y-1">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.url}
              target={!link.url.startsWith('/') ? "_blank" : undefined}
              rel={!link.url.startsWith('/') ? "noopener noreferrer" : undefined}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {link.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

async function getPublicationDetails(slug: string) {
  const allPublications = await getPublications();
  // Không cần chuyển đổi slug thành số nếu id có thể là string
  // const pubId = parseInt(slug, 10);
  const publication = allPublications.find(p => createSlug(p.title, p.id) === slug);
  return publication;
}

export async function generateStaticParams() {
  const publications = await getPublications();
  if (!Array.isArray(publications)) return [];

  return publications.map((pub) => {
    const slug = createSlug(pub.title, pub.id);
    return { slug };
  });
}

export const dynamic = 'force-static';

export default async function PublicationDetailPage({ params }: PageProps) {
  // Đảm bảo params được await trước khi sử dụng
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const pub = await getPublicationDetails(slug);

  if (!pub) {
    notFound();
  }

  const displayTags = pub.tags ?? pub.technologies;
  const publicationLink = pub.links?.view_publication ?? (pub.doi ? `https://doi.org/${pub.doi}` : (pub.url ?? pub.link));
  const websiteLink = pub.links?.website;
  const githubLink = pub.links?.github_repository ?? pub.github;
  const videoUrl = pub.links?.youtube_demo ?? pub.videoUrl;
  const highlight = pub.highlight;

  const getYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };
  const youtubeVideoId = videoUrl ? getYouTubeId(videoUrl) : null;

  // Helper function to format text with references
  const formatTextWithReferences = (text: string): string => {
    // First replace all [ref:X] with placeholders to avoid processing them twice
    let processedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Then replace each [ref:X] with a link that has a title attribute
    if (pub.references) {
      Object.entries(pub.references).forEach(([key, value]) => {
        const refPattern = new RegExp(`\\[ref:${key}\\]`, 'g');
        // Escape the value for use in title attribute
        const escapedValue = value.replace(/"/g, '&quot;');
        processedText = processedText.replace(
          refPattern,
          `<a href="#reference-${key}" class="text-blue-600 dark:text-blue-400 hover:underline tooltip-reference" title="${escapedValue}">[ref:${key}]</a>`
        );
      });
    } else {
      // Fallback if no references object is available
      processedText = processedText.replace(
        /\[ref:(\d+)\]/g,
        '<a href="#reference-$1" class="text-blue-600 dark:text-blue-400 hover:underline">[ref:$1]</a>'
      );
    }

    return processedText;
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-gray-900 dark:text-white">{pub.title ?? 'Untitled Publication'}</h1>
        {Array.isArray(pub.authors) && pub.authors.length > 0 && (
          <p className="text-md text-gray-600 dark:text-gray-400 mb-2">{pub.authors.join(', ')}</p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-6">
          {pub.venue ?? 'Unknown Venue'}, {pub.year ?? 'N/A'}
          {pub.rank && <span className="ml-2 font-medium">[{pub.rank}]</span>}
          {pub.doi && <span className="ml-2">(DOI: <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{pub.doi}</a>)</span>}
        </p>

        {highlight && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded shadow-sm">
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 text-sm mb-1">HIGHLIGHT</h3>
            <p className="text-yellow-800 dark:text-yellow-200 font-medium">{highlight}</p>
          </div>
        )}

        {Array.isArray(pub.topics) && pub.topics.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-2">TOPICS</h3>
            <div className="flex flex-wrap gap-2">
              {pub.topics.map((item: string) => (
                typeof item === 'string' && (
                  <span key={item} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                    {item}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {pub.abstract && (
          <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Abstract</h3>
            <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
              {pub.abstract}
            </div>
          </div>
        )}

        {/* 6 phần quan trọng của publication */}
        <div className="space-y-6">
          {/* 1. Vấn đề (Problem) */}
          {pub.problem && (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded-md shadow-sm border-l-4 border-red-500 flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Problem
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                {typeof pub.problem === 'string' ? (
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTextWithReferences(pub.problem) }}></div>
                ) : Array.isArray(pub.problem) ? (
                  <div className="space-y-6">
                    {pub.problem.map((item, index) => (
                      <div key={index}>
                        {item.type === 'text' && (
                          <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: item.text ? formatTextWithReferences(item.text) : ''
                            }}
                          />
                        )}
                        {item.type === 'image' && item.url && (
                          <div className="my-4 mx-auto" style={{ width: '70%' }}>
                            <PublicationImageViewer
                              url={item.url}
                              caption={item.caption}
                              className="w-full h-auto rounded-md shadow-md"
                            />
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                        {item.type === 'video' && (
                          <div className="my-4 mx-auto aspect-video" style={{ width: '70%' }}>
                            {item.videoId ? (
                              <iframe
                                className="w-full h-full rounded-md shadow-md"
                                src={`https://www.youtube.com/embed/${item.videoId}`}
                                title={item.caption || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : item.url ? (
                              <video
                                className="w-full h-auto rounded-md shadow-md"
                                controls
                                poster={item.url.replace(/\.[^/.]+$/, '') + '-thumbnail.jpg'}
                              >
                                <source src={item.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* 2. Khoảng trống (Gap / Limitation) */}
          {pub.gap && (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 p-2 rounded-md shadow-sm border-l-4 border-orange-500 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                Research Gap
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-4 ml-2 border-l border-gray-200 dark:border-gray-700">
                {typeof pub.gap === 'string' ? (
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTextWithReferences(pub.gap) }}></div>
                ) : Array.isArray(pub.gap) ? (
                  <div className="space-y-6">
                    {pub.gap.map((item, index) => (
                      <div key={index}>
                        {item.type === 'text' && (
                          <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: item.text ? formatTextWithReferences(item.text) : ''
                            }}
                          />
                        )}
                        {item.type === 'image' && item.url && (
                          <div className="my-4 mx-auto" style={{ width: '70%' }}>
                            <PublicationImageViewer
                              url={item.url}
                              caption={item.caption}
                              className="w-full h-auto rounded-md shadow-md"
                            />
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                        {item.type === 'video' && (
                          <div className="my-4 mx-auto aspect-video" style={{ width: '70%' }}>
                            {item.videoId ? (
                              <iframe
                                className="w-full h-full rounded-md shadow-md"
                                src={`https://www.youtube.com/embed/${item.videoId}`}
                                title={item.caption || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : item.url ? (
                              <video
                                className="w-full h-auto rounded-md shadow-md"
                                controls
                                poster={item.url.replace(/\.[^/.]+$/, '') + '-thumbnail.jpg'}
                              >
                                <source src={item.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* 3. Giải pháp đề xuất (Proposed Method) */}
          {pub.solution && (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-2 rounded-md shadow-sm border-l-4 border-blue-500 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                Proposed Method
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-4 ml-2 border-l border-gray-200 dark:border-gray-700">
                {typeof pub.solution === 'string' ? (
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTextWithReferences(pub.solution) }}></div>
                ) : Array.isArray(pub.solution) ? (
                  <div className="space-y-6">
                    {pub.solution.map((item, index) => (
                      <div key={index}>
                        {item.type === 'text' && (
                          <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: item.text ? formatTextWithReferences(item.text) : ''
                            }}
                          />
                        )}
                        {item.type === 'image' && item.url && (
                          <div className="my-4 mx-auto" style={{ width: '70%' }}>
                            <PublicationImageViewer
                              url={item.url}
                              caption={item.caption}
                              className="w-full h-auto rounded-md shadow-md"
                            />
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                        {item.type === 'video' && (
                          <div className="my-4 mx-auto aspect-video" style={{ width: '70%' }}>
                            {item.videoId ? (
                              <iframe
                                className="w-full h-full rounded-md shadow-md"
                                src={`https://www.youtube.com/embed/${item.videoId}`}
                                title={item.caption || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : item.url ? (
                              <video
                                className="w-full h-auto rounded-md shadow-md"
                                controls
                                poster={item.url.replace(/\.[^/.]+$/, '') + '-thumbnail.jpg'}
                              >
                                <source src={item.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* 4. Kết quả chính (Key Results) */}
          {pub.results && (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded-md shadow-sm border-l-4 border-green-500 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Key Results
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-4 ml-2 border-l border-gray-200 dark:border-gray-700">
                {typeof pub.results === 'string' ? (
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTextWithReferences(pub.results) }}></div>
                ) : Array.isArray(pub.results) ? (
                  <div className="space-y-6">
                    {pub.results.map((item, index) => (
                      <div key={index}>
                        {item.type === 'text' && (
                          <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: item.text ? formatTextWithReferences(item.text) : ''
                            }}
                          />
                        )}
                        {item.type === 'image' && item.url && (
                          <div className="my-4 mx-auto" style={{ width: '70%' }}>
                            <PublicationImageViewer
                              url={item.url}
                              caption={item.caption}
                              className="w-full h-auto rounded-md shadow-md"
                            />
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                        {item.type === 'video' && (
                          <div className="my-4 mx-auto aspect-video" style={{ width: '70%' }}>
                            {item.videoId ? (
                              <iframe
                                className="w-full h-full rounded-md shadow-md"
                                src={`https://www.youtube.com/embed/${item.videoId}`}
                                title={item.caption || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : item.url ? (
                              <video
                                className="w-full h-auto rounded-md shadow-md"
                                controls
                                poster={item.url.replace(/\.[^/.]+$/, '') + '-thumbnail.jpg'}
                              >
                                <source src={item.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* 5. Phát hiện / Hiểu biết thú vị (Insight / Observation) */}
          {pub.insights && (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 p-2 rounded-md shadow-sm border-l-4 border-yellow-500 flex items-center">
                <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                </svg>
                Insights & Observations
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-4 ml-2 border-l border-gray-200 dark:border-gray-700">
                {typeof pub.insights === 'string' ? (
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTextWithReferences(pub.insights) }}></div>
                ) : Array.isArray(pub.insights) ? (
                  <div className="space-y-6">
                    {pub.insights.map((item, index) => (
                      <div key={index}>
                        {item.type === 'text' && (
                          <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: item.text ? formatTextWithReferences(item.text) : ''
                            }}
                          />
                        )}
                        {item.type === 'image' && item.url && (
                          <div className="my-4 mx-auto" style={{ width: '70%' }}>
                            <PublicationImageViewer
                              url={item.url}
                              caption={item.caption}
                              className="w-full h-auto rounded-md shadow-md"
                            />
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                        {item.type === 'video' && (
                          <div className="my-4 mx-auto aspect-video" style={{ width: '70%' }}>
                            {item.videoId ? (
                              <iframe
                                className="w-full h-full rounded-md shadow-md"
                                src={`https://www.youtube.com/embed/${item.videoId}`}
                                title={item.caption || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : item.url ? (
                              <video
                                className="w-full h-auto rounded-md shadow-md"
                                controls
                                poster={item.url.replace(/\.[^/.]+$/, '') + '-thumbnail.jpg'}
                              >
                                <source src={item.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* 6. Đóng góp chính + Hướng phát triển (Contributions & Future Work) */}
          {pub.contributions && (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-lg bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 p-2 rounded-md shadow-sm border-l-4 border-purple-500 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                Contributions & Future Work
              </h3>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 pl-4 ml-2 border-l border-gray-200 dark:border-gray-700">
                {typeof pub.contributions === 'string' ? (
                  <div className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatTextWithReferences(pub.contributions) }}></div>
                ) : Array.isArray(pub.contributions) ? (
                  <div className="space-y-6">
                    {pub.contributions.map((item, index) => (
                      <div key={index}>
                        {item.type === 'text' && (
                          <div
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: item.text ? formatTextWithReferences(item.text) : ''
                            }}
                          />
                        )}
                        {item.type === 'image' && item.url && (
                          <div className="my-4 mx-auto" style={{ width: '70%' }}>
                            <PublicationImageViewer
                              url={item.url}
                              caption={item.caption}
                              className="w-full h-auto rounded-md shadow-md"
                            />
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                        {item.type === 'video' && (
                          <div className="my-4 mx-auto aspect-video" style={{ width: '70%' }}>
                            {item.videoId ? (
                              <iframe
                                className="w-full h-full rounded-md shadow-md"
                                src={`https://www.youtube.com/embed/${item.videoId}`}
                                title={item.caption || 'Video'}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            ) : item.url ? (
                              <video
                                className="w-full h-auto rounded-md shadow-md"
                                controls
                                poster={item.url.replace(/\.[^/.]+$/, '') + '-thumbnail.jpg'}
                              >
                                <source src={item.url} type="video/mp4" />
                                Your browser does not support the video tag.
                              </video>
                            ) : null}
                            {item.caption && (
                              <p className="text-sm text-center mt-2 text-gray-500 dark:text-gray-400">{item.caption}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>



        <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold mb-4 text-lg text-gray-700 dark:text-gray-300">Links</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {publicationLink && (
              <a
                href={publicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                </svg>
                View Publication
              </a>
            )}

            {websiteLink && (
              <a
                href={websiteLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 bg-purple-50 dark:bg-purple-900/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd"></path>
                </svg>
                Website
              </a>
            )}

            {youtubeVideoId && (
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                YouTube Demo
              </a>
            )}

            {githubLink && (
              <a
                href={githubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center p-3 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                </svg>
                GitHub Repository
              </a>
            )}
          </div>
        </div>

        {Array.isArray(pub.images) && pub.images.length > 0 && (
          <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Images:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pub.images.map((img, index) => (
                typeof img === 'object' && img.url ? (
                  <div key={index}>
                    <img src={img.url} alt={img.caption || `Publication illustration ${index + 1}`} className="w-full h-auto rounded-md shadow" />
                    {img.caption && <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">{img.caption}</p>}
                  </div>
                ) : typeof img === 'string' ? (
                  <img key={index} src={img} alt={`Publication illustration ${index + 1}`} className="w-full h-auto rounded-md shadow" />
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* References Section */}
        {pub.references && Object.keys(pub.references).length > 0 && (
          <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 text-lg text-gray-700 dark:text-gray-300 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              References
            </h3>
            <ol className="space-y-3 list-decimal list-inside text-gray-700 dark:text-gray-300">
              {Object.entries(pub.references).map(([key, value]) => (
                <li id={`reference-${key}`} key={key} className="pl-2 py-2 border-l-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 rounded-r-md scroll-mt-24">
                  {value}
                </li>
              ))}
            </ol>
          </div>
        )}

        {Array.isArray(displayTags) && displayTags.length > 0 && (
          <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Tags/Technologies:</h3>
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag) => (
                typeof tag === 'string' && (
                  <span key={tag} className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300">
                    {tag}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {pub.citationFormat && (
          <CitationWithCopy
            citationText={pub.citationFormat}
            citationCount={pub.citationCount}
          />
        )}

        <div className="mt-8">
          <RelatedLinksSection title="Related Internal Content" links={pub.related} />
        </div>
        <div className="mt-0">
          <RelatedLinksSection title="External Resources" links={pub.links} />
        </div>
      </article>
    </main>
  );
}

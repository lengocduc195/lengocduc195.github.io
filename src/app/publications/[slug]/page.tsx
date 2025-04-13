import { getPublications, generateSlug } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CitationWithCopy from '@/components/CitationWithCopy';
import PublicationContent from './PublicationContent';

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
  const publication = allPublications.find(p => generateSlug(p) === slug);
  return publication;
}

export async function generateStaticParams() {
  const publications = await getPublications();
  if (!Array.isArray(publications)) return [];

  // Sử dụng hàm generateSlug để tạo slug cho mỗi publication
  return publications.map(pub => ({
    slug: generateSlug(pub)
  }));
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

        {/* Publication Content with interactive images and videos */}
        <PublicationContent publication={pub} />


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

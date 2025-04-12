import { getPublications } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PublicationDetailPageProps {
  params: { slug: string };
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
  const pubId = parseInt(slug, 10);
  const publication = allPublications.find(p =>
    (p.id?.toString() === slug) ||
    (typeof p.title === 'string' && p.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') === slug)
  );
  return publication;
}

export async function generateStaticParams() {
  const publications = await getPublications();
  if (!Array.isArray(publications)) return [];

  return publications.map((pub) => {
    let slug: string | null = null;
    if (typeof pub.title === 'string' && pub.title.trim() !== '') {
      slug = pub.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    } else if (pub.id !== null && pub.id !== undefined) {
      slug = pub.id.toString();
    }
    return slug ? { slug } : null;
  }).filter(Boolean);
}

export const dynamic = 'force-static';

export default async function PublicationDetailPage({ params }: PublicationDetailPageProps) {
  // Đảm bảo params đã được await trước khi sử dụng
  const slug = params.slug;
  const pub = await getPublicationDetails(slug);

  if (!pub) {
    notFound();
  }

  const mainContent = pub.content ?? pub.fullText ?? pub.abstract;
  const displayTags = pub.tags ?? pub.technologies;
  const publicationLink = pub.doi ? `https://doi.org/${pub.doi}` : (pub.url ?? pub.link);
  const githubLink = pub.github;
  const videoUrl = pub.videoUrl;

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

        {Array.isArray(pub.topics) && pub.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-[-1rem] mb-4">
            {pub.topics.map((item: string) => (
              typeof item === 'string' && (
                <span key={item} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                  {item}
                </span>
              )
            ))}
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

        {(pub.content || pub.fullText) && (
          <div className="prose dark:prose-invert max-w-none mb-6 whitespace-pre-wrap border-t border-gray-200 dark:border-gray-700 pt-4">
            {pub.content ?? pub.fullText}
          </div>
        )}

        {youtubeVideoId && (
          <div className="mt-8 mb-6 aspect-video">
            <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Video</h3>
            <iframe
              className="w-full h-full rounded-md shadow"
              src={`https://www.youtube.com/embed/${youtubeVideoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        )}
        {!youtubeVideoId && videoUrl && (
          <div className="mt-8 mb-6">
            <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">Video Link</h3>
            <Link href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
              Watch Video
            </Link>
          </div>
        )}

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
          <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-3 text-lg text-gray-700 dark:text-gray-300">
              Citation
              {pub.citationCount !== undefined && pub.citationCount !== null && (
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">[Citations: {pub.citationCount}]</span>
              )}
            </h3>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 text-sm font-mono whitespace-pre-wrap">
              {pub.citationFormat}
            </div>
          </div>
        )}

        {(publicationLink || githubLink) && (
          <div className="mt-8 mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-4">
              {publicationLink && (
                <Link
                  href={publicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800"
                >
                  View Publication
                </Link>
              )}
              {githubLink && (
                <Link
                  href={githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-800"
                >
                  View Code (GitHub)
                </Link>
              )}
            </div>
          </div>
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

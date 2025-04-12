import { getBlogs } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import fs from 'fs/promises';
// import path from 'path';

interface BlogDetailPageProps {
  params: { slug: string };
}

// Helper Component để render Links (giữ nguyên)
const RelatedLinksSection: React.FC<{ title: string, links: { title: string, url: string }[] | undefined }> = ({ title, links }) => {
  if (!Array.isArray(links) || links.length === 0) return null;
  return (
    <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">{title}</h3>
      <ul className="list-disc list-inside space-y-1">
        {links.map((link, index) => (
          <li key={index}>
            <Link href={link.url} target={!link.url.startsWith('/') ? "_blank" : undefined} rel={!link.url.startsWith('/') ? "noopener noreferrer" : undefined} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">{link.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

async function getBlogDetails(slug: string) {
  const allBlogs = await getBlogs();
  const entry = allBlogs.find(b =>
      (b.id?.toString() === slug) ||
      (b.url === `/blog/${slug}`) ||
      (typeof b.title === 'string' && b.title.toLowerCase().replace(/\s+/g, '-') === slug)
  );
  return entry;
}

// // Hàm đọc nội dung file Markdown (ví dụ)
// async function getMarkdownContent(fileName: string): Promise<string | null> {
//   if (!fileName) return null;
//   const filePath = path.join(process.cwd(), 'public', 'assets', 'data', 'blogs', 'content', fileName); // Giả sử có thư mục content
//   try {
//     const content = await fs.readFile(filePath, 'utf8');
//     return content;
//   } catch (error) {
//     console.error(`Error reading markdown file ${filePath}:`, error);
//     return null;
//   }
// }

export async function generateStaticParams() {
  const blogs = await getBlogs();
  if (!Array.isArray(blogs)) return [];

  return blogs.map((blog) => {
    let slug: string | null = null;
    if (typeof blog.url === 'string' && blog.url.startsWith('/blog/')) {
       slug = blog.url.substring(6);
    } else if (typeof blog.title === 'string' && blog.title.trim() !== '') {
       slug = blog.title.toLowerCase().replace(/\s+/g, '-');
    } else if (blog.id !== null && blog.id !== undefined) {
      slug = blog.id.toString();
    }
    return slug ? { slug } : null;
  }).filter(Boolean);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  // Đảm bảo params đã được await trước khi sử dụng
  const slug = params.slug;
  const blog = await getBlogDetails(slug);
  // const markdownContent = blog?.contentFile ? await getMarkdownContent(blog.contentFile) : null;

  if (!blog) {
    notFound();
  }

  // Ưu tiên content, sau đó đến excerpt
  const displayContent = blog.content ?? blog.excerpt;

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        {/* Header */}
         <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
             {blog.category && <span className="bg-indigo-100 text-indigo-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">{blog.category}</span>}
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">{blog.title ?? 'Untitled Blog Post'}</h1>
             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                {Array.isArray(blog.authors) && <span>By {blog.authors.join(', ')}</span>}
                 {blog.date && <span>on {blog.date}</span>}
                 {blog.readingTime && <span>· {blog.readingTime}</span>}
             </div>
         </div>

        {/* Featured Image */}
        {blog.featuredImage && <img src={blog.featuredImage} alt={blog.title ?? ''} className="w-full h-auto rounded-md mb-6 shadow-lg" />}

        {/* Content */}
        {displayContent && (
            <div className="prose dark:prose-invert max-w-none mb-6">
                {/* {markdownContent ? ( */}
                {/*    <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownContent}</ReactMarkdown> */}
                {/* ) : ( */}
                    <p className="whitespace-pre-wrap">{displayContent}</p>
                {/* )} */}
            </div>
        )}

         {/* Other Images */}
         {Array.isArray(blog.images) && blog.images.length > 0 && (
            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Images:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {blog.images.map((img, index) => (
                        typeof img === 'object' && img.url && (
                        <div key={index}>
                            <img src={img.url} alt={img.caption || `Blog image ${index + 1}`} className="w-full h-auto rounded-md shadow"/>
                            {img.caption && <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">{img.caption}</p>}
                        </div>
                        ) || (typeof img === 'string' && (
                             <img key={index} src={img} alt={`Blog image ${index + 1}`} className="w-full h-auto rounded-md shadow"/>
                        ))
                    ))}
                </div>
            </div>
        )}

        {/* Tags & Keywords */}
        {(Array.isArray(blog.tags) && blog.tags.length > 0) || (Array.isArray(blog.keywords) && blog.keywords.length > 0) ? (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              {Array.isArray(blog.tags) && blog.tags.length > 0 && (
                  <div className="mb-3">
                      <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300 inline-block mr-2">Tags:</h3>
                      <div className="inline-flex flex-wrap gap-2">
                        {blog.tags.map((tag) => (
                          typeof tag === 'string' && (
                            <span key={tag} className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300">
                              #{tag}
                            </span>
                          )
                        ))}
                      </div>
                  </div>
              )}
               {Array.isArray(blog.keywords) && blog.keywords.length > 0 && (
                 <div>
                      <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300 inline-block mr-2">Keywords:</h3>
                      <div className="inline-flex flex-wrap gap-2">
                        {blog.keywords.map((keyword) => (
                          typeof keyword === 'string' && (
                            <span key={keyword} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-yellow-900 dark:text-yellow-300">
                              {keyword}
                            </span>
                          )
                        ))}
                      </div>
                  </div>
              )}
            </div>
        ): null}

        <RelatedLinksSection title="Related Internal Content" links={blog.related} />
        <RelatedLinksSection title="External Resources" links={blog.links} />

         {/* Back Button */}
         <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
             <Link href="/blogs" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                ← Back to Blogs
             </Link>
         </div>

      </article>
    </main>
  );
}
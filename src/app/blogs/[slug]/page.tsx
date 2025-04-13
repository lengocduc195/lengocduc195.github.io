import { getBlogs, generateBlogSlug } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BlogContent from './BlogContent';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import fs from 'fs/promises';
// import path from 'path';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
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

  // Tìm kiếm blog dựa trên slug được tạo bởi hàm generateBlogSlug
  const entry = allBlogs.find(blog => generateBlogSlug(blog) === slug);

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

  // Sử dụng hàm generateBlogSlug để tạo slug cho mỗi blog
  return blogs.map(blog => ({
    slug: generateBlogSlug(blog)
  }));
}

export default async function BlogDetailPage({ params }: PageProps) {
  // Đảm bảo params đã được await trước khi sử dụng
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const blog = await getBlogDetails(slug);
  // const markdownContent = blog?.contentFile ? await getMarkdownContent(blog.contentFile) : null;

  if (!blog) {
    notFound();
  }

  // Ưu tiên content, sau đó đến excerpt hoặc description
  const displayContent = blog.content ?? blog.excerpt ?? blog.description;

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        {/* Header */}
         <div className="mb-6 border-b border-gray-200 dark:border-gray-700 pb-6">
             {blog.topics && blog.topics.length > 0 && (
               <span className="bg-indigo-100 text-indigo-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                 {blog.topics[0]}
               </span>
             )}
             {blog.category && !blog.topics && (
               <span className="bg-indigo-100 text-indigo-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                 {blog.category}
               </span>
             )}
            <h1 className="text-3xl md:text-4xl font-bold mt-4 mb-2 text-gray-900 dark:text-white">{blog.title ?? 'Untitled Blog Post'}</h1>
             <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                {blog.author && <span>By {blog.author}</span>}
                {Array.isArray(blog.authors) && !blog.author && <span>By {blog.authors.join(', ')}</span>}
                {blog.date && <span>on {new Date(blog.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
                {blog.readingTime && <span>· {blog.readingTime}</span>}
             </div>
         </div>



        <BlogContent blog={blog} />

        {/* External Links */}
        {(blog.videoUrl || blog.githubUrl || blog.productUrl) && (
          <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 text-lg text-gray-700 dark:text-gray-300">Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Website */}
              {blog.productUrl && (
                <a href={blog.productUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                  <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-200">Website</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Visit the product website</div>
                  </div>
                </a>
              )}

              {/* Video Demo */}
              {blog.videoUrl && (
                <a href={blog.videoUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-200">YouTube Demo</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Watch product demonstration on YouTube</div>
                  </div>
                </a>
              )}

              {/* GitHub Repository */}
              {blog.githubUrl && (
                <a href={blog.githubUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3">
                    <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-200">GitHub Repository</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">View source code</div>
                  </div>
                </a>
              )}
            </div>
          </div>
        )}



        <RelatedLinksSection title="Related Content" links={blog.related} />
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
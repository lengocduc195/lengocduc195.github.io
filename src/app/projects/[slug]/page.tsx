import { getProjects } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation'; // Để xử lý trường hợp không tìm thấy project
// import ReactMarkdown from 'react-markdown'; // Bỏ comment nếu dùng Markdown
// import remarkGfm from 'remark-gfm';

interface ProjectDetailPageProps {
  params: { slug: string };
}

// Hàm để lấy dữ liệu chi tiết của một project dựa trên slug (ID)
async function getProjectDetails(slug: string) {
  const allProjects = await getProjects();
  // Tìm project theo ID
  const project = allProjects.find(p => p.id?.toString() === slug);
  return project;
}

// Required for static export
export async function generateStaticParams() {
  const projects = await getProjects();

  // Ensure projects is an array before mapping
  if (!Array.isArray(projects)) {
    console.error("generateStaticParams: Failed to fetch projects or projects is not an array.");
    return [];
  }

  return projects.map((project) => {
    // Use project ID as slug for simplicity and reliability
    if (project.id !== null && project.id !== undefined) {
      const slug = project.id.toString();
      return { slug };
    } else {
      // Skip generating params if no valid identifier found
      console.warn("generateStaticParams: Skipping project due to missing id:", project);
      return null; // Will be filtered out later
    }
  }).filter(Boolean); // Remove any null entries
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
              // Mở link ngoài trong tab mới nếu không phải link nội bộ
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
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Đảm bảo params đã được await trước khi sử dụng
  const slug = params.slug;
  const project = await getProjectDetails(slug);

  if (!project) {
    notFound(); // Hiển thị trang 404 nếu không tìm thấy project
  }

  const displayTags = project.tags ?? project.technologies;
  // Xác định các URL hợp lệ
  const repoLink = project.repoUrl || project.githubUrl;
  const demoLink = project.liveUrl || project.demoUrl;

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">{project.title ?? project.name ?? 'Untitled Project'}</h1>

        {/* Hiển thị Author và Date */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            {Array.isArray(project.author) && <span>By {project.author.join(', ')}</span>}
            {project.date && <span>on {project.date}</span>}
        </div>

        {/* Hiển thị Description trước */}
        {project.description && (
          <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-6 border-l-4 border-gray-300 dark:border-gray-600 pl-4">
            {project.description}
          </p>
        )}

        {/* Hiển thị hình ảnh chính (nếu có) */}
        <div className="mb-6 space-y-6">
            {Array.isArray(project.images) && project.images.length > 0 && typeof project.images[0] === 'string' && (
              <img src={project.images[0]} alt={project.title ?? 'Project image'} className="w-full h-auto rounded-md shadow-lg"/>
            )}
            {Array.isArray(project.images) && project.images.length > 0 && typeof project.images[0] === 'object' && project.images[0]?.url && (
                 <img src={project.images[0].url} alt={project.images[0].caption || project.title || 'Project image'} className="w-full h-auto rounded-md shadow-lg"/>
            )}
            {project.videoUrl && (
                 <div className="aspect-w-16 aspect-h-9">
                     <iframe
                         src={project.videoUrl.includes('youtube.com/embed') ? project.videoUrl : `https://www.youtube.com/embed/${project.videoUrl.split('v=')[1]}`}
                         title={project.title ?? "Project Video"}
                         frameBorder="0"
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                         referrerPolicy="strict-origin-when-cross-origin"
                         allowFullScreen
                         className="w-full h-full rounded-md shadow-lg"
                     ></iframe>
                </div>
            )}
        </div>

        {/* Hiển thị Content chi tiết */}
        {project.content && (
             <div className="prose dark:prose-invert max-w-none mb-6">
                 <h2 className="text-2xl font-semibold mb-3">Details</h2>
                 {/* <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown> */}
                 <p className="whitespace-pre-wrap">{project.content}</p>
            </div>
        )}

         {/* Hiển thị các hình ảnh khác (nếu có và là object) */}
         {Array.isArray(project.images) && project.images.length > 1 && (
             <div className="mb-6">
                 <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">More Images:</h3>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {project.images.slice(1).map((img, index) => (
                         typeof img === 'object' && img.url && (
                            <div key={index}>
                                <img src={img.url} alt={img.caption || `Project image ${index + 2}`} className="w-full h-auto rounded-md shadow"/>
                                {img.caption && <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">{img.caption}</p>}
                            </div>
                         )
                     ))}
                 </div>
             </div>
         )}

         {/* Hiển thị Tags/Technologies */}
        {Array.isArray(displayTags) && displayTags.length > 0 && (
             <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Tags/Technologies:</h3>
              <div className="flex flex-wrap gap-2">
                {displayTags.map((tag) => (
                  typeof tag === 'string' && (
                    <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      {tag}
                    </span>
                  )
                ))}
              </div>
            </div>
        )}

        {/* Links (Repo/Demo) */}
        {(repoLink || demoLink) && (
             <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Project Links:</h3>
                <div className="flex justify-start space-x-4">
                    {repoLink && (
                      <Link href={repoLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium">
                        View Code
                      </Link>
                    )}
                    {demoLink && (
                      <Link href={demoLink} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors font-medium">
                        Live Demo / View Product
                      </Link>
                    )}
                </div>
            </div>
        )}

        {/* Related & External Links Sections */}
        <RelatedLinksSection title="Related Internal Content" links={project.related} />
        <RelatedLinksSection title="External Resources" links={project.links} />

         {/* Nút quay lại trang danh sách */}
         <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
             <Link href="/projects" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                ← Back to Projects
             </Link>
         </div>

      </article>
    </main>
  );
}
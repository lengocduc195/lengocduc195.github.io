import { getProducts } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductContent from './ProductContent';
import ProductImages from './ProductImages';

interface PageProps {
  params: {
    slug: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

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

async function getProductDetails(slug: string) {
  const allProducts = await getProducts();
  const productId = parseInt(slug, 10);
  const product = allProducts.find(p =>
      (p.id?.toString() === slug) ||
      (typeof p.name === 'string' && p.name.toLowerCase().replace(/\s+/g, '-') === slug)
  );
  return product;
}

export async function generateStaticParams() {
  const products = await getProducts();
  if (!Array.isArray(products)) return [];

  const params = [];

  for (const product of products) {
    // Generate slug from name
    if (typeof product.name === 'string' && product.name.trim() !== '') {
      const nameSlug = product.name.toLowerCase().replace(/\s+/g, '-');
      if (!params.some(p => p.slug === nameSlug)) {
        params.push({ slug: nameSlug });
      }
    }

    // Generate slug from ID
    if (product.id !== null && product.id !== undefined) {
      const idSlug = product.id.toString();
      if (!params.some(p => p.slug === idSlug)) {
        params.push({ slug: idSlug });
      }
    }
  }

  // Thêm các slug cụ thể mà chúng ta biết sẽ được sử dụng
  const additionalSlugs = [
    'secomus-ai-platform',
    'smart-home-automation-system',
    'e-commerce-platform'
  ];

  for (const slug of additionalSlugs) {
    if (!params.some(p => p.slug === slug)) {
      params.push({ slug });
    }
  }

  return params;
}

export default async function ProductDetailPage({ params }: PageProps) {
  // Đảm bảo params được await trước khi sử dụng
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams.slug;
  const product = await getProductDetails(slug);

  if (!product) {
    notFound();
  }

  const displayTags = product.tags ?? product.technologies;

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">{product.name ?? 'Untitled Product'}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            {Array.isArray(product.author) && <span>By {product.author.join(', ')}</span>}
            {product.date && <span>on {product.date}</span>}
            {product.company && <span className="font-medium text-purple-600 dark:text-purple-400">· Company: {product.company}</span>}
            {product.lab && <span>· Lab: {product.lab}</span>}
        </div>

        {product.description && (
          <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-6 border-l-4 border-gray-300 dark:border-gray-600 pl-4">
            {product.description}
          </p>
        )}

        <ProductContent product={product} />



        {/* Product Links Section */}
        <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 text-lg text-gray-700 dark:text-gray-300">Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.productUrl && (
                    <a href={product.productUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                        <div className="bg-purple-100 dark:bg-purple-800 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
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

                {product.videoUrl && (
                    <a href={product.videoUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                        <div className="bg-red-100 dark:bg-red-800 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-300" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium text-gray-700 dark:text-gray-200">YouTube Demo Video</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Watch product demonstration on YouTube</div>
                        </div>
                    </a>
                )}

                {product.githubUrl && (
                    <a href={product.githubUrl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800/80 transition-colors">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-full mr-3">
                            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
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

        <RelatedLinksSection title="Related Internal Content" links={product.related} />
        <RelatedLinksSection title="External Resources" links={product.links} />

         <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
             <Link href="/products" className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                ← Back to Products
             </Link>
         </div>

      </article>
    </main>
  );
}
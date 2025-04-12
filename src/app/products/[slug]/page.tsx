import { getProducts } from '@/lib/dataUtils';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface ProductDetailPageProps {
  params: { slug: string };
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

  return products.map((product) => {
    let slug: string | null = null;
    if (typeof product.name === 'string' && product.name.trim() !== '') {
      slug = product.name.toLowerCase().replace(/\s+/g, '-');
    } else if (product.id !== null && product.id !== undefined) {
      slug = product.id.toString();
    }
    return slug ? { slug } : null;
  }).filter(Boolean);
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  // Đảm bảo params đã được await trước khi sử dụng
  const slug = params.slug;
  const product = await getProductDetails(slug);

  if (!product) {
    notFound();
  }

  const displayTags = product.tags ?? product.technologies;
  const productLink = product.url ?? product.link ?? product.demoUrl;

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-white">{product.name ?? 'Untitled Product'}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
            {Array.isArray(product.author) && <span>By {product.author.join(', ')}</span>}
            {product.date && <span>on {product.date}</span>}
             {product.lab && <span>· Lab: {product.lab}</span>}
        </div>

        {product.description && (
          <p className="text-lg italic text-gray-600 dark:text-gray-400 mb-6 border-l-4 border-gray-300 dark:border-gray-600 pl-4">
            {product.description}
          </p>
        )}

         {Array.isArray(product.images) && product.images.length > 0 && (
            <div className="mb-6">
                <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Images:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.images.map((img, index) => (
                        typeof img === 'object' && img.url && (
                        <div key={index}>
                            <img src={img.url} alt={img.caption || `Product image ${index + 1}`} className="w-full h-auto rounded-md shadow"/>
                            {img.caption && <p className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400">{img.caption}</p>}
                        </div>
                        ) || (typeof img === 'string' && (
                             <img key={index} src={img} alt={`Product image ${index + 1}`} className="w-full h-auto rounded-md shadow"/>
                        ))
                    ))}
                </div>
            </div>
        )}

         {Array.isArray(displayTags) && displayTags.length > 0 && (
            <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Tags/Technologies:</h3>
              <div className="flex flex-wrap gap-2">
                {displayTags.map((tag) => (
                  typeof tag === 'string' && (
                    <span key={tag} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-purple-900 dark:text-purple-300">
                      {tag}
                    </span>
                  )
                ))}
              </div>
            </div>
        )}

        {productLink && (
             <div className="mb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                 <h3 className="font-semibold mb-2 text-lg text-gray-700 dark:text-gray-300">Product Link:</h3>
                 <Link href={productLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium">
                   Visit Product/Demo →
                 </Link>
            </div>
        )}

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
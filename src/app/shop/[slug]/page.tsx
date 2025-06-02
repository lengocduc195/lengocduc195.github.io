import { getShopProductBySlug, getRelatedProducts, getShopProducts } from '@/lib/shopUtils';
import ProductDetail from './ProductDetail';
import { notFound } from 'next/navigation';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const products = await getShopProducts();

  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Đảm bảo params đã được giải quyết trước khi sử dụng
  const resolvedParams = await Promise.resolve(params);
  const { slug } = resolvedParams;
  const product = await getShopProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product, 4);

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <ProductDetail product={product} relatedProducts={relatedProducts} />
      </div>
    </main>
  );
}

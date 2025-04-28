import fs from 'fs';
import path from 'path';

export interface ShopProduct {
  id: number;
  name: string;
  slug: string;
  description: string;
  longDescription?: string;
  price: number;
  salePrice?: number;
  image: string;
  gallery?: string[];
  category: string;
  features?: string[];
  specifications?: Record<string, string>;
  inStock: boolean;
  rating: number;
  reviews: number;
  date: string;
  tags?: string[];
}

const SHOP_DATA_DIR = path.join(process.cwd(), 'public', 'assets', 'data', 'shop');

/**
 * Lấy tất cả sản phẩm từ thư mục data/shop
 */
export async function getShopProducts(): Promise<ShopProduct[]> {
  try {
    // Kiểm tra xem thư mục có tồn tại không
    if (!fs.existsSync(SHOP_DATA_DIR)) {
      console.warn(`Shop data directory not found: ${SHOP_DATA_DIR}`);
      return [];
    }

    const files = fs.readdirSync(SHOP_DATA_DIR);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    const products: ShopProduct[] = [];
    
    for (const file of jsonFiles) {
      const filePath = path.join(SHOP_DATA_DIR, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const product = JSON.parse(fileContent);
      
      // Đảm bảo sản phẩm có slug
      if (!product.slug) {
        product.slug = product.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      }
      
      products.push(product);
    }
    
    // Sắp xếp sản phẩm theo ngày (mới nhất trước)
    return products.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error loading shop products:', error);
    return [];
  }
}

/**
 * Lấy sản phẩm theo slug
 */
export async function getShopProductBySlug(slug: string): Promise<ShopProduct | null> {
  const products = await getShopProducts();
  return products.find(product => product.slug === slug) || null;
}

/**
 * Lấy các sản phẩm liên quan
 */
export async function getRelatedProducts(product: ShopProduct, limit: number = 4): Promise<ShopProduct[]> {
  const allProducts = await getShopProducts();
  
  // Lọc ra các sản phẩm cùng danh mục, ngoại trừ sản phẩm hiện tại
  const sameCategory = allProducts.filter(p => 
    p.id !== product.id && p.category === product.category
  );
  
  // Nếu không đủ sản phẩm cùng danh mục, thêm các sản phẩm khác
  if (sameCategory.length < limit) {
    const otherProducts = allProducts.filter(p => 
      p.id !== product.id && p.category !== product.category
    );
    
    return [...sameCategory, ...otherProducts].slice(0, limit);
  }
  
  return sameCategory.slice(0, limit);
}

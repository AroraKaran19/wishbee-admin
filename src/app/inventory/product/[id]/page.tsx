import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProductDetailPage } from '@/components/product/product-detail-page';
import { productApi } from '@/lib/api/products';

interface ProductIndividualPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPageRoute({ params }: ProductIndividualPageProps) {
  const { id } = await params;
  
  try {
    const response = await productApi.getById(id);
    const product = response.data;

    if (!product) {
      notFound();
    }

    return (
      <DashboardLayout>
        <ProductDetailPage product={product} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error('Error fetching product:', error);
    notFound();
  }
}

// Generate static params for all products
export async function generateStaticParams() {
  try {
    const response = await productApi.getAll({ limit: 20 });
    const products = response.data;
    
    return products.map((product: any) => ({
      id: product._id,
    }));
  } catch (error) {
    console.error('Error fetching products for static generation:', error);
    return []; // Return empty array if API fails
  }
}

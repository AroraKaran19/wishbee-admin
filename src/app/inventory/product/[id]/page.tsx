import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ProductDetailPage } from '@/components/product/product-detail-page';
import { productDetails } from '@/lib/data/mockData';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPageRoute({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = productDetails.find(p => p.id === id);

  if (!product) {
    notFound();
  }

  return (
    <DashboardLayout>
      <ProductDetailPage product={product} />
    </DashboardLayout>
  );
}

// Generate static params for all products
export async function generateStaticParams() {
  return productDetails.map((product) => ({
    id: product.id,
  }));
}

import { notFound } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PermissionGuard } from '@/components/layout/permission-guard';
import { ProductDetailPage } from '@/components/product/product-detail-page';
import { productApi } from '@/lib/api/products';
import { ADMIN_PERMISSIONS } from '@/lib/constants/permissions';

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
        <PermissionGuard requiredPermission={ADMIN_PERMISSIONS.INVENTORY}>
          <ProductDetailPage product={product} />
        </PermissionGuard>
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
    const productsData = response.data?.products;
    
    if (!Array.isArray(productsData)) {
      return [];
    }
    
    return productsData.map((product: any) => ({
      id: product._id,
    }));
  } catch (error) {
    console.error('Error fetching products for static generation:', error);
    return []; // Return empty array if API fails
  }
}

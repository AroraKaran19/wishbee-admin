import { notFound } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ComboDetailPage } from "@/components/combo/combo-detail-page";
import { comboApi } from "@/lib/api/combos";

interface ComboIndividualPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ComboDetailPageRoute({
  params,
}: ComboIndividualPageProps) {
  const { id } = await params;

  try {
    const response = await comboApi.getById(id);
    const combo = response.data;

    if (!combo) {
      notFound();
    }

    return (
      <DashboardLayout>
        <ComboDetailPage combo={combo} />
      </DashboardLayout>
    );
  } catch (error) {
    console.error("Error fetching combo:", error);
    notFound();
  }
}

// Generate static params for all combos
export async function generateStaticParams() {
  try {
    const response = await comboApi.getAll({ limit: 20 });
    const combosData = response.data?.combos || response.data;

    if (!Array.isArray(combosData)) {
      return [];
    }

    return combosData.map((combo: any) => ({
      id: combo._id,
    }));
  } catch (error) {
    console.error("Error fetching combos for static generation:", error);
    return []; // Return empty array if API fails
  }
}

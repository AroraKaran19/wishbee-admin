import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingSkeleton } from "@/components/ui/loading";

export default function EditProductLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <LoadingSkeleton className="h-4 w-4 rounded" />
          <LoadingSkeleton className="h-6 w-48" />
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <LoadingSkeleton className="h-6 w-40" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <LoadingSkeleton className="h-4 w-24" />
                    <LoadingSkeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-4">
              <LoadingSkeleton className="h-6 w-32" />
              <LoadingSkeleton className="h-32 w-full rounded-lg" />
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <LoadingSkeleton className="h-6 w-28" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <LoadingSkeleton
                    key={index}
                    className="h-24 w-full rounded-lg aspect-square"
                  />
                ))}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
              <LoadingSkeleton className="h-6 w-32" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <LoadingSkeleton className="h-4 w-20" />
                    <LoadingSkeleton className="h-10 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <LoadingSkeleton className="h-12 w-32 rounded-lg" />
              <LoadingSkeleton className="h-12 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}


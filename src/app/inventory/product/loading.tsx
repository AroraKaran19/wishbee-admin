import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoadingSkeleton } from "@/components/ui/loading";

export default function ProductLoading() {
  return (
    <DashboardLayout>
      <div className="space-y-6 h-full flex flex-col">
        <div className="flex items-center gap-4">
          <LoadingSkeleton className="h-6 w-6 rounded" />
          <LoadingSkeleton className="h-6 w-48" />
        </div>

        <div className="flex-1 min-h-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="py-3 border-gray-200">
                  <div className="flex space-x-1">
                    <div className="px-4 py-3 rounded-tr-3xl">
                      <LoadingSkeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-10">
                        <LoadingSkeleton className="h-4 w-32" />
                        <LoadingSkeleton className="h-4 w-48" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex gap-4">
                  <LoadingSkeleton className="flex-1 aspect-square rounded-lg" />
                  <div className="flex flex-col space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <LoadingSkeleton
                        key={index}
                        className="w-16 h-16 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <LoadingSkeleton className="h-6 w-32 mb-6" />
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2"
                    >
                      <LoadingSkeleton className="h-4 w-24" />
                      <LoadingSkeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 pb-4">
                <LoadingSkeleton className="flex-1 h-12 rounded-lg" />
                <LoadingSkeleton className="flex-1 h-12 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

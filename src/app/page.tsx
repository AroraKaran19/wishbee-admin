import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { WelcomePage } from "@/components/home/welcome-page";

export default function Home() {
  // DashboardLayout wraps ProtectedRoute, which sends unauthenticated
  // visitors to /login.
  return (
    <DashboardLayout>
      <WelcomePage />
    </DashboardLayout>
  );
}

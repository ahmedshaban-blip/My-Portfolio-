import { ThemeProvider } from "@/components/theme-provider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatedBackground } from "@/components/animations/AnimatedBackground";
import { AdminAuthGuard } from "@/components/admin/AdminAuthGuard";
import { SECRET_ADMIN_PATH, useSecretHotkey } from "@/hooks/use-secret-hotkey";
import { useVisitTracker } from "@/hooks/use-visit-tracker";
import { Suspense, lazy } from "react";
const CVDashboard = lazy(() => import("./pages/CVDashboard"));
// OPTIMIZE: react-query only serves the private admin route — keep it out of
// the public initial bundle.
const AdminQueryProvider = lazy(() =>
  import("@/components/admin/AdminQueryProvider").then((m) => ({
    default: m.AdminQueryProvider,
  }))
);
import Index from "./pages/Index";
const CVView = lazy(() => import("./pages/CVView"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AppRoutes = () => {
  useSecretHotkey();
  useVisitTracker();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path={SECRET_ADMIN_PATH}
        element={
          <AdminAuthGuard>
            <Suspense fallback={null}>
              <AdminQueryProvider>
                <CVDashboard />
              </AdminQueryProvider>
            </Suspense>
          </AdminAuthGuard>
        }
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route
        path="/cv"
        element={
          <Suspense fallback={null}>
            <CVView />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={null}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  );
};

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <AnimatedBackground />
    <Sonner />
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </ThemeProvider>
);

export default App;

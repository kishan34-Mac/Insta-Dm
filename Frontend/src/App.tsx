import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";


import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import {
  ProtectedRoute,
  PublicOnlyRoute,
} from "@/components/auth/AuthRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import { AuthProvider } from "@/store/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CookieConsent } from "@/components/CookieConsent";
import { RealtimeListener } from "@/components/RealtimeListener";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

const Login = lazy(() => import("./pages/auth/Login"));
const Signup = lazy(() => import("./pages/auth/Signup"));
const AdminLogin = lazy(() => import("./pages/auth/AdminLogin"));

const DashboardLayout = lazy(
  () => import("./pages/dashboard/DashboardLayout"),
);
const Overview = lazy(() => import("./pages/dashboard/Overview"));
const Campaigns = lazy(() => import("./pages/dashboard/Campaigns"));
const CampaignBuilder = lazy(
  () => import("./pages/dashboard/CampaignBuilder"),
);
const Analytics = lazy(() => import("./pages/dashboard/Analytics"));
const Leads = lazy(() => import("./pages/dashboard/Leads"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));

const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns"));

const queryClient = new QueryClient();

export default function App() {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "YOUR_GOOGLE_CLIENT_ID_HERE";

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <AuthProvider>
            <RealtimeListener />

            <Toaster />
            <Sonner />

            <GoogleOAuthProvider clientId={googleClientId}>
              <BrowserRouter>
                <Suspense
                  fallback={
                    <div className="min-h-screen bg-background" />
                  }
                >
                  <Routes>
                    {/* Public Pages */}
                    <Route path="/" element={<Index />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />

                    {/* Authentication */}
                    <Route element={<PublicOnlyRoute />}>
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route
                        path="/admin-login"
                        element={<AdminLogin />}
                      />
                    </Route>

                    {/* User Dashboard */}
                    <Route element={<ProtectedRoute />}>
                      <Route
                        path="/dashboard"
                        element={<DashboardLayout />}
                      >
                        <Route index element={<Overview />} />
                        <Route
                          path="campaigns"
                          element={<Campaigns />}
                        />
                        <Route
                          path="campaigns/new"
                          element={<CampaignBuilder />}
                        />
                        <Route
                          path="campaigns/edit/:id"
                          element={<CampaignBuilder />}
                        />
                        <Route
                          path="analytics"
                          element={<Analytics />}
                        />
                        <Route path="leads" element={<Leads />} />
                        <Route
                          path="settings"
                          element={<Settings />}
                        />
                      </Route>
                    </Route>

                    {/* Admin Dashboard */}
                    <Route element={<AdminRoute />}>
                      <Route
                        path="/admin"
                        element={<AdminLayout />}
                      >
                        <Route
                          index
                          element={<AdminDashboard />}
                        />

                        <Route
                          path="dashboard"
                          element={<AdminDashboard />}
                        />

                        <Route
                          path="users"
                          element={<AdminUsers />}
                        />

                        <Route
                          path="payments"
                          element={<AdminPayments />}
                        />
                        <Route
                          path="campaigns"
                          element={<AdminCampaigns />}
                        />
                      </Route>
                    </Route>

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </GoogleOAuthProvider>

            <CookieConsent />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
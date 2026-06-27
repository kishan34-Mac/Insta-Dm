import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/store/AuthContext";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import "./admin.css";

const adminLinks = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    to: "/admin/users",
    icon: Users,
  },
  {
    label: "Payments",
    to: "/admin/payments",
    icon: CreditCard,
  },
  
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setIsDark(document.documentElement.classList.contains("dark"));
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="admin-shell admin-page min-h-screen text-foreground">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "admin-sidebar fixed inset-y-0 left-0 z-50 flex flex-col border-r transition-all duration-300",
          "w-[250px] -translate-x-full lg:translate-x-0",
          mobileSidebarOpen && "translate-x-0",
          sidebarCollapsed && "lg:w-[72px]",
        )}
      >
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b px-4">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex min-w-0 items-center"
          >
            <img
              src="/assets/athenura-logo.png"
              alt="Athenura"
              className={cn(
                "h-7 w-auto object-contain transition-all",
                sidebarCollapsed && "lg:hidden",
              )}
            />

            {sidebarCollapsed && (
              <span className="hidden h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground lg:inline-flex">
                A
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-6">
          <p
            className={cn(
              "mb-2 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground",
              sidebarCollapsed && "lg:hidden",
            )}
          >
            Management
          </p>

          <div className="space-y-1">
            {adminLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileSidebarOpen(false)}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    cn(
                      "flex h-10 w-full items-center rounded-lg px-3 text-[14px] font-medium transition-colors",
                      sidebarCollapsed ? "justify-center px-0" : "gap-3",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />

                  <span
                    className={cn(
                      "truncate",
                      sidebarCollapsed && "lg:hidden",
                    )}
                  >
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="shrink-0 border-t p-3">
          <button
            type="button"
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : undefined}
            className={cn(
              "flex h-10 w-full items-center rounded-lg px-3 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-destructive",
              sidebarCollapsed ? "justify-center px-0" : "gap-3",
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />

            <span className={cn(sidebarCollapsed && "lg:hidden")}>
              Logout
            </span>
          </button>
        </div>
      </aside>

      <div
        className={cn(
          "admin-main min-h-screen transition-[margin] duration-300",
          "lg:ml-[250px]",
          sidebarCollapsed && "lg:ml-[72px]",
        )}
      >
        <header className="admin-header sticky top-0 z-30 flex h-[68px] items-center justify-between border-b px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setSidebarCollapsed((value) => !value)}
              className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-muted lg:inline-flex"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            <div className="min-w-0">
              <h1 className="truncate text-[16px] font-semibold sm:text-[18px]">
                Admin Console
              </h1>

              <p className="hidden truncate text-[13px] text-muted-foreground sm:block">
                Manage users, billing, and platform activity
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-muted"
            >
              {isDark ? (
                <Sun className="h-[18px] w-[18px]" />
              ) : (
                <Moon className="h-[18px] w-[18px]" />
              )}
            </button>

          </div>
        </header>

        <main className="w-full overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
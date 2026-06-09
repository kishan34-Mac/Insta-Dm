import {
  BarChart3,
  Megaphone,
  LayoutDashboard,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";

import { NavLink } from "@/components/NavLink";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export type DashboardNavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
};

const workspaceItems: DashboardNavItem[] = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, end: true },
  {
    title: "Campaigns",
    url: "/dashboard/campaigns",
    icon: Megaphone,
  },
  { title: "Leads", url: "/dashboard/leads", icon: Users },
];

const managementItems: DashboardNavItem[] = [
 
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Settings", url: "/dashboard/settings", icon: SettingsIcon },
   {
    title: " Back to Home",
    url: "/",
    icon: LayoutDashboard,
    end: true,
  }
  // { title: "Billing", url: "/dashboard/settings", icon: SettingsIcon },
];

export function SidebarNav() {
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>WORKSPACE</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {workspaceItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.end}
                    className="hover:bg-muted rounded-xl transition-all"
                    activeClassName="bg-gradient-primary text-primary-foreground hover:bg-gradient-primary [&>svg]:text-primary-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>MANAGEMENT</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {managementItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={item.url}
                    end={item.end}
                    className="hover:bg-muted rounded-xl transition-all"
                    activeClassName="bg-gradient-primary text-primary-foreground hover:bg-gradient-primary [&>svg]:text-primary-foreground font-medium"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}


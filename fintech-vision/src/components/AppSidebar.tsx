import { LayoutDashboard, ArrowLeftRight, History, FileText, LogOut, Globe, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Profile", url: "/profile", icon: User }, // Added this
  { title: "Payments", url: "/payments", icon: ArrowLeftRight },
  { title: "History", url: "/history", icon: History },
  { title: "Reports", url: "/reports", icon: FileText },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, account, accounts, switchAccount } = useAuth();

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-sidebar-primary" />
              {!collapsed && <span className="font-display font-bold">VaultBank</span>}
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/dashboard"} className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && account && (
          <div className="mb-3 rounded-lg bg-sidebar-accent/50 p-3">
            <p className="text-xs text-sidebar-foreground/60 mb-2">Logged in as</p>
            {accounts && accounts.length > 1 ? (
              <Select
                value={account.accountNumber}
                onValueChange={(val) => {
                  const selected = accounts.find((a) => a.accountNumber === val);
                  if (selected) switchAccount(selected);
                }}
              >
                <SelectTrigger className="w-full bg-background border-border h-auto py-2 px-3">
                  <div className="flex flex-col items-start text-left truncate overflow-hidden w-full">
                    <span className="text-sm font-medium text-sidebar-foreground truncate w-full">{account.holderName}</span>
                    <span className="text-[10px] text-sidebar-primary font-mono mt-0.5 truncate w-full">{account.accountNumber} &bull; {account.accountType}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.accountNumber} value={acc.accountNumber}>
                      <div className="flex flex-col items-start py-1">
                        <span className="text-sm font-medium">{acc.holderName}</span>
                        <span className="text-xs text-muted-foreground">{acc.accountNumber} &bull; {acc.accountType}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div>
                <p className="text-sm font-medium text-sidebar-foreground truncate">{account.holderName}</p>
                <p className="text-xs text-sidebar-primary font-mono">{account.accountNumber} &bull; {account.accountType}</p>
              </div>
            )}
          </div>
        )}
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && "Logout"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

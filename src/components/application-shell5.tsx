"use client";

import {
  BadgeCheck,
  BarChart3,
  Briefcase,
  ChevronRight,
  ChevronsUpDown,
  ClipboardList,
  Clock3,
  FileText,
  Folder,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Settings,
  Sparkles,
  Star,
  User,
  Users,
} from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

// Base nav item - used by simple sidebars
type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
  // Optional children for submenus (Sidebar3+)
  children?: NavItem[];
};

// Nav group with optional collapsible state
type NavGroup = {
  title: string;
  items: NavItem[];
  // Optional: default collapsed state (Sidebar2+)
  defaultOpen?: boolean;
};

// User data for footer (Sidebar6+)
type UserData = {
  name: string;
  email: string;
  avatar: string;
};

// Complete sidebar data structure
type SidebarData = {
  // Logo/branding (all sidebars)
  logo: {
    src: string;
    alt: string;
    title: string;
    description: string;
  };
  // Main navigation groups (all sidebars)
  navGroups: NavGroup[];
  // Footer navigation group (all sidebars)
  footerGroup: NavGroup;
  // User data for user footer (Sidebar6+)
  user?: UserData;
  // Workspaces for switcher (Sidebar7+)
  workspaces?: Array<{
    id: string;
    name: string;
    logo: string;
    plan: string;
  }>;
  // Currently active workspace (Sidebar7+)
  activeWorkspace?: string;
};

// Shared sidebar data - works with all sidebar variations
const sidebarData: SidebarData = {
  logo: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
    alt: "Shadcnblocks",
    title: "Shadcnblocks",
    description: "Build your app",
  },
  navGroups: [
    {
      title: "Overview",
      defaultOpen: true,
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "#",
          isActive: true,
        },
        { label: "Tasks", icon: ClipboardList, href: "#" },
        { label: "Roadmap", icon: BarChart3, href: "#" },
      ],
    },
    {
      title: "Projects",
      defaultOpen: true,
      items: [
        {
          label: "Active Projects",
          icon: Briefcase,
          href: "#",
          children: [
            { label: "Project Alpha", icon: FileText, href: "#" },
            { label: "Project Beta", icon: FileText, href: "#" },
            { label: "Project Gamma", icon: FileText, href: "#" },
          ],
        },
        {
          label: "Archived",
          icon: Folder,
          href: "#",
          children: [
            { label: "2024 Archive", icon: FileText, href: "#" },
            { label: "2023 Archive", icon: FileText, href: "#" },
          ],
        },
      ],
    },
    {
      title: "Team",
      defaultOpen: false,
      items: [
        { label: "Members", icon: Users, href: "#" },
        { label: "Sprints", icon: Clock3, href: "#" },
        { label: "Approvals", icon: BadgeCheck, href: "#" },
        { label: "Reviews", icon: Star, href: "#" },
      ],
    },
    {
      title: "Workspace",
      defaultOpen: false,
      items: [
        { label: "Integrations", icon: Globe2, href: "#" },
        { label: "Automations", icon: Sparkles, href: "#" },
      ],
    },
  ],
  footerGroup: {
    title: "Support",
    items: [
      { label: "Help Center", icon: HelpCircle, href: "#" },
      { label: "Settings", icon: Settings, href: "#" },
    ],
  },
  user: {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
  },
  workspaces: [
    {
      id: "1",
      name: "Shadcnblocks",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
      plan: "Enterprise",
    },
    {
      id: "2",
      name: "Shadcn Templates",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
      plan: "Startup",
    },
    {
      id: "3",
      name: "Shadcn Components",
      logo: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
      plan: "Free",
    },
  ],
  activeWorkspace: "1",
};


const NavMenuItem = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <Collapsible asChild defaultOpen className="group/collapsible">
        <SidebarMenuItem>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={item.isActive}>
              <Icon className="size-4" />
              <span>{item.label}</span>
              <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((child) => {
                const ChildIcon = child.icon;
                return (
                  <SidebarMenuSubItem key={child.label}>
                    <SidebarMenuSubButton asChild isActive={child.isActive}>
                      <a href={child.href}>
                        <ChildIcon className="size-4" />
                        <span>{child.label}</span>
                      </a>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                );
              })}
            </SidebarMenuSub>
          </CollapsibleContent>
        </SidebarMenuItem>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={item.isActive}>
        <a href={item.href}>
          <Icon className="size-4" />
          <span>{item.label}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

const NavUser = ({ user }: { user: UserData }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 size-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

// Module tabs (top bar navigation)
interface ModuleTabsProps {
  className?: string;
  groups: NavGroup[];
  activeGroupIndex: number;
  onChange: (index: number) => void;
}

const ModuleTabs = ({
  className,
  groups,
  activeGroupIndex,
  onChange,
}: ModuleTabsProps) => {
  return (
    <nav
      aria-label="Primary modules"
      className={cn(
        "hidden flex-1 items-center gap-1 overflow-x-auto whitespace-nowrap md:flex",
        className,
      )}
    >
      {groups.map((group, index) => {
        const isActive = index === activeGroupIndex;
        return (
          <button
            key={group.title}
            type="button"
            onClick={() => onChange(index)}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <span>{group.title}</span>
          </button>
        );
      })}
    </nav>
  );
};

// Mobile bottom navigation
interface MobileBottomNavProps {
  className?: string;
  groups: NavGroup[];
  activeGroupIndex: number;
  onChange: (index: number) => void;
}

const MobileBottomNav = ({
  className,
  groups,
  activeGroupIndex,
  onChange,
}: MobileBottomNavProps) => {
  const { setOpenMobile } = useSidebar();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden",
        className,
      )}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${groups.length}, minmax(0, 1fr))`,
        }}
      >
        {groups.map((group, index) => {
          // Use first item's icon as the group icon
          const Icon = group.items[0]?.icon;
          const isActive = index === activeGroupIndex;
          return (
            <button
              key={group.title}
              type="button"
              onClick={() => {
                onChange(index);
                setOpenMobile(false);
              }}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-label={group.title}
            >
              {Icon && <Icon className="size-5" />}
              <span className="truncate">{group.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeGroupIndex: number;
}

const AppSidebar = ({ activeGroupIndex, ...props }: AppSidebarProps) => {
  const activeGroup = sidebarData.navGroups[activeGroupIndex];

  return (
    <Sidebar
      collapsible="icon"
      className="top-14 h-[calc(100svh-3.5rem)]!"
      {...props}
    >
      <SidebarHeader>
        <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <span className="px-2 text-sm font-medium group-data-[collapsible=icon]:hidden">
            {activeGroup.title}
          </span>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{activeGroup.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {activeGroup.items.map((item) => (
                <NavMenuItem key={item.label} item={item} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Footer group items */}
        <SidebarGroup>
          <SidebarGroupLabel>{sidebarData.footerGroup.title}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarData.footerGroup.items.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {sidebarData.user && <NavUser user={sidebarData.user} />}
      </SidebarFooter>
    </Sidebar>
  );
};

interface ApplicationShell5Props {
  className?: string;
}

const ApplicationShell5 = ({ className }: ApplicationShell5Props) => {
  const [activeGroupIndex, setActiveGroupIndex] = React.useState(0);
  const activeGroup = sidebarData.navGroups[activeGroupIndex];

  return (
    <SidebarProvider className={cn("flex flex-col", className)}>
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="flex h-14 items-center gap-4 px-4">
          <div className="flex items-center gap-3 md:hidden">
            <SidebarTrigger />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
              <img
                src={sidebarData.logo.src}
                alt={sidebarData.logo.alt}
                className="size-6 text-primary-foreground invert dark:invert-0"
              />
            </div>
            <span className="font-semibold">{sidebarData.logo.title}</span>
          </div>

          <ModuleTabs
            groups={sidebarData.navGroups}
            activeGroupIndex={activeGroupIndex}
            onChange={setActiveGroupIndex}
          />

          <div className="ml-auto flex items-center text-sm font-semibold md:hidden">
            {activeGroup.title}
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <AppSidebar activeGroupIndex={activeGroupIndex} />
        <SidebarInset className="pb-20 md:pb-0">
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </SidebarInset>
      </div>

      <MobileBottomNav
        groups={sidebarData.navGroups}
        activeGroupIndex={activeGroupIndex}
        onChange={setActiveGroupIndex}
      />
    </SidebarProvider>
  );
};

export { ApplicationShell5 };

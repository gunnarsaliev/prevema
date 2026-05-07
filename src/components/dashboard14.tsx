"use client";

import {
  BarChart3,
  BedDouble,
  Bell,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CreditCard,
  DoorOpen,
  Globe,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  User,
  Users,
  UtensilsCrossed,
  Wallet,
  Wrench,
} from "lucide-react";
import * as React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ---------------------------------------------------------------------------
// Schedule types
// ---------------------------------------------------------------------------

type Guest = {
  name: string;
  avatar?: string;
  initials: string;
};

type Booking = {
  id: string;
  guestName: string;
  roomNumber: string;
  roomType: string;
  time: string;
  guests: Guest[];
  guestCount: number;
  source: "Direct" | "Booking.com" | "Expedia" | "Walk-in";
  status: string;
  statusColor: string;
  nights: number;
  specialRequests?: string;
};

type DateCell = {
  day: string;
  date: number;
  month: number;
  year: number;
  isSelected: boolean;
  isToday: boolean;
};

// ---------------------------------------------------------------------------
// Schedule mock data
// ---------------------------------------------------------------------------

const ARRIVALS: Booking[] = [
  {
    id: "arr-1",
    guestName: "James Brown",
    roomNumber: "412",
    roomType: "Suite",
    time: "2:00 PM Check-in",
    guests: [
      {
        name: "James Brown",
        avatar: "https://i.pravatar.cc/32?img=12",
        initials: "JB",
      },
      {
        name: "Maria Brown",
        avatar: "https://i.pravatar.cc/32?img=25",
        initials: "MB",
      },
    ],
    guestCount: 4,
    source: "Direct",
    status: "VIP",
    statusColor: "violet",
    nights: 3,
    specialRequests: "Late check-out, extra pillows",
  },
  {
    id: "arr-2",
    guestName: "Sarah & Tom Lee",
    roomNumber: "215",
    roomType: "Deluxe",
    time: "3:00 PM Check-in",
    guests: [
      {
        name: "Sarah Lee",
        avatar: "https://i.pravatar.cc/32?img=32",
        initials: "SL",
      },
      {
        name: "Tom Lee",
        avatar: "https://i.pravatar.cc/32?img=15",
        initials: "TL",
      },
    ],
    guestCount: 2,
    source: "Booking.com",
    status: "Confirmed",
    statusColor: "emerald",
    nights: 5,
  },
  {
    id: "arr-3",
    guestName: "Michael Chen",
    roomNumber: "108",
    roomType: "Standard",
    time: "4:00 PM Check-in",
    guests: [
      {
        name: "Michael Chen",
        avatar: "https://i.pravatar.cc/32?img=53",
        initials: "MC",
      },
    ],
    guestCount: 1,
    source: "Expedia",
    status: "Pending",
    statusColor: "amber",
    nights: 2,
    specialRequests: "Ground floor preferred",
  },
  {
    id: "arr-4",
    guestName: "Emily Davis",
    roomNumber: "501",
    roomType: "Penthouse",
    time: "5:30 PM Check-in",
    guests: [
      {
        name: "Emily Davis",
        avatar: "https://i.pravatar.cc/32?img=44",
        initials: "ED",
      },
      {
        name: "Ryan Davis",
        avatar: "https://i.pravatar.cc/32?img=18",
        initials: "RD",
      },
      { name: "Sophie Davis", initials: "SD" },
    ],
    guestCount: 5,
    source: "Direct",
    status: "VIP",
    statusColor: "violet",
    nights: 7,
    specialRequests: "Airport transfer, champagne on arrival",
  },
];

const IN_HOUSE: Booking[] = [
  {
    id: "inh-1",
    guestName: "Robert Garcia",
    roomNumber: "302",
    roomType: "Deluxe",
    time: "Since Feb 16",
    guests: [
      {
        name: "Robert Garcia",
        avatar: "https://i.pravatar.cc/32?img=60",
        initials: "RG",
      },
    ],
    guestCount: 1,
    source: "Walk-in",
    status: "Checked In",
    statusColor: "sky",
    nights: 4,
  },
  {
    id: "inh-2",
    guestName: "Anna & Chris Bell",
    roomNumber: "419",
    roomType: "Suite",
    time: "Since Feb 15",
    guests: [
      {
        name: "Anna Bell",
        avatar: "https://i.pravatar.cc/32?img=29",
        initials: "AB",
      },
      {
        name: "Chris Bell",
        avatar: "https://i.pravatar.cc/32?img=14",
        initials: "CB",
      },
    ],
    guestCount: 2,
    source: "Booking.com",
    status: "Checked In",
    statusColor: "sky",
    nights: 6,
    specialRequests: "Daily housekeeping at 10 AM",
  },
  {
    id: "inh-3",
    guestName: "Lisa Park",
    roomNumber: "207",
    roomType: "Standard",
    time: "Since Feb 17",
    guests: [
      {
        name: "Lisa Park",
        avatar: "https://i.pravatar.cc/32?img=38",
        initials: "LP",
      },
    ],
    guestCount: 1,
    source: "Direct",
    status: "Checked In",
    statusColor: "sky",
    nights: 2,
  },
];

const DEPARTURES: Booking[] = [
  {
    id: "dep-1",
    guestName: "David Kim",
    roomNumber: "315",
    roomType: "Deluxe",
    time: "11:00 AM Check-out",
    guests: [
      {
        name: "David Kim",
        avatar: "https://i.pravatar.cc/32?img=52",
        initials: "DK",
      },
      {
        name: "Jenny Kim",
        avatar: "https://i.pravatar.cc/32?img=41",
        initials: "JK",
      },
    ],
    guestCount: 2,
    source: "Expedia",
    status: "Checking Out",
    statusColor: "sky",
    nights: 3,
  },
  {
    id: "dep-2",
    guestName: "Rachel Green",
    roomNumber: "104",
    roomType: "Standard",
    time: "12:00 PM Check-out",
    guests: [
      {
        name: "Rachel Green",
        avatar: "https://i.pravatar.cc/32?img=23",
        initials: "RG",
      },
    ],
    guestCount: 1,
    source: "Direct",
    status: "Checking Out",
    statusColor: "sky",
    nights: 1,
  },
];

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ---------------------------------------------------------------------------
// Schedule helpers
// ---------------------------------------------------------------------------

function generateDateCells(
  year: number,
  month: number,
  selectedDate: number,
): DateCell[] {
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Show 2 days from previous month
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: DateCell[] = [];

  // Previous month trailing days (up to 2)
  const prevStart = Math.max(0, 2);
  for (let i = prevStart; i > 0; i--) {
    const d = prevMonthDays - i + 1;
    const pm = month === 0 ? 11 : month - 1;
    const py = month === 0 ? year - 1 : year;
    cells.push({
      day: DAY_LABELS[new Date(py, pm, d).getDay()],
      date: d,
      month: pm,
      year: py,
      isSelected: false,
      isToday:
        d === today.getDate() &&
        pm === today.getMonth() &&
        py === today.getFullYear(),
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    cells.push({
      day: DAY_LABELS[dow],
      date: d,
      month,
      year,
      isSelected: d === selectedDate,
      isToday:
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear(),
    });
  }

  // Next month leading days (up to 2)
  const nm = month === 11 ? 0 : month + 1;
  const ny = month === 11 ? year + 1 : year;
  for (let d = 1; d <= 2; d++) {
    cells.push({
      day: DAY_LABELS[new Date(ny, nm, d).getDay()],
      date: d,
      month: nm,
      year: ny,
      isSelected: false,
      isToday:
        d === today.getDate() &&
        nm === today.getMonth() &&
        ny === today.getFullYear(),
    });
  }

  return cells;
}

const STATUS_STYLES: Record<string, string> = {
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
  amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
};

const SOURCE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  Direct: Globe,
  "Booking.com": Globe,
  Expedia: Globe,
  "Walk-in": DoorOpen,
};

// ---------------------------------------------------------------------------
// Schedule sub-components
// ---------------------------------------------------------------------------

function ScheduleHeader() {
  return (
    <div className="flex items-center justify-between px-4 pt-4 pb-3">
      <h2 className="text-lg font-semibold tracking-tight">Bookings</h2>
      <button className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
        See All
      </button>
    </div>
  );
}

function MonthNavigation({
  month,
  year,
  onPrev,
  onNext,
}: {
  month: number;
  year: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="px-4 pb-3">
      <div className="flex items-center rounded-xl bg-muted/60 px-2 py-2">
        <button
          onClick={onPrev}
          aria-label="Previous month"
          className="flex size-6 items-center justify-center rounded-md border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <span className="flex-1 text-center text-sm font-medium text-foreground/85">
          {MONTH_LABELS[month]} {year}
        </span>
        <button
          onClick={onNext}
          aria-label="Next month"
          className="flex size-6 items-center justify-center rounded-md border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function HorizontalDateStrip({
  cells,
  onSelect,
}: {
  cells: DateCell[];
  onSelect: (cell: DateCell) => void;
}) {
  const VISIBLE_COUNT = 5;
  const [startIndex, setStartIndex] = React.useState(() => {
    const selectedIdx = cells.findIndex((c) => c.isSelected);
    return Math.max(0, Math.min(selectedIdx - 2, cells.length - VISIBLE_COUNT));
  });

  const visibleCells = cells.slice(startIndex, startIndex + VISIBLE_COUNT);
  const canGoLeft = startIndex > 0;
  const canGoRight = startIndex + VISIBLE_COUNT < cells.length;

  return (
    <div className="px-4 pb-4">
      <div className="flex items-center rounded-xl border px-2 py-2">
        <button
          onClick={() => setStartIndex((i) => Math.max(0, i - 1))}
          disabled={!canGoLeft}
          aria-label="Previous dates"
          className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="size-3.5" />
        </button>

        <div className="flex flex-1 justify-between gap-2">
          {visibleCells.map((cell, i) => {
            const isActive = cell.isSelected;
            return (
              <button
                key={`${cell.year}-${cell.month}-${cell.date}-${i}`}
                onClick={() => onSelect(cell)}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg py-2 transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="text-[11px] leading-none font-medium">
                  {cell.day}
                </span>
                <span className="text-sm font-semibold">
                  {cell.date.toString().padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() =>
            setStartIndex((i) => Math.min(cells.length - VISIBLE_COUNT, i + 1))
          }
          disabled={!canGoRight}
          aria-label="Next dates"
          className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border/80 bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

function ScheduleSearchBar() {
  return (
    <div className="px-4 pb-3">
      <div className="relative flex items-center">
        <Search className="absolute left-3 size-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search bookings..."
          className="h-9 w-full rounded-lg border bg-muted/40 pr-10 pl-9 text-sm transition-all placeholder:text-muted-foreground/60 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 focus:outline-none"
        />
        <div className="absolute right-3 flex items-center">
          <button className="flex size-6 items-center justify-center rounded-md transition-colors hover:bg-muted">
            <SlidersHorizontal className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}

function AvatarGroup({
  guests,
  guestCount,
}: {
  guests: Guest[];
  guestCount: number;
}) {
  if (guests.length === 0) return null;

  const overflow = guestCount - guests.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {guests.slice(0, 4).map((a) => (
          <Avatar
            key={a.name}
            className="size-7 border-2 border-background ring-0"
          >
            {a.avatar && <AvatarImage src={a.avatar} alt={a.name} />}
            <AvatarFallback className="bg-muted text-[10px] font-medium">
              {a.initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {overflow > 0 && (
        <span className="ml-2 text-xs font-medium text-muted-foreground">
          +{overflow}
        </span>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: Booking }) {
  const [expanded, setExpanded] = React.useState(false);
  const SourceIcon = SOURCE_ICONS[booking.source] || Globe;

  return (
    <div className="rounded-lg border bg-card p-3 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div>
            <h3 className="truncate text-sm leading-snug font-semibold">
              {booking.guestName} — {booking.roomType} {booking.roomNumber}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {booking.time}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AvatarGroup
              guests={booking.guests}
              guestCount={booking.guestCount}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <SourceIcon className="size-3.5" />
              <span>via {booking.source}</span>
            </div>
            <span className="text-muted-foreground/40">·</span>
            <Badge
              variant="secondary"
              className={cn(
                "border-0 px-2 py-0 text-[11px] font-medium",
                STATUS_STYLES[booking.statusColor] || STATUS_STYLES.violet,
              )}
            >
              {booking.status}
            </Badge>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-muted"
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-1 border-t pt-3 text-xs text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">Room Type:</span>{" "}
            {booking.roomType}
          </p>
          <p>
            <span className="font-medium text-foreground">Nights:</span>{" "}
            {booking.nights}
          </p>
          {booking.specialRequests && (
            <p>
              <span className="font-medium text-foreground">
                Special Requests:
              </span>{" "}
              {booking.specialRequests}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BookingList({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <BedDouble className="mb-2 size-8 opacity-40" />
        <p className="text-sm">No bookings</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Schedule panel (card-less variant for activity sidebar)
// ---------------------------------------------------------------------------

function SchedulePanel() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(today.getMonth());
  const [currentYear, setCurrentYear] = React.useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = React.useState(today.getDate());

  const dateCells = React.useMemo(
    () => generateDateCells(currentYear, currentMonth, selectedDate),
    [currentYear, currentMonth, selectedDate],
  );

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDate(1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDate(1);
  };

  const handleDateSelect = (cell: DateCell) => {
    if (cell.month !== currentMonth || cell.year !== currentYear) {
      setCurrentMonth(cell.month);
      setCurrentYear(cell.year);
    }
    setSelectedDate(cell.date);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0">
        <ScheduleHeader />
        <MonthNavigation
          month={currentMonth}
          year={currentYear}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
        <HorizontalDateStrip cells={dateCells} onSelect={handleDateSelect} />
        <ScheduleSearchBar />
      </div>

      <div className="min-h-0 flex-1 px-4 pb-4">
        <Tabs defaultValue="arrivals" className="flex h-full flex-col">
          <TabsList className="mb-4 w-full shrink-0">
            <TabsTrigger value="arrivals" className="flex-1 gap-1.5">
              <DoorOpen className="size-3.5" />
              Arrivals
            </TabsTrigger>
            <TabsTrigger value="in-house" className="flex-1 gap-1.5">
              <BedDouble className="size-3.5" />
              In-House
            </TabsTrigger>
            <TabsTrigger value="departures" className="flex-1 gap-1.5">
              <KeyRound className="size-3.5" />
              Departures
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="min-h-0 flex-1">
            <TabsContent value="arrivals" className="mt-0">
              <BookingList bookings={ARRIVALS} />
            </TabsContent>
            <TabsContent value="in-house" className="mt-0">
              <BookingList bookings={IN_HOUSE} />
            </TabsContent>
            <TabsContent value="departures" className="mt-0">
              <BookingList bookings={DEPARTURES} />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard14 types & data
// ---------------------------------------------------------------------------

type NavItem = {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  href: string;
  isActive?: boolean;
  children?: NavItem[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
  defaultOpen?: boolean;
};

type UserData = {
  name: string;
  email: string;
  avatar: string;
};

type SidebarData = {
  logo: {
    src: string;
    alt: string;
    title: string;
    description: string;
  };
  navGroups: NavGroup[];
  footerGroup: NavGroup;
  user?: UserData;
};

type HotelStatItem = {
  title: string;
  value: number;
  format: "currency" | "percent";
  trendValue: number;
  footerLabel: string;
  footerSubtext: string;
};

type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

type Order = {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: OrderStatus;
};

type FulfillmentItem = {
  order: string;
  shipped: Date;
  progress: number;
  segments: number[];
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const numberFormatter = new Intl.NumberFormat("en-US");
const trendPercentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});
const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 0,
});
const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const dashboardRangeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const dashboardRangeStart = new Date(2025, 0, 1);
const dashboardRangeEnd = new Date(2025, 0, 31);
const dashboardDateRangeLabel =
  typeof dashboardRangeFormatter.formatRange === "function"
    ? dashboardRangeFormatter.formatRange(
        dashboardRangeStart,
        dashboardRangeEnd,
      )
    : `${dashboardRangeFormatter.format(
        dashboardRangeStart,
      )} – ${dashboardRangeFormatter.format(dashboardRangeEnd)}`;

const shippedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const formatTrendValue = (trendValue: number) => {
  return trendPercentFormatter.format(trendValue / 100);
};

const mixBase = "var(--background)";

const palette = {
  primary: "var(--primary)",
  secondary: {
    light: `color-mix(in oklch, var(--primary) 75%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 85%, ${mixBase})`,
  },
  tertiary: {
    light: `color-mix(in oklch, var(--primary) 55%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 65%, ${mixBase})`,
  },
  quaternary: {
    light: `color-mix(in oklch, var(--primary) 40%, ${mixBase})`,
    dark: `color-mix(in oklch, var(--primary) 45%, ${mixBase})`,
  },
};

const sidebarData: SidebarData = {
  logo: {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
    alt: "Grandview",
    title: "Grandview",
    description: "Hospitality Suite",
  },
  navGroups: [
    {
      title: "Front Office",
      defaultOpen: true,
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          href: "#",
          isActive: true,
        },
        { label: "Reservations", icon: CalendarRange, href: "#" },
        { label: "Check-in / Check-out", icon: DoorOpen, href: "#" },
        {
          label: "Guest Profiles",
          icon: Users,
          href: "#",
          children: [
            { label: "All Guests", icon: Users, href: "#" },
            { label: "Loyalty Members", icon: Users, href: "#" },
            { label: "Corporate Accounts", icon: Users, href: "#" },
          ],
        },
      ],
    },
    {
      title: "Property",
      defaultOpen: true,
      items: [
        {
          label: "Rooms & Suites",
          icon: BedDouble,
          href: "#",
          children: [
            { label: "Floor Plan", icon: BedDouble, href: "#" },
            { label: "Room Types", icon: BedDouble, href: "#" },
            { label: "Availability", icon: BedDouble, href: "#" },
          ],
        },
        { label: "Housekeeping", icon: Sparkles, href: "#" },
        { label: "Dining & Events", icon: UtensilsCrossed, href: "#" },
      ],
    },
    {
      title: "Revenue",
      defaultOpen: false,
      items: [
        { label: "Rate Manager", icon: CreditCard, href: "#" },
        { label: "Billing & Invoices", icon: Wallet, href: "#" },
        { label: "Channel Distribution", icon: Globe, href: "#" },
      ],
    },
    {
      title: "Administration",
      defaultOpen: false,
      items: [
        { label: "Staff & Roles", icon: ShieldCheck, href: "#" },
        { label: "Maintenance Logs", icon: Wrench, href: "#" },
        { label: "Security & Access", icon: KeyRound, href: "#" },
      ],
    },
  ],
  footerGroup: {
    title: "Settings",
    items: [{ label: "Settings", icon: Settings, href: "#" }],
  },
  user: {
    name: "Robert Austin",
    email: "robert@grandview.hotel",
    avatar:
      "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar/avatar22.jpg",
  },
};

const hotelStats: HotelStatItem[] = [
  {
    title: "Occupancy Rate",
    value: 78,
    format: "percent",
    trendValue: 3.2,
    footerLabel: "+6 rooms vs last week",
    footerSubtext: "156 of 200 rooms occupied",
  },
  {
    title: "Avg. Daily Rate",
    value: 185,
    format: "currency",
    trendValue: 5.1,
    footerLabel: "+$9.00 from last month",
    footerSubtext: "Based on 156 occupied rooms",
  },
  {
    title: "RevPAR",
    value: 144.3,
    format: "currency",
    trendValue: 8.5,
    footerLabel: "+$11.30 from last month",
    footerSubtext: "Across 200 available rooms",
  },
];

const monthLabel = (monthIndex: number) =>
  monthFormatter.format(new Date(2025, monthIndex, 1));

const salesPipelineData: Record<
  string,
  { week: string; month: string; orders: number; sales: number }[]
> = {
  q1: [
    { week: "W1", month: monthLabel(0), orders: 220, sales: 5100 },
    { week: "W2", month: monthLabel(0), orders: 480, sales: 11200 },
    { week: "W3", month: monthLabel(0), orders: 390, sales: 9400 },
    { week: "W4", month: monthLabel(0), orders: 150, sales: 3600 },
    { week: "W5", month: monthLabel(1), orders: 310, sales: 7400 },
    { week: "W6", month: monthLabel(1), orders: 540, sales: 13100 },
    { week: "W7", month: monthLabel(1), orders: 460, sales: 10800 },
    { week: "W8", month: monthLabel(1), orders: 200, sales: 4700 },
    { week: "W9", month: monthLabel(2), orders: 130, sales: 3100 },
    { week: "W10", month: monthLabel(2), orders: 420, sales: 10200 },
    { week: "W11", month: monthLabel(2), orders: 510, sales: 12400 },
    { week: "W12", month: monthLabel(2), orders: 350, sales: 8500 },
  ],
  q2: [
    { week: "W1", month: monthLabel(3), orders: 410, sales: 9800 },
    { week: "W2", month: monthLabel(3), orders: 280, sales: 6700 },
    { week: "W3", month: monthLabel(3), orders: 120, sales: 2900 },
    { week: "W4", month: monthLabel(3), orders: 350, sales: 8400 },
    { week: "W5", month: monthLabel(4), orders: 520, sales: 12600 },
    { week: "W6", month: monthLabel(4), orders: 470, sales: 11300 },
    { week: "W7", month: monthLabel(4), orders: 190, sales: 4500 },
    { week: "W8", month: monthLabel(4), orders: 100, sales: 2400 },
    { week: "W9", month: monthLabel(5), orders: 330, sales: 7900 },
    { week: "W10", month: monthLabel(5), orders: 490, sales: 11800 },
    { week: "W11", month: monthLabel(5), orders: 540, sales: 13000 },
    { week: "W12", month: monthLabel(5), orders: 260, sales: 6200 },
  ],
  q3: [
    { week: "W1", month: monthLabel(6), orders: 180, sales: 4200 },
    { week: "W2", month: monthLabel(6), orders: 520, sales: 12800 },
    { week: "W3", month: monthLabel(6), orders: 480, sales: 11500 },
    { week: "W4", month: monthLabel(6), orders: 120, sales: 2800 },
    { week: "W5", month: monthLabel(7), orders: 90, sales: 2100 },
    { week: "W6", month: monthLabel(7), orders: 450, sales: 10500 },
    { week: "W7", month: monthLabel(7), orders: 510, sales: 12200 },
    { week: "W8", month: monthLabel(7), orders: 480, sales: 11000 },
    { week: "W9", month: monthLabel(8), orders: 200, sales: 4800 },
    { week: "W10", month: monthLabel(8), orders: 150, sales: 3500 },
    { week: "W11", month: monthLabel(8), orders: 380, sales: 9200 },
    { week: "W12", month: monthLabel(8), orders: 420, sales: 10100 },
  ],
  q4: [
    { week: "W1", month: monthLabel(9), orders: 300, sales: 7200 },
    { week: "W2", month: monthLabel(9), orders: 160, sales: 3800 },
    { week: "W3", month: monthLabel(9), orders: 440, sales: 10600 },
    { week: "W4", month: monthLabel(9), orders: 530, sales: 12900 },
    { week: "W5", month: monthLabel(10), orders: 380, sales: 9100 },
    { week: "W6", month: monthLabel(10), orders: 140, sales: 3400 },
    { week: "W7", month: monthLabel(10), orders: 250, sales: 6000 },
    { week: "W8", month: monthLabel(10), orders: 500, sales: 12100 },
    { week: "W9", month: monthLabel(11), orders: 550, sales: 13300 },
    { week: "W10", month: monthLabel(11), orders: 470, sales: 11400 },
    { week: "W11", month: monthLabel(11), orders: 210, sales: 5000 },
    { week: "W12", month: monthLabel(11), orders: 340, sales: 8200 },
  ],
};

const fullYearData = [
  { monthIndex: 0, thisYear: 42000, prevYear: 38000 },
  { monthIndex: 1, thisYear: 38000, prevYear: 45000 },
  { monthIndex: 2, thisYear: 52000, prevYear: 41000 },
  { monthIndex: 3, thisYear: 45000, prevYear: 48000 },
  { monthIndex: 4, thisYear: 58000, prevYear: 44000 },
  { monthIndex: 5, thisYear: 41000, prevYear: 52000 },
  { monthIndex: 6, thisYear: 55000, prevYear: 47000 },
  { monthIndex: 7, thisYear: 48000, prevYear: 53000 },
  { monthIndex: 8, thisYear: 62000, prevYear: 49000 },
  { monthIndex: 9, thisYear: 54000, prevYear: 58000 },
  { monthIndex: 10, thisYear: 67000, prevYear: 52000 },
  { monthIndex: 11, thisYear: 71000, prevYear: 61000 },
].map(({ monthIndex, ...entry }) => ({
  month: monthLabel(monthIndex),
  ...entry,
}));

type OccupancyScope = "all" | "rooms" | "suites";
type RevenueGlowSegment =
  | "all"
  | "roomRevenue"
  | "platformRevenue"
  | "upsellRevenue";
type RevenueGlowMetric = Exclude<RevenueGlowSegment, "all">;

type RecentArrivalItem = {
  roomNo: string;
  name: string;
  time: string;
  initials: string;
  avatar?: string;
};
type TimePeriod = "6months" | "year";

const OCCUPANCY_DAYS = 30;
const OCCUPANCY_TICK_EVERY = 3;

const occupancyScopeLabels: Record<OccupancyScope, string> = {
  all: "All ",
  rooms: "Rooms ",
  suites: "Suites ",
};

const occupancyScopeScale: Record<OccupancyScope, number> = {
  all: 1,
  rooms: 0.78,
  suites: 0.42,
};

const occupancyBaseData = [
  [25, 95, 42],
  [33, 77, 39],
  [30, 60, 36],
  [31, 74, 58],
  [31, 100, 49],
  [23, 113, 40],
  [34, 81, 33],
  [28, 92, 39],
  [27, 98, 42],
  [18, 112, 34],
  [20, 85, 55],
  [22, 108, 43],
  [31, 114, 42],
  [29, 121, 39],
  [30, 118, 32],
  [35, 88, 33],
  [31, 84, 31],
  [23, 137, 60],
  [29, 141, 74],
  [27, 131, 40],
  [35, 95, 43],
  [34, 108, 45],
  [35, 92, 61],
  [37, 95, 74],
  [36, 112, 40],
  [24, 125, 49],
  [29, 137, 42],
  [32, 128, 61],
  [41, 108, 75],
  [28, 115, 52],
  [31, 115, 45],
  [21, 108, 38],
  [19, 129, 37],
  [20, 132, 39],
  [27, 117, 46],
  [34, 119, 39],
  [25, 90, 35],
  [24, 90, 40],
  [22, 105, 45],
  [23, 98, 48],
  [20, 93, 44],
  [17, 76, 39],
  [25, 80, 60],
  [29, 80, 44],
  [36, 83, 42],
  [32, 96, 38],
  [33, 104, 41],
  [33, 119, 41],
  [27, 104, 34],
  [31, 98, 38],
  [31, 85, 46],
  [30, 84, 58],
  [28, 99, 46],
  [28, 96, 40],
  [22, 101, 32],
  [24, 130, 42],
  [33, 121, 47],
  [34, 111, 47],
  [29, 89, 45],
  [31, 80, 36],
  [32, 101, 44],
  [28, 103, 41],
  [36, 100, 34],
  [36, 101, 45],
  [36, 86, 47],
  [27, 87, 56],
  [29, 99, 52],
  [34, 121, 44],
  [37, 114, 38],
  [37, 93, 36],
  [33, 87, 29],
  [33, 85, 40],
  [34, 82, 49],
  [34, 110, 39],
  [28, 99, 35],
  [23, 93, 28],
  [19, 79, 25],
  [22, 94, 37],
  [23, 76, 41],
  [18, 82, 42],
  [28, 98, 41],
  [27, 99, 37],
  [28, 102, 37],
  [22, 81, 58],
  [31, 92, 39],
  [29, 98, 37],
  [28, 86, 38],
  [33, 95, 42],
  [35, 116, 34],
  [38, 110, 40],
].map(([available, occupied, notReady], index) => ({
  day: index + 1,
  available,
  occupied,
  notReady,
}));

const revenueGlowData = [
  {
    channel: "Booking.com",
    roomRevenue: 46,
    platformRevenue: 27,
    upsellRevenue: 17,
  },
  {
    channel: "Airbnb",
    roomRevenue: 41,
    platformRevenue: 24,
    upsellRevenue: 23,
  },
  { channel: "Agoda", roomRevenue: 36, platformRevenue: 20, upsellRevenue: 17 },
  {
    channel: "Hotels.com",
    roomRevenue: 31,
    platformRevenue: 18,
    upsellRevenue: 15,
  },
  {
    channel: "Expedia",
    roomRevenue: 43,
    platformRevenue: 26,
    upsellRevenue: 18,
  },
  {
    channel: "Direct",
    roomRevenue: 58,
    platformRevenue: 14,
    upsellRevenue: 12,
  },
].map((entry) => ({
  ...entry,
  total: entry.roomRevenue + entry.platformRevenue + entry.upsellRevenue,
}));

const recentArrivalsData: RecentArrivalItem[] = [
  {
    roomNo: "#105",
    name: "Marvin McKinney",
    time: "10 minutes ago",
    initials: "M",
    avatar: "https://i.pravatar.cc/40?img=32",
  },
  {
    roomNo: "#106",
    name: "Albert Flores",
    time: "2 minutes ago",
    initials: "A",
    avatar: "https://i.pravatar.cc/40?img=12",
  },
  {
    roomNo: "#107",
    name: "Guy Hawkins",
    time: "2 hours ago",
    initials: "G",
    avatar: "https://i.pravatar.cc/40?img=53",
  },
  {
    roomNo: "#108",
    name: "Brooklyn Simmons",
    time: "12 hours ago",
    initials: "B",
    avatar: "https://i.pravatar.cc/40?img=15",
  },
  {
    roomNo: "#109",
    name: "Cody Fisher",
    time: "22 hours ago",
    initials: "C",
    avatar: "https://i.pravatar.cc/40?img=22",
  },
  {
    roomNo: "#110",
    name: "Darlene Robertson",
    time: "3 days ago",
    initials: "D",
    avatar: "https://i.pravatar.cc/40?img=28",
  },
];

const periodLabels: Record<TimePeriod, string> = {
  "6months": "Last 6 Months",
  year: "Last Year",
};

function getDataForPeriod(period: TimePeriod) {
  if (period === "6months") {
    return fullYearData.slice(0, 6);
  }
  return fullYearData;
}

const orderStatuses: OrderStatus[] = [
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const statusStyles: Record<OrderStatus, string> = {
  Processing:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-400/20",
  Shipped:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-400/20",
  Delivered:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-400 dark:ring-emerald-400/20",
  Cancelled:
    "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/30 dark:text-red-400 dark:ring-red-400/20",
};

const orders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    customer: "Sarah Johnson",
    status: "Delivered",
    total: 2499.0,
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    customer: "Michael Chen",
    status: "Shipped",
    total: 1348.0,
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    customer: "Emma Wilson",
    status: "Processing",
    total: 1198.0,
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    customer: "James Rodriguez",
    status: "Delivered",
    total: 799.0,
  },
  {
    id: "5",
    orderNumber: "ORD-2024-005",
    customer: "Lisa Park",
    status: "Cancelled",
    total: 599.0,
  },
  {
    id: "6",
    orderNumber: "ORD-2024-006",
    customer: "David Kim",
    status: "Shipped",
    total: 5498.0,
  },
  {
    id: "7",
    orderNumber: "ORD-2024-007",
    customer: "Anna Martinez",
    status: "Delivered",
    total: 1199.0,
  },
  {
    id: "8",
    orderNumber: "ORD-2024-008",
    customer: "Robert Taylor",
    status: "Processing",
    total: 1128.0,
  },
  {
    id: "9",
    orderNumber: "ORD-2024-009",
    customer: "Jennifer Lee",
    status: "Shipped",
    total: 449.0,
  },
  {
    id: "10",
    orderNumber: "ORD-2024-010",
    customer: "William Brown",
    status: "Delivered",
    total: 2199.0,
  },
  {
    id: "11",
    orderNumber: "ORD-2024-011",
    customer: "Sophia Davis",
    status: "Cancelled",
    total: 349.0,
  },
  {
    id: "12",
    orderNumber: "ORD-2024-012",
    customer: "Daniel Garcia",
    status: "Processing",
    total: 899.0,
  },
];

const fulfillmentData: FulfillmentItem[] = [
  {
    order: "ORD-4821",
    shipped: new Date(2025, 0, 27),
    progress: 92,
    segments: [
      0.9, 0.7, 1.0, 0.8, 0.6, 0.9, 1.0, 0.7, 0.5, 0.8, 0.9, 1.0, 0.6, 0.7, 0.8,
      0.9, 1.0, 0.5, 0.7, 0.8, 0.9, 0.6, 1.0, 0.8, 0.7, 0.3, 0.2, 0.1, 0.1, 0.1,
    ],
  },
  {
    order: "ORD-4819",
    shipped: new Date(2025, 0, 26),
    progress: 78,
    segments: [
      0.8, 0.6, 0.9, 0.7, 1.0, 0.5, 0.8, 0.9, 0.6, 0.7, 1.0, 0.8, 0.5, 0.9, 0.7,
      0.6, 0.8, 1.0, 0.7, 0.5, 0.2, 0.1, 0.15, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
      0.1,
    ],
  },
  {
    order: "ORD-4815",
    shipped: new Date(2025, 0, 25),
    progress: 100,
    segments: [
      1.0, 0.9, 0.8, 1.0, 0.7, 0.9, 1.0, 0.8, 0.6, 0.9, 1.0, 0.7, 0.8, 0.9, 1.0,
      0.6, 0.8, 0.9, 1.0, 0.7, 0.9, 0.8, 1.0, 0.6, 0.9, 0.7, 1.0, 0.8, 0.9, 1.0,
    ],
  },
  {
    order: "ORD-4812",
    shipped: new Date(2025, 0, 24),
    progress: 65,
    segments: [
      0.9, 1.0, 0.7, 0.8, 0.6, 0.9, 0.5, 0.8, 1.0, 0.7, 0.9, 0.6, 0.8, 0.5, 0.7,
      1.0, 0.6, 0.9, 0.8, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
    ],
  },
  {
    order: "ORD-4808",
    shipped: new Date(2025, 0, 23),
    progress: 43,
    segments: [
      0.8, 0.7, 1.0, 0.6, 0.9, 0.8, 0.5, 0.7, 1.0, 0.9, 0.6, 0.8, 0.7, 0.1, 0.1,
      0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
    ],
  },
  {
    order: "ORD-4805",
    shipped: new Date(2025, 0, 22),
    progress: 100,
    segments: [
      0.9, 0.8, 1.0, 0.7, 0.9, 0.6, 1.0, 0.8, 0.7, 0.9, 1.0, 0.8, 0.6, 0.9, 0.7,
      1.0, 0.8, 0.9, 0.7, 1.0, 0.8, 0.9, 0.6, 1.0, 0.7, 0.8, 0.9, 1.0, 0.8, 0.9,
    ],
  },
  {
    order: "ORD-4801",
    shipped: new Date(2025, 0, 21),
    progress: 88,
    segments: [
      1.0, 0.8, 0.7, 0.9, 0.6, 1.0, 0.8, 0.5, 0.9, 0.7, 1.0, 0.8, 0.6, 0.9, 0.7,
      0.8, 1.0, 0.6, 0.5, 0.3, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
    ],
  },
  {
    order: "ORD-4798",
    shipped: new Date(2025, 0, 20),
    progress: 55,
    segments: [
      0.7, 0.9, 1.0, 0.6, 0.8, 0.9, 0.7, 1.0, 0.5, 0.8, 0.6, 0.9, 0.1, 0.1, 0.1,
      0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
    ],
  },
  {
    order: "ORD-4794",
    shipped: new Date(2025, 0, 19),
    progress: 100,
    segments: [
      0.8, 1.0, 0.9, 0.7, 0.8, 1.0, 0.6, 0.9, 0.8, 1.0, 0.7, 0.9, 0.8, 1.0, 0.6,
      0.9, 0.7, 1.0, 0.8, 0.9, 0.7, 1.0, 0.8, 0.6, 0.9, 1.0, 0.7, 0.8, 0.9, 1.0,
    ],
  },
  {
    order: "ORD-4790",
    shipped: new Date(2025, 0, 18),
    progress: 71,
    segments: [
      0.9, 0.6, 0.8, 1.0, 0.7, 0.9, 0.5, 0.8, 1.0, 0.6, 0.9, 0.7, 0.8, 0.5, 0.3,
      0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
    ],
  },
  {
    order: "ORD-4786",
    shipped: new Date(2025, 0, 17),
    progress: 35,
    segments: [
      1.0, 0.8, 0.9, 0.7, 0.6, 0.8, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
      0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
    ],
  },
  {
    order: "ORD-4782",
    shipped: new Date(2025, 0, 16),
    progress: 96,
    segments: [
      0.8, 0.9, 1.0, 0.7, 0.8, 0.9, 1.0, 0.6, 0.8, 0.9, 1.0, 0.7, 0.9, 0.8, 1.0,
      0.6, 0.9, 0.7, 1.0, 0.8, 0.9, 0.6, 1.0, 0.8, 0.7, 0.9, 1.0, 0.8, 0.3, 0.1,
    ],
  },
];

const ordersBarConfig = {
  orders: { label: "Orders", color: palette.primary },
} satisfies ChartConfig;

const salesBarConfig = {
  sales: { label: "Sales", theme: palette.secondary },
} satisfies ChartConfig;

const createHighlightBarShape = (fill: string) => (props: unknown) => {
  const { x, y, width, height, index } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
  };
  const isHighlight = index === 5;
  return (
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      fill={fill}
      opacity={isHighlight ? 1 : 0.45}
      rx={4}
      ry={4}
    />
  );
};

const revenueFlowChartConfig = {
  thisYear: { label: "This Year", color: palette.primary },
  prevYear: { label: "Previous Year", theme: palette.secondary },
} satisfies ChartConfig;

const occupancyChartConfig = {
  occupied: { label: "Occupied", color: palette.primary },
  available: { label: "Available", theme: palette.secondary },
  notReady: { label: "Not Ready", theme: palette.quaternary },
} satisfies ChartConfig;

const revenueGlowChartConfig = {
  roomRevenue: { label: "Room Revenue", color: palette.primary },
  platformRevenue: { label: "Platform Revenue", theme: palette.secondary },
  upsellRevenue: { label: "Upsell Revenue", theme: palette.quaternary },
} satisfies ChartConfig;

const isRevenueGlowMetric = (value: string): value is RevenueGlowMetric =>
  value === "roomRevenue" ||
  value === "platformRevenue" ||
  value === "upsellRevenue";

const tableHeadClass = "text-xs font-medium text-muted-foreground sm:text-sm";

const SidebarLogo = ({ logo }: { logo: SidebarData["logo"] }) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" tooltip={logo.title}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-sm bg-primary">
            <img
              src={logo.src}
              alt={logo.alt}
              width={24}
              height={24}
              className="size-6 text-primary-foreground invert dark:invert-0"
            />
          </div>
          <div className="flex flex-col gap-0.5 leading-none">
            <span className="font-medium">{logo.title}</span>
            <span className="text-xs text-muted-foreground">
              {logo.description}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const NavMenuItem = ({ item }: { item: NavItem }) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={item.isActive}
          tooltip={item.label}
        >
          <a href={item.href}>
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible asChild defaultOpen className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={item.isActive} tooltip={item.label}>
            <Icon className="size-4" aria-hidden="true" />
            <span>{item.label}</span>
            <ChevronRight
              className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
              aria-hidden="true"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children!.map((child) => (
              <SidebarMenuSubItem key={child.label}>
                <SidebarMenuSubButton asChild isActive={child.isActive}>
                  <a href={child.href}>{child.label}</a>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
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
              <ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
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
              <User className="mr-2 size-4" aria-hidden="true" />
              Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 size-4" aria-hidden="true" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
          <SidebarLogo logo={sidebarData.logo} />
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:ml-0" />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          {sidebarData.navGroups.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <NavMenuItem key={item.label} item={item} />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        {sidebarData.user && <NavUser user={sidebarData.user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};

const DashboardHeader = () => {
  const user = sidebarData.user;
  const userInitials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "RA";
  const userFirstName = user?.name.split(" ")[0] ?? "Robert";

  return (
    <header className="sticky top-0 z-40 flex w-full shrink-0 items-center gap-3 border-b bg-background px-4 py-4 sm:px-6 lg:rounded-t-xl">
      <Avatar className="size-10 rounded-lg">
        {user?.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
        <AvatarFallback className="rounded-lg">{userInitials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{`Hello ${userFirstName}`}</span>
        <span className="text-xs text-muted-foreground">
          Welcome back to Grandview 👋
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Search"
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          aria-label="Notifications"
        >
          <Bell className="size-4" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          aria-label="Last 7 days"
        >
          Last 7 days
          <ChevronDown className="size-3.5" aria-hidden="true" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          aria-label="Date range"
        >
          <CalendarRange className="size-3.5" aria-hidden="true" />
          Feb 04 - Feb 11, 2024
        </Button>
      </div>
    </header>
  );
};

const HotelStatsCards = () => (
  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {hotelStats.map((stat) => {
      const isPositive = stat.trendValue > 0;
      const isNeutral = stat.trendValue === 0;
      const trendColor = isNeutral
        ? "text-muted-foreground"
        : isPositive
          ? "text-success"
          : "text-destructive";
      const formattedValue =
        stat.format === "percent"
          ? `${stat.value}%`
          : currencyFormatter.format(stat.value);
      return (
        <Card key={stat.title} className="gap-2 px-4 py-2.5 shadow-none">
          <p className="text-sm text-muted-foreground">{stat.title}</p>
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-lg font-semibold">{formattedValue}</span>
            <span className={cn("text-sm", trendColor)}>
              {formatTrendValue(stat.trendValue)}
            </span>
          </div>
        </Card>
      );
    })}
  </div>
);

function OccupancyTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  const available = Number(
    payload.find((entry) => entry.dataKey === "available")?.value ?? 0,
  );
  const occupied = Number(
    payload.find((entry) => entry.dataKey === "occupied")?.value ?? 0,
  );
  const notReady = Math.abs(
    Number(payload.find((entry) => entry.dataKey === "notReady")?.value ?? 0),
  );

  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">Day {label}</p>
      <div className="space-y-1 text-[10px] sm:text-xs">
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Available</span>
          <span className="font-medium text-foreground">
            {numberFormatter.format(available)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Occupied</span>
          <span className="font-medium text-foreground">
            {numberFormatter.format(occupied)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-muted-foreground">Not Ready</span>
          <span className="font-medium text-foreground">
            {numberFormatter.format(notReady)}
          </span>
        </div>
      </div>
    </div>
  );
}

const OccupancyChart = () => {
  const [scope, setScope] = React.useState<OccupancyScope>("all");
  const scopeScale = occupancyScopeScale[scope];

  const data = React.useMemo(
    () =>
      occupancyBaseData.slice(0, OCCUPANCY_DAYS).map((entry, index) => ({
        day: String(index + 1).padStart(2, "0"),
        available: Math.round(entry.available * scopeScale),
        occupied: Math.round(entry.occupied * scopeScale),
        notReady: -Math.max(6, Math.round(entry.notReady * scopeScale)),
      })),
    [scopeScale],
  );

  return (
    <div className="w-full rounded-xl border bg-card">
      <div className="flex h-14 items-center justify-between px-4 sm:px-5">
        <h2 className="text-sm font-medium text-pretty sm:text-base">
          Occupancy
        </h2>

        <div className="flex items-center gap-2">
          <Select
            value={scope}
            onValueChange={(value) => setScope(value as OccupancyScope)}
          >
            <SelectTrigger
              className="h-7 w-[100px] text-xs"
              aria-label="Select occupancy scope"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{occupancyScopeLabels.all}</SelectItem>
              <SelectItem value="rooms">
                {occupancyScopeLabels.rooms}
              </SelectItem>
              <SelectItem value="suites">
                {occupancyScopeLabels.suites}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 px-4 sm:px-5">
        {[
          { label: "Occupied", color: palette.primary },
          { label: "Available", color: palette.secondary.light },
          { label: "Not Ready", color: palette.quaternary.light },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full sm:size-2.5"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="p-4 pt-3 sm:p-5 sm:pt-5">
        <div className="h-[220px] w-full min-w-0 sm:h-[250px]">
          <ChartContainer
            config={occupancyChartConfig}
            className="h-full w-full"
          >
            <BarChart
              data={data}
              stackOffset="sign"
              barCategoryGap={2}
              margin={{ top: 6, right: 0, left: -8, bottom: 0 }}
            >
              <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                tickMargin={10}
                padding={{ left: 0, right: 0 }}
                tickFormatter={(value, index) =>
                  index % OCCUPANCY_TICK_EVERY === 0 ||
                  index === data.length - 1
                    ? value
                    : "-"
                }
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10 }}
                dx={-5}
                width={40}
                domain={[-100, 200]}
                ticks={[-100, -50, 0, 50, 100, 150, 200]}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fillOpacity: 0.05 }}
                content={<OccupancyTooltip />}
              />
              <Bar
                dataKey="occupied"
                stackId="occupancy"
                fill="var(--color-occupied)"
                stroke="var(--color-occupied)"
                strokeWidth={1}
                radius={[0, 0, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="available"
                stackId="occupancy"
                fill="var(--color-available)"
                stroke="var(--color-available)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
              <Bar
                dataKey="notReady"
                stackId="occupancy"
                fill="var(--color-notReady)"
                stroke="var(--color-notReady)"
                strokeWidth={1}
                radius={[4, 4, 0, 0]}
                barSize={18}
              />
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

function RevenueGlowTooltip({
  active,
  payload,
  label,
}: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((sum, item) => sum + Number(item.value || 0), 0);
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      <div className="space-y-1 text-[10px] sm:text-xs">
        {payload.map((item) => {
          const key = String(item.dataKey ?? "");
          const color = String(item.color ?? "var(--muted-foreground)");
          const entryLabel = isRevenueGlowMetric(key)
            ? revenueGlowChartConfig[key].label
            : String(item.name ?? key);
          return (
            <div
              key={`${key}-${label}`}
              className="flex items-center justify-between gap-4"
            >
              <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {entryLabel}
              </span>
              <span className="font-medium text-foreground">
                {Number(item.value).toFixed(0)}%
              </span>
            </div>
          );
        })}
        <div className="mt-1 border-t border-border pt-1 text-right font-medium text-foreground">
          {total.toFixed(0)}% Total
        </div>
      </div>
    </div>
  );
}

const GlowingHorizontalBarShape = (
  props: React.SVGProps<SVGRectElement> & {
    dataKey?: string;
    activeSegment?: RevenueGlowSegment;
    glowPrefix?: string;
  },
) => {
  const {
    fill,
    x,
    y,
    width,
    height,
    radius,
    dataKey,
    activeSegment = "all",
    glowPrefix = "revenue-glow",
  } = props;

  const key = String(dataKey ?? "segment");
  const isActive = activeSegment === "all" || activeSegment === key;
  const filterId = `${glowPrefix}-${key}`;

  return (
    <>
      <rect
        x={Number(x ?? 0)}
        y={Number(y ?? 0)}
        width={Math.max(0, Number(width ?? 0))}
        height={Math.max(0, Number(height ?? 0))}
        rx={Number(radius ?? 0)}
        ry={Number(radius ?? 0)}
        fill={String(fill ?? "currentColor")}
        stroke="none"
        opacity={isActive ? 1 : 0.16}
        filter={
          isActive && activeSegment !== "all" ? `url(#${filterId})` : undefined
        }
      />
      <defs>
        <filter id={filterId} x="-200%" y="-200%" width="600%" height="600%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    </>
  );
};

const RevenueOverviewGlowingHorizontal = ({
  className,
}: {
  className?: string;
}) => {
  const [activeSegment, setActiveSegment] =
    React.useState<RevenueGlowSegment>("all");
  const glowPrefix = React.useId().replace(/:/g, "");

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col rounded-xl border bg-card p-4 sm:p-5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-medium text-pretty sm:text-base">
            Revenue Overview
          </h2>
        </div>
        <Select
          value={activeSegment}
          onValueChange={(value) =>
            setActiveSegment(value as RevenueGlowSegment)
          }
        >
          <SelectTrigger
            className="h-7 w-[100px] text-xs"
            aria-label="Select revenue segment"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="roomRevenue">Room </SelectItem>
            <SelectItem value="platformRevenue">Platform </SelectItem>
            <SelectItem value="upsellRevenue">Upsell </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-4">
        {[
          { label: "Room", color: palette.primary },
          { label: "Platform", color: palette.secondary.light },
          { label: "Upsell", color: palette.quaternary.light },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full sm:size-2.5"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="h-[230px] w-full min-w-0 sm:h-[250px]">
        <ChartContainer
          config={revenueGlowChartConfig}
          className="h-full w-full"
        >
          <BarChart
            data={revenueGlowData}
            layout="vertical"
            barCategoryGap={14}
            margin={{ top: 2, right: 4, bottom: 2, left: -10 }}
          >
            <YAxis
              type="category"
              dataKey="channel"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              tickMargin={8}
              width={68}
            />
            <XAxis type="number" hide domain={[0, 100]} />
            <Tooltip cursor={false} content={<RevenueGlowTooltip />} />
            <Bar
              dataKey="roomRevenue"
              stackId="revenue"
              barSize={12}
              fill="var(--color-roomRevenue)"
              radius={4}
              shape={
                <GlowingHorizontalBarShape
                  activeSegment={activeSegment}
                  glowPrefix={glowPrefix}
                />
              }
              background={{ fill: "var(--muted)", radius: 4 }}
              overflow="visible"
            />
            <Bar
              dataKey="platformRevenue"
              stackId="revenue"
              barSize={12}
              fill="var(--color-platformRevenue)"
              radius={4}
              shape={
                <GlowingHorizontalBarShape
                  activeSegment={activeSegment}
                  glowPrefix={glowPrefix}
                />
              }
              overflow="visible"
            />
            <Bar
              dataKey="upsellRevenue"
              stackId="revenue"
              barSize={12}
              fill="var(--color-upsellRevenue)"
              radius={4}
              shape={
                <GlowingHorizontalBarShape
                  activeSegment={activeSegment}
                  glowPrefix={glowPrefix}
                />
              }
              overflow="visible"
            />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  );
};

const RecentArrivalsWidget = () => {
  return (
    <div className="flex h-full w-full flex-col rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-pretty sm:text-base">
            Recent Arrivals
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        >
          View All
        </Button>
      </div>

      <div className="-mx-4 min-h-0 flex-1 overflow-hidden border-y sm:-mx-5">
        <Table className="w-full table-fixed">
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[52%]" />
            <col className="w-[30%]" />
          </colgroup>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="h-8 pl-4 text-[11px] font-medium text-muted-foreground sm:pl-5">
                R. No
              </TableHead>
              <TableHead className="h-8 text-[11px] font-medium text-muted-foreground">
                Name
              </TableHead>
              <TableHead className="h-8 pr-4 text-[11px] font-medium text-muted-foreground sm:pr-5">
                Time
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentArrivalsData.map((arrival) => (
              <TableRow key={`${arrival.roomNo}-${arrival.name}`}>
                <TableCell className="py-2 pl-4 text-xs font-medium text-muted-foreground sm:pl-5">
                  {arrival.roomNo}
                </TableCell>
                <TableCell className="py-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="size-6">
                      {arrival.avatar && (
                        <AvatarImage src={arrival.avatar} alt={arrival.name} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {arrival.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-medium text-foreground">
                      {arrival.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2 pr-4 text-xs text-muted-foreground sm:pr-5">
                  {arrival.time}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

function PipelineTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipProps<number, string> & {
  valueFormatter: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">
        {valueFormatter(Number(entry.value))}
      </p>
    </div>
  );
}

const SalesPipelineChart = () => {
  const [searchParams, setSearchParams] = React.useState(
    () =>
      new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      ),
  );

  const quarter = searchParams.get("quarter") ?? "q1";

  const handleQuarterChange = (value: string) => {
    const next = new URLSearchParams(searchParams);
    next.set("quarter", value);
    setSearchParams(next);
    window.history.replaceState(null, "", `?${next.toString()}`);
  };

  const data = salesPipelineData[quarter] ?? salesPipelineData.q1;
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);
  const totalSales = data.reduce((sum, d) => sum + d.sales, 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col rounded-xl border bg-card">
      <div className="flex h-14 items-center justify-between border-b px-4 sm:px-5">
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="icon"
            className="size-7 sm:size-8"
            aria-label="Sales Pipeline"
          >
            <BarChart3
              className="size-4 text-muted-foreground sm:size-[18px]"
              aria-hidden="true"
            />
          </Button>
          <h2 className="text-sm font-medium text-pretty sm:text-base">
            Sales Pipeline
          </h2>
        </div>

        <Select value={quarter} onValueChange={handleQuarterChange}>
          <SelectTrigger
            className="h-7 w-[120px] text-xs"
            aria-label="Select quarter"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="q1">Quarter 1</SelectItem>
            <SelectItem value="q2">Quarter 2</SelectItem>
            <SelectItem value="q3">Quarter 3</SelectItem>
            <SelectItem value="q4">Quarter 4</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_auto_1fr] sm:p-5">
        <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
          <div>
            <p className="text-lg font-semibold tracking-tight">
              {numberFormatter.format(totalOrders)}
            </p>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Total Orders
            </p>
          </div>
          <div className="min-h-0 w-full min-w-0 flex-1">
            <ChartContainer config={ordersBarConfig} className="h-full w-full">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  dx={-5}
                  width={40}
                />
                <Tooltip
                  cursor={{ fillOpacity: 0.05 }}
                  content={
                    <PipelineTooltip
                      valueFormatter={(v) => numberFormatter.format(v)}
                    />
                  }
                />
                <Bar
                  dataKey="orders"
                  radius={[4, 4, 0, 0]}
                  fill="var(--color-orders)"
                  shape={createHighlightBarShape("var(--color-orders)")}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>

        <div className="hidden w-px self-stretch bg-border sm:block" />

        <div className="flex min-h-0 min-w-0 flex-col gap-3 overflow-hidden">
          <div>
            <p className="text-lg font-semibold tracking-tight">
              {compactCurrencyFormatter.format(totalSales)}
            </p>
            <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
              Total Sales
            </p>
          </div>
          <div className="min-h-0 w-full min-w-0 flex-1">
            <ChartContainer config={salesBarConfig} className="h-full w-full">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="0" vertical={false} />
                <XAxis
                  dataKey="week"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  dx={-5}
                  width={40}
                />
                <Tooltip
                  cursor={{ fillOpacity: 0.05 }}
                  content={
                    <PipelineTooltip
                      valueFormatter={(v) => currencyFormatter.format(v)}
                    />
                  }
                />
                <Bar
                  dataKey="sales"
                  radius={[4, 4, 0, 0]}
                  fill="var(--color-sales)"
                  shape={createHighlightBarShape("var(--color-sales)")}
                />
              </BarChart>
            </ChartContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

function CustomTooltip({
  active,
  payload,
  label,
  colors,
}: TooltipProps<number, string> & {
  colors: { primary: string; secondary: string };
}) {
  if (!active || !payload?.length) return null;

  const thisYear = payload.find((p) => p.dataKey === "thisYear")?.value || 0;
  const prevYear = payload.find((p) => p.dataKey === "prevYear")?.value || 0;
  const diff = Number(thisYear) - Number(prevYear);
  const percentage = prevYear ? Math.round((diff / Number(prevYear)) * 100) : 0;
  const currentYear = new Date().getFullYear();

  return (
    <div className="rounded-lg border border-border bg-popover p-2 shadow-lg sm:p-3">
      <p className="mb-1.5 text-xs font-medium text-foreground sm:mb-2 sm:text-sm">
        {label}, {currentYear}
      </p>
      <div className="space-y-1 sm:space-y-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="size-2 rounded-full sm:size-2.5"
            style={{ backgroundColor: colors.primary }}
          />
          <span className="text-[10px] text-muted-foreground sm:text-sm">
            This Year:
          </span>
          <span className="text-[10px] font-medium text-foreground sm:text-sm">
            {currencyFormatter.format(Number(thisYear))}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="size-2 rounded-full sm:size-2.5"
            style={{ backgroundColor: colors.secondary }}
          />
          <span className="text-[10px] text-muted-foreground sm:text-sm">
            Prev Year:
          </span>
          <span className="text-[10px] font-medium text-foreground sm:text-sm">
            {currencyFormatter.format(Number(prevYear))}
          </span>
        </div>
        <div className="mt-1 border-t border-border pt-1">
          <span
            className={cn(
              "text-[10px] font-medium sm:text-xs",
              diff >= 0 ? "text-emerald-500" : "text-red-500",
            )}
          >
            {diff >= 0 ? "+" : ""}
            {percentage}% vs last year
          </span>
        </div>
      </div>
    </div>
  );
}

const RevenueFlowChart = () => {
  const [period, setPeriod] = React.useState<TimePeriod>("year");

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const nextPeriod = params.get("period");
    if (nextPeriod === "6months" || nextPeriod === "year") {
      setPeriod(nextPeriod);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (period !== "year") {
      params.set("period", period);
    } else {
      params.delete("period");
    }
    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [period]);

  const chartData = getDataForPeriod(period);
  const totalRevenue = chartData.reduce((acc, item) => acc + item.thisYear, 0);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4 rounded-xl border bg-card p-4 sm:gap-6 sm:p-6">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-xl leading-tight font-semibold tracking-tight sm:text-2xl">
            {currencyFormatter.format(totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground">
            Total Revenue ({periodLabels[period]})
          </p>
        </div>
        <div className="hidden items-center gap-3 sm:flex sm:gap-5">
          <div className="flex items-center gap-1.5">
            <div
              className="size-2.5 rounded-full sm:size-3"
              style={{ backgroundColor: palette.primary }}
            />
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              This Year
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="size-2.5 rounded-full sm:size-3"
              style={{ backgroundColor: palette.secondary.light }}
            />
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              Prev Year
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 sm:size-8"
              aria-label="Select time period"
            >
              <MoreHorizontal className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Time Period</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {(Object.keys(periodLabels) as TimePeriod[]).map((key) => (
              <DropdownMenuCheckboxItem
                key={key}
                checked={period === key}
                onCheckedChange={() => setPeriod(key)}
              >
                {periodLabels[key]}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-[200px] w-full min-w-0 sm:h-[240px] lg:h-[280px]">
        <ChartContainer
          config={revenueFlowChartConfig}
          className="h-full w-full"
        >
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="0" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10 }}
              dx={-5}
              tickFormatter={(value) => compactCurrencyFormatter.format(value)}
              width={40}
            />
            <Tooltip
              content={
                <CustomTooltip
                  colors={{
                    primary: "var(--color-thisYear)",
                    secondary: "var(--color-prevYear)",
                  }}
                />
              }
              cursor={{ strokeOpacity: 0.2 }}
            />
            <Line
              type="linear"
              dataKey="thisYear"
              stroke="var(--color-thisYear)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={{ fill: "var(--color-thisYear)", strokeWidth: 0, r: 2 }}
              activeDot={{ r: 3.5, fill: "var(--color-thisYear)" }}
            />
            <Line
              type="linear"
              dataKey="prevYear"
              stroke="var(--color-prevYear)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={0.5}
              dot={{
                fill: "var(--color-prevYear)",
                fillOpacity: 0.5,
                strokeWidth: 0,
                r: 2,
              }}
              activeDot={{
                r: 3.5,
                fill: "var(--color-prevYear)",
                fillOpacity: 0.5,
              }}
            />
          </LineChart>
        </ChartContainer>
      </div>
    </div>
  );
};

const RecentOrdersTable = () => {
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "all">(
    "all",
  );
  const [currentPage, setCurrentPage] = React.useState(1);
  const [isHydrated, setIsHydrated] = React.useState(false);
  const pageSize = 6;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const nextStatus = params.get("status");
    if (
      nextStatus &&
      (nextStatus === "all" ||
        orderStatuses.includes(nextStatus as OrderStatus))
    ) {
      setStatusFilter(nextStatus as OrderStatus | "all");
    }
    const nextPage = Number(params.get("page"));
    if (!Number.isNaN(nextPage) && nextPage > 0) {
      setCurrentPage(nextPage);
    }
    setIsHydrated(true);
  }, []);

  const filteredOrders = React.useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));

  const paginatedOrders = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredOrders.slice(startIndex, startIndex + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  React.useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (statusFilter !== "all") {
      params.set("status", statusFilter);
    } else {
      params.delete("status");
    }
    if (currentPage > 1) {
      params.set("page", String(currentPage));
    } else {
      params.delete("page");
    }
    const nextQuery = params.toString();
    const nextUrl = nextQuery
      ? `${window.location.pathname}?${nextQuery}`
      : window.location.pathname;
    window.history.replaceState(null, "", nextUrl);
  }, [statusFilter, currentPage, isHydrated]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const startRow = filteredOrders.length ? (currentPage - 1) * pageSize + 1 : 0;
  const endRow = Math.min(currentPage * pageSize, filteredOrders.length);

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-6">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-pretty sm:text-base">
            Recent Orders
          </h2>
          <span className="ml-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-[10px] font-medium text-gray-600 ring-1 ring-gray-500/10 ring-inset sm:text-xs dark:bg-gray-800/50 dark:text-gray-400 dark:ring-gray-400/20">
            {filteredOrders.length}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 sm:h-9 sm:gap-2"
            >
              <span className="text-xs sm:text-sm">
                {statusFilter === "all" ? "All" : statusFilter}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={statusFilter === "all"}
              onCheckedChange={() => setStatusFilter("all")}
            >
              All Statuses
            </DropdownMenuCheckboxItem>
            {orderStatuses.map((status) => (
              <DropdownMenuCheckboxItem
                key={status}
                checked={statusFilter === status}
                onCheckedChange={() => setStatusFilter(status)}
              >
                {status}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 pt-3 pb-4 sm:px-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className={tableHeadClass}>Order Ref</TableHead>
              <TableHead className={tableHeadClass}>Buyer</TableHead>
              <TableHead className={tableHeadClass}>Total</TableHead>
              <TableHead className={tableHeadClass}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-sm text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="text-xs font-medium text-muted-foreground sm:text-sm">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground sm:text-sm">
                    {order.customer}
                  </TableCell>
                  <TableCell className="text-xs text-foreground tabular-nums sm:text-sm">
                    {currencyFormatter.format(order.total)}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium sm:text-xs",
                        statusStyles[order.status],
                      )}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between border-t px-4 py-3 text-[10px] text-muted-foreground sm:px-6 sm:text-xs">
        <span>
          {startRow}-{endRow} of {filteredOrders.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Go to previous page"
          >
            <ChevronLeft className="size-3.5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Go to next page"
          >
            <ChevronRight className="size-3.5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const FulfillmentPanel = () => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-medium text-pretty">Order Fulfillment</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label="Refresh"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                aria-label="Options"
              >
                <MoreHorizontal className="size-3.5" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Export CSV</DropdownMenuItem>
              <DropdownMenuItem>View All Orders</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        <div className="flex items-center border-b pr-3 pb-2 text-[10px] text-muted-foreground">
          <span className="w-20 shrink-0">Order</span>
          <span className="flex-1">Status</span>
          <span className="w-8 shrink-0 text-right">Del[%]</span>
        </div>
        <ScrollArea className="h-[280px]">
          <div className="divide-y pr-3">
            {fulfillmentData.map((row) => (
              <div
                key={row.order}
                className="flex items-center gap-2 py-2.5 text-xs"
              >
                <span className="w-20 shrink-0 font-medium">{row.order}</span>
                <div className="flex min-w-0 flex-1 items-center gap-px overflow-hidden">
                  {row.segments.slice(0, 15).map((opacity, i) => {
                    const filled = i < Math.round((row.progress / 100) * 15);
                    return (
                      <div
                        key={i}
                        className="h-2.5 w-2 shrink-0 rounded-[1px]"
                        style={{
                          backgroundColor: filled
                            ? palette.primary
                            : "var(--muted)",
                          opacity: filled ? opacity : 0.2,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="w-8 shrink-0 text-right font-medium">
                  {row.progress}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

const DashboardContent = () => {
  return (
    <main
      id="dashboard-main"
      tabIndex={-1}
      className="w-full flex-1 space-y-4 bg-background p-3 sm:space-y-6 sm:p-4 md:p-6"
    >
      <HotelStatsCards />
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[3fr_2fr]">
        <SalesPipelineChart />
        <RevenueFlowChart />
      </div>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[2fr_1fr]">
        <RecentOrdersTable />
        <FulfillmentPanel />
      </div>
    </main>
  );
};

const Dashboard14 = ({ className }: { className?: string }) => {
  return (
    <SidebarProvider className={cn("bg-sidebar", className)}>
      <a
        href="#dashboard-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <div className="h-svh w-full overflow-hidden lg:p-2">
        <div className="flex h-full w-full flex-col bg-background lg:rounded-xl lg:border">
          <DashboardHeader />
          <div className="grid min-h-0 flex-1 lg:grid-cols-[7fr_3fr]">
            <div className="min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
                  <HotelStatsCards />
                  <OccupancyChart />
                  <div className="grid gap-4 xl:grid-cols-2">
                    <RevenueOverviewGlowingHorizontal />
                    <RecentArrivalsWidget />
                  </div>
                </div>
              </ScrollArea>
            </div>
            <div className="h-full overflow-hidden border-l">
              <SchedulePanel />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export { Dashboard14 };

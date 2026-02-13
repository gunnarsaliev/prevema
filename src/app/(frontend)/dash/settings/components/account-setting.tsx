"use client";

import * as React from "react";
import {Button, Input, Select, SelectItem, Spacer} from "@heroui/react";
import {cn} from "@heroui/react";

interface AccountSettingCardProps {
  className?: string;
}

const timeZoneOptions = [
  {
    label: "Pacific Time (UTC-8)",
    value: "utc-8",
    description: "Pacific Time (UTC-8)",
  },
  {
    label: "Mountain Time (UTC-7)",
    value: "utc-7",
    description: "Mountain Time (UTC-7)",
  },
  {
    label: "Central Time (UTC-6)",
    value: "utc-6",
    description: "Central Time (UTC-6)",
  },
  {
    label: "Eastern Time (UTC-5)",
    value: "utc-5",
    description: "Eastern Time (UTC-5)",
  },
];

const AccountSetting = React.forwardRef<HTMLDivElement, AccountSettingCardProps>(
  ({className, ...props}, ref) => (
    <div ref={ref} className={cn("p-2", className)} {...props}>
      {/* Full name */}
      <div>
        <p className="text-default-700 text-base font-medium">Full name</p>
        <p className="text-default-400 mt-1 text-sm font-normal">Name to be used for emails.</p>
        <Input className="mt-2" placeholder="e.g Dashboard User" defaultValue="Dashboard User" />
      </div>
      <Spacer y={2} />
      {/* Username */}
      <div>
        <p className="text-default-700 text-base font-medium">Username</p>
        <p className="text-default-400 mt-1 text-sm font-normal">Nickname or first name.</p>
        <Input className="mt-2" placeholder="dashboarduser" defaultValue="dashboarduser" />
      </div>
      <Spacer y={2} />
      {/* Email Address */}
      <div>
        <p className="text-default-700 text-base font-medium">Email Address</p>
        <p className="text-default-400 mt-1 text-sm font-normal">
          The email address associated with your account.
        </p>
        <Input className="mt-2" placeholder="e.g user@prevema.com" defaultValue="user@prevema.com" />
      </div>
      <Spacer y={2} />
      {/* Timezone */}
      <section>
        <div>
          <p className="text-default-700 text-base font-medium">Timezone</p>
          <p className="text-default-400 mt-1 text-sm font-normal">Set your current timezone.</p>
        </div>
        <Select className="mt-2" defaultSelectedKeys={["utc-8"]}>
          {timeZoneOptions.map((timeZoneOption) => (
            <SelectItem key={timeZoneOption.value}>{timeZoneOption.label}</SelectItem>
          ))}
        </Select>
      </section>
      <Spacer y={2} />
      <Button className="bg-default-foreground text-background mt-4" size="sm">
        Update Account
      </Button>
    </div>
  ),
);

AccountSetting.displayName = "AccountSetting";

export default AccountSetting;

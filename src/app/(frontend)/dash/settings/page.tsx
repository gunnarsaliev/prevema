"use client";

import React from "react";
import {Tabs, Tab} from "@heroui/react";

import ProfileSetting from "./components/profile-setting";
import AppearanceSetting from "./components/appearance-setting";
import AccountSetting from "./components/account-setting";
import BillingSetting from "./components/billing-setting";
import TeamSetting from "./components/team-setting";

export default function SettingsPage() {
  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-x-3">
        <h1 className="text-default-foreground text-3xl leading-9 font-bold">Settings</h1>
      </div>
      <h2 className="text-small text-default-500 mt-2">
        Customize your dashboard preferences and account settings.
      </h2>

      {/* Tabs */}
      <Tabs
        fullWidth
        classNames={{
          base: "mt-6",
          cursor: "bg-content1 dark:bg-content1",
          panel: "w-full p-0 pt-4",
        }}
      >
        <Tab key="profile" title="Profile">
          <ProfileSetting />
        </Tab>
        <Tab key="appearance" title="Appearance">
          <AppearanceSetting />
        </Tab>
        <Tab key="account" title="Account">
          <AccountSetting />
        </Tab>
        <Tab key="billing" title="Billing">
          <BillingSetting />
        </Tab>
        <Tab key="team" title="Team">
          <TeamSetting />
        </Tab>
      </Tabs>
    </div>
  );
}

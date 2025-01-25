"use client";

import React, { useEffect, useTransition } from "react";
import { IconUserSquareRounded } from "@tabler/icons-react";
import { useUserStore } from "@/stores/use-user-profile-store";
import { useButtonsStore } from "@/stores/use-buttons-store";
import { logout } from "@/app/(auth)/login/actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, User } from "lucide-react";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function UserProfile() {
  const {
    userName,
    userEmail,
    userRole,
    userOrganization,
    licenseStartDate,
    licenseEndDate,
    usageRequests,
    usageDocs,
    maxRequests,
    maxDocs,
    maxArea,
    fetchAndSetUsage,
  } = useUserStore();

  const isSidebarCollapsed = useButtonsStore(
    (state) => state.isSidebarCollapsed
  );

  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchAndSetUsage();
  }, [fetchAndSetUsage]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => {
      logout();
    });
  }

  return (
    <section className="z-[5000]">
      <Dialog>
        {/* Trigger: clickable icon (and optional label) */}
        <DialogTrigger asChild>
          <div className="px-4 py-2 text-accent-foreground cursor-pointer text-sm font-normal">
            <div
              className={`flex items-center px-3 py-2 gap-4 w-full rounded-xl text-gray-100 hover:bg-muted dark:hover:bg-muted-foreground/20 hover:text-foreground ${
                isSidebarCollapsed ? "justify-center" : "justify-start"
              }`}
            >
              <button>
                <IconUserSquareRounded
                  stroke={1.5}
                  className="h-7 w-7 flex-shrink-0"
                />
              </button>
              {!isSidebarCollapsed && <span>Profile</span>}
            </div>
          </div>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your Profile</DialogTitle>
            <DialogDescription>
              View your account details and license information.
            </DialogDescription>
          </DialogHeader>

          {/* Modal Body */}
          <div className="flex flex-col items-center px-6 py-4 space-y-4">
            {/* Avatar */}
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <User size={48} className="text-muted-foreground" />
            </div>

            {/* Name & Email */}
            <div className="text-center space-y-1">
              <h3 className="text-lg font-semibold">{userName || "—"}</h3>
              <p className="text-sm text-muted-foreground">
                {userEmail || "—"}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid w-full max-w-md grid-cols-2 gap-4 mt-3 text-center">
              {/* Role */}
              <div className="flex flex-col">
                <Label className="mb-0.5 text-xs uppercase text-muted-foreground">
                  Role
                </Label>
                <p className="text-sm font-medium">{userRole || "—"}</p>
              </div>

              {/* Organization */}
              <div className="flex flex-col">
                <Label className="mb-0.5 text-xs uppercase text-muted-foreground">
                  Organization
                </Label>
                <p className="text-sm font-medium">{userOrganization || "—"}</p>
              </div>

              {/* License Start */}
              <div className="flex flex-col">
                <Label className="mb-0.5 text-xs uppercase text-muted-foreground">
                  License Start
                </Label>
                <p className="text-sm font-medium">
                  {licenseStartDate
                    ? licenseStartDate.split("T")[0]
                    : "Not Available"}
                </p>
              </div>

              {/* License End */}
              <div className="flex flex-col">
                <Label className="mb-0.5 text-xs uppercase text-muted-foreground">
                  License End
                </Label>
                <p className="text-sm font-medium">
                  {licenseEndDate
                    ? licenseEndDate.split("T")[0]
                    : "Not Available"}
                </p>
              </div>

              {/* Requests Usage */}
              <div className="flex flex-col">
                <Label className="mb-0.5 text-xs uppercase text-muted-foreground">
                  Requests Used
                </Label>
                <p className="text-sm font-medium">
                  {maxRequests > 0 ? `${usageRequests} / ${maxRequests}` : "—"}
                </p>
              </div>

              {/* Docs Usage */}
              <div className="flex flex-col">
                <Label className="mb-0.5 text-xs uppercase text-muted-foreground">
                  Knowledge Base Docs
                </Label>
                <p className="text-sm font-medium">
                  {maxDocs > 0 ? `${usageDocs} / ${maxDocs}` : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Modal Footer with the Logout button */}
          <DialogFooter>
            <form onSubmit={handleSubmit}>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  "Logout"
                )}
              </Button>
            </form>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

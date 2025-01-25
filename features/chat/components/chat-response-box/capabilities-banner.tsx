"use client";

import * as React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useUserStore } from "@/stores/use-user-profile-store";
import { cn } from "@/lib/utils";

export function CapabilitiesBanner() {
  const userName = useUserStore((state) => state.userName);
  const maxArea = useUserStore((state) => state.maxArea);
  const maxDocs = useUserStore((state) => state.maxDocs);
  const userRole = useUserStore((state) => state.userRole);

  return (
    <div className="w-full flex justify-center my-6">
      <div className="max-w-lg w-full">
        <Alert
          variant="default"
          className={cn(
            "border border-border rounded-lg p-4 shadow-sm",
            "bg-secondary dark:bg-neutral-900"
          )}
        >
          <AlertTitle className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight">
                Hello, {userName.split(" ")[0] || "there"}!
              </span>
            </div>
          </AlertTitle>

          <AlertDescription className="mt-3 text-sm leading-relaxed text-center text-foreground/80 space-y-4">
            <p>
              Here’s a quick overview of some of the capabilities of Chat2Geo:
            </p>

            {/* Group 1: Platform Capabilities */}
            <div className="text-left">
              <p className="font-semibold mb-1">Platform Capabilities:</p>
              <ul className="list-none space-y-2 pl-4">
                <li>
                  <span className="mr-2">⚡</span>Real-time geospatial analysis
                </li>
                <li>
                  <span className="mr-2">📚</span>Knowledge Base queries using
                  your docs
                </li>
                <li>
                  <span className="mr-2">📝</span>Drafting summary reports
                </li>
              </ul>
            </div>

            {/* Group 2: Geospatial Analyses */}
            <div className="text-left">
              <p className="font-semibold mb-1">Geospatial Analyses:</p>
              <ul className="list-none space-y-2 pl-4">
                <li>
                  <span className="mr-2">🗺️</span>Land-use/land-cover mapping
                </li>
                <li>
                  <span className="mr-2">🔄</span>Bi-Temporal Change detection
                </li>
                <li>
                  <span className="mr-2">🏙️</span>Urban heat island analysis
                </li>
                <li>
                  <span className="mr-2">🌫️</span>
                  Air pollution assessment
                </li>
              </ul>
            </div>

            {/* Key Notes */}
            <div className="pt-2 text-left">
              <p className="font-semibold">Key Notes:</p>
              <ul className="list-disc list-inside text-sm text-foreground/70 mt-1 space-y-1">
                <li>
                  <strong>Role:</strong> {userRole || "USER"}
                </li>
                <li>
                  You can store up to <strong>{maxDocs || "N/A"}</strong>{" "}
                  documents for Knowledge Base queries.
                </li>
                <li>
                  No analyses are available for <strong>2025</strong> yet.
                </li>
                <li>
                  Maximum area per request is{" "}
                  <strong>{maxArea || "N/A"}</strong> &nbsp;sq km.
                </li>
                <li>
                  Analyses start from <strong>2015</strong>.
                </li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

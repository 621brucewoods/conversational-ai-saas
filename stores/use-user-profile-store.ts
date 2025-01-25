import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  userName: string;
  userEmail: string;
  userRole: string;
  userOrganization: string;
  licenseStartDate: string;
  licenseEndDate: string;

  usageRequests: number;
  usageDocs: number;
  maxRequests: number;
  maxDocs: number;
  maxArea: number;

  setUserData: (
    userName: string,
    userEmail: string,
    userRole: string,
    userOrganization: string,
    licenseStartDate: string,
    licenseEndDate: string
  ) => void;

  setUsage: (
    usageRequests: number,
    usageDocs: number,
    maxRequests: number,
    maxDocs: number,
    maxArea: number
  ) => void;

  resetUserData: () => void;

  fetchAndSetUsage: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // ------------------------------------
      // Basic user fields
      // ------------------------------------
      userName: "",
      userEmail: "",
      userRole: "",
      userOrganization: "",
      licenseStartDate: "",
      licenseEndDate: "",

      // ------------------------------------
      // Usage data & limits
      // ------------------------------------
      usageRequests: 0,
      usageDocs: 0,
      maxRequests: 0,
      maxDocs: 0,
      maxArea: 0,

      // ------------------------------------
      // Set user data
      // ------------------------------------
      setUserData: (
        userName,
        userEmail,
        userRole,
        userOrganization,
        licenseStartDate,
        licenseEndDate
      ) => {
        set({
          userName,
          userEmail,
          userRole,
          userOrganization,
          licenseStartDate,
          licenseEndDate,
        });
      },

      // ------------------------------------
      // Set usage data
      // ------------------------------------
      setUsage: (usageRequests, usageDocs, maxRequests, maxDocs, maxArea) => {
        set({
          usageRequests,
          usageDocs,
          maxRequests,
          maxDocs,
          maxArea,
        });
      },

      // ------------------------------------
      // Reset user data
      // ------------------------------------
      resetUserData: () => {
        set({
          userName: "",
          userEmail: "",
          userRole: "",
          userOrganization: "",
          licenseStartDate: "",
          licenseEndDate: "",
          usageRequests: 0,
          usageDocs: 0,
          maxRequests: 0,
          maxDocs: 0,
          maxArea: 0,
        });
      },

      // ------------------------------------
      // Fetch usage from /api/user-usage
      // ------------------------------------
      fetchAndSetUsage: async () => {
        try {
          const response = await fetch("/api/user-usage", {
            method: "GET",
            credentials: "include",
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || "Failed to fetch usage");
          }
          const usageData = await response.json();

          set({
            usageRequests: usageData.requests_count ?? 0,
            usageDocs: usageData.knowledge_base_docs_count ?? 0,
            maxRequests: usageData.maxRequests ?? 0,
            maxDocs: usageData.maxDocs ?? 0,
            maxArea: usageData.maxArea ?? 0,
          });
        } catch (err) {
          console.error("Error fetching usage data:", err);
        }
      },
    }),
    {
      name: "user-store",
    }
  )
);

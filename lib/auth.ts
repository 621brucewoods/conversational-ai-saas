// In production, this is handled in the database. You can use the Supabase UI to add a new row to the `user_roles` table.
"use server";

export type UserRole = "ADMIN" | "USER" | "TRIAL";
export type SubscriptionTier = "Essentials" | "Pro" | "Enterprise";

export interface PermissionSet {
  maxRequests: number;
  maxDocs: number;
  maxArea: number;
  experimental: boolean;
}

const PERMISSION_MATRIX: Record<
  UserRole,
  Record<SubscriptionTier, PermissionSet>
> = {
  ADMIN: {
    Essentials: {
      maxRequests: 100,
      maxDocs: 100,
      maxArea: 100,
      experimental: false,
    },
    Pro: { maxRequests: 100, maxDocs: 100, maxArea: 100, experimental: false },
    Enterprise: {
      maxRequests: 9999,
      maxDocs: 9999,
      maxArea: 9999,
      experimental: true,
    },
  },
  USER: {
    Essentials: {
      maxRequests: 100,
      maxDocs: 50,
      maxArea: 100,
      experimental: false,
    },
    Pro: {
      maxRequests: 2000,
      maxDocs: 100,
      maxArea: 2000,
      experimental: false,
    },
    Enterprise: {
      maxRequests: 100,
      maxDocs: 200,
      maxArea: 100,
      experimental: false,
    },
  },
  TRIAL: {
    Essentials: {
      maxRequests: 10,
      maxDocs: 10,
      maxArea: 10,
      experimental: false,
    },
    Pro: { maxRequests: 50, maxDocs: 20, maxArea: 50, experimental: false },
    Enterprise: {
      maxRequests: 30,
      maxDocs: 50,
      maxArea: 1,
      experimental: false,
    },
  },
};

export async function getPermissionSet(
  role: UserRole,
  subscriptionTier: SubscriptionTier
): Promise<PermissionSet> {
  return Promise.resolve(PERMISSION_MATRIX[role][subscriptionTier]);
}

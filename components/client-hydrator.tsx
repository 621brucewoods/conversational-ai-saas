"use client";
import { useEffect } from "react";
import { useUserStore } from "@/stores/use-user-profile-store";

interface ClientHydratorProps {
  userProfile: {
    email: string;
    name: string;
    role: string;
    organization: string;
    licenseStart: string;
    licenseEnd: string;
  } | null;
}

export default function ClientHydrator({ userProfile }: ClientHydratorProps) {
  const { setUserData } = useUserStore();

  useEffect(() => {
    if (userProfile) {
      setUserData(
        userProfile.name,
        userProfile.email,
        userProfile.role,
        userProfile.organization,
        userProfile.licenseStart,
        userProfile.licenseEnd
      );
    }
  }, [userProfile, setUserData]);

  return null;
}

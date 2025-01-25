"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, useTransition } from "react";

import { login } from "@/app/(auth)/login/actions";
import { useUserStore } from "@/stores/use-user-profile-store";
import PrivacyPolicy from "@/components/notices/privacy-policy";
import TermsOfService from "@/components/notices/terms-of-services";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setUserData } = useUserStore();
  const [openTerms, setOpenTerms] = useState(false);
  const [openPrivacy, setOpenPrivacy] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      // Update user store with returned data
      setUserData(
        result.userName!,
        result.userEmail!,
        result.userRole!,
        result.userOrganization!,
        result.licenseStartString!,
        result.licenseEndString!
      );
      startTransition(() => {
        router.push("/");
      });
    }

    setLoading(false);
  };

  return (
    <>
      <TermsOfService open={openTerms} onOpenChange={setOpenTerms} />
      <PrivacyPolicy open={openPrivacy} onOpenChange={setOpenPrivacy} />

      {/* Main container for md+ screens */}
      <div className="container relative hidden h-full flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        {/* Left column with background and testimonial */}
        <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-gray-950" />
          <div className="relative z-20 mt-auto">
            <blockquote className="space-y-2">
              <p className="text-lg">
                Let powerful AI solutions help you better address various
                environmental challenges.
              </p>
            </blockquote>
          </div>
        </div>

        {/* Right column with the actual login form */}
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Sign in to your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials below
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="flex flex-col space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>

              {/* Error Alert */}
              {error && (
                <p className="text-destructive text-sm">
                  <strong>Error:</strong> {error}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || isPending}
                className="w-full"
              >
                {(loading || isPending) && <Loader2 className="animate-spin" />}
                Sign in
              </Button>
            </form>

            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <button
                className="underline underline-offset-4 hover:text-primary"
                onClick={() => setOpenTerms(true)}
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                className="underline underline-offset-4 hover:text-primary"
                onClick={() => setOpenPrivacy(true)}
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

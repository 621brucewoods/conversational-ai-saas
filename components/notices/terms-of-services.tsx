"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TermsOfServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function TermsOfService({
  open,
  onOpenChange,
}: TermsOfServiceModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Terms of Service</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>Effective Date:</strong> January 06, 2025
          </p>
          <p>
            Welcome to the Chat2Geo platform (“the Service”). By accessing or
            using the Service, you agree to be bound by these Terms of Service
            (“Terms”). If you do not agree with any part of these Terms, you
            must not use the Service.
          </p>

          <h2 className="font-semibold">1. Beta Testing Program</h2>
          <p>
            <strong>1.1 Limited Access</strong>
            <br />
            Access to the beta version of the Service is granted by selection
            only. Each license is personal to the individual user and is
            non-transferable.
          </p>
          <p>
            <strong>1.2 Beta Features</strong>
            <br />
            Because this is a beta version, certain features may be in
            development or subject to change without notice. The Service may not
            operate as intended, and you may encounter bugs, errors, or other
            issues.
          </p>
          <p>
            <strong>1.3 Feedback</strong>
            <br />
            We welcome feedback about your experience with the Service. You
            grant us a non-exclusive, perpetual, irrevocable, royalty-free
            license to use, modify, and incorporate any feedback you provide
            into our products or services.
          </p>

          <h2 className="font-semibold">2. User Accounts</h2>
          <p>
            <strong>2.1 Account Creation</strong>
            <br />
            To use certain features of the Service, you may be required to
            create an account. You agree to provide accurate, current, and
            complete information during the registration process and to update
            such information to keep it accurate and complete.
          </p>
          <p>
            <strong>2.2 Account Security</strong>
            <br />
            You are responsible for maintaining the confidentiality of your
            account credentials and for all activities that occur under your
            account. You must immediately notify us of any unauthorized use of
            your account or any other breach of security.
          </p>

          <h2 className="font-semibold">3. User Content and Data</h2>
          <p>
            <strong>3.1 Data Storage</strong>
            <br />
            Your chats, analyses, and documents uploaded to the Service (“User
            Data”) are stored in our systems so that you can review or reload
            them at a later time.
          </p>
          <p>
            <strong>3.2 Ownership of User Data</strong>
            <br />
            You retain all ownership rights to content you upload. By uploading
            content to the Service, you grant us a limited, non-exclusive right
            to store, reproduce, and process your content solely for the purpose
            of providing the Service to you.
          </p>
          <p>
            <strong>3.3 Exclusive Use</strong>
            <br />
            Your session history and any documents you upload are only used for
            your own purposes, namely to facilitate and enhance the geospatial
            analyses you conduct. We do not share or use your content for any
            other purpose.
          </p>

          <h2 className="font-semibold">4. License and Usage</h2>
          <p>
            <strong>4.1 License Grant</strong>
            <br />
            Subject to these Terms, we grant you a limited, non-transferable,
            non-exclusive, revocable license to use the Service for lawful
            purposes.
          </p>
          <p>
            <strong>4.2 Prohibited Conduct</strong>
            <br />
            You agree not to use the Service to:
          </p>
          <ul className="list-disc list-inside ml-4">
            <li>
              Violate any local, state, national, or international law or
              regulation.
            </li>
            <li>
              Infringe or misappropriate the intellectual property rights of any
              third party.
            </li>
            <li>
              Upload harmful or disruptive materials, such as malware or
              viruses.
            </li>
            <li>
              Perform analyses or operations you are not authorized to execute.
            </li>
          </ul>

          <h2 className="font-semibold">5. Intellectual Property</h2>
          <p>
            All intellectual property rights in the Service, including any
            trademarks, logos, designs, or underlying technology, are owned or
            licensed by us. Nothing in these Terms grants you any right, title,
            or interest in our intellectual property except as expressly set
            forth herein.
          </p>

          <h2 className="font-semibold">6. Disclaimers</h2>
          <p>
            <strong>6.1 Beta Disclaimer</strong>
            <br />
            The Service is provided on an “as is” and “as available” basis. As
            this is a beta version, no warranties or guarantees of performance,
            reliability, or availability are provided.
          </p>
          <p>
            <strong>6.2 No Warranty</strong>
            <br />
            We disclaim any and all warranties, express or implied, including
            but not limited to merchantability, fitness for a particular
            purpose, and non-infringement.
          </p>

          <h2 className="font-semibold">7. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, we shall not be liable for
            any indirect, incidental, special, consequential, or exemplary
            damages arising out of or in connection with the use or inability to
            use the Service, even if we have been advised of the possibility of
            such damages.
          </p>

          <h2 className="font-semibold">8. Termination and Data Removal</h2>
          <p>
            <strong>8.1 Termination</strong>
            <br />
            We may terminate or suspend access to the Service at any time
            without prior notice or liability for any reason. You may also
            discontinue use of the Service at any time.
          </p>
          <p>
            <strong>8.2 Data Removal</strong>
            <br />
            Upon the end of your beta testing, all of your data and history will
            be permanently removed if not already deleted by you, and this
            removal is irreversible.
          </p>

          <h2 className="font-semibold">
            9. Governing Law and Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with
            the laws of the jurisdiction in which our company is registered,
            without regard to its conflict of law provisions. Any dispute
            arising under these Terms shall be resolved exclusively in the
            courts within that jurisdiction.
          </p>

          <h2 className="font-semibold">10. Changes to the Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. If we make
            material changes, we will notify you by updating the “Effective
            Date” at the top of this page. Your continued use of the Service
            after such changes constitute acceptance of the modified Terms.
          </p>

          <p className="text-xs mt-4">Last Updated: January 06, 2025</p>
        </div>

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

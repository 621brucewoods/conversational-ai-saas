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

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PrivacyPolicy({
  open,
  onOpenChange,
}: PrivacyPolicyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm leading-relaxed">
          <p>
            <strong>Effective Date:</strong> January 06, 2025
          </p>
          <p>
            Your privacy is important to us. This Privacy Policy explains how we
            collect, use, share, and protect your personal information when you
            use the Chat2Geo platform (“the Service”).
          </p>

          <h2 className="font-semibold">1. Information We Collect</h2>
          <p>
            <strong>1.1 Personal Information</strong>
            <br />
            We may collect personal information such as your name, email
            address, and any additional information you provide when you create
            an account or use the Service.
            <br />
            <strong>Note:</strong> We do not record or collect IP addresses.
          </p>
          <p>
            <strong>1.2 Uploaded Content</strong>
            <br />
            We store the content you upload to the Service (e.g., text data,
            vector files, or documents) to provide you with geospatial analyses
            and related features. This includes data processed in your chats and
            any documents you integrate with the Service.
          </p>
          <p>
            <strong>1.3 Interaction Data</strong>
            <br />
            We may collect basic information about how you navigate or interact
            with the Service (e.g., feature usage, timestamps of actions) solely
            for improving user experience and maintaining platform stability. We
            do not collect IP addresses or other network identifiers.
          </p>

          <h2 className="font-semibold">2. How We Use Your Information</h2>
          <p>
            <strong>2.1 Providing the Service</strong>
            <br />
            We use your information exclusively to operate and maintain the
            Service, including running analyses, generating reports, and
            displaying results for your use. We do not share or sell your data
            to any third party for their own use.
          </p>
          <p>
            <strong>2.2 Improvement and Development</strong>
            <br />
            We may use aggregated or anonymized information about overall
            feature usage for research and development to enhance and refine our
            services. This data will not identify you or your specific User
            Data.
          </p>
          <p>
            <strong>2.3 Communication</strong>
            <br />
            We may use your contact information to send you administrative or
            technical notices, updates, and other information directly relevant
            to your use of the Service.
          </p>

          <h2 className="font-semibold">3. Sharing and Disclosure</h2>
          <p>
            <strong>3.1 Limited Disclosure to Service Providers</strong>
            <br />
            We may share minimal information with trusted service providers who
            help us operate and improve the Service. Such providers are bound by
            confidentiality and are prohibited from using the information for
            any purpose other than providing services to us.
          </p>
          <p>
            <strong>3.2 Legal Requirements</strong>
            <br />
            We may disclose your information if required by law or in response
            to valid legal processes, such as a subpoena or court order.
          </p>
          <p>
            <strong>3.3 Business Transfers</strong>
            <br />
            In the event of a merger, acquisition, or sale of assets, your
            information may be transferred as part of that transaction. We will
            notify you if any such transfer occurs.
          </p>

          <h2 className="font-semibold">4. Data Retention and Deletion</h2>
          <p>
            <strong>4.1 Storage Period</strong>
            <br />
            We retain your data as long as you have an active account or as
            needed to provide you with the Service. For beta testers, data and
            history may be removed upon completion of the beta period, as stated
            in our Terms of Service.
          </p>
          <p>
            <strong>4.2 Deletion Requests</strong>
            <br />
            You can delete your data at any time by following the instructions
            within the Service or by contacting us directly. Once deleted, your
            data may not be recoverable.
          </p>

          <h2 className="font-semibold">5. Security Measures</h2>
          <p>
            We take reasonable measures to protect your information from
            unauthorized access, alteration, disclosure, or destruction.
            However, no method of data transmission or storage is 100% secure,
            and we cannot guarantee absolute security.
          </p>

          <h2 className="font-semibold">6. Children’s Privacy</h2>
          <p>
            Because this Service provides specialized geospatial analysis tools
            intended for professional or academic use, it is not marketed toward
            or intended for use by individuals under the age of 18. We do not
            knowingly collect personal information from minors. If you are a
            parent or guardian and believe we may have inadvertently collected
            information from a minor, please contact us immediately.
          </p>

          <h2 className="font-semibold">7. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time to reflect
            changes in our practices. We will notify you by updating the
            “Effective Date” at the top of this page. Your continued use of the
            Service after any changes indicate your acceptance of the new
            Privacy Policy.
          </p>
          <p className="text-xs mt-4">Last Updated: January 06, 2025</p>
        </div>

        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

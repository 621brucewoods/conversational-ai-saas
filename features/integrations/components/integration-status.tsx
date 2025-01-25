import React from "react";
import { Button } from "@/components/ui/button";

interface IntegrationStatusProps {
  isConnected: boolean;
}

export const IntegrationStatus: React.FC<IntegrationStatusProps> = ({
  isConnected,
}) => {
  if (!isConnected) return null;

  return (
    <span className="flex items-center text-sm">
      <Button variant="destructive" size="sm" onClick={() => {}}>
        Disconnect
      </Button>
    </span>
  );
};

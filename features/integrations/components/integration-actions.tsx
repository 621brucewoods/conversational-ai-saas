import React from "react";
import { Button } from "@/components/ui/button";

interface IntegrationActionsProps {
  serviceId: ServiceType;
  isConnected: boolean;
  onConnect: (id: ServiceType) => void;
  onConfigure: (id: string) => void;
}

export const IntegrationActions: React.FC<IntegrationActionsProps> = ({
  serviceId,
  isConnected,
  onConnect,
  onConfigure,
}) => {
  return (
    <div className="flex items-center">
      {!isConnected && (
        <Button
          variant="default"
          size="sm"
          onClick={() => onConnect(serviceId)}
        >
          Connect
        </Button>
      )}
    </div>
  );
};

import React from "react";
import { IntegrationStatus } from "./integration-status";
import { IntegrationActions } from "./integration-actions";

interface IntegrationItemProps {
  service: IntegrationService;
  onConnect: (id: ServiceType) => void;
  onConfigure: (id: string) => void;
}

export const IntegrationItem: React.FC<IntegrationItemProps> = ({
  service,
  onConnect,
  onConfigure,
}) => {
  const isConnected = service.status === "connected";

  return (
    <div className="flex items-center justify-between p-4 transition-colors">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 flex items-center justify-center">
          <img
            src={service.icon}
            alt={service.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{service.name}</h3>
          <p className="text-sm text-muted-foreground">{service.description}</p>
        </div>
      </div>

      <div className="flex items-center">
        <IntegrationStatus isConnected={isConnected} />
        <IntegrationActions
          serviceId={service.id}
          isConnected={isConnected}
          onConnect={onConnect}
          onConfigure={onConfigure}
        />
      </div>
    </div>
  );
};

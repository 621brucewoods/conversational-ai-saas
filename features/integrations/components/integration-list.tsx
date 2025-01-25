import React from "react";
import { IntegrationItem } from "./integration-item";

interface IntegrationListProps {
  services: IntegrationService[];
  onConnect: (id: ServiceType) => void;
  onConfigure: (id: string) => void;
}

export const IntegrationList: React.FC<IntegrationListProps> = ({
  services,
  onConnect,
  onConfigure,
}) => {
  return (
    <div className="rounded-lg border border-stone-300 dark:border-stone-600">
      <div className="divide-y divide-stone-300 dark:divide-stone-600">
        {services.map((service) => (
          <IntegrationItem
            key={service.id}
            service={service}
            onConnect={onConnect}
            onConfigure={onConfigure}
          />
        ))}
      </div>
    </div>
  );
};

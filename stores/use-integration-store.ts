import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { INTEGRATION_SERVICES } from "@/custom-configs/integrations";

interface IntegrationState {
  services: IntegrationService[];
  updateServiceStatus: (serviceId: ServiceType, status: ServiceStatus) => void;
  updateLastSync: (serviceId: ServiceType, lastSync: string) => void;
  getServiceStatus: (serviceId: ServiceType) => ServiceStatus;
  getLastSync: (serviceId: ServiceType) => string | undefined;
}

export const useIntegrationStore = create<IntegrationState>()(
  devtools(
    (set, get) => ({
      services: INTEGRATION_SERVICES,

      updateServiceStatus: (serviceId, status) =>
        set((state) => ({
          services: state.services.map((service) =>
            service.id === serviceId ? { ...service, status } : service
          ),
        })),

      updateLastSync: (serviceId, lastSync) =>
        set((state) => ({
          services: state.services.map((service) =>
            service.id === serviceId ? { ...service, lastSync } : service
          ),
        })),

      getServiceStatus: (serviceId) =>
        get().services.find((service) => service.id === serviceId)?.status ??
        "not_connected",

      getLastSync: (serviceId) =>
        get().services.find((service) => service.id === serviceId)?.lastSync,
    }),
    {
      name: "integration-store",
    }
  )
);

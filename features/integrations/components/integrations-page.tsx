"use client";

import React, { use, useEffect } from "react";

import { IntegrationHeader } from "./integration-header";
import { IntegrationList } from "./integration-list";
import { handleArcGISAuth } from "@/utils/service-handlers/esri";
import { useIntegrationStore } from "@/stores/use-integration-store";
import useToastMessageStore from "@/stores/use-toast-message-store";
import { useButtonsStore } from "@/stores/use-buttons-store";

const IntegrationsPage = () => {
  const services = useIntegrationStore((state) => state.services);
  const updateServiceStatus = useIntegrationStore(
    (state) => state.updateServiceStatus
  );
  const setToastMessage = useToastMessageStore(
    (state) => state.setToastMessage
  );
  const isSidebarCollapsed = useButtonsStore(
    (state) => state.isSidebarCollapsed
  );

  const handleAddNew = () => {
    console.log("Add new integration");
  };

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel("esriChannel");

    broadcastChannel.onmessage = (event) => {
      const { connectionStatus } = event.data;
      if (connectionStatus === "connected") {
        updateServiceStatus("arcgis", "connected");
        setToastMessage(
          "Successfully connected to Esri Feature Services",
          "success"
        );
      }
    };

    return () => {
      broadcastChannel.close();
    };
  }, [updateServiceStatus]);

  const handleConnect = (serviceId: ServiceType) => {
    if (serviceId === "arcgis") {
      handleArcGISAuth();
    } else {
      console.log(serviceId);
    }
  };

  const handleConfigure = (serviceId: string) => {
    console.log("Configuring service:", serviceId);
  };

  return (
    <section
      className={`flex h-screen overflow-hidden flex-grow transition-all duration-300 ${
        isSidebarCollapsed ? "ml-20" : "ml-64"
      }`}
    >
      <div className="container mx-auto py-16 max-w-6xl">
        <IntegrationHeader onAddNew={handleAddNew} />
        <IntegrationList
          services={services}
          onConnect={handleConnect}
          onConfigure={handleConfigure}
        />
      </div>
    </section>
  );
};

export default IntegrationsPage;

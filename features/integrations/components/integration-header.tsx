import { Separator } from "@/components/ui/separator";
import React from "react";

interface IntegrationHeaderProps {
  onAddNew: () => void;
}

export const IntegrationHeader: React.FC<IntegrationHeaderProps> = ({
  onAddNew,
}) => {
  return (
    <section>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Integrations
          </h1>
          <p className="mt-2 font-semibold text-muted-foreground ">
            Connect your preferred services and data sources
          </p>
        </div>
        {/* <Button
        variant="btn-ghost"
        size="md"
        onClick={onAddNew}
        className="gap-2"
      >
        <IconPlus size={18} />
        Add New Integration
      </Button> */}
      </div>
      <Separator className="mt-3 mb-10" />
    </section>
  );
};

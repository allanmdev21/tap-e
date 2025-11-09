import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Store, Building2 } from "lucide-react";
import StoreDashboard from "./StoreDashboard";
import CityDashboard from "./CityDashboard";
import { BrandLogo } from "@/components/BrandLogo";

export default function Dashboards() {
  const [activeTab, setActiveTab] = useState<"store" | "city">("store");

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 border-b border-border bg-card">
        <div className="flex flex-col items-center gap-3 mb-4">
          <BrandLogo className="h-12" />
          <h1 className="text-xl font-bold text-center text-foreground">Painéis</h1>
        </div>
        
        <div className="flex gap-2 max-w-md mx-auto">
          <Button
            variant={activeTab === "store" ? "default" : "outline"}
            className="flex-1 h-12 rounded-full font-semibold"
            onClick={() => setActiveTab("store")}
            data-testid="tab-store"
          >
            <Store className="w-5 h-5 mr-2" />
            Lojista
          </Button>
          <Button
            variant={activeTab === "city" ? "default" : "outline"}
            className="flex-1 h-12 rounded-full font-semibold"
            onClick={() => setActiveTab("city")}
            data-testid="tab-city"
          >
            <Building2 className="w-5 h-5 mr-2" />
            Prefeitura
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {activeTab === "store" ? <StoreDashboard /> : <CityDashboard />}
      </main>
    </div>
  );
}

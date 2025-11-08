import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Users, Upload, Monitor, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import type { Store } from "@shared/schema";

interface StoreStats {
  totalPedestrians: number;
  totalEnergy: number;
  todayPedestrians: number;
  todayEnergy: number;
}

export default function StoreDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: store, isLoading: storeLoading } = useQuery<Store>({
    queryKey: ['/api/stores/my-store'],
    enabled: !!user,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<StoreStats>({
    queryKey: ['/api/stores/stats', store?.id],
    queryFn: async () => {
      if (!store?.id) throw new Error('Store not found');
      const response = await fetch(`/api/stores/${store.id}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!store,
  });

  const [storeName, setStoreName] = useState("");
  const [location, setLocation] = useState("");
  const [logo, setLogo] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast({
          title: "Logo carregado!",
          description: "Sua logo foi atualizada com sucesso",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditAd = () => {
    toast({
      title: "Editor de anúncio",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  if (storeLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Carregando dados da loja...</div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-center max-w-md space-y-3">
          <p className="text-lg font-semibold text-foreground">Loja não encontrada</p>
          <p className="text-sm text-muted-foreground">
            Nenhuma loja está cadastrada para este usuário. Entre em contato com a prefeitura para cadastrar seu estabelecimento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Estabelecimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Estabelecimento</Label>
              <p className="text-base font-semibold text-foreground" data-testid="text-store-name">
                {store.name}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Localização</Label>
              <p className="text-sm text-muted-foreground" data-testid="text-store-location">
                {store.location}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <Label className="text-xs">Pisos Cinéticos</Label>
                <p className="text-2xl font-bold text-primary" data-testid="text-kinetic-floors">
                  {store.kineticFloors}
                </p>
              </div>
              <div>
                <Label className="text-xs">Totens LED</Label>
                <p className="text-2xl font-bold text-primary" data-testid="text-led-totems">
                  {store.ledTotems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground" data-testid="text-store-energy">
                  {stats?.todayEnergy ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Wh gerados hoje</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground" data-testid="text-store-traffic">
                  {stats?.todayPedestrians ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">pedestres hoje</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {stats && (
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Estatísticas Totais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total de Pedestres</p>
                  <p className="text-lg font-bold text-foreground" data-testid="text-total-pedestrians">
                    {stats.totalPedestrians.toLocaleString('pt-BR')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Energia Total</p>
                  <p className="text-lg font-bold text-foreground" data-testid="text-total-energy">
                    {stats.totalEnergy.toLocaleString('pt-BR')} Wh
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Monitor className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">Seu anúncio no totem</p>
                <p className="text-sm text-muted-foreground">
                  Personalize a mensagem que aparece nos {store.ledTotems} totens de LED em frente à sua loja
                </p>
              </div>
            </div>
            <Button 
              className="w-full h-12 text-base font-semibold rounded-full"
              onClick={handleEditAd}
              data-testid="button-edit-ad"
            >
              Editar Anúncio no Totem
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

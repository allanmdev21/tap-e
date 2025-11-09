import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Users, Footprints, LogOut, Store, TrendingUp, BarChart3, MapPin, PlusCircle, Trophy } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserProfile, Store as StoreType } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/BrandLogo";

interface StoreStats {
  totalPedestrians: number;
  totalEnergy: number;
  todayPedestrians: number;
  todayEnergy: number;
}

interface CityStats {
  totalEnergy: number;
  totalUsers: number;
  activeUsers: number;
  totalStores: number;
  totalStoreEnergy: number;
  totalStoreFootTraffic: number;
  totalKineticFloors: number;
  totalLedTotems: number;
  topWalkers: {
    username: string;
    displayName: string;
    distance: number;
    energy: number;
  }[];
}

export default function Profile() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const isCityAdmin = user?.role === "city_admin";
  const isStoreOwner = user?.role === "store_owner";

  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ['/api/users', user?.id],
    enabled: !!user && !isCityAdmin && !isStoreOwner,
  });

  const { data: store, isLoading: storeLoading, error: storeError } = useQuery<StoreType>({
    queryKey: ['/api/stores/my-store'],
    enabled: !!user && isStoreOwner,
    retry: false,
  });

  const { data: storeStats, isLoading: storeStatsLoading } = useQuery<StoreStats>({
    queryKey: ['/api/stores/stats', store?.id],
    queryFn: async () => {
      if (!store?.id) {
        throw new Error("Store not found");
      }
      const response = await fetch(`/api/stores/${store.id}/stats`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch store stats");
      }
      return response.json() as Promise<StoreStats>;
    },
    enabled: !!user && isStoreOwner && !!store?.id,
  });

  const { data: cityStats, isLoading: cityStatsLoading } = useQuery<CityStats>({
    queryKey: ['/api/city/stats'],
    enabled: !!user && isCityAdmin,
  });

  const { data: stores = [], isLoading: storesLoading } = useQuery<StoreType[]>({
    queryKey: ['/api/stores'],
    enabled: !!user && isCityAdmin,
  });

  const [newStoreForm, setNewStoreForm] = useState({
    ownerUsername: "",
    name: "",
    location: "",
    kineticFloors: "",
    ledTotems: "",
  });
  const [cityTab, setCityTab] = useState<"management" | "analytics">("management");

  const createStoreMutation = useMutation({
    mutationFn: async (payload: {
      ownerUsername: string;
      name: string;
      location: string;
      kineticFloors: number;
      ledTotems: number;
    }) => {
      const response = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Erro ao criar loja");
      }

      return data as StoreType;
    },
    onSuccess: () => {
      toast({
        title: "Loja criada!",
        description: "O cadastro foi realizado com sucesso.",
      });
      setNewStoreForm({
        ownerUsername: "",
        name: "",
        location: "",
        kineticFloors: "",
        ledTotems: "",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/city/stats'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : "Tente novamente mais tarde.";
      toast({
        title: "Não foi possível criar a loja",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleCreateStore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newStoreForm.ownerUsername.trim() || !newStoreForm.name.trim() || !newStoreForm.location.trim()) {
      toast({
        title: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createStoreMutation.mutate({
      ownerUsername: newStoreForm.ownerUsername.trim(),
      name: newStoreForm.name.trim(),
      location: newStoreForm.location.trim(),
      kineticFloors: Number(newStoreForm.kineticFloors) || 0,
      ledTotems: Number(newStoreForm.ledTotems) || 0,
    });
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  if (!user) {
    return <div />;
  }

  const initials = user.displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderCityAdminSection = () => {
    if (cityStatsLoading || storesLoading || !cityStats) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Carregando dados da prefeitura...
          </CardContent>
        </Card>
      );
    }

    const totalWalkEnergyKwh = cityStats.totalEnergy / 1000;
    const totalStoreEnergyKwh = cityStats.totalStoreEnergy / 1000;
    const isCreateDisabled =
      createStoreMutation.isPending ||
      !newStoreForm.ownerUsername.trim() ||
      !newStoreForm.name.trim() ||
      !newStoreForm.location.trim();

    const sortedStores = [...stores].sort(
      (a, b) => (b.energyToday ?? 0) - (a.energyToday ?? 0),
    );

    const managementTab = (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Ranking de Lojas por Energia
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedStores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma loja cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedStores.map((storeItem, index) => (
                  <div
                    key={storeItem.id}
                    className="rounded-lg border border-border p-4 hover-elevate"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-muted-foreground">#{index + 1}</p>
                        <p className="text-sm font-semibold text-foreground">
                          {storeItem.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {storeItem.location}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">
                          {(storeItem.energyToday ?? 0).toLocaleString("pt-BR")} Wh
                        </p>
                        <p className="text-xs text-muted-foreground">energia hoje</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Lojas cadastradas ({stores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma loja cadastrada ainda.
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map((storeItem) => (
                  <div
                    key={storeItem.id}
                    className="rounded-lg border border-border p-4 hover-elevate"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {storeItem.name}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {storeItem.location}
                        </p>
                      </div>
                      <div className="text-right text-xs text-muted-foreground space-y-1">
                        <div>
                          Energia hoje:{" "}
                          <span className="font-semibold text-foreground">
                            {(storeItem.energyToday ?? 0).toLocaleString("pt-BR")} Wh
                          </span>
                        </div>
                        <div>
                          Pisos:{" "}
                          <span className="font-semibold text-foreground">
                            {storeItem.kineticFloors ?? 0}
                          </span>
                          {" · "}Totens:{" "}
                          <span className="font-semibold text-foreground">
                            {storeItem.ledTotems ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cadastrar nova loja</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateStore}>
              <div className="space-y-2">
                <Label htmlFor="ownerUsername">Usuário do lojista</Label>
                <Input
                  id="ownerUsername"
                  placeholder="ex: loja.ruaxv"
                  value={newStoreForm.ownerUsername}
                  onChange={(event) =>
                    setNewStoreForm((prev) => ({ ...prev, ownerUsername: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeName">Nome da loja</Label>
                <Input
                  id="storeName"
                  placeholder="Nome do estabelecimento"
                  value={newStoreForm.name}
                  onChange={(event) =>
                    setNewStoreForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeLocation">Localização</Label>
                <Input
                  id="storeLocation"
                  placeholder="Rua XV de Novembro, 1234"
                  value={newStoreForm.location}
                  onChange={(event) =>
                    setNewStoreForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="kineticFloors">Pisos Cinéticos</Label>
                  <Input
                    id="kineticFloors"
                    type="number"
                    min={0}
                    value={newStoreForm.kineticFloors}
                    onChange={(event) =>
                      setNewStoreForm((prev) => ({ ...prev, kineticFloors: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ledTotems">Totens LED</Label>
                  <Input
                    id="ledTotems"
                    type="number"
                    min={0}
                    value={newStoreForm.ledTotems}
                    onChange={(event) =>
                      setNewStoreForm((prev) => ({ ...prev, ledTotems: event.target.value }))
                    }
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full font-semibold"
                disabled={isCreateDisabled}
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                {createStoreMutation.isPending ? "Cadastrando..." : "Cadastrar loja"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );

    const analyticsTab = (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalWalkEnergyKwh.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">kWh dos pedestres</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalStoreEnergyKwh.toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">kWh captados nas lojas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {cityStats.totalStores}
                </p>
                <p className="text-xs text-muted-foreground">lojas cadastradas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Pisos cinéticos</span>
                  <span className="font-semibold text-foreground">{cityStats.totalKineticFloors}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Totens LED</span>
                  <span className="font-semibold text-foreground">{cityStats.totalLedTotems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Pedestres/dia</span>
                  <span className="font-semibold text-foreground">
                    {cityStats.totalStoreFootTraffic.toLocaleString("pt-BR")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top caminhadores</CardTitle>
          </CardHeader>
          <CardContent>
            {cityStats.topWalkers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum dado de caminhada disponível.
              </div>
            ) : (
              <div className="space-y-2">
                {cityStats.topWalkers.slice(0, 5).map((walker, index) => (
                  <div
                    key={walker.username}
                    className="flex items-center justify-between rounded-md border border-border px-4 py-3 hover-elevate"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {walker.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">@{walker.username}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-muted-foreground">
                      <div>
                        Distância:{" "}
                        <span className="font-semibold text-foreground">
                          {walker.distance.toFixed(1)} km
                        </span>
                      </div>
                      <div>
                        Energia:{" "}
                        <span className="font-semibold text-foreground">
                          {walker.energy.toLocaleString("pt-BR")} Wh
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );

    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant={cityTab === "management" ? "default" : "outline"}
            className="flex-1 rounded-full font-semibold"
            onClick={() => setCityTab("management")}
          >
            Gestão de Lojas
          </Button>
          <Button
            variant={cityTab === "analytics" ? "default" : "outline"}
            className="flex-1 rounded-full font-semibold"
            onClick={() => setCityTab("analytics")}
          >
            Analytics
          </Button>
        </div>
        {cityTab === "management" ? managementTab : analyticsTab}
      </div>
    );
  };

  const renderStoreOwnerSection = () => {
    if (storeLoading || (isStoreOwner && !store && !storeError)) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Carregando dados da loja...
          </CardContent>
        </Card>
      );
    }

    if (storeError || !store) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground space-y-2">
            <p>Não encontramos uma loja vinculada ao seu usuário.</p>
            <p className="text-xs">
              Entre em contato com a prefeitura para concluir o cadastro do estabelecimento.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (storeStatsLoading || !storeStats) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Carregando estatísticas energéticas...
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{store.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {store.location}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 text-center space-y-2">
                  <Zap className="w-6 h-6 text-primary mx-auto" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {storeStats.todayEnergy.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">Wh gerados hoje</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center space-y-2">
                  <TrendingUp className="w-6 h-6 text-primary mx-auto" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {storeStats.totalEnergy.toLocaleString("pt-BR")}
                    </p>
                    <p className="text-xs text-muted-foreground">Wh acumulados</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{store.kineticFloors} pisos cinéticos</span>
              <span>{store.ledTotems} totens LED</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCitizenSection = () => {
    if (profileLoading || !profile) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            Carregando estatísticas pessoais...
          </CardContent>
        </Card>
      );
    }

    return (
      <>
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <Footprints className="w-6 h-6 text-primary mx-auto" />
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-walks">
                  {profile.totalWalks}
                </p>
                <p className="text-xs text-muted-foreground">caminhadas</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <Zap className="w-6 h-6 text-primary mx-auto" />
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-energy">
                  {profile.totalEnergy.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Wh</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <Users className="w-6 h-6 text-primary mx-auto" />
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-friends-count">
                  {profile.friendsCount}
                </p>
                <p className="text-xs text-muted-foreground">amigos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Estatísticas Totais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Distância Total</span>
              <span className="font-bold text-foreground">
                {profile.totalDistance.toFixed(2)} km
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Energia Gerada</span>
              <span className="font-bold text-foreground">
                {profile.totalEnergy.toFixed(0)} Wh
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Média por Caminhada</span>
              <span className="font-bold text-foreground">
                {profile.totalWalks > 0
                  ? (profile.totalDistance / profile.totalWalks).toFixed(2)
                  : "0.00"} km
              </span>
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo className="h-12" />
          <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 text-center">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-foreground" data-testid="text-display-name">
                    {user.displayName}
                  </h2>
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {isCityAdmin && renderCityAdminSection()}
          {isStoreOwner && !isCityAdmin && renderStoreOwnerSection()}
          {!isCityAdmin && !isStoreOwner && renderCitizenSection()}

          <Button
            variant="destructive"
            className="w-full h-12 rounded-full font-semibold"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair
          </Button>
        </div>
      </main>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, TrendingUp, BarChart3, Store, Monitor, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import type { Store as StoreType } from "@shared/schema";

interface CityStats {
  totalEnergy: number;
  totalUsers: number;
  activeUsers: number;
  topWalkers: {
    username: string;
    displayName: string;
    distance: number;
    energy: number;
  }[];
}

export default function CityDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<CityStats>({
    queryKey: ['/api/city/stats'],
  });

  const { data: stores = [], isLoading: storesLoading, error: storesError } = useQuery<StoreType[]>({
    queryKey: ['/api/stores'],
    retry: false,
  });

  if (statsLoading || storesLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  // Check if user has permission to view city dashboard
  if (user && user.role !== 'city_admin') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="max-w-md space-y-4 text-center">
          <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 inline-block">
            <ShieldAlert className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Restrito</h3>
            <p className="text-sm text-muted-foreground">
              Este painel é exclusivo para a prefeitura de Curitiba. Apenas administradores da cidade podem visualizar dados consolidados de todas as lojas e métricas urbanas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activePercentage = stats.totalUsers > 0 
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
    : 0;

  const totalKineticFloors = stores.reduce((sum, store) => sum + (store.kineticFloors || 0), 0);
  const totalLedTotems = stores.reduce((sum, store) => sum + (store.ledTotems || 0), 0);
  const totalStoreEnergy = stores.reduce((sum, store) => sum + (store.energyToday || 0), 0);
  const totalFootTraffic = stores.reduce((sum, store) => sum + (store.dailyFootTraffic || 0), 0);
  
  // Find peak traffic store
  const peakStore = stores.length > 0 
    ? stores.reduce((max, store) => 
        (store.dailyFootTraffic || 0) > (max.dailyFootTraffic || 0) ? store : max
      )
    : null;

  return (
    <div className="px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card data-testid="card-total-energy">
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-energy">
                  {(stats.totalEnergy / 1000).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">kWh total</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-users">
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-users">
                  {stats.totalUsers}
                </p>
                <p className="text-xs text-muted-foreground">usuários</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-active-users">
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-users">
                  {stats.activeUsers}
                </p>
                <p className="text-xs text-muted-foreground">ativos ({activePercentage}%)</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-avg-energy">
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-avg-energy">
                  {stats.activeUsers > 0 
                    ? Math.round(stats.totalEnergy / stats.activeUsers)
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Wh/usuário</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-top-walkers">
          <CardHeader>
            <CardTitle className="text-lg">Top Caminhadores</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topWalkers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum dado de caminhadas ainda
              </div>
            ) : (
              <div className="space-y-2">
                {stats.topWalkers.slice(0, 5).map((walker, index) => (
                  <div 
                    key={walker.username}
                    className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                    data-testid={`walker-${index + 1}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {walker.displayName}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {walker.distance.toFixed(1)} km
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {walker.energy} Wh
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Card data-testid="card-total-stores">
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-stores">
                  {stores.length}
                </p>
                <p className="text-xs text-muted-foreground">lojas parceiras</p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-total-totems">
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-totems">
                  {totalLedTotems}
                </p>
                <p className="text-xs text-muted-foreground">totens LED</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {peakStore && (
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900" data-testid="card-peak-traffic">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Pico de Tráfego Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-semibold text-foreground" data-testid="text-peak-store-name">
                  {peakStore.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {peakStore.location}
                </p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedestres</p>
                    <p className="text-lg font-bold text-foreground" data-testid="text-peak-pedestrians">
                      {peakStore.dailyFootTraffic}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Energia</p>
                    <p className="text-lg font-bold text-foreground">
                      {peakStore.energyToday} Wh
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Pisos</p>
                    <p className="text-lg font-bold text-foreground">
                      {peakStore.kineticFloors}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card data-testid="card-stores-list">
          <CardHeader>
            <CardTitle className="text-lg">Lojas Parceiras ({stores.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {stores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhuma loja cadastrada ainda
              </div>
            ) : (
              <div className="space-y-2">
                {stores.map((store, index) => (
                  <div 
                    key={store.id}
                    className="flex items-center gap-3 p-3 rounded-md hover-elevate"
                    data-testid={`store-${index + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {store.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {store.location}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-muted-foreground">Pisos:</span>
                        <span className="font-semibold text-foreground">{store.kineticFloors}</span>
                        <span className="text-muted-foreground">Totens:</span>
                        <span className="font-semibold text-foreground">{store.ledTotems}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {store.dailyFootTraffic} pedestres hoje
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              Dashboard com métricas em tempo real do projeto Rua XV.
              Os dados mostram o impacto dos pisos cinéticos e o engajamento dos cidadãos
              com a mobilidade sustentável na cidade.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

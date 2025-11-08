import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Users, TrendingUp, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
  const { data: stats, isLoading } = useQuery<CityStats>({
    queryKey: ['/api/city/stats'],
  });

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-muted-foreground">Carregando dados...</div>
      </div>
    );
  }

  const activePercentage = stats.totalUsers > 0 
    ? Math.round((stats.activeUsers / stats.totalUsers) * 100) 
    : 0;

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

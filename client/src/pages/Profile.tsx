import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Zap, Users, Footprints, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@shared/schema";

export default function Profile() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const { data: profile } = useQuery<UserProfile>({
    queryKey: ['/api/users', user?.id],
    enabled: !!user,
  });

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

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
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

          {profile && (
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
          )}

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

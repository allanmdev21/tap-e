import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import type { RankingEntry } from "@shared/schema";

export default function Ranking() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [showFriendsOnly, setShowFriendsOnly] = useState(true);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, authLoading, setLocation]);

  const { data: rankings = [], isLoading: rankingsLoading } = useQuery<RankingEntry[]>({
    queryKey: ['/api/ranking', showFriendsOnly, user?.id],
    queryFn: async () => {
      const params = new URLSearchParams({
        friendsOnly: showFriendsOnly.toString(),
        ...(user?.id && { userId: user.id }),
      });
      const response = await fetch(`/api/ranking?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ranking');
      return response.json();
    },
    enabled: !!user,
  });

  const getMedalIcon = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Ranking da XV</h1>
        </div>
        
        <div className="flex gap-2 max-w-md mx-auto">
          <Button
            variant={showFriendsOnly ? "default" : "outline"}
            className="flex-1 h-10 rounded-full font-medium"
            onClick={() => setShowFriendsOnly(true)}
            data-testid="button-friends-only"
          >
            <Users className="w-4 h-4 mr-2" />
            Amigos
          </Button>
          <Button
            variant={!showFriendsOnly ? "default" : "outline"}
            className="flex-1 h-10 rounded-full font-medium"
            onClick={() => setShowFriendsOnly(false)}
            data-testid="button-all-users"
          >
            <Trophy className="w-4 h-4 mr-2" />
            Todos
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          {rankingsLoading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : rankings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">
                  {showFriendsOnly 
                    ? "Adicione amigos para ver o ranking!" 
                    : "Nenhum usuário no ranking ainda."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {rankings.map((entry) => {
                const isTopThree = entry.position <= 3;
                const medal = getMedalIcon(entry.position);
                const isCurrentUser = user?.id === entry.id;
                const initials = entry.name
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card
                    key={entry.id}
                    className={`${isTopThree ? "bg-amber-50 dark:bg-amber-950/20" : ""} ${isCurrentUser ? "border-primary border-2" : ""}`}
                    data-testid={`ranking-item-${entry.position}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted text-center flex-shrink-0">
                          {medal ? (
                            <span className="text-2xl">{medal}</span>
                          ) : (
                            <span className="text-lg font-bold text-muted-foreground">
                              {entry.position}
                            </span>
                          )}
                        </div>

                        <Avatar className="w-10 h-10 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground truncate">
                              {entry.name}
                            </p>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs flex-shrink-0">
                                Você
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm text-muted-foreground">
                              {entry.distance.toFixed(1)} km
                            </span>
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-primary" />
                              <span className="text-sm text-muted-foreground">
                                {entry.energy.toFixed(0)} Wh
                              </span>
                            </div>
                          </div>
                        </div>

                        {isTopThree && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            Top {entry.position}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

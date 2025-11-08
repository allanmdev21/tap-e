import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Ranking() {
  const rankingData = [
    { id: "1", position: 1, name: "Maria Silva", distance: 45.3, energy: 2265 },
    { id: "2", position: 2, name: "João Santos", distance: 38.7, energy: 1935 },
    { id: "3", position: 3, name: "Ana Costa", distance: 32.1, energy: 1605 },
    { id: "4", position: 4, name: "Pedro Lima", distance: 28.5, energy: 1425 },
    { id: "5", position: 5, name: "Carla Mendes", distance: 24.9, energy: 1245 },
    { id: "6", position: 6, name: "Lucas Ferreira", distance: 21.3, energy: 1065 },
    { id: "7", position: 7, name: "Julia Alves", distance: 18.7, energy: 935 },
    { id: "8", position: 8, name: "Rafael Souza", distance: 15.2, energy: 760 },
    { id: "9", position: 9, name: "Beatriz Rocha", distance: 12.8, energy: 640 },
    { id: "10", position: 10, name: "Gabriel Dias", distance: 10.4, energy: 520 },
  ];

  const getMedalIcon = (position: number) => {
    if (position === 1) return "🥇";
    if (position === 2) return "🥈";
    if (position === 3) return "🥉";
    return null;
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Ranking da XV</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-4">
          <Card className="bg-primary/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Top caminhantes da Rua XV este mês
              </p>
            </CardContent>
          </Card>

          <div className="space-y-2">
            {rankingData.map((entry) => {
              const isTopThree = entry.position <= 3;
              const medal = getMedalIcon(entry.position);

              return (
                <Card
                  key={entry.id}
                  className={isTopThree ? "bg-amber-50 dark:bg-amber-950/20" : ""}
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

                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">
                          {entry.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">
                            {entry.distance} km
                          </span>
                          <div className="flex items-center gap-1">
                            <Zap className="w-3 h-3 text-primary" />
                            <span className="text-sm text-muted-foreground">
                              {entry.energy} Wh
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
        </div>
      </main>
    </div>
  );
}

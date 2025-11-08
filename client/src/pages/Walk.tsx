import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Zap, Clock, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

export default function Walk() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);
  const [isWalking, setIsWalking] = useState(false);
  const [distance, setDistance] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [duration, setDuration] = useState(0);
  const [walkCompleted, setWalkCompleted] = useState(false);
  const { toast } = useToast();

  const saveWalkMutation = useMutation({
    mutationFn: async (walkData: { userId: string; distance: number; energy: number; duration: number }) => {
      const response = await fetch("/api/walks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walkData),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ranking'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isWalking) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        setDistance(prev => {
          const newDist = prev + (Math.random() * 0.01);
          setEnergy(newDist * 50);
          return newDist;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isWalking]);

  const requestPermission = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setPermissionGranted(true);
          setIsWalking(true);
          toast({
            title: "Geolocalização ativada!",
            description: "Comece a caminhar pela Rua XV",
          });
        },
        () => {
          toast({
            title: "Permissão negada",
            description: "Precisamos da localização para rastrear sua caminhada",
            variant: "destructive",
          });
        }
      );
    }
  };

  const endWalk = () => {
    setIsWalking(false);
    setWalkCompleted(true);
    
    // Save walk to backend
    if (user) {
      saveWalkMutation.mutate({
        userId: user.id,
        distance,
        energy,
        duration,
      });
    }
    
    toast({
      title: "Caminhada finalizada!",
      description: `Você gerou ${energy.toFixed(0)} Wh de energia`,
    });
  };

  const resetWalk = () => {
    setDistance(0);
    setEnergy(0);
    setDuration(0);
    setIsWalking(false);
    setWalkCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!permissionGranted) {
    return (
      <div className="flex flex-col min-h-screen pb-20 bg-background">
        <header className="px-4 py-6 text-center border-b border-border bg-card">
          <h1 className="text-xl font-bold text-foreground">Minha Caminhada na XV</h1>
        </header>

        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md mx-auto w-full space-y-6">
            <Card>
              <CardContent className="p-8 space-y-6 text-center">
                <div className="flex justify-center">
                  <div className="p-4 rounded-full bg-primary/10">
                    <MapPin className="w-16 h-16 text-primary" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    Precisamos da sua localização
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Para rastrear sua caminhada na Rua XV e calcular a energia gerada, precisamos acessar sua geolocalização.
                  </p>
                </div>

                <Button 
                  className="w-full h-12 text-base font-semibold rounded-full"
                  onClick={requestPermission}
                  data-testid="button-allow-location"
                >
                  Permitir Geolocalização
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (walkCompleted) {
    return (
      <div className="flex flex-col min-h-screen pb-20 bg-background">
        <header className="px-4 py-6 text-center border-b border-border bg-card">
          <h1 className="text-xl font-bold text-foreground">Caminhada Concluída!</h1>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="max-w-md mx-auto w-full space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-primary/10">
                <CheckCircle2 className="w-16 h-16 text-primary" />
              </div>
            </div>

            <Card className="bg-primary/5">
              <CardContent className="p-8 text-center space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Distância Total</p>
                <p className="text-5xl font-bold text-primary">{distance.toFixed(2)}</p>
                <p className="text-lg text-muted-foreground">km</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <Zap className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-2xl font-bold text-foreground">{energy.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">Wh gerados</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center space-y-2">
                  <Clock className="w-8 h-8 text-primary mx-auto" />
                  <p className="text-2xl font-bold text-foreground">{formatTime(duration)}</p>
                  <p className="text-xs text-muted-foreground">minutos</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full h-12 text-base font-semibold rounded-full"
                onClick={resetWalk}
                data-testid="button-new-walk"
              >
                Nova Caminhada
              </Button>
              
              <Button 
                variant="outline"
                className="w-full h-12 text-base font-semibold rounded-full border-2"
                onClick={() => window.location.href = '/ranking'}
                data-testid="button-view-ranking"
              >
                Ver Ranking
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <h1 className="text-xl font-bold text-foreground">Minha Caminhada na XV</h1>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          <Card className="bg-primary/5">
            <CardContent className="p-8 text-center space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Distância na Rua XV</p>
              <p className="text-6xl font-bold text-primary" data-testid="text-distance">
                {distance.toFixed(2)}
              </p>
              <p className="text-xl text-muted-foreground">km</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="p-2 rounded-lg bg-primary/10 inline-block">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-energy">
                    {energy.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Wh gerados</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <div className="p-2 rounded-lg bg-primary/10 inline-block">
                  <Clock className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground" data-testid="text-duration">
                    {formatTime(duration)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">tempo</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="pt-4">
            <Button 
              className="w-full h-12 text-base font-semibold rounded-full"
              variant="destructive"
              onClick={endWalk}
              data-testid="button-end-walk"
            >
              Encerrar Caminhada
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

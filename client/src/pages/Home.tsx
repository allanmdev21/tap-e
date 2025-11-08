import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, MapPin, Monitor } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <h1 className="text-xl font-bold text-foreground">Energia+Publicidade</h1>
      </header>

      <main className="flex-1 px-4 py-8">
        <div className="max-w-md mx-auto space-y-8">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold text-foreground leading-tight">
              Transformando Energia em Publicidade
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              Já pensou em ganhar dinheiro com o chão?
            </p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <p className="flex-1 text-sm text-foreground leading-relaxed">
                    Pisos especiais na Rua XV captam a energia cinética de cada passo dos pedestres
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Monitor className="w-6 h-6 text-primary" />
                  </div>
                  <p className="flex-1 text-sm text-foreground leading-relaxed">
                    Totens de LED são alimentados com essa energia para exibir publicidade local
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <p className="flex-1 text-sm text-foreground leading-relaxed">
                    Seu celular rastreia quanto você andou na XV e quanto de energia você gerou
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            {isAuthenticated ? (
              <Link href="/walk">
                <Button 
                  className="w-full h-12 text-base font-semibold rounded-full" 
                  size="lg"
                  data-testid="button-start-walk"
                >
                  Iniciar Caminhada na XV
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button 
                  className="w-full h-12 text-base font-semibold rounded-full" 
                  size="lg"
                  data-testid="button-login"
                >
                  Entrar para Começar
                </Button>
              </Link>
            )}
            
            <Button 
              variant="outline" 
              className="w-full h-12 text-base font-semibold rounded-full border-2"
              size="lg"
              data-testid="button-learn-more"
              onClick={() => {
                const card = document.querySelector('[data-project-info]');
                card?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Entenda o Projeto
            </Button>
          </div>

          <Card data-project-info>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Como Funciona</h3>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Para Pedestres:</strong> Caminhe pela Rua XV e veja sua contribuição energética. Participe do ranking com seus amigos e ganhe reconhecimento!
                </p>
                <p>
                  <strong className="text-foreground">Para Lojistas:</strong> Publicidade alimentada pela energia dos pedestres, mostrando o movimento em tempo real.
                </p>
                <p>
                  <strong className="text-foreground">Para a Cidade:</strong> Dados para planejamento urbano, iluminação sustentável e revitalização inteligente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

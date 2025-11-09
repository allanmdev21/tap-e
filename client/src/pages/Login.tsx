import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { BrandLogo } from "@/components/BrandLogo";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const data = isLogin 
        ? { username, password }
        : { username, password, displayName };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erro ao autenticar");
      }

      const result = await response.json();
      login(result.user);
      toast({
        title: isLogin ? "Login realizado!" : "Conta criada!",
        description: `Bem-vindo!`,
      });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo className="h-12" />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {isLogin ? "Entrar" : "Criar Conta"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu.usuario"
                  required
                  minLength={3}
                  className="h-12"
                  data-testid="input-username"
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nome de Exibição</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Seu Nome"
                    required
                    className="h-12"
                    data-testid="input-displayname"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  minLength={6}
                  className="h-12"
                  data-testid="input-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-full font-semibold"
                disabled={loading}
                data-testid="button-submit"
              >
                {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setDisplayName("");
                }}
                data-testid="button-toggle-mode"
              >
                {isLogin ? "Não tem conta? Criar conta" : "Já tem conta? Fazer login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

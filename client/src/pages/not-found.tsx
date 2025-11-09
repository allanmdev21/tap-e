import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <BrandLogo className="h-12" />
        </div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Página não encontrada</h2>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>
        <Link href="/">
          <Button className="h-12 rounded-full font-semibold">
            <Home className="w-5 h-5 mr-2" />
            Voltar ao Início
          </Button>
        </Link>
      </div>
    </div>
  );
}

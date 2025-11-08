import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Users, Upload, Monitor } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function StoreDashboard() {
  const [storeName, setStoreName] = useState("Café Aroma da XV");
  const [location, setLocation] = useState("Rua XV de Novembro, 1234");
  const [logo, setLogo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        toast({
          title: "Logo carregado!",
          description: "Sua logo foi atualizada com sucesso",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditAd = () => {
    toast({
      title: "Editor de anúncio",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informações do Estabelecimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nome do Estabelecimento</Label>
              <Input
                id="store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Digite o nome"
                className="h-12"
                data-testid="input-store-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-location">Trecho/Número na Rua XV</Label>
              <Input
                id="store-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Rua XV, 1234"
                className="h-12"
                data-testid="input-store-location"
              />
            </div>

            <div className="space-y-2">
              <Label>Logo do Estabelecimento</Label>
              <Card className="border-2 border-dashed border-border hover-elevate cursor-pointer">
                <CardContent className="p-6">
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                      data-testid="input-logo-upload"
                    />
                    {logo ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={logo} alt="Logo" className="w-24 h-24 object-contain rounded-lg" />
                        <p className="text-sm text-primary font-medium">Clique para alterar</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Adicionar logo</p>
                          <p className="text-xs text-muted-foreground mt-1">Clique para fazer upload</p>
                        </div>
                      </div>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground" data-testid="text-store-energy">
                  1,247
                </p>
                <p className="text-xs text-muted-foreground mt-1">Wh gerados hoje</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground" data-testid="text-store-traffic">
                  2,841
                </p>
                <p className="text-xs text-muted-foreground mt-1">pedestres/dia</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-primary/5">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <Monitor className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-1">Seu anúncio no totem</p>
                <p className="text-sm text-muted-foreground">
                  Personalize a mensagem que aparece no totem de LED em frente à sua loja
                </p>
              </div>
            </div>
            <Button 
              className="w-full h-12 text-base font-semibold rounded-full"
              onClick={handleEditAd}
              data-testid="button-edit-ad"
            >
              Editar Anúncio no Totem
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

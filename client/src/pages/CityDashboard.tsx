import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Monitor, Store, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function CityDashboard() {
  const chartData = [
    { day: "Seg", energy: 4200 },
    { day: "Ter", energy: 3800 },
    { day: "Qua", energy: 5100 },
    { day: "Qui", energy: 4700 },
    { day: "Sex", energy: 6300 },
    { day: "Sáb", energy: 7800 },
    { day: "Dom", energy: 5900 },
  ];

  return (
    <div className="px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-energy">
                  37.8
                </p>
                <p className="text-xs text-muted-foreground">kWh total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-active-totems">
                  24
                </p>
                <p className="text-xs text-muted-foreground">totens ativos</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center space-y-2">
              <div className="p-2 rounded-lg bg-primary/10 inline-block">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-participating-stores">
                  48
                </p>
                <p className="text-xs text-muted-foreground">lojas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Energia Gerada por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar 
                    dataKey="energy" 
                    fill="hsl(var(--primary))" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <p className="font-semibold text-foreground mb-2">Uso dos Dados</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>
                    • <strong className="text-foreground">Iluminação:</strong> Otimização do consumo energético
                  </p>
                  <p>
                    • <strong className="text-foreground">Segurança:</strong> Identificação de áreas com maior fluxo
                  </p>
                  <p>
                    • <strong className="text-foreground">Planejamento:</strong> Dados para revitalização urbana
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

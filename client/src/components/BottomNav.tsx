import { Home, Footprints, Trophy, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Início", path: "/" },
    { icon: Footprints, label: "Caminhada", path: "/walk" },
    { icon: Trophy, label: "Ranking", path: "/ranking" },
    { icon: LayoutDashboard, label: "Painéis", path: "/dashboards" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path} data-testid={`nav-${item.label.toLowerCase()}`}>
              <button className="flex flex-col items-center justify-center gap-1 px-4 py-2 hover-elevate active-elevate-2 rounded-lg min-w-[64px]">
                <Icon 
                  className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

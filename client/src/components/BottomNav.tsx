import { Home, Footprints, Trophy, User, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

export default function BottomNav() {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { icon: Home, label: "Início", path: "/", requiresAuth: false },
    { icon: Footprints, label: "Caminhada", path: "/walk", requiresAuth: true },
    { icon: Trophy, label: "Ranking", path: "/ranking", requiresAuth: true },
    { icon: Users, label: "Amigos", path: "/friends", requiresAuth: true },
    { icon: User, label: "Perfil", path: "/profile", requiresAuth: true },
  ];

  const visibleItems = navItems.filter(item => 
    !item.requiresAuth || isAuthenticated
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {visibleItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path} data-testid={`nav-${item.label.toLowerCase()}`}>
              <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 hover-elevate active-elevate-2 rounded-lg min-w-[60px]">
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

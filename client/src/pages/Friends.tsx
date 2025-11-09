import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Users, UserX, UserCheck, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Friendship } from "@shared/schema";
import { BrandLogo } from "@/components/BrandLogo";

export default function Friends() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [searchUsername, setSearchUsername] = useState("");
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const { data: friends = [] } = useQuery<Omit<User, 'password'>[]>({
    queryKey: ['/api/friends', user?.id],
    enabled: !!user,
  });

  const { data: pendingRequests = [], isError: requestsError } = useQuery<(Friendship & { requesterName: string; requesterUsername: string })[]>({
    queryKey: ['/api/friends/requests', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      const response = await fetch(`/api/friends/${user.id}/requests`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (requestsError) {
      toast({
        title: "Erro ao carregar convites",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    }
  }, [requestsError, toast]);

  const addFriendMutation = useMutation({
    mutationFn: async (friendUsername: string) => {
      // First, find the user by username
      const userResponse = await fetch(`/api/users/by-username/${friendUsername}`);
      if (!userResponse.ok) {
        throw new Error("Usuário não encontrado");
      }
      const friendUser = await userResponse.json();
      
      // Then create friendship
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          friendId: friendUser.id,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Erro ao adicionar amigo");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', user?.id] });
      toast({
        title: "Convite enviado!",
        description: "Aguarde a aceitação do seu amigo",
      });
      setSearchUsername("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o amigo",
        variant: "destructive",
      });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      const response = await fetch(`/api/friends/${user?.id}/${friendId}`, {
        method: "DELETE",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', user?.id] });
      toast({
        title: "Amigo removido",
      });
    },
  });

  const acceptFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const response = await fetch(`/api/friends/${friendshipId}/accept`, {
        method: "PUT",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests', user?.id] });
      toast({
        title: "Convite aceito!",
        description: "Agora vocês são amigos",
      });
    },
  });

  const rejectFriendMutation = useMutation({
    mutationFn: async (friendshipId: string) => {
      const response = await fetch(`/api/friends/${friendshipId}/reject`, {
        method: "PUT",
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/friends', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/friends/requests', user?.id] });
      toast({
        title: "Convite rejeitado",
      });
    },
  });

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      addFriendMutation.mutate(searchUsername);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-20 bg-background">
      <header className="px-4 py-6 text-center border-b border-border bg-card">
        <div className="flex flex-col items-center gap-3">
          <BrandLogo className="h-12" />
          <div className="flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Meus Amigos</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto space-y-6">
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleAddFriend} className="flex gap-2">
                <Input
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value)}
                  placeholder="Buscar por usuário..."
                  className="h-12"
                  data-testid="input-search-friend"
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="flex-shrink-0"
                  disabled={!searchUsername.trim() || addFriendMutation.isPending}
                  data-testid="button-add-friend"
                >
                  <UserPlus className="w-5 h-5" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {pendingRequests.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground px-2">
                Convites Pendentes ({pendingRequests.length})
              </h2>
              
              {pendingRequests.map((request) => {
                const initials = request.requesterName
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card key={request.id} data-testid={`pending-request-${request.id}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarFallback className="bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {request.requesterName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Quer ser seu amigo
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="default"
                            size="icon"
                            onClick={() => acceptFriendMutation.mutate(request.id)}
                            disabled={acceptFriendMutation.isPending}
                            data-testid={`button-accept-${request.id}`}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => rejectFriendMutation.mutate(request.id)}
                            disabled={rejectFriendMutation.isPending}
                            data-testid={`button-reject-${request.id}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground px-2">
              {friends.length} {friends.length === 1 ? 'amigo' : 'amigos'}
            </h2>
            
            {friends.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Você ainda não tem amigos. Adicione alguém para começar!
                  </p>
                </CardContent>
              </Card>
            ) : (
              friends.map((friend) => {
                const initials = friend.displayName
                  .split(" ")
                  .map(n => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <Card key={friend.id} data-testid={`friend-${friend.username}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate">
                            {friend.displayName}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            @{friend.username}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFriendMutation.mutate(friend.id)}
                          disabled={removeFriendMutation.isPending}
                          data-testid={`button-remove-${friend.username}`}
                        >
                          <UserX className="w-5 h-5 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

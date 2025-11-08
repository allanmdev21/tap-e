# Energia+Publicidade - Smart City App

## Overview
Aplicação mobile-first de smart city que gamifica caminhadas na Rua XV de Curitiba, transformando energia cinética em publicidade através de geolocalização e rede social entre amigos.

## Project Purpose
O projeto combina:
- **Sustentabilidade**: Pisos que captam energia cinética dos pedestres
- **Publicidade inteligente**: Totens LED alimentados pela energia gerada
- **Gamificação**: Ranking social entre amigos baseado em caminhadas
- **Dados urbanos**: Informações para planejamento urbano e revitalização

## Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + TypeScript
- **Routing**: Wouter
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Storage**: In-memory storage (MemStorage) com dados mockados
- **UI Components**: Shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Charts**: Recharts

## Recent Changes (Latest First)
### v1.2 - Friend Requests & City Dashboard (Nov 2025)
- **Friends**: Sistema completo de pedidos de amizade com aceitar/rejeitar
  - Seção "Convites Pendentes" na página de amigos
  - Backend enriquece pedidos com nome do solicitante (evita N+1 queries)
  - Invalidação de cache correta após aceitar/rejeitar
  - Endpoint PUT `/api/friends/:id/reject` para rejeitar convites
  - Tratamento de erro com toast quando falha ao carregar convites
- **City Dashboard**: Dashboard da prefeitura com métricas reais
  - Endpoint GET `/api/city/stats` retorna estatísticas agregadas
  - Método `getCityStats()` em IStorage calcula métricas em tempo real
  - 4 KPIs principais: Energia Total, Total Usuários, Usuários Ativos, Média/Usuário
  - Top 5 caminhadores com distância e energia gerada
  - Substituído dados mockados por dados reais do backend
- **Testing**: Todos os fluxos testados end-to-end com Playwright

### v1.1 - Security Enhancements (Nov 2025)
- **Security**: Implementado bcrypt para hashing de senhas (10 rounds)
- **Security**: Método `verifyPassword()` para autenticação segura
- **Architecture**: Adicionado `getRankingData()` à interface IStorage (removido cast `any`)
- **Testing**: Todos os fluxos end-to-end testados e funcionando

### v1.0 - MVP Features (Nov 2025)
- Implementado sistema de autenticação completo com login/registro
- Criado sistema de amigos (adicionar, remover, listar)
- Ranking filtrado por amigos ou todos os usuários
- Página de perfil com estatísticas pessoais
- Navegação protegida com rotas autenticadas (com loading state)
- Integração com geolocalização para rastrear caminhadas
- Persistência de caminhadas no backend
- Bottom navigation adaptativa baseada no estado de autenticação
- Endpoint `/api/users/by-username/:username` para lookup de amigos

## Architecture

### Data Model (shared/schema.ts)
```typescript
- users: id, username, password, displayName, avatar
- walks: id, userId, distance, energy, duration, createdAt
- friendships: id, userId, friendId, status (pending/accepted/rejected), createdAt
- stores: id, name, location, logo, energyToday, dailyFootTraffic
```

### Pages Structure
```
/                - Home (pública)
/login           - Login/Registro (pública)
/walk            - Caminhada com geolocalização (protegida)
/ranking         - Ranking de amigos/todos (protegida)
/friends         - Gestão de amigos (protegida)
/profile         - Perfil do usuário (protegida)
/dashboards      - Painéis Lojista/Prefeitura (pública)
```

### API Endpoints
```
POST   /api/auth/register              - Criar conta
POST   /api/auth/login                 - Fazer login
GET    /api/users/:id                  - Buscar perfil completo do usuário
POST   /api/walks                      - Salvar caminhada
GET    /api/walks/user/:userId         - Buscar caminhadas do usuário
GET    /api/ranking                    - Ranking (com filtro de amigos)
GET    /api/friends/:userId            - Listar amigos aceitos
GET    /api/friends/:userId/requests   - Listar pedidos pendentes (enriquecido com nome)
POST   /api/friends/request            - Enviar pedido de amizade
PUT    /api/friends/:id/accept         - Aceitar pedido
PUT    /api/friends/:id/reject         - Rejeitar pedido
DELETE /api/friends/:userId/:friendId  - Remover amigo
GET    /api/city/stats                 - Estatísticas agregadas da cidade
```

### Authentication System
- Context API para gerenciar estado de autenticação
- LocalStorage para persistência de sessão
- Proteção de rotas via useEffect redirect
- Bottom navigation dinâmica baseada em autenticação

### Mock Data
**IMPORTANTE**: O projeto usa dados mockados em memória
- 5 usuários pré-criados (Maria Silva, João Santos, Ana Costa, Pedro Lima, Carla Mendes)
- Cada usuário tem caminhadas simuladas
- Senhas mockadas: "123456" para todos os usuários de teste
- **TODO**: Remover funcionalidade de mock antes da produção (buscar por `//todo: remove mock functionality`)

## User Preferences
- Design mobile-first (360-430px)
- Paleta verde tecnológico (#22C55E) para energia sustentável
- Tipografia: Inter/Poppins
- Cards com cantos arredondados e sombras sutis
- Botões grandes (min 48px) para touch targets
- Bottom navigation para facilitar navegação mobile

## Design System
- **Cores**: Verde primário (#22C55E), fundo claro (#F9FAFB)
- **Espaçamento**: Consistente (4, 6, 8 unidades Tailwind)
- **Cards**: rounded-2xl, shadow-sm/md, padding generoso
- **Botões**: rounded-full (pill shape), h-12 mínimo
- **Tipografia**: Hierarquia clara (text-3xl títulos, text-base corpo)

## Features

### 1. Sistema de Autenticação
- Login e registro de usuários
- Persistência de sessão (localStorage)
- Proteção de rotas autenticadas

### 2. Caminhada com Geolocalização
- Permissão de geolocalização no primeiro acesso
- Rastreamento em tempo real (simulado)
- Cálculo automático de energia gerada (distância × 50 Wh/km)
- Timer de duração
- Salvamento de caminhadas no backend

### 3. Rede Social
- Sistema completo de amigos com pedidos
- Visualizar convites pendentes recebidos
- Aceitar ou rejeitar pedidos de amizade
- Ranking filtrado por amigos
- Perfil de usuário com estatísticas
- Adicionar/remover amigos

### 4. Ranking
- Visualização de ranking completo ou apenas amigos
- Destaque para top 3 (medalhas)
- Avatar com iniciais
- Indicador visual do usuário logado

### 5. Perfil do Usuário
- Estatísticas totais (caminhadas, energia, distância)
- Contador de amigos
- Logout

### 6. Painéis
- **Lojista**: Cadastro de estabelecimento, métricas de energia e fluxo
- **Prefeitura**: Dashboard em tempo real com:
  - 4 KPIs principais (Energia Total, Total Usuários, Usuários Ativos, Média/Usuário)
  - Top 5 caminhadores da cidade
  - Métricas calculadas dinamicamente do backend
  - Interface mobile-first otimizada

## Running the Project
```bash
npm run dev
```
- O workflow "Start application" já está configurado
- Backend: Express na porta 5000
- Frontend: Vite servindo na mesma porta
- Hot reload ativo para desenvolvimento

## Testing
- Dados mockados permitem teste imediato
- **Usuários de teste disponíveis** (todos com senha "123456"):
  - **Usuários comuns:**
    - maria.silva / 123456 (Maria Silva)
    - joao.santos / 123456 (João Santos)
    - ana.costa / 123456 (Ana Costa)
    - pedro.lima / 123456 (Pedro Lima)
    - carla.mendes / 123456 (Carla Mendes)
    - carlos.oliveira / 123456 (Carlos Oliveira)
    - juliana.rocha / 123456 (Juliana Rocha)
  - **Usuários especiais:**
    - prefeitura.ctba / 123456 (Prefeitura de Curitiba)
    - loja.ruaxv / 123456 (Lojista Rua XV)
- Geolocalização simulada com incrementos aleatórios

## Security Notes
- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Senhas nunca retornadas em respostas da API
- ✅ Verificação segura de credenciais via bcrypt.compare()
- ⚠️ **TODO (Produção)**: Implementar tokens JWT ou sessions server-side
- ⚠️ **TODO (Produção)**: Rate limiting em endpoints de autenticação
- ⚠️ **TODO (Produção)**: HTTPS obrigatório

## Next Steps (Fora do MVP)
- [ ] Server-side session/token management para autenticação de API
- [ ] Implementar geofencing real para validar caminhadas apenas na Rua XV
- [ ] Adicionar persistência real com banco de dados (substituir MemStorage)
- [ ] Sistema de notificações push
- [ ] Integração com anúncios reais dos lojistas
- [ ] Mapa interativo mostrando totens e pisos energéticos
- [ ] Sistema de conquistas e badges
- [ ] Histórico detalhado de caminhadas
- [ ] Compartilhamento social de conquistas
- [ ] Testes unitários para storage layer

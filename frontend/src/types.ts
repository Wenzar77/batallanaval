export type Team = 'A' | 'B';

export type TeamBreakdown = { hits?: number; sinks?: number; trivia?: number };

export type TriviaMsg = {
  card: { q: string; opts: string[] };
  nonce: string;
  canAnswer: boolean;
  playerName?: string;
  team?: Team;
};

export type Snapshot = {
  code: string;
  state: 'lobby' | 'active' | `finished_A` | `finished_B`;
  turnTeam: Team;
  teamNames?: Record<Team, string>;
  players: { id: string; name: string; team: Team }[];
  weapons: Record<Team, string[]>;
  shipsRemaining: Record<Team, number>;
  gridSize: number;
  turnPlayerId?: string | null;
  history: { A: string[]; B: string[]; Amiss: string[]; Bmiss: string[] };
  scores?: {
    teams: Record<Team, number>;
    players: { id: string; name: string; team: Team; points: number }[];
    breakdown?: { teams: Record<Team, TeamBreakdown> };
  };
  teamStats?: Record<Team, TeamBreakdown>;
  breakdown?: { teams?: Record<Team, TeamBreakdown> };
  stats?: { teams?: Record<Team, TeamBreakdown> };
  trivia?: { nonce: string; toTeam: Team; allowedPlayerId: string; timeout: number } | null;
};

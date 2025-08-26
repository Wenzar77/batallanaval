import type { Team } from '../types/game';

export const SIZE = 20;
export const DEFAULT_TEAM_NAMES: Record<Team, string> = { A: 'Jaguares', B: 'Guacamayas' };
export const TEAM_ICONS: Record<Team, string> = { A: '🐆', B: '🦜' };

export const FLEET_INFO = [
  { key: 'carrier', label: 'Portaviones', size: 5, count: 1, emoji: '🛳️' },
  { key: 'battleship', label: 'Acorazado', size: 4, count: 1, emoji: '🚢' },
  { key: 'cruiser', label: 'Crucero', size: 3, count: 2, emoji: '🛥️' },
  { key: 'destroyer', label: 'Destructor', size: 2, count: 3, emoji: '🚤' },
] as const;

export const FLEET_TOTAL_SHIPS = FLEET_INFO.reduce((s, f) => s + f.count, 0);

export type ShipCell = { x?: number; y?: number; i?: number; j?: number } | string;
export const toKey = (c: ShipCell) => (typeof c === 'string' ? c : `${c.x ?? c.i},${c.y ?? c.j}`);

// Trata varias estructuras posibles e intenta deducir celdas propias.
export function getTeamShipCells(snapshot: any, team: Team, clientId?: string): string[] {
  const perClientCandidates: unknown[] = [
    clientId && snapshot?.myFleetCells?.[clientId],
    clientId && snapshot?.playerBoards?.[clientId]?.shipCells,
    clientId && snapshot?.clients?.[clientId]?.shipCells,
  ].filter(Boolean);
  if (perClientCandidates.length > 0) {
    const flat = perClientCandidates.flatMap((v: any) => (Array.isArray(v) ? v : [v]));
    return flat.map(toKey);
  }
  const perTeamCandidates: unknown[] = [
    snapshot?.board?.[team]?.shipCells,
    snapshot?.fleetCells?.[team],
    snapshot?.ownFleet?.[team],
    snapshot?.fleet?.[team]?.cells,
    Array.isArray(snapshot?.ships?.[team]) ? snapshot.ships[team].flatMap((s: any) => s?.cells ?? []) : null,
    snapshot?.teamFleet?.[team]?.cells,
  ].filter(Boolean);
  if (perTeamCandidates.length === 0) return [];
  const flat = perTeamCandidates.flatMap((v: any) => (Array.isArray(v) ? v : [v]));
  return flat.map(toKey);
}
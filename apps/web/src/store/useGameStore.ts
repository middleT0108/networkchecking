import { create } from 'zustand';
import { gamesConfig, GameProfile, RegionEndpoint } from '@netcheck/shared';

export interface RegionMeasurement {
  regionId: string;
  rtt: number;
  status: 'idle' | 'measuring' | 'success' | 'timeout';
  lastUpdated: number;
}

export type ActiveTab = 'dashboard' | 'games' | 'diagnostics' | 'history';

interface GameState {
  activeTab: ActiveTab;
  games: GameProfile[];
  selectedGameId: string;
  selectedRegionId: string;
  regionResults: Record<string, RegionMeasurement>;
  isBenchmarkingAll: boolean;

  setActiveTab: (tab: ActiveTab) => void;
  selectGame: (gameId: string) => void;
  selectRegion: (regionId: string) => void;
  setRegionResult: (regionId: string, result: Partial<RegionMeasurement>) => void;
  setIsBenchmarkingAll: (benchmarking: boolean) => void;
  getSelectedGame: () => GameProfile;
  getSelectedRegion: () => RegionEndpoint | undefined;
}

export const useGameStore = create<GameState>((set, get) => ({
  activeTab: 'games',
  games: gamesConfig.games,
  selectedGameId: 'valorant',
  selectedRegionId: 'ap-southeast-1',
  regionResults: {},
  isBenchmarkingAll: false,

  setActiveTab: (activeTab) => set({ activeTab }),

  selectGame: (gameId) => {
    const game = get().games.find((g) => g.id === gameId);
    const defaultRegion = game?.regions[0]?.id || '';
    set({
      selectedGameId: gameId,
      selectedRegionId: defaultRegion,
      regionResults: {}
    });
  },

  selectRegion: (regionId) => set({ selectedRegionId: regionId }),

  setRegionResult: (regionId, update) =>
    set((state) => ({
      regionResults: {
        ...state.regionResults,
        [regionId]: {
          ...(state.regionResults[regionId] || {
            regionId,
            rtt: 0,
            status: 'idle',
            lastUpdated: Date.now()
          }),
          ...update
        }
      }
    })),

  setIsBenchmarkingAll: (isBenchmarkingAll) => set({ isBenchmarkingAll }),

  getSelectedGame: () => {
    const state = get();
    return state.games.find((g) => g.id === state.selectedGameId) || state.games[0];
  },

  getSelectedRegion: () => {
    const state = get();
    const game = state.getSelectedGame();
    return game.regions.find((r) => r.id === state.selectedRegionId) || game.regions[0];
  }
}));

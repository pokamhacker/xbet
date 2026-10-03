import { create } from 'zustand';
import apiFootballService, {
  ApiFootballLeagueItem,
  ApiFootballTeamItem,
  ApiFootballFixtureItem,
  ApiFootballOddsItem,
} from '../services/apiFootballService';
import { MatchEvent } from '../types/bet';

export interface FootballStoreState {
  // Données
  leagues: ApiFootballLeagueItem[];
  selectedLeagueId: number | string | null;
  teams: ApiFootballTeamItem[];
  liveFixtures: ApiFootballFixtureItem[];
  liveMatchEvents: MatchEvent[];
  upcomingFixtures: ApiFootballFixtureItem[];
  upcomingMatchEvents: MatchEvent[];
  activeOdds: Record<string, ApiFootballOddsItem>;

  // Statuts & États
  isLoadingLeagues: boolean;
  isLoadingTeams: boolean;
  isLoadingFixtures: boolean;
  error: string | null;
  hasApiKey: boolean;
  accountStatus: {
    requests: { current: number; limit_day: number };
    subscription: string;
  } | null;

  // Actions
  setApiKey: (key: string) => void;
  checkStatus: () => Promise<void>;
  fetchLeagues: (params?: { country?: string; season?: number; current?: boolean }) => Promise<ApiFootballLeagueItem[]>;
  fetchTeams: (leagueId: number | string, season?: number) => Promise<ApiFootballTeamItem[]>;
  fetchLiveFixtures: (leagueId?: number | string) => Promise<MatchEvent[]>;
  fetchUpcomingFixtures: (options?: { league?: number | string; next?: number; date?: string }) => Promise<MatchEvent[]>;
  fetchOdds: (fixtureId: number | string) => Promise<ApiFootballOddsItem | null>;
  setSelectedLeagueId: (leagueId: number | string | null) => void;
  clearError: () => void;
}

export const useFootballStore = create<FootballStoreState>((set, get) => ({
  leagues: [],
  selectedLeagueId: null,
  teams: [],
  liveFixtures: [],
  liveMatchEvents: [],
  upcomingFixtures: [],
  upcomingMatchEvents: [],
  activeOdds: {},

  isLoadingLeagues: false,
  isLoadingTeams: false,
  isLoadingFixtures: false,
  error: null,
  hasApiKey: apiFootballService.hasApiKey(),
  accountStatus: null,

  setApiKey: (key: string) => {
    apiFootballService.setApiKey(key);
    set({ hasApiKey: apiFootballService.hasApiKey() });
    get().checkStatus();
  },

  checkStatus: async () => {
    try {
      const status = await apiFootballService.checkAccountStatus();
      set({
        accountStatus: status,
        hasApiKey: apiFootballService.hasApiKey(),
      });
    } catch (e: any) {
      set({ error: e.message });
    }
  },

  fetchLeagues: async (params = {}) => {
    set({ isLoadingLeagues: true, error: null });
    try {
      const leagues = await apiFootballService.getLeagues(params);
      set({ leagues, isLoadingLeagues: false });
      return leagues;
    } catch (err: any) {
      set({ isLoadingLeagues: false, error: err.message });
      return [];
    }
  },

  fetchTeams: async (leagueId: number | string, season: number = 2024) => {
    set({ isLoadingTeams: true, error: null, selectedLeagueId: leagueId });
    try {
      const teams = await apiFootballService.getTeams(leagueId, season);
      set({ teams, isLoadingTeams: false });
      return teams;
    } catch (err: any) {
      set({ isLoadingTeams: false, error: err.message });
      return [];
    }
  },

  fetchLiveFixtures: async (leagueId?: number | string) => {
    set({ isLoadingFixtures: true, error: null });
    try {
      const fixtures = await apiFootballService.getLiveFixtures(leagueId);
      const matchEvents = fixtures.map((f) => apiFootballService.convertFixtureToMatchEvent(f));
      set({
        liveFixtures: fixtures,
        liveMatchEvents: matchEvents,
        isLoadingFixtures: false,
      });
      return matchEvents;
    } catch (err: any) {
      set({ isLoadingFixtures: false, error: err.message });
      return [];
    }
  },

  fetchUpcomingFixtures: async (options = {}) => {
    set({ isLoadingFixtures: true, error: null });
    try {
      const fixtures = await apiFootballService.getUpcomingFixtures(options);
      const matchEvents = fixtures.map((f) => apiFootballService.convertFixtureToMatchEvent(f));
      set({
        upcomingFixtures: fixtures,
        upcomingMatchEvents: matchEvents,
        isLoadingFixtures: false,
      });
      return matchEvents;
    } catch (err: any) {
      set({ isLoadingFixtures: false, error: err.message });
      return [];
    }
  },

  fetchOdds: async (fixtureId: number | string) => {
    try {
      const odds = await apiFootballService.getOddsForFixture(fixtureId);
      if (odds) {
        set((state) => ({
          activeOdds: {
            ...state.activeOdds,
            [String(fixtureId)]: odds,
          },
        }));
      }
      return odds;
    } catch (err: any) {
      console.warn(`[FootballStore] Erreur cotes pour ${fixtureId}:`, err.message);
      return null;
    }
  },

  setSelectedLeagueId: (leagueId: number | string | null) => {
    set({ selectedLeagueId: leagueId });
    if (leagueId) {
      get().fetchTeams(leagueId);
    }
  },

  clearError: () => set({ error: null }),
}));

export default useFootballStore;

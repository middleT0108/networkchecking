import { create } from 'zustand';

interface AgentState {
  isAgentConnected: boolean;
  agentVersion: string;
  agentPlatform: string;
  isAgentEnabled: boolean; // User preference to enable Agent ICMP mode

  setAgentConnected: (connected: boolean, version?: string, platform?: string) => void;
  setAgentEnabled: (enabled: boolean) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  isAgentConnected: false,
  agentVersion: '',
  agentPlatform: '',
  isAgentEnabled: true,

  setAgentConnected: (connected, version = '', platform = '') =>
    set({
      isAgentConnected: connected,
      agentVersion: version,
      agentPlatform: platform
    }),

  setAgentEnabled: (enabled) => set({ isAgentEnabled: enabled })
}));

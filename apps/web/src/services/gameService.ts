import { useGameStore } from '../store/useGameStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { measurementService } from './measurementService';
import { calculateMedian } from '@netcheck/shared';

class GameService {
  /**
   * Benchmarks all regions for the currently selected game concurrently
   */
  public async benchmarkCurrentGameRegions() {
    const store = useGameStore.getState();
    const game = store.getSelectedGame();
    if (!game || store.isBenchmarkingAll) return;

    store.setIsBenchmarkingAll(true);

    // Run parallel tests for each region
    const promises = game.regions.map(async (region) => {
      store.setRegionResult(region.id, { status: 'measuring' });

      const samples: number[] = [];
      const sampleCount = 3; // Take 3 quick samples for accuracy

      for (let i = 0; i < sampleCount; i++) {
        try {
          const rtt = await measurementService.measureHttpPing(region.testUrl, 2500);
          samples.push(rtt);
        } catch {
          // sample failed
        }
        // Small delay between samples
        await new Promise((r) => setTimeout(r, 80));
      }

      if (samples.length > 0) {
        const medianRtt = calculateMedian(samples);
        store.setRegionResult(region.id, {
          rtt: medianRtt,
          status: 'success',
          lastUpdated: Date.now()
        });
      } else {
        store.setRegionResult(region.id, {
          rtt: 0,
          status: 'timeout',
          lastUpdated: Date.now()
        });
      }
    });

    await Promise.allSettled(promises);
    store.setIsBenchmarkingAll(false);
  }

  /**
   * Switches the active real-time measurement target to a specific game region
   */
  public selectActiveGameRegion(gameId: string, regionId: string) {
    const gameStore = useGameStore.getState();
    const netStore = useNetworkStore.getState();

    gameStore.selectGame(gameId);
    gameStore.selectRegion(regionId);

    const game = gameStore.games.find((g) => g.id === gameId);
    const region = game?.regions.find((r) => r.id === regionId);

    if (game && region) {
      netStore.setActiveEndpoint(`${game.name} - ${region.name}`, region.testUrl);
      netStore.resetMetrics();
    }
  }
}

export const gameService = new GameService();

import React from 'react';
import { Shield, Crosshair, Zap, Trophy, Swords, Flame, Target, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { gameService } from '../../services/gameService';

// Icon resolver for game config
const getGameIcon = (iconName: string) => {
  switch (iconName) {
    case 'shield':
      return Shield;
    case 'crosshair':
      return Crosshair;
    case 'zap':
      return Zap;
    case 'trophy':
      return Trophy;
    case 'swords':
      return Swords;
    case 'flame':
      return Flame;
    case 'target':
      return Target;
    case 'sparkles':
      return Sparkles;
    default:
      return Zap;
  }
};

export const GameSelectorTabs: React.FC = () => {
  const { games, selectedGameId } = useGameStore();
  const { lang } = useSettingsStore();

  const handleSelect = (gameId: string) => {
    const game = games.find((g) => g.id === gameId);
    if (game && game.regions.length > 0) {
      gameService.selectActiveGameRegion(gameId, game.regions[0].id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {lang === 'vi' ? 'Chọn Game kiểm tra:' : 'Select Game:'}
        </span>
        <span className="text-xs text-slate-500">
          {games.length} {lang === 'vi' ? 'tựa game có sẵn' : 'supported profiles'}
        </span>
      </div>

      <div className="flex space-x-2.5 overflow-x-auto pb-2 scrollbar-thin">
        {games.map((game) => {
          const Icon = getGameIcon(game.icon);
          const isSelected = game.id === selectedGameId;

          return (
            <button
              key={game.id}
              onClick={() => handleSelect(game.id)}
              className={`flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-800 text-white shadow-lg'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:bg-slate-800/80'
              }`}
              style={{
                borderColor: isSelected ? game.color : undefined,
                boxShadow: isSelected ? `0 0 15px -3px ${game.color}30` : undefined
              }}
            >
              <div
                className="p-1.5 rounded-lg"
                style={{
                  backgroundColor: `${game.color}20`,
                  color: game.color
                }}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="block text-slate-100 font-bold">{game.name}</span>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">
                  {game.category}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

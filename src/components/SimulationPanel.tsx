import React from 'react';
import { SimulationItem } from '../types';
import { Sparkles, TrendingUp, Play, RotateCcw } from 'lucide-react';

interface SimulationPanelProps {
  items: SimulationItem[];
  aiInsight: string;
  loadingAi: boolean;
  onSimulate: () => void;
  onRegenerate: () => void;
}

const SimulationPanel: React.FC<SimulationPanelProps> = ({ items, aiInsight, loadingAi, onSimulate, onRegenerate }) => {

  // If no simulation items, show a prompt and a "Simulate Now" button
  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-6 min-h-[200px]">
        <TrendingUp size={48} className="mb-4 opacity-20" />
        <p className="text-sm text-center mb-6 text-gray-400">
          数値を入力して<br/>
          <span className="font-bold text-indigo-400">＝</span> または <span className="font-bold text-indigo-400">ボタン</span> で開始
        </p>
        <button
          onClick={onSimulate}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all active:scale-95"
        >
          <Play size={16} fill="currentColor" />
          シミュレーション実行
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar relative">

      {/* Header / Manual Trigger */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-500 tracking-wider">シミュレーション結果</span>
        <div className="flex gap-2">
           <button
            onClick={onSimulate}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
            title="数値を再計算"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={onRegenerate}
            disabled={loadingAi}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Sparkles size={12} />
            {loadingAi ? '生成中...' : 'AI再生成'}
          </button>
        </div>
      </div>

      {/* AI Insight Bubble */}
      <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 rounded-xl p-4 border border-indigo-500/30 relative shadow-lg min-h-[100px] flex items-center">
        <div className="absolute -top-2 -left-2 bg-indigo-500 text-white p-1.5 rounded-full shadow-md z-10">
          <Sparkles size={14} fill="currentColor" />
        </div>
        <div className="text-sm text-indigo-100 leading-relaxed w-full">
           {loadingAi ? (
             <div className="flex flex-col items-center justify-center py-2 gap-2 text-indigo-300/70">
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
               </div>
               <span className="text-xs">AIが分析中...</span>
             </div>
           ) : (
             aiInsight || "シミュレーション実行でAIインサイトが表示されます"
           )}
        </div>
      </div>

      {/* Result Cards */}
      <div className="grid grid-cols-1 gap-3 pb-4">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border flex justify-between items-center transition-all duration-500 ${
              item.highlight
                ? 'bg-gray-800 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)] scale-[1.02]'
                : 'bg-gray-800/50 border-gray-700'
            }`}
          >
            <div>
              <div className="text-xs text-gray-400 mb-1">{item.label}</div>
              <div className="text-xs text-gray-500">{item.subtext}</div>
            </div>
            <div className={`text-xl font-bold ${item.highlight ? 'text-emerald-400' : 'text-gray-200'}`}>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulationPanel;

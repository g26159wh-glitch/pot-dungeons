import React from 'react';
import { GachaPullResult } from '../types';

interface GachaModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: GachaPullResult[];
  totalRefundGems: number;
}

export const GachaModal: React.FC<GachaModalProps> = ({
  isOpen,
  onClose,
  results,
  totalRefundGems,
}) => {
  if (!isOpen) return null;

  const getRankBadgeClass = (rank: string) => {
    switch (rank) {
      case 'UR':
        return 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white font-black';
      case 'SSR':
        return 'bg-amber-400 text-black font-black';
      case 'SR':
        return 'bg-purple-600 text-white font-bold';
      case 'R':
        return 'bg-blue-600 text-white font-bold';
      case 'N':
        return 'bg-gray-600 text-gray-200';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4">
      <div className="bg-[#1e1e1e] border-2 border-[#555] p-5 rounded-2xl w-full max-w-[440px] max-h-[85vh] overflow-y-auto text-white shadow-2xl flex flex-col">
        <h3 className="text-center text-lg font-black text-[#f0a500] mb-3">
          ✨ ガチャ結果 ✨
        </h3>

        {totalRefundGems > 0 && (
          <div className="bg-amber-950/70 border border-amber-500/60 rounded-lg p-2.5 mb-3 text-center text-xs text-amber-200">
            ⚠️ 上限到達モンスターが被ったため、合計 💎<strong className="text-amber-300 font-bold">{totalRefundGems}</strong> 個のダイヤが返還されました！
          </div>
        )}

        <div className="space-y-2 mb-4 overflow-y-auto max-h-[50vh] pr-1">
          {results.map((res, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                res.monster.rank === 'UR'
                  ? 'bg-purple-950/40 border-purple-500'
                  : res.monster.rank === 'SSR'
                  ? 'bg-amber-950/40 border-amber-500'
                  : 'bg-[#2a2a2a] border-[#444]'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${getRankBadgeClass(
                      res.monster.rank
                    )}`}
                  >
                    {res.monster.rank}
                  </span>
                  <span className="font-bold text-sm text-white">{res.monster.name}</span>
                  {res.isNew && (
                    <span className="text-[10px] bg-red-600 text-white px-1.5 py-0.2 rounded font-bold">
                      NEW!
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#aaa]">
                  Lv.{res.monster.level} / MAX.{res.monster.maxLevel} | HP:{res.monster.hp} 攻:{res.monster.atk} [{res.monster.type}]
                </div>
              </div>

              <div className="text-right pl-2">
                {res.levelUp && (
                  <div className="text-emerald-400 font-bold text-xs">
                    LvUP! ({res.oldLevel} ➔ {res.newLevel})
                  </div>
                )}
                {res.refundGems > 0 && (
                  <div className="text-amber-400 font-bold text-[11px]">
                    返還: +💎{res.refundGems}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-[#f0a500] hover:bg-[#e09400] text-black font-black py-2.5 rounded-xl cursor-pointer text-sm transition-colors mt-auto"
        >
          結果を閉じる
        </button>
      </div>
    </div>
  );
};

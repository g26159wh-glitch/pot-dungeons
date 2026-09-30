import React, { useState } from 'react';
import { MonsterProfile } from '../types';

interface EnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  monsters: MonsterProfile[];
  currentGems: number;
  onEnhance: (monsterIndex: number, cost: number) => void;
}

export const EnhanceModal: React.FC<EnhanceModalProps> = ({
  isOpen,
  onClose,
  monsters,
  currentGems,
  onEnhance,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentMonster = monsters[selectedIndex];
  if (!currentMonster) return null;

  const isMaxLevel = currentMonster.level >= currentMonster.maxLevel;
  const upgradeCost = currentMonster.level * 15;
  const canAfford = currentGems >= upgradeCost;

  const nextHp = currentMonster.hp + Math.round(currentMonster.baseHp * 0.15);
  const nextAtk = currentMonster.atk + Math.max(1, Math.round(currentMonster.baseAtk * 0.15));

  const handleLevelUp = () => {
    if (isMaxLevel) {
      alert('このモンスターはすでに最大レベルに達しています！');
      return;
    }
    if (!canAfford) {
      alert('ダイヤが足りません！');
      return;
    }
    onEnhance(selectedIndex, upgradeCost);
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4">
      <div className="bg-[#222] border-2 border-[#555] p-5 rounded-2xl w-full max-w-[420px] max-h-[85vh] overflow-y-auto text-white shadow-2xl relative flex flex-col">
        <span
          className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </span>
        <h3 className="text-base font-bold text-[#3498db] mb-3 flex items-center gap-1.5">
          ⚔️ モンスター強化・育成
        </h3>

        <div className="text-xs text-[#00cec9] mb-3 font-bold bg-[#181818] p-2 rounded-lg border border-[#333]">
          所持ダイヤ: 💎 {currentGems} 個
        </div>

        {/* Monster Selector */}
        <div className="mb-3 text-left">
          <label className="text-[11px] text-[#aaa] block mb-1">強化するモンスターを選択:</label>
          <select
            value={selectedIndex}
            onChange={(e) => setSelectedIndex(parseInt(e.target.value, 10))}
            className="w-full p-2 bg-[#2d2d2d] border border-[#555] text-white rounded text-xs outline-none"
          >
            {monsters.map((m, idx) => (
              <option key={idx} value={idx}>
                {m.name} [{m.rank}] (Lv.{m.level}/{m.maxLevel})
              </option>
            ))}
          </select>
        </div>

        {/* Selected Monster Detail Card */}
        <div className="bg-[#1a1a1a] p-3.5 rounded-xl border border-[#444] mb-4 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center border-b border-[#333] pb-2">
            <div>
              <span className="font-bold text-sm text-white">{currentMonster.name}</span>
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[#444] text-[#ddd]">
                {currentMonster.rank}
              </span>
            </div>
            <div className="text-[#f0a500] font-bold">
              Lv.{currentMonster.level} / MAX {currentMonster.maxLevel}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs py-1">
            <div className="bg-[#262626] p-2 rounded">
              <span className="text-[#888] block text-[10px]">現在のHP</span>
              <span className="text-rose-400 font-bold text-sm">{currentMonster.hp}</span>
              {!isMaxLevel && (
                <span className="text-emerald-400 font-bold ml-1 text-xs">➔ {nextHp}</span>
              )}
            </div>
            <div className="bg-[#262626] p-2 rounded">
              <span className="text-[#888] block text-[10px]">現在の攻撃力</span>
              <span className="text-amber-400 font-bold text-sm">{currentMonster.atk}</span>
              {!isMaxLevel && (
                <span className="text-emerald-400 font-bold ml-1 text-xs">➔ {nextAtk}</span>
              )}
            </div>
          </div>

          <div className="text-[11px] text-[#aaa]">
            能力タイプ: <strong className="text-white">{currentMonster.type}</strong>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto">
          {isMaxLevel ? (
            <div className="p-2.5 bg-[#333] text-gray-400 text-center rounded-xl text-xs font-bold">
              ⭐️ レベルMAXに達しています
            </div>
          ) : (
            <button
              onClick={handleLevelUp}
              disabled={!canAfford}
              className={`w-full py-2.5 rounded-xl font-bold text-xs cursor-pointer transition-all shadow-md ${
                canAfford
                  ? 'bg-[#2980b9] hover:bg-[#3498db] text-white'
                  : 'bg-[#333] text-[#777] cursor-not-allowed'
              }`}
            >
              💎 {upgradeCost} 個でレベルアップ (Lv.{currentMonster.level + 1}へ)
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

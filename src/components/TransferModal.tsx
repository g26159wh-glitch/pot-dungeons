import React, { useState } from 'react';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGems: number;
  currentUserTag: string;
  onTransfer: (targetTag: string, amount: number) => boolean;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  onClose,
  currentGems,
  currentUserTag,
  onTransfer,
}) => {
  const [targetTag, setTargetTag] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSend = () => {
    setErrorMsg('');
    const trimmedTarget = targetTag.trim();
    const amount = parseInt(amountStr, 10);

    if (!trimmedTarget) {
      setErrorMsg('送金先のネームタグを入力してください。');
      return;
    }
    if (trimmedTarget === currentUserTag) {
      setErrorMsg('自分自身に送金することはできません。');
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('有効なダイヤ数を入力してください。');
      return;
    }
    if (amount > currentGems) {
      setErrorMsg('所持ダイヤが不足しています！');
      return;
    }

    const success = onTransfer(trimmedTarget, amount);
    if (success) {
      setTargetTag('');
      setAmountStr('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
      <div className="bg-[#222] border border-[#555] p-5 rounded-2xl w-full max-w-[380px] text-white shadow-2xl relative">
        <span
          className="absolute top-3 right-3 text-gray-400 hover:text-white cursor-pointer text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </span>
        <h3 className="text-base font-bold text-[#00cec9] mb-3 flex items-center gap-1.5">
          💎 ダイヤ受け渡し・送金
        </h3>

        <div className="bg-[#1a1a1a] p-3 rounded-lg border border-[#333] mb-3.5 text-xs text-[#ccc]">
          <div>現在の所持ダイヤ: <strong className="text-[#00cec9] font-bold">💎 {currentGems} 個</strong></div>
          <div className="text-[11px] text-[#888] mt-1">他の冒険者のネームタグ宛にダイヤを直接プレゼントできます。</div>
        </div>

        {errorMsg && (
          <div className="text-[#ff5555] text-xs mb-2.5 bg-red-950/40 p-2 rounded border border-red-500/50">
            {errorMsg}
          </div>
        )}

        <div className="space-y-3 mb-4 text-left">
          <div>
            <label className="text-xs text-[#aaa] block mb-1">相手の冒険者名（ネームタグ）</label>
            <input
              type="text"
              value={targetTag}
              onChange={(e) => setTargetTag(e.target.value)}
              placeholder="例: 冒険者ポテト"
              className="w-full p-2 bg-[#2d2d2d] border border-[#555] text-white rounded text-xs outline-none focus:border-[#00cec9]"
            />
          </div>
          <div>
            <label className="text-xs text-[#aaa] block mb-1">送金するダイヤ数</label>
            <input
              type="number"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder={`1〜${currentGems}`}
              className="w-full p-2 bg-[#2d2d2d] border border-[#555] text-white rounded text-xs outline-none focus:border-[#00cec9]"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-[#444] hover:bg-[#555] text-white font-bold p-2 text-xs rounded-lg cursor-pointer"
          >
            キャンセル
          </button>
          <button
            onClick={handleSend}
            className="flex-1 bg-[#00b894] hover:bg-[#55efc4] text-black font-black p-2 text-xs rounded-lg cursor-pointer transition-colors"
          >
            送金する
          </button>
        </div>
      </div>
    </div>
  );
};

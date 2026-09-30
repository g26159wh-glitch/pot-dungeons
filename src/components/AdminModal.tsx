import React, { useState } from 'react';
import {
  Floor,
  MonsterProfile,
  Player,
  BossType,
  AbilityType,
  RarityRank,
} from '../types';
import { ADMIN_CODE } from '../data/gameData';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  gems: number;
  floors: Floor[];
  playerSelectableMonsters: MonsterProfile[];
  onUpdatePlayer: (updated: Partial<Player>) => void;
  onUpdateGems: (newGems: number) => void;
  onUpdateFloors: (newFloors: Floor[]) => void;
  onUpdateSelectableMonsters: (monsters: MonsterProfile[]) => void;
  onAddGachaCharacter: (char: MonsterProfile) => void;
  onUpdateGachaRates: (ur: number, ssr: number) => void;
  gachaRateUr: number;
  gachaRateSsr: number;
  addLog: (text: string) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  player,
  gems,
  floors,
  playerSelectableMonsters,
  onUpdatePlayer,
  onUpdateGems,
  onUpdateFloors,
  onUpdateSelectableMonsters,
  onAddGachaCharacter,
  onUpdateGachaRates,
  gachaRateUr,
  gachaRateSsr,
  addLog,
}) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [adminTab, setAdminTab] = useState<'status' | 'edit_monsters' | 'add_monster' | 'enemy' | 'gacha' | 'floor'>('status');

  // Status adjustments
  const [setGemsInput, setSetGemsInput] = useState('');
  const [setAtkInput, setSetAtkInput] = useState('');
  const [setMaxHpInput, setSetMaxHpInput] = useState('');

  // Edit Existing Monster
  const [selectedEditIndex, setSelectedEditIndex] = useState(0);
  const [editName, setEditName] = useState('');
  const [editHp, setEditHp] = useState(100);
  const [editAtk, setEditAtk] = useState(10);
  const [editLevel, setEditLevel] = useState(1);
  const [editMaxLevel, setEditMaxLevel] = useState(10);
  const [editType, setEditType] = useState<AbilityType>('オルゴン');

  // Add Monster
  const [newMName, setNewMName] = useState('');
  const [newMHp, setNewMHp] = useState(150);
  const [newMAtk, setNewMAtk] = useState(12);
  const [newMType, setNewMType] = useState<AbilityType>('オルゴン');
  const [newMRank, setNewMRank] = useState<RarityRank>('カスタム');
  const [newMMaxLevel, setNewMMaxLevel] = useState(20);

  // Enemy Addition
  const [newEnemyFloorSelect, setNewEnemyFloorSelect] = useState(0);
  const [newEnemyName, setNewEnemyName] = useState('');
  const [newEnemyHp, setNewEnemyHp] = useState(100);
  const [newEnemyAtk, setNewEnemyAtk] = useState(10);
  const [newEnemyType, setNewEnemyType] = useState<'golem' | 'enon' | 'ushi' | 'obadora' | ''>('');
  const [newEnemyBossType, setNewEnemyBossType] = useState<BossType>('');

  // Gacha forms
  const [urRate, setUrRate] = useState(gachaRateUr);
  const [ssrRate, setSsrRate] = useState(gachaRateSsr);
  const [newGachaName, setNewGachaName] = useState('');
  const [newGachaRank, setNewGachaRank] = useState<'N' | 'R' | 'SR' | 'SSR' | 'UR'>('N');
  const [newGachaHp, setNewGachaHp] = useState(100);
  const [newGachaAtk, setNewGachaAtk] = useState(10);
  const [newGachaType, setNewGachaType] = useState<AbilityType>('オルゴン');

  if (!isOpen) return null;

  const checkAdminCode = () => {
    if (adminCodeInput === ADMIN_CODE) {
      setIsAdminLoggedIn(true);
      if (playerSelectableMonsters[0]) {
        loadMonsterToEdit(0);
      }
    } else {
      alert('管理者パスワードが違います！');
    }
  };

  const loadMonsterToEdit = (idx: number) => {
    setSelectedEditIndex(idx);
    const m = playerSelectableMonsters[idx];
    if (m) {
      setEditName(m.name);
      setEditHp(m.hp);
      setEditAtk(m.atk);
      setEditLevel(m.level);
      setEditMaxLevel(m.maxLevel);
      setEditType(m.type);
    }
  };

  const handleSaveMonsterEdit = () => {
    if (!editName.trim()) return alert('名前を入力してください');
    const updated = [...playerSelectableMonsters];
    if (updated[selectedEditIndex]) {
      updated[selectedEditIndex] = {
        ...updated[selectedEditIndex],
        name: editName.trim(),
        hp: editHp,
        atk: editAtk,
        level: editLevel,
        maxLevel: editMaxLevel,
        type: editType,
      };
      onUpdateSelectableMonsters(updated);
      alert(`「${editName}」のステータスを更新しました！`);
    }
  };

  const handleDeleteMonster = () => {
    if (playerSelectableMonsters.length <= 1) {
      return alert('最低1体のモンスターが必要です！');
    }
    if (confirm(`本当に「${playerSelectableMonsters[selectedEditIndex]?.name}」を削除しますか？`)) {
      const updated = playerSelectableMonsters.filter((_, idx) => idx !== selectedEditIndex);
      onUpdateSelectableMonsters(updated);
      loadMonsterToEdit(0);
      alert('モンスターを削除しました。');
    }
  };

  const handleFullHeal = () => {
    onUpdatePlayer({
      hp: player.maxHp,
      sp: player.sp + 10,
      status: null,
    });
    addLog(`🔧 **[管理者] プレイヤー全回復＆SP+10を実行しました！**`);
    alert('プレイヤーのHPを全回復し、SPを+10しました！');
  };

  const handleAddGems = () => {
    const val = parseInt(setGemsInput, 10);
    if (isNaN(val)) return alert('数値を入力してください');
    onUpdateGems(gems + val);
    addLog(`🔧 **[管理者] ダイヤを 💎${val}個 追加しました！**`);
    alert(`ダイヤを ${val}個 追加しました！`);
    setSetGemsInput('');
  };

  const handleSetAtk = () => {
    const val = parseInt(setAtkInput, 10);
    if (isNaN(val)) return alert('数値を入力してください');
    onUpdatePlayer({ atk: val });
    addLog(`🔧 **[管理者] プレイヤー攻撃力を ${val} に設定しました！**`);
    alert(`攻撃力を ${val} に変更しました！`);
    setSetAtkInput('');
  };

  const handleSetMaxHp = () => {
    const val = parseInt(setMaxHpInput, 10);
    if (isNaN(val)) return alert('数値を入力してください');
    onUpdatePlayer({ maxHp: val, hp: val });
    addLog(`🔧 **[管理者] プレイヤー最大HPを ${val} に設定しました！**`);
    alert(`最大HPを ${val} に変更しました！`);
    setSetMaxHpInput('');
  };

  const handleAddNewMonster = () => {
    if (!newMName.trim()) return alert('名前を入力してください');
    const newM: MonsterProfile = {
      name: newMName.trim(),
      hp: newMHp,
      atk: newMAtk,
      type: newMType,
      rank: newMRank,
      level: 1,
      maxLevel: newMMaxLevel,
      baseHp: newMHp,
      baseAtk: newMAtk,
    };
    const updated = [...playerSelectableMonsters, newM];
    onUpdateSelectableMonsters(updated);
    alert(`モンスター「${newM.name}」を追加しました！`);
    setNewMName('');
  };

  const handleAddEnemy = () => {
    if (!newEnemyName.trim()) return alert('敵の名前を入力してください');
    const updatedFloors = floors.map((fl, idx) => {
      if (idx === newEnemyFloorSelect) {
        return {
          ...fl,
          enemies: [
            ...fl.enemies,
            {
              name: newEnemyName.trim(),
              hp: newEnemyHp,
              atk: newEnemyAtk,
              type: newEnemyType,
              bossType: newEnemyBossType,
            },
          ],
        };
      }
      return fl;
    });
    onUpdateFloors(updatedFloors);
    alert(`${floors[newEnemyFloorSelect]?.name} に ${newEnemyName.trim()} を追加しました！`);
    setNewEnemyName('');
  };

  const handleUpdateRates = () => {
    onUpdateGachaRates(urRate, ssrRate);
    alert(`ガチャ確率を更新しました (UR:${urRate}%, SSR:${ssrRate}%)`);
  };

  const handleAddGachaChar = () => {
    if (!newGachaName.trim()) return alert('名前を入力してください');
    const newChar: MonsterProfile = {
      name: newGachaName.trim(),
      hp: newGachaHp,
      atk: newGachaAtk,
      type: newGachaType,
      rank: newGachaRank,
      level: 1,
      maxLevel: newGachaRank === 'UR' ? 30 : newGachaRank === 'SSR' ? 20 : 15,
      baseHp: newGachaHp,
      baseAtk: newGachaAtk,
    };
    onAddGachaCharacter(newChar);
    alert(`ガチャプール [${newGachaRank}] に ${newChar.name} を追加しました！`);
    setNewGachaName('');
  };

  const handleAddFloor = () => {
    const num = floors.length + 1;
    const newFloor: Floor = {
      name: `第${num}階層`,
      enemies: [{ name: 'カスタムモンスター', hp: 200, atk: 12 }],
      clearRewardGems: num * 15,
    };
    onUpdateFloors([...floors, newFloor]);
    alert(`第${num}階層 を追加しました！`);
  };

  return (
    <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-4">
      <div className="bg-[#222] border-2 border-[#555] p-5 rounded-2xl w-full max-w-[440px] max-h-[85vh] overflow-y-auto text-white shadow-2xl relative">
        <span
          className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-white text-lg font-bold"
          onClick={onClose}
        >
          ✕
        </span>

        {!isAdminLoggedIn ? (
          <div className="mt-2 text-center">
            <h3 className="text-base font-bold mb-3 text-[#f0a500]">🔑 管理者ログイン</h3>
            <p className="text-xs text-[#aaa] mb-3">管理者コードを入力してください</p>
            <input
              type="password"
              value={adminCodeInput}
              onChange={(e) => setAdminCodeInput(e.target.value)}
              placeholder="コードを入力"
              className="w-full p-2.5 mb-3 bg-[#333] border border-[#555] text-white text-xs rounded-lg outline-none"
            />
            <button
              onClick={checkAdminCode}
              className="w-full bg-[#f0a500] hover:bg-[#e09400] text-black font-black p-2.5 text-xs rounded-lg cursor-pointer"
            >
              ログイン
            </button>
          </div>
        ) : (
          <div className="mt-2 text-left">
            <h3 className="text-sm font-bold mb-2.5 text-[#f0a500]">🛠️ 仕様変更・管理者ルーム</h3>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 mb-3">
              <button
                className={`px-2 py-1 text-[10px] rounded cursor-pointer ${
                  adminTab === 'status' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                }`}
                onClick={() => setAdminTab('status')}
              >
                ステータス
              </button>
              <button
                className={`px-2 py-1 text-[10px] rounded cursor-pointer ${
                  adminTab === 'edit_monsters' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                }`}
                onClick={() => {
                  setAdminTab('edit_monsters');
                  loadMonsterToEdit(selectedEditIndex);
                }}
              >
                モンスター編集
              </button>
              <button
                className={`px-2 py-1 text-[10px] rounded cursor-pointer ${
                  adminTab === 'add_monster' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                }`}
                onClick={() => setAdminTab('add_monster')}
              >
                モンスター追加
              </button>
              <button
                className={`px-2 py-1 text-[10px] rounded cursor-pointer ${
                  adminTab === 'enemy' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                }`}
                onClick={() => setAdminTab('enemy')}
              >
                敵追加
              </button>
              <button
                className={`px-2 py-1 text-[10px] rounded cursor-pointer ${
                  adminTab === 'gacha' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                }`}
                onClick={() => setAdminTab('gacha')}
              >
                ガチャ調整
              </button>
              <button
                className={`px-2 py-1 text-[10px] rounded cursor-pointer ${
                  adminTab === 'floor' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                }`}
                onClick={() => setAdminTab('floor')}
              >
                階層追加
              </button>
            </div>

            {/* Tab: Status */}
            {adminTab === 'status' && (
              <div className="text-xs space-y-2.5">
                <button
                  onClick={handleFullHeal}
                  className="w-full bg-[#27ae60] hover:bg-[#2ecc71] text-white font-bold p-2 rounded-lg cursor-pointer"
                >
                  💖 プレイヤー全回復＆SP+10
                </button>
                <div>
                  <label className="block text-[11px] text-[#aaa]">ダイヤ追加 (💎):</label>
                  <div className="flex gap-1 mt-1">
                    <input
                      type="number"
                      value={setGemsInput}
                      onChange={(e) => setSetGemsInput(e.target.value)}
                      placeholder="例: 500"
                      className="flex-1 p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                    />
                    <button
                      onClick={handleAddGems}
                      className="bg-[#00cec9] hover:bg-[#81ecec] text-black font-bold px-3 rounded text-xs cursor-pointer"
                    >
                      付与
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa]">攻撃力書き換え:</label>
                  <div className="flex gap-1 mt-1">
                    <input
                      type="number"
                      value={setAtkInput}
                      onChange={(e) => setSetAtkInput(e.target.value)}
                      placeholder={`現在: ${player.atk}`}
                      className="flex-1 p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                    />
                    <button
                      onClick={handleSetAtk}
                      className="bg-[#e67e22] hover:bg-[#f39c12] text-white font-bold px-3 rounded text-xs cursor-pointer"
                    >
                      適用
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa]">最大HP書き換え:</label>
                  <div className="flex gap-1 mt-1">
                    <input
                      type="number"
                      value={setMaxHpInput}
                      onChange={(e) => setSetMaxHpInput(e.target.value)}
                      placeholder={`現在: ${player.maxHp}`}
                      className="flex-1 p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                    />
                    <button
                      onClick={handleSetMaxHp}
                      className="bg-[#e74c3c] hover:bg-[#ff7675] text-white font-bold px-3 rounded text-xs cursor-pointer"
                    >
                      適用
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Edit Existing Monster */}
            {adminTab === 'edit_monsters' && (
              <div className="text-xs space-y-2.5">
                <div>
                  <label className="block text-[11px] text-[#aaa]">編集するモンスターを選択:</label>
                  <select
                    value={selectedEditIndex}
                    onChange={(e) => loadMonsterToEdit(parseInt(e.target.value, 10))}
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  >
                    {playerSelectableMonsters.map((m, idx) => (
                      <option key={idx} value={idx}>
                        {m.name} [{m.rank}] (Lv.{m.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-[#aaa]">名前:</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#aaa]">HP:</label>
                    <input
                      type="number"
                      value={editHp}
                      onChange={(e) => setEditHp(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#aaa]">攻撃力:</label>
                    <input
                      type="number"
                      value={editAtk}
                      onChange={(e) => setEditAtk(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#aaa]">現在のレベル:</label>
                    <input
                      type="number"
                      value={editLevel}
                      onChange={(e) => setEditLevel(parseInt(e.target.value, 10) || 1)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#aaa]">最大レベル:</label>
                    <input
                      type="number"
                      value={editMaxLevel}
                      onChange={(e) => setEditMaxLevel(parseInt(e.target.value, 10) || 10)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-[#aaa]">能力タイプ:</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as AbilityType)}
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  >
                    <option value="オルゴン">オルゴン (凍結/ライフフルーツ)</option>
                    <option value="ラリ">ラリ (困惑/油蓄え)</option>
                    <option value="ドレイム">ドレイム (火傷/ファイアハート)</option>
                    <option value="ゾンビ">ゾンビ (感染/ゾーンビー)</option>
                    <option value="ノーマル">ノーマル (攻撃/回復)</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleDeleteMonster}
                    className="flex-1 bg-red-700 hover:bg-red-600 text-white font-bold p-2 rounded cursor-pointer"
                  >
                    モンスター削除
                  </button>
                  <button
                    onClick={handleSaveMonsterEdit}
                    className="flex-1 bg-[#27ae60] hover:bg-[#2ecc71] text-white font-bold p-2 rounded cursor-pointer"
                  >
                    変更を保存
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Add Monster */}
            {adminTab === 'add_monster' && (
              <div className="text-xs space-y-2">
                <div>
                  <label className="block text-[11px] text-[#aaa]">モンスター名:</label>
                  <input
                    type="text"
                    value={newMName}
                    onChange={(e) => setNewMName(e.target.value)}
                    placeholder="例: ゴールデンドラゴン"
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#aaa]">HP:</label>
                    <input
                      type="number"
                      value={newMHp}
                      onChange={(e) => setNewMHp(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#aaa]">攻撃力:</label>
                    <input
                      type="number"
                      value={newMAtk}
                      onChange={(e) => setNewMAtk(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#aaa]">レアリティ:</label>
                    <select
                      value={newMRank}
                      onChange={(e) => setNewMRank(e.target.value as RarityRank)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    >
                      <option value="初期">初期</option>
                      <option value="N">N</option>
                      <option value="R">R</option>
                      <option value="SR">SR</option>
                      <option value="SSR">SSR</option>
                      <option value="UR">UR</option>
                      <option value="カスタム">カスタム</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#aaa]">最大レベル:</label>
                    <input
                      type="number"
                      value={newMMaxLevel}
                      onChange={(e) => setNewMMaxLevel(parseInt(e.target.value, 10) || 10)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa]">能力タイプ:</label>
                  <select
                    value={newMType}
                    onChange={(e) => setNewMType(e.target.value as AbilityType)}
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  >
                    <option value="オルゴン">オルゴン (凍結/ライフフルーツ)</option>
                    <option value="ラリ">ラリ (困惑/油蓄え)</option>
                    <option value="ドレイム">ドレイム (火傷/ファイアハート)</option>
                    <option value="ゾンビ">ゾンビ (感染/ゾーンビー)</option>
                    <option value="ノーマル">ノーマル (攻撃/回復)</option>
                  </select>
                </div>
                <button
                  onClick={handleAddNewMonster}
                  className="w-full mt-2 bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2 rounded cursor-pointer"
                >
                  所持モンスターリストに追加
                </button>
              </div>
            )}

            {/* Tab: Enemy Addition */}
            {adminTab === 'enemy' && (
              <div className="text-xs space-y-2">
                <div>
                  <label className="block text-[11px] text-[#aaa]">配置先の階層:</label>
                  <select
                    value={newEnemyFloorSelect}
                    onChange={(e) => setNewEnemyFloorSelect(parseInt(e.target.value, 10))}
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  >
                    {floors.map((fl, idx) => (
                      <option key={idx} value={idx}>
                        {fl.name} (敵 {fl.enemies.length} 体)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa]">敵の名前:</label>
                  <input
                    type="text"
                    value={newEnemyName}
                    onChange={(e) => setNewEnemyName(e.target.value)}
                    placeholder="例: デーモンロード"
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#aaa]">HP:</label>
                    <input
                      type="number"
                      value={newEnemyHp}
                      onChange={(e) => setNewEnemyHp(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#aaa]">攻撃力:</label>
                    <input
                      type="number"
                      value={newEnemyAtk}
                      onChange={(e) => setNewEnemyAtk(parseInt(e.target.value, 10) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa]">特殊行動パターン:</label>
                  <select
                    value={newEnemyType}
                    onChange={(e) =>
                      setNewEnemyType(e.target.value as 'golem' | 'enon' | 'ushi' | 'obadora' | '')
                    }
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  >
                    <option value="">なし</option>
                    <option value="golem">ドラッグ服用 (回復 & 攻撃UP/ダウン)</option>
                    <option value="enon">自己回復</option>
                    <option value="ushi">突進攻撃</option>
                    <option value="obadora">アビス (拘束/火傷/固定ダメ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-[#aaa]">ボス種別:</label>
                  <select
                    value={newEnemyBossType}
                    onChange={(e) => setNewEnemyBossType(e.target.value as BossType)}
                    className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                  >
                    <option value="">なし</option>
                    <option value="中BOSS">中BOSS (10💎)</option>
                    <option value="BOSS">BOSS (25💎)</option>
                    <option value="強BOSS">強BOSS (50💎)</option>
                    <option value="狂BOSS">狂BOSS (100💎)</option>
                    <option value="最恐BOSS">最恐BOSS (1000💎)</option>
                  </select>
                </div>
                <button
                  onClick={handleAddEnemy}
                  className="w-full mt-2 bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2 rounded cursor-pointer"
                >
                  階層に敵を追加
                </button>
              </div>
            )}

            {/* Tab: Gacha */}
            {adminTab === 'gacha' && (
              <div className="text-xs space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-[#aaa]">UR確率 (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={urRate}
                      onChange={(e) => setUrRate(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-[#aaa]">SSR確率 (%):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ssrRate}
                      onChange={(e) => setSsrRate(parseFloat(e.target.value) || 0)}
                      className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                    />
                  </div>
                </div>
                <button
                  onClick={handleUpdateRates}
                  className="w-full bg-[#3a3a3a] hover:bg-[#555] text-white font-bold p-1.5 rounded cursor-pointer"
                >
                  確率を更新
                </button>

                <hr className="border-[#444] my-2" />
                <label className="block text-[11px] text-[#aaa] font-bold">新ガチャキャラ追加:</label>
                <input
                  type="text"
                  value={newGachaName}
                  onChange={(e) => setNewGachaName(e.target.value)}
                  placeholder="キャラクター名"
                  className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                />
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <select
                    value={newGachaRank}
                    onChange={(e) =>
                      setNewGachaRank(e.target.value as 'N' | 'R' | 'SR' | 'SSR' | 'UR')
                    }
                    className="p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                  >
                    <option value="N">N</option>
                    <option value="R">R</option>
                    <option value="SR">SR</option>
                    <option value="SSR">SSR</option>
                    <option value="UR">UR</option>
                  </select>
                  <select
                    value={newGachaType}
                    onChange={(e) => setNewGachaType(e.target.value as AbilityType)}
                    className="p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                  >
                    <option value="オルゴン">オルゴン</option>
                    <option value="ラリ">ラリ</option>
                    <option value="ドレイム">ドレイム</option>
                    <option value="ゾンビ">ゾンビ</option>
                    <option value="ノーマル">ノーマル</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <input
                    type="number"
                    value={newGachaHp}
                    onChange={(e) => setNewGachaHp(parseInt(e.target.value, 10) || 0)}
                    placeholder="HP"
                    className="p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                  />
                  <input
                    type="number"
                    value={newGachaAtk}
                    onChange={(e) => setNewGachaAtk(parseInt(e.target.value, 10) || 0)}
                    placeholder="攻撃力"
                    className="p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                  />
                </div>
                <button
                  onClick={handleAddGachaChar}
                  className="w-full mt-2 bg-[#8e44ad] hover:bg-[#9b59b6] text-white font-bold p-2 rounded cursor-pointer"
                >
                  ガチャプールに追加
                </button>
              </div>
            )}

            {/* Tab: Floor Addition */}
            {adminTab === 'floor' && (
              <div className="text-xs space-y-3">
                <p className="text-xs text-[#aaa]">現在の総階層数: {floors.length}</p>
                <button
                  onClick={handleAddFloor}
                  className="w-full bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2.5 rounded cursor-pointer"
                >
                  末尾に新階層を追加 (クリア報酬付き)
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

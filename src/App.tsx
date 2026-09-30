import React, { useState, useEffect } from 'react';
import {
  MasterMonster,
  GachaRank,
  UserAccount,
  CalculatedUnit,
} from './types';
import {
  ADMIN_CODE,
  INITIAL_MASTER_MONSTERS,
  STARTER_KEYS,
  INITIAL_GACHA_POOL,
  REFUND_GEMS,
  INITIAL_FLOOR_CONFIG,
  getCalculatedStats,
  initStatus,
} from './data/defaults';
import { BattleScreen } from './components/BattleScreen';
import { AdminScreen } from './components/AdminScreen';

export default function App() {
  // Master databases persisted to localStorage
  const [masterMonsters, setMasterMonsters] = useState<Record<string, MasterMonster>>(() => {
    try {
      const saved = localStorage.getItem('m_rpg_master_monsters');
      return saved ? JSON.parse(saved) : INITIAL_MASTER_MONSTERS;
    } catch {
      return INITIAL_MASTER_MONSTERS;
    }
  });

  const [gachaPool, setGachaPool] = useState<Record<GachaRank, string[]>>(() => {
    try {
      const saved = localStorage.getItem('m_rpg_gacha_pool');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.SCR) parsed.SCR = [];
        return parsed;
      }
      return INITIAL_GACHA_POOL;
    } catch {
      return INITIAL_GACHA_POOL;
    }
  });

  const [floorConfig, setFloorConfig] = useState<Record<number, string[]>>(() => {
    try {
      const saved = localStorage.getItem('m_rpg_floor_config');
      return saved ? JSON.parse(saved) : INITIAL_FLOOR_CONFIG;
    } catch {
      return INITIAL_FLOOR_CONFIG;
    }
  });

  const [db, setDb] = useState<Record<string, UserAccount>>(() => {
    try {
      const saved = localStorage.getItem('m_rpg_db');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Current session & screen
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [currentScreen, setCurrentScreen] = useState<
    | 'screen-login'
    | 'screen-admin-login'
    | 'screen-starter'
    | 'screen-home'
    | 'screen-battle'
    | 'screen-gacha'
    | 'screen-transfer'
    | 'screen-admin'
  >('screen-login');

  // Input states
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [adminPassInput, setAdminPassInput] = useState('');

  // Gacha log
  const [gachaLogs, setGachaLogs] = useState<string[]>([]);

  // Transfer states
  const [transferTarget, setTransferTarget] = useState('');
  const [transferAmount, setTransferAmount] = useState<number | ''>('');

  // Battle prep
  const [battlePlayer, setBattlePlayer] = useState<CalculatedUnit | null>(null);
  const [battleEnemyQueue, setBattleEnemyQueue] = useState<CalculatedUnit[]>([]);

  // Sync Master Databases
  const saveMasterMonsters = (updated: Record<string, MasterMonster>) => {
    setMasterMonsters(updated);
    localStorage.setItem('m_rpg_master_monsters', JSON.stringify(updated));
  };

  const saveGachaPool = (updated: Record<GachaRank, string[]>) => {
    setGachaPool(updated);
    localStorage.setItem('m_rpg_gacha_pool', JSON.stringify(updated));
  };

  const saveFloorConfig = (updated: Record<number, string[]>) => {
    setFloorConfig(updated);
    localStorage.setItem('m_rpg_floor_config', JSON.stringify(updated));
  };

  const saveDB = (newDb: Record<string, UserAccount>) => {
    setDb(newDb);
    localStorage.setItem('m_rpg_db', JSON.stringify(newDb));
  };

  const updateCurrentUser = (updater: (prev: UserAccount) => UserAccount) => {
    if (!currentUser) return;
    const updated = updater(currentUser);
    setCurrentUser(updated);
    const newDb = { ...db, [updated.name]: updated };
    saveDB(newDb);
  };

  // Login handler
  const handleLogin = () => {
    const name = loginName.trim();
    const pass = loginPass.trim();
    if (!name || !pass) {
      alert('ネームタグとパスワードを入力してください。');
      return;
    }

    if (db[name]) {
      if (db[name].pass === pass) {
        const user = { ...db[name], name };
        setCurrentUser(user);
        if (!user.monsters || user.monsters.length === 0) {
          setCurrentScreen('screen-starter');
        } else {
          setCurrentScreen('screen-home');
        }
      } else {
        alert('パスワードが違います。');
      }
    } else {
      const newUser: UserAccount = {
        name,
        pass,
        gems: 0,
        floor: 1,
        monsters: [],
        selectedIndex: 0,
      };
      const newDb = { ...db, [name]: newUser };
      saveDB(newDb);
      setCurrentUser(newUser);
      setCurrentScreen('screen-starter');
    }
  };

  // Admin login handler
  const handleAdminLogin = () => {
    if (adminPassInput.trim() === ADMIN_CODE) {
      setAdminPassInput('');
      setCurrentScreen('screen-admin');
    } else {
      alert('管理者コードが正しくありません。');
    }
  };

  // Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setLoginName('');
    setLoginPass('');
    setCurrentScreen('screen-login');
  };

  // Select starter monster
  const handleSelectStarter = (key: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      monsters: [{ name: key, level: 1 }],
      selectedIndex: 0,
    };
    setCurrentUser(updatedUser);
    const newDb = { ...db, [currentUser.name]: updatedUser };
    saveDB(newDb);
    setCurrentScreen('screen-home');
  };

  // Change selected combat monster
  const selectMainMonster = (idx: number) => {
    updateCurrentUser((prev) => ({
      ...prev,
      selectedIndex: idx,
    }));
  };

  // Delete monster
  const deleteUserMonster = (idx: number) => {
    if (!currentUser) return;
    if (currentUser.monsters.length <= 1) {
      alert('最後の1体は削除できません！');
      return;
    }
    const target = currentUser.monsters[idx];
    if (confirm(`本当に [${target.name} (Lv.${target.level})] とお別れしますか？`)) {
      const newMonsters = currentUser.monsters.filter((_, i) => i !== idx);
      const newIdx = currentUser.selectedIndex >= newMonsters.length ? 0 : currentUser.selectedIndex;
      updateCurrentUser((prev) => ({
        ...prev,
        monsters: newMonsters,
        selectedIndex: newIdx,
      }));
    }
  };

  // Start Dungeon Battle
  const handleStartDungeon = () => {
    if (!currentUser || currentUser.monsters.length === 0) return;
    const activeMonster = currentUser.monsters[currentUser.selectedIndex || 0];
    const playerUnit = getCalculatedStats(activeMonster, masterMonsters);
    playerUnit.pt = 0;
    playerUnit.status = initStatus();
    playerUnit.revived = false;

    const enemyNames = floorConfig[currentUser.floor] || ['スライム'];
    const enemies = enemyNames.map((eName) => {
      const copy = getCalculatedStats({ name: eName, level: 1 }, masterMonsters);
      copy.status = initStatus();
      return copy;
    });

    setBattlePlayer(playerUnit);
    setBattleEnemyQueue(enemies);
    setCurrentScreen('screen-battle');
  };

  // Floor Clear Callback
  const handleFloorClear = () => {
    if (!currentUser) return;
    let extraGems = 0;
    if (currentUser.floor === 5) extraGems = 10;
    if (currentUser.floor === 10) extraGems = 25;

    updateCurrentUser((prev) => ({
      ...prev,
      gems: prev.gems + extraGems,
      floor: prev.floor + 1,
    }));
  };

  // Gacha draw
  const handleDrawGacha = (count: number) => {
    if (!currentUser) return;
    const cost = count === 1 ? 50 : 480;
    if (currentUser.gems < cost) {
      alert('💎が足りません！');
      return;
    }

    let currentG = currentUser.gems - cost;
    const newLogs: string[] = [`--- ガチャ結果 (${count}回) ---`];
    const userMonsters = [...currentUser.monsters];

    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100;
      let rank: GachaRank = 'N';
      if (rand < 0.001) rank = 'SCR';
      else if (rand < 0.501) rank = 'UR';
      else if (rand < 5.001) rank = 'SSR';
      else if (rand < 20.0) rank = 'SR';
      else if (rand < 55.0) rank = 'R';

      let pool = gachaPool[rank];
      if (!pool || pool.length === 0) {
        rank = 'N';
        pool = gachaPool['N'] || ['ゾンビ'];
      }

      const mName = pool[Math.floor(Math.random() * pool.length)];
      const existing = userMonsters.find((m) => m.name === mName);

      if (existing) {
        if (!existing.level) existing.level = 1;
        if (existing.level < 100) {
          existing.level++;
          newLogs.push(`[${rank}] <strong>${mName}</strong> 重複！ (Lv.${existing.level} にアップ！)`);
        } else {
          const refund = REFUND_GEMS[rank] || 10;
          currentG += refund;
          newLogs.push(
            `[${rank}] <strong>${mName}</strong> (Lv.100上限) -> <span style="color:#ffd600;">+${refund}💎</span> 変換！`
          );
        }
      } else {
        userMonsters.push({ name: mName, level: 1 });
        newLogs.push(`[${rank}] <strong>${mName}</strong> (NEW!) を獲得！`);
      }
    }

    setGachaLogs(newLogs);
    updateCurrentUser((prev) => ({
      ...prev,
      gems: currentG,
      monsters: userMonsters,
    }));
  };

  // Transfer diamonds
  const handleExecuteTransfer = () => {
    if (!currentUser) return;
    const target = transferTarget.trim();
    const amt = Number(transferAmount);

    if (!db[target]) {
      alert('相手のネームタグが存在しません。');
      return;
    }
    if (isNaN(amt) || amt <= 0 || currentUser.gems < amt) {
      alert('有効な数量を入力してください。');
      return;
    }

    const updatedCurrent = {
      ...currentUser,
      gems: currentUser.gems - amt,
    };
    const updatedTarget = {
      ...db[target],
      gems: (db[target].gems || 0) + amt,
    };

    const newDb = {
      ...db,
      [currentUser.name]: updatedCurrent,
      [target]: updatedTarget,
    };

    setCurrentUser(updatedCurrent);
    saveDB(newDb);
    setTransferTarget('');
    setTransferAmount('');
    alert(`${target} に ${amt}💎 を送信しました。`);
    setCurrentScreen('screen-home');
  };

  const isGachaUnlocked = currentUser ? currentUser.floor >= 4 : false;

  return (
    <div id="game-container">
      {/* 1. ログイン画面 */}
      {currentScreen === 'screen-login' && (
        <div id="screen-login" className="active">
          <h1>モンスターダンジョン</h1>
          <h3>プレイヤー ログイン / 新規登録</h3>
          <input
            type="text"
            id="login-name"
            placeholder="ネームタグを入力"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
          />
          <input
            type="password"
            id="login-pass"
            placeholder="パスワードを入力"
            value={loginPass}
            onChange={(e) => setLoginPass(e.target.value)}
          />
          <button onClick={handleLogin} style={{ width: '100%' }}>
            ゲームスタート
          </button>
          <hr style={{ borderColor: '#333', margin: '20px 0' }} />
          <button
            className="btn-warning"
            onClick={() => setCurrentScreen('screen-admin-login')}
            style={{ width: '100%' }}
          >
            管理者ログイン画面へ
          </button>
        </div>
      )}

      {/* 1.5 管理者認証画面 */}
      {currentScreen === 'screen-admin-login' && (
        <div id="screen-admin-login" className="active">
          <h2>管理者ログイン</h2>
          <p style={{ fontSize: '12px', color: '#aaa' }}>管理者専用パスワードを入力してください。</p>
          <input
            type="password"
            id="admin-pass-input"
            placeholder="管理者コード"
            value={adminPassInput}
            onChange={(e) => setAdminPassInput(e.target.value)}
          />
          <button className="btn-warning" onClick={handleAdminLogin} style={{ width: '100%' }}>
            管理者ルーム入室
          </button>
          <button
            onClick={() => setCurrentScreen('screen-login')}
            style={{ width: '100%', marginTop: '10px' }}
          >
            戻る
          </button>
        </div>
      )}

      {/* 2. 初期モンスター選択画面 */}
      {currentScreen === 'screen-starter' && (
        <div id="screen-starter" className="active">
          <h2>最初のパートナーを選択</h2>
          <p>ダンジョンに挑むモンスターを1体選んでください。</p>
          <div id="starter-list" className="monster-grid">
            {STARTER_KEYS.map((key) => {
              const stats = getCalculatedStats({ name: key, level: 1 }, masterMonsters);
              return (
                <div key={key} className="monster-card">
                  <div className="unit-img">
                    {stats.img ? <img src={stats.img} alt={key} /> : '立ち絵なし'}
                  </div>
                  <strong>{key}</strong>
                  <br />
                  HP:{stats.maxHp} / ATK:{stats.atk}
                  <br />
                  <button onClick={() => handleSelectStarter(key)}>これにする</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ホーム画面 */}
      {currentScreen === 'screen-home' && currentUser && (
        <div id="screen-home" className="active">
          <h2>ホーム</h2>
          <p>
            プレイヤー: <span id="home-player-name" style={{ color: '#00e676' }}>{currentUser.name}</span> | 所持💎:{' '}
            <span id="home-gems" style={{ color: '#ffd600' }}>{currentUser.gems}</span>
          </p>
          <p>
            現在の進行度: <strong>第 <span id="home-floor">{currentUser.floor}</span> 階層</strong>
          </p>

          <button className="btn-success" onClick={handleStartDungeon}>
            ダンジョンへ挑戦
          </button>
          <button
            id="btn-gacha-menu"
            disabled={!isGachaUnlocked}
            onClick={() => setCurrentScreen('screen-gacha')}
          >
            {isGachaUnlocked ? 'ガチャ (解放済み)' : 'ガチャ (第3階層クリアで解放)'}
          </button>
          <button onClick={() => setCurrentScreen('screen-transfer')}>
            💎を他のプレイヤーに渡す
          </button>
          <button className="btn-danger" onClick={handleLogout}>
            ログアウト
          </button>

          <h3>所持モンスター一覧</h3>
          <div id="home-monster-list" className="monster-grid">
            {currentUser.monsters.map((m, idx) => {
              const stats = getCalculatedStats(m, masterMonsters);
              const isSelected = idx === currentUser.selectedIndex;
              return (
                <div
                  key={idx}
                  className="monster-card"
                  style={isSelected ? { borderColor: '#00e676' } : {}}
                >
                  <div className="unit-img">
                    {stats.img ? <img src={stats.img} alt={stats.name} /> : '立ち絵なし'}
                  </div>
                  <strong>{stats.name}</strong>{' '}
                  <span style={{ color: '#ffd600' }}>Lv.{stats.level}</span>
                  <br />
                  HP:{stats.maxHp} ATK:{stats.atk}
                  <br />
                  <button onClick={() => selectMainMonster(idx)}>
                    {isSelected ? '出撃中' : '出撃選択'}
                  </button>
                  <button
                    className="btn-danger"
                    style={{ marginTop: '5px', fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => deleteUserMonster(idx)}
                  >
                    お別れ(削除)
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. ダンジョン戦闘画面 */}
      {currentScreen === 'screen-battle' && battlePlayer && currentUser && (
        <BattleScreen
          initialPlayer={battlePlayer}
          enemyQueue={battleEnemyQueue}
          floor={currentUser.floor}
          onFloorClear={handleFloorClear}
          onExit={() => setCurrentScreen('screen-home')}
        />
      )}

      {/* 5. ガチャ画面 */}
      {currentScreen === 'screen-gacha' && currentUser && (
        <div id="screen-gacha" className="active">
          <h2>モンスターガチャ</h2>
          <p>所持💎: <span id="gacha-gems" style={{ color: '#ffd600' }}>{currentUser.gems}</span></p>
          <p style={{ fontSize: '12px', color: '#aaa' }}>
            排出率: N 45% / R 35% / SR 14.999% / SSR 4.5% / UR 0.5% /{' '}
            <strong style={{ color: '#ff00ff' }}>SCR 0.001%</strong>
          </p>
          <button onClick={() => handleDrawGacha(1)}>1回引く (50💎)</button>
          <button onClick={() => handleDrawGacha(10)}>10回引く (480💎)</button>
          <div
            id="gacha-result"
            className="log-box"
            style={{ marginTop: '15px', height: '150px' }}
          >
            {gachaLogs.map((log, i) => (
              <div key={i} dangerouslySetInnerHTML={{ __html: log }} />
            ))}
          </div>
          <button onClick={() => setCurrentScreen('screen-home')}>ホームへ戻る</button>
        </div>
      )}

      {/* 6. 💎譲渡画面 */}
      {currentScreen === 'screen-transfer' && currentUser && (
        <div id="screen-transfer" className="active">
          <h2>💎 プレイヤー間送金</h2>
          <p>所持💎: <span id="transfer-gems" style={{ color: '#ffd600' }}>{currentUser.gems}</span></p>
          <input
            type="text"
            id="transfer-target"
            placeholder="相手のネームタグ"
            value={transferTarget}
            onChange={(e) => setTransferTarget(e.target.value)}
          />
          <input
            type="number"
            id="transfer-amount"
            placeholder="渡す💎の数量"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value === '' ? '' : Number(e.target.value))}
          />
          <button className="btn-success" onClick={handleExecuteTransfer}>
            送信する
          </button>
          <button onClick={() => setCurrentScreen('screen-home')}>キャンセル</button>
        </div>
      )}

      {/* 7. 管理者ルーム */}
      {currentScreen === 'screen-admin' && (
        <AdminScreen
          masterMonsters={masterMonsters}
          gachaPool={gachaPool}
          floorConfig={floorConfig}
          db={db}
          onSaveMasterMonsters={saveMasterMonsters}
          onSaveGachaPool={saveGachaPool}
          onSaveFloorConfig={saveFloorConfig}
          onSaveDB={saveDB}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

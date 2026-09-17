import React, { useState, useEffect, useRef } from 'react';
import {
  Player,
  Enemy,
  AbilityType,
  MonsterProfile,
  Floor,
  GachaRates,
  StatusEffect,
  BossType,
  RarityRank,
} from './types';
import {
  ADMIN_CODE,
  BOSS_REWARDS,
  DEFAULT_PLAYER_SELECTABLE_MONSTERS,
  DEFAULT_GACHA_POOL,
  DEFAULT_FLOORS,
} from './data/gameData';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function App() {
  // Screens: 'login' | 'setup' | 'home' | 'game'
  const [currentScreen, setCurrentScreen] = useState<'login' | 'setup' | 'home' | 'game'>('login');

  // User Authentication & Save State
  const [userTag, setUserTag] = useState('冒険者');
  const [userPass, setUserPass] = useState('');
  const [playerTagInput, setPlayerTagInput] = useState('');
  const [playerPassInput, setPlayerPassInput] = useState('');
  const [gems, setGems] = useState(0);
  const [isHomeUnlocked, setIsHomeUnlocked] = useState(false);

  // Monsters & Floors
  const [playerSelectableMonsters, setPlayerSelectableMonsters] = useState<MonsterProfile[]>(
    DEFAULT_PLAYER_SELECTABLE_MONSTERS
  );
  const [gachaPool, setGachaPool] = useState(DEFAULT_GACHA_POOL);
  const [floors, setFloors] = useState<Floor[]>(DEFAULT_FLOORS);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);

  // Gacha Rates
  const [gachaRates, setGachaRates] = useState<GachaRates>({
    UR: 0.5,
    SSR: 4.5,
    SR: 15.0,
    R: 35.0,
    N: 45.0,
  });

  // Battle state
  const [player, setPlayer] = useState<Player>({
    name: '',
    hp: 0,
    maxHp: 0,
    atk: 0,
    sp: 0,
    type: '',
    status: null,
    hasRevived: false,
    deathZombies: 0,
  });

  const [enemy, setEnemy] = useState<Enemy>({
    name: '',
    hp: 0,
    maxHp: 0,
    atk: 0,
    baseAtk: 0,
    status: null,
    type: '',
    bossType: '',
    buffTurns: 0,
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [homeLogs, setHomeLogs] = useState<string[]>([]);
  const [controlsDisabled, setControlsDisabled] = useState(false);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [showHomeBtn, setShowHomeBtn] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Admin Modal state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [adminTab, setAdminTab] = useState<'status' | 'enemy' | 'gacha' | 'floor'>('status');

  // Admin form inputs
  const [adminSetGems, setAdminSetGems] = useState('');
  const [adminSetAtk, setAdminSetAtk] = useState('');
  const [adminCustomMName, setAdminCustomMName] = useState('');
  const [adminCustomMHp, setAdminCustomMHp] = useState(200);
  const [adminCustomMAtk, setAdminCustomMAtk] = useState(15);
  const [adminCustomMType, setAdminCustomMType] = useState<AbilityType>('オルゴン');

  // Admin enemy form
  const [newEnemyFloorSelect, setNewEnemyFloorSelect] = useState(0);
  const [newEnemyName, setNewEnemyName] = useState('');
  const [newEnemyHp, setNewEnemyHp] = useState(100);
  const [newEnemyAtk, setNewEnemyAtk] = useState(10);
  const [newEnemyType, setNewEnemyType] = useState<'golem' | 'enon' | 'ushi' | 'obadora' | ''>('');
  const [newEnemyBossType, setNewEnemyBossType] = useState<BossType>('');

  // Admin gacha form
  const [rateUrInput, setRateUrInput] = useState(0.5);
  const [rateSsrInput, setRateSsrInput] = useState(4.5);
  const [newGachaName, setNewGachaName] = useState('');
  const [newGachaRank, setNewGachaRank] = useState<'N' | 'R' | 'SR' | 'SSR' | 'UR'>('N');
  const [newGachaHp, setNewGachaHp] = useState(100);
  const [newGachaAtk, setNewGachaAtk] = useState(10);
  const [newGachaType, setNewGachaType] = useState<AbilityType>('オルゴン');

  const logBoxRef = useRef<HTMLDivElement>(null);
  const homeLogBoxRef = useRef<HTMLDivElement>(null);
  const enemyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll battle logs
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // Auto-scroll home logs
  useEffect(() => {
    if (homeLogBoxRef.current) {
      homeLogBoxRef.current.scrollTop = homeLogBoxRef.current.scrollHeight;
    }
  }, [homeLogs]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (enemyTimerRef.current) {
        clearInterval(enemyTimerRef.current);
      }
    };
  }, []);

  const addLog = (text: string) => {
    setLogs((prev) => [...prev, text]);
  };

  const addHomeLog = (text: string) => {
    setHomeLogs((prev) => [...prev, text]);
  };

  // Save / Load logic
  const saveGame = (
    updatedFields?: Partial<{
      gems: number;
      currentFloorIndex: number;
      currentEnemyIndex: number;
      isHomeUnlocked: boolean;
      playerSelectableMonsters: MonsterProfile[];
      player: Player;
      floors: Floor[];
    }>
  ) => {
    if (!userPass) return;
    const saveData = {
      userTag,
      userPass,
      gems: updatedFields?.gems ?? gems,
      currentFloorIndex: updatedFields?.currentFloorIndex ?? currentFloorIndex,
      currentEnemyIndex: updatedFields?.currentEnemyIndex ?? currentEnemyIndex,
      isHomeUnlocked: updatedFields?.isHomeUnlocked ?? isHomeUnlocked,
      playerSelectableMonsters: updatedFields?.playerSelectableMonsters ?? playerSelectableMonsters,
      player: updatedFields?.player ?? player,
      floors: updatedFields?.floors ?? floors,
    };
    try {
      localStorage.setItem(`rpg_save_${userTag}`, JSON.stringify(saveData));
    } catch {
      // Ignore if localStorage quota exceeded
    }
  };

  const loadGame = (tag: string) => {
    const data = localStorage.getItem(`rpg_save_${tag}`);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  };

  const stopEnemyTimer = () => {
    if (enemyTimerRef.current) {
      clearInterval(enemyTimerRef.current);
      enemyTimerRef.current = null;
    }
  };

  // Login / Name Tag submission
  const submitNameTag = () => {
    const tagInput = playerTagInput.trim();
    const passInput = playerPassInput.trim();

    if (!tagInput) {
      alert('ネームタグを入力してください！');
      return;
    }

    setUserTag(tagInput);
    setUserPass(passInput);

    const savedData = loadGame(tagInput);

    if (savedData) {
      if (savedData.userPass !== passInput) {
        alert('パスワードが違います！');
        return;
      }
      const loadedGems = savedData.gems || 0;
      setGems(loadedGems);
      setCurrentFloorIndex(savedData.currentFloorIndex || 0);
      setCurrentEnemyIndex(savedData.currentEnemyIndex || 0);
      setIsHomeUnlocked(savedData.isHomeUnlocked || false);
      setPlayerSelectableMonsters(savedData.playerSelectableMonsters || DEFAULT_PLAYER_SELECTABLE_MONSTERS);
      setPlayer(savedData.player);
      if (savedData.floors) setFloors(savedData.floors);

      setCurrentScreen('game');
      addLog(`💾 **セーブデータからロード完了！ (所持💎: ${loadedGems}個 / 第${(savedData.currentFloorIndex || 0) + 1}階層)**`);
      loadEnemy(
        savedData.currentFloorIndex || 0,
        savedData.currentEnemyIndex || 0,
        savedData.floors || floors
      );
    } else {
      setGems(0);
      setCurrentScreen('setup');
    }
  };

  // Select monster
  const selectMonster = (name: string, hp: number, atk: number, type: AbilityType) => {
    const newPlayer: Player = {
      name,
      hp,
      maxHp: hp,
      atk,
      sp: 0,
      type,
      status: null,
      hasRevived: false,
      deathZombies: 0,
    };
    setPlayer(newPlayer);
    setCurrentFloorIndex(0);
    setCurrentEnemyIndex(0);
    setLogs([]);
    setShowNextBtn(false);
    setShowHomeBtn(false);
    setIsGameOver(false);
    setCurrentScreen('game');

    addLog(`【ゲーム開始】 ${userTag} は ${name} を選んだ！`);
    loadEnemy(0, 0, floors, newPlayer);
    saveGame({ player: newPlayer, currentFloorIndex: 0, currentEnemyIndex: 0 });
  };

  // Enemy timer behavior
  const startEnemyTimer = (targetEnemy: Enemy) => {
    stopEnemyTimer();

    if (targetEnemy.type === 'golem') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currEnemy) => {
          setPlayer((currPlayer) => {
            if (currEnemy.hp <= 0 || currPlayer.hp <= 0) return currPlayer;

            addLog(`🧪 ${currEnemy.name} はドラッグを飲んだ！`);
            if (Math.random() < 0.75) {
              const newHp = Math.min(currEnemy.maxHp, currEnemy.hp + 20);
              const turns = getRandomInt(3, 4);
              const newAtk = currEnemy.baseAtk + 4;
              addLog(`HPが 20 回復し、攻撃力が 4 アップした！（${turns}ターン持続）`);
              setEnemy({
                ...currEnemy,
                hp: newHp,
                atk: newAtk,
                buffTurns: turns,
              });
            } else {
              const newHp = Math.max(0, currEnemy.hp - 15);
              const turns = getRandomInt(3, 4);
              const newAtk = Math.max(1, currEnemy.baseAtk - 5);
              addLog(`💀 悪影響！ HPが 15 減少し、攻撃力が 5 下がった！（${turns}ターン持続）`);
              setEnemy({
                ...currEnemy,
                hp: newHp,
                atk: newAtk,
                buffTurns: turns,
              });
              if (newHp <= 0) {
                setTimeout(() => checkEnemyDefeated(currEnemy.name, currEnemy.bossType), 100);
              }
            }
            return currPlayer;
          });
          return currEnemy;
        });
      }, 20000);
    } else if (targetEnemy.type === 'enon') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currEnemy) => {
          setPlayer((currPlayer) => {
            if (currEnemy.hp <= 0 || currPlayer.hp <= 0) return currPlayer;

            addLog(`✨ ${currEnemy.name} は回復を試みた！`);
            if (Math.random() < 0.5) {
              const newHp = Math.min(currEnemy.maxHp, currEnemy.hp + 20);
              addLog(`成功！ HPが 20 回復した！`);
              setEnemy({ ...currEnemy, hp: newHp });
            } else {
              addLog(`しかし失敗した…`);
            }
            return currPlayer;
          });
          return currEnemy;
        });
      }, 30000);
    } else if (targetEnemy.type === 'ushi') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currEnemy) => {
          setPlayer((currPlayer) => {
            if (currEnemy.hp <= 0 || currPlayer.hp <= 0) return currPlayer;

            addLog(`🦬 ${currEnemy.name} の突進攻撃！`);
            if (Math.random() < 0.25) {
              const nextHp = Math.max(0, currPlayer.hp - 25);
              addLog(`激突！ ${currPlayer.name} は 25 ダメージを受けた！`);
              if (nextHp <= 0) {
                setTimeout(() => handlePlayerDeath(), 100);
              }
              return { ...currPlayer, hp: nextHp };
            } else {
              addLog(`しかし交わされた！`);
            }
            return currPlayer;
          });
          return currEnemy;
        });
      }, 10000);
    }
  };

  const loadEnemy = (
    floorIdx = currentFloorIndex,
    enemyIdx = currentEnemyIndex,
    floorList = floors,
    _playerObj = player
  ) => {
    const floorData = floorList[floorIdx];
    if (!floorData || !floorData.enemies[enemyIdx]) return;
    const enemyData = floorData.enemies[enemyIdx];

    const newEnemy: Enemy = {
      name: enemyData.name,
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      atk: enemyData.atk,
      baseAtk: enemyData.atk,
      status: null,
      type: enemyData.type || '',
      bossType: enemyData.bossType || '',
      buffTurns: 0,
    };

    setEnemy(newEnemy);
    const bossTag = newEnemy.bossType ? `【${newEnemy.bossType}】` : '';
    addLog(`＞ ${bossTag}${newEnemy.name} が現れた！`);
    setControlsDisabled(false);
    startEnemyTimer(newEnemy);
  };

  // Player action handler
  const handlePlayerAction = (actionType: 'attack' | 'heal_skill' | 'atk_skill') => {
    setControlsDisabled(true);

    let nextPlayer = { ...player };
    let nextEnemy = { ...enemy };

    if (actionType === 'heal_skill') {
      const cost = nextPlayer.type === 'ドレイム' ? 7 : nextPlayer.type === 'ゾンビ' ? 4 : 2;
      if (nextPlayer.sp < cost) {
        addLog(`SPが足りません！（必要SP: ${cost}）`);
        setControlsDisabled(false);
        return;
      }

      if (nextPlayer.type === 'ゾンビ') {
        if (nextPlayer.deathZombies <= 0) {
          addLog(`デスゾンビがいません！発動に失敗しました。`);
          setControlsDisabled(false);
          return;
        }
        nextPlayer.sp -= cost;
        nextPlayer.deathZombies--;
        nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 30);
        addLog(`🧟 ${nextPlayer.name}の「ゾーンビー」！ デスゾンビを1体食べてHPが 30 回復した！`);
      } else {
        nextPlayer.sp -= cost;
        if (nextPlayer.type === 'ラリ') {
          nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 10);
          addLog(`${nextPlayer.name}の「油を蓄える」！ HPが 10 回復した！`);
        } else if (nextPlayer.type === 'オルゴン') {
          nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 20);
          addLog(`${nextPlayer.name}の「ライフフルーツ」！ HPが 20 回復した！`);
        } else if (nextPlayer.type === 'ドレイム') {
          const newMaxHp = getRandomInt(90, 120);
          nextPlayer.maxHp = newMaxHp;
          nextPlayer.hp = newMaxHp;
          addLog(`🔥 ${nextPlayer.name}の「ファイアハート」！ 最大HPが ${newMaxHp} に増え、全回復した！`);
        } else {
          nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 20);
          addLog(`${nextPlayer.name}の回復スキル！ HPが 20 回復した！`);
        }
      }
    } else if (actionType === 'atk_skill') {
      const cost =
        nextPlayer.type === 'ラリ'
          ? 3
          : nextPlayer.type === 'オルゴン'
          ? 4
          : nextPlayer.type === 'ゾンビ'
          ? 8
          : 3;
      if (nextPlayer.sp < cost) {
        addLog(`SPが足りません！（必要SP: ${cost}）`);
        setControlsDisabled(false);
        return;
      }
      nextPlayer.sp -= cost;

      if (nextPlayer.type === 'ラリ') {
        addLog(`${nextPlayer.name}の「抱きつく」！`);
        nextEnemy.status = { type: 'confused', turns: 999 };
        addLog(`${nextEnemy.name} は困惑した！`);
      } else if (nextPlayer.type === 'オルゴン') {
        addLog(`${nextPlayer.name}の「ダークアイス」！`);
        if (Math.random() < 0.45) {
          const turns = getRandomInt(2, 4);
          nextEnemy.status = { type: 'frozen', turns };
          addLog(`${nextEnemy.name} は凍結した！（${turns}ターン持続）`);
        } else {
          addLog(`しかし凍結しなかった…`);
        }
      } else if (nextPlayer.type === 'ドレイム') {
        addLog(`${nextPlayer.name}の「ドットフレイム」！`);
        const turns = getRandomInt(2, 4);
        nextEnemy.status = { type: 'burned', turns };
        addLog(`${nextEnemy.name} は火傷を負った！（${turns}ターン持続）`);
      } else if (nextPlayer.type === 'ゾンビ') {
        addLog(`☣️ ${nextPlayer.name}の「感染」！`);
        if (Math.random() < 0.01) {
          nextEnemy.hp = 0;
          addLog(`☠️ 一撃必殺！ 1%の確率が発動し、${nextEnemy.name} を一瞬で葬り去った！`);
        } else {
          nextPlayer.deathZombies++;
          addLog(`感染により、デスゾンビを1体召喚した！（所持数: ${nextPlayer.deathZombies}）`);
        }
      } else {
        const dmg = Math.floor(nextPlayer.atk * 1.5);
        nextEnemy.hp = Math.max(0, nextEnemy.hp - dmg);
        addLog(`${nextPlayer.name}の強力攻撃！ ${nextEnemy.name}に ${dmg} のダメージ。`);
      }
    } else if (actionType === 'attack') {
      nextEnemy.hp = Math.max(0, nextEnemy.hp - nextPlayer.atk);
      addLog(`${nextPlayer.name}の攻撃！ ${nextEnemy.name}に ${nextPlayer.atk} のダメージ。`);
    }

    nextPlayer.sp += 2;
    setPlayer(nextPlayer);
    setEnemy(nextEnemy);

    if (nextEnemy.hp <= 0) {
      checkEnemyDefeated(nextEnemy.name, nextEnemy.bossType);
      return;
    }

    setTimeout(() => {
      runEnemyTurn(nextPlayer, nextEnemy);
    }, 500);
  };

  const runEnemyTurn = (currentPlayer: Player, currentEnemy: Enemy) => {
    let p = { ...currentPlayer };
    let e = { ...currentEnemy };
    let isFrozenSkipped = false;

    // Buff turns
    if (e.buffTurns > 0) {
      e.buffTurns--;
      if (e.buffTurns <= 0) {
        e.atk = e.baseAtk;
        addLog(`${e.name} のバフ/デバフ効果が切れた。`);
      }
    }

    // Player burn
    if (p.status && p.status.type === 'burned') {
      p.hp = Math.max(0, p.hp - 2);
      p.status.turns--;
      addLog(`[火傷] ${p.name} は火傷で 2 ダメージ！`);
      if (p.status.turns <= 0) {
        p.status = null;
        addLog(`${p.name} の火傷が治った。`);
      }
      if (p.hp <= 0) {
        setPlayer(p);
        setEnemy(e);
        handlePlayerDeath(p);
        return;
      }
    }

    // Enemy status effect
    if (e.status) {
      if (e.status.type === 'burned') {
        e.hp = Math.max(0, e.hp - 2);
        e.status.turns--;
        addLog(`[火傷] ${e.name} は火傷で 2 ダメージ！`);
        if (e.status.turns <= 0) {
          e.status = null;
          addLog(`${e.name} の火傷が治った。`);
        }
      } else if (e.status.type === 'frozen') {
        if (Math.random() < 0.5) {
          e.hp = Math.max(0, e.hp - 5);
          addLog(`[凍結] ${e.name} は氷結の痛みに耐えている！ 5 ダメージ！`);
        } else {
          isFrozenSkipped = true;
          addLog(`[凍結] ${e.name} は凍りついて動けない！`);
        }
        e.status.turns--;
        if (e.status.turns <= 0) {
          e.status = null;
          addLog(`${e.name} の凍結が解けた。`);
        }
      }
    }

    if (e.hp <= 0) {
      setPlayer(p);
      setEnemy(e);
      checkEnemyDefeated(e.name, e.bossType);
      return;
    }

    if (isFrozenSkipped) {
      finishEnemyTurn(p, e);
      return;
    }

    // Enemy confused
    if (e.status && e.status.type === 'confused') {
      if (Math.random() < 0.3) {
        e.hp = Math.max(0, e.hp - e.atk);
        addLog(`[困惑] ${e.name} は困惑して自分自身を攻撃した！ ${e.atk} のダメージ！`);
        if (e.hp <= 0) {
          setPlayer(p);
          setEnemy(e);
          checkEnemyDefeated(e.name, e.bossType);
          return;
        }
        finishEnemyTurn(p, e);
        return;
      }
    }

    // Enemy attack
    if (e.type === 'obadora') {
      addLog(`👁️ ${e.name} の「アビス」！`);
      const rand = Math.random();
      if (rand < 0.25) {
        const turns = getRandomInt(3, 5);
        p.status = { type: 'bind', turns };
        addLog(`⛓️ ${p.name} は拘束された！（${turns}ターン行動不能）`);
      } else if (rand < 0.75) {
        const turns = getRandomInt(2, 4);
        p.status = { type: 'burned', turns };
        addLog(`🔥 ${p.name} は火傷を負った！`);
      } else {
        const dmg = getRandomInt(10, 17);
        p.hp = Math.max(0, p.hp - dmg);
        addLog(`⚰️ 〈棺桶をぶつける〉！ ${p.name}に ${dmg} のダメージ！`);
      }
    } else {
      p.hp = Math.max(0, p.hp - e.atk);
      addLog(`${e.name}の攻撃！ ${p.name}は ${e.atk} のダメージ。`);
    }

    if (p.hp <= 0) {
      setPlayer(p);
      setEnemy(e);
      handlePlayerDeath(p);
      return;
    }

    finishEnemyTurn(p, e);
  };

  const handlePlayerDeath = (targetPlayer = player) => {
    if (targetPlayer.type === 'ゾンビ' && !targetPlayer.hasRevived) {
      const revivedPlayer = { ...targetPlayer, hasRevived: true, hp: targetPlayer.maxHp };
      setPlayer(revivedPlayer);
      addLog(`💀 倒れた… しかし！【起死回生】が発動！ ${revivedPlayer.name} は全回復で蘇った！`);
      setControlsDisabled(false);
      return;
    }
    handleGameOver(targetPlayer.name);
  };

  const finishEnemyTurn = (p: Player, e: Enemy) => {
    let updatedPlayer = { ...p };

    if (updatedPlayer.status && updatedPlayer.status.type === 'bind') {
      updatedPlayer.status.turns--;
      if (updatedPlayer.status.turns <= 0) {
        updatedPlayer.status = null;
        addLog(`${updatedPlayer.name} の拘束が解けた！`);
      } else {
        addLog(`[拘束] ${updatedPlayer.name} は拘束されていて動けない！（残り${updatedPlayer.status.turns}ターン）`);
      }
    }

    setPlayer(updatedPlayer);
    setEnemy(e);

    setTimeout(() => {
      if (updatedPlayer.hp > 0 && e.hp > 0) {
        if (updatedPlayer.status && updatedPlayer.status.type === 'bind') {
          runEnemyTurn(updatedPlayer, e);
        } else {
          setControlsDisabled(false);
        }
      }
    }, 500);
  };

  const handleGameOver = (playerName = player.name) => {
    stopEnemyTimer();
    addLog(`💀 ${playerName} は倒れてしまった… GAME OVER`);
    setIsGameOver(true);
  };

  const checkEnemyDefeated = (enemyName: string, bossType: BossType) => {
    stopEnemyTimer();
    addLog(`★ ${enemyName} を倒した！`);

    let newGems = gems;
    if (bossType && BOSS_REWARDS[bossType]) {
      const reward = BOSS_REWARDS[bossType];
      newGems += reward;
      setGems(newGems);
      addLog(`💎 **【${bossType}撃破報酬】 ダイヤを ${reward} 個獲得！ (合計: ${newGems}個)**`);
    }

    let unlockedHome = isHomeUnlocked;
    if (currentFloorIndex === 2 && enemyName === 'フレアスライム') {
      unlockedHome = true;
      setIsHomeUnlocked(true);
      addLog(`✨ **第3階層クリア！ ホーム機能が解放されました！**`);
    }

    const nextEnemyIdx = currentEnemyIndex + 1;
    if (nextEnemyIdx < floors[currentFloorIndex].enemies.length) {
      setCurrentEnemyIndex(nextEnemyIdx);
      saveGame({
        gems: newGems,
        currentEnemyIndex: nextEnemyIdx,
        isHomeUnlocked: unlockedHome,
      });
      setTimeout(() => {
        loadEnemy(currentFloorIndex, nextEnemyIdx);
      }, 500);
    } else {
      const nextFloorIdx = currentFloorIndex + 1;
      setCurrentFloorIndex(nextFloorIdx);
      setCurrentEnemyIndex(0);
      saveGame({
        gems: newGems,
        currentFloorIndex: nextFloorIdx,
        currentEnemyIndex: 0,
        isHomeUnlocked: unlockedHome,
      });

      if (nextFloorIdx < floors.length) {
        if (unlockedHome) setShowHomeBtn(true);
        setShowNextBtn(true);
      } else {
        addLog('🎉 **ダンジョン全階層制覇！おめでとうございます！**');
        setIsGameOver(true);
      }
    }
  };

  const goToHome = () => {
    stopEnemyTimer();
    const healedPlayer: Player = { ...player, hp: player.maxHp, status: null };
    setPlayer(healedPlayer);
    setCurrentScreen('home');
    setHomeLogs([`🏠 ホームに戻りました。 ${healedPlayer.name} のHPが全回復しました！`]);
    saveGame({ player: healedPlayer });
  };

  const returnToDungeon = () => {
    setCurrentScreen('game');
    setShowHomeBtn(false);
    setShowNextBtn(false);
    loadEnemy(currentFloorIndex, 0);
  };

  const nextStage = () => {
    setShowNextBtn(false);
    setShowHomeBtn(false);
    loadEnemy(currentFloorIndex, 0);
  };

  const handleRestart = () => {
    stopEnemyTimer();
    setCurrentScreen('setup');
    setIsGameOver(false);
    setShowNextBtn(false);
    setShowHomeBtn(false);
    setControlsDisabled(false);
  };

  // Gacha logic
  const drawGacha = (count: number) => {
    const cost = count === 10 ? 480 : 50;
    if (gems < cost) {
      addHomeLog(`❌ ダイヤが足りません！（所持: 💎${gems} / 必要: 💎${cost}）`);
      return;
    }

    const nextGems = gems - cost;
    setGems(nextGems);
    addHomeLog(`✨ **ガチャを ${count} 回引きました！ (消費: 💎${cost}個)**`);

    let newMonsters = [...playerSelectableMonsters];

    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100;
      let rank: 'UR' | 'SSR' | 'SR' | 'R' | 'N' = 'N';
      if (rand < gachaRates.UR) rank = 'UR';
      else if (rand < gachaRates.UR + gachaRates.SSR) rank = 'SSR';
      else if (rand < gachaRates.UR + gachaRates.SSR + gachaRates.SR) rank = 'SR';
      else if (rand < gachaRates.UR + gachaRates.SSR + gachaRates.SR + gachaRates.R) rank = 'R';
      else rank = 'N';

      const pool = gachaPool[rank];
      if (!pool || pool.length === 0) {
        addHomeLog(`🎁 [${rank}] 当選 (キャラクター未実装)`);
        continue;
      }

      const drawnChar = pool[Math.floor(Math.random() * pool.length)];
      addHomeLog(`🎁 **[${rank}] ${drawnChar.name}** を獲得！`);

      if (!newMonsters.some((m) => m.name === drawnChar.name)) {
        newMonsters.push(drawnChar);
        addHomeLog(`💡 新モンスター 『${drawnChar.name}』 が仲間になりました！`);
      }
    }

    setPlayerSelectableMonsters(newMonsters);
    saveGame({ gems: nextGems, playerSelectableMonsters: newMonsters });
  };

  const openEnhanceNotice = () => {
    addHomeLog('🛠️ **強化機能は現在開発中です！今後のアップデートをお楽しみに！**');
  };

  // Admin Room functions
  const checkAdminCode = () => {
    if (adminCodeInput === ADMIN_CODE) {
      setIsAdminLoggedIn(true);
    } else {
      alert('コードが間違っています。');
    }
  };

  const adminFullHeal = () => {
    const healed = { ...player, hp: player.maxHp, sp: player.sp + 10 };
    setPlayer(healed);
    saveGame({ player: healed });
    addLog(`🔧 **[管理者コマンド] HPが全回復し、SPが+10されました！**`);
    alert('プレイヤーを回復しました');
  };

  const adminAddGems = () => {
    const val = parseInt(adminSetGems, 10);
    if (isNaN(val)) return alert('数値を入力してください');
    const newG = gems + val;
    setGems(newG);
    saveGame({ gems: newG });
    addLog(`🔧 **[管理者コマンド] ダイヤを ${val} 個追加しました！ (合計: ${newG}個)**`);
    alert(`ダイヤを ${val} 個追加しました`);
    setAdminSetGems('');
  };

  const adminSetAtkValue = () => {
    const val = parseInt(adminSetAtk, 10);
    if (isNaN(val)) return alert('数値を入力してください');
    const updated = { ...player, atk: val };
    setPlayer(updated);
    saveGame({ player: updated });
    addLog(`🔧 **[管理者コマンド] 攻撃力を ${val} に書き換えました！**`);
    alert(`攻撃力を ${val} にセットしました`);
    setAdminSetAtk('');
  };

  const adminAddSelectableMonster = () => {
    if (!adminCustomMName.trim()) return alert('名前を入力してください');
    const newM: MonsterProfile = {
      name: adminCustomMName.trim(),
      hp: adminCustomMHp,
      atk: adminCustomMAtk,
      type: adminCustomMType,
      rank: 'カスタム',
    };
    const updated = [...playerSelectableMonsters, newM];
    setPlayerSelectableMonsters(updated);
    saveGame({ playerSelectableMonsters: updated });
    alert(`初期選択リストに ${newM.name} (タイプ:${newM.type}) を追加しました！`);
    setAdminCustomMName('');
  };

  const updateGachaRates = () => {
    if (isNaN(rateUrInput) || isNaN(rateSsrInput)) return alert('有効な数字を入力してください');
    setGachaRates((prev) => ({
      ...prev,
      UR: rateUrInput,
      SSR: rateSsrInput,
    }));
    alert(`ガチャ確率を更新しました (UR:${rateUrInput}%, SSR:${rateSsrInput}%)`);
  };

  const addCustomEnemy = () => {
    if (!newEnemyName.trim()) return alert('名前を入力してください');
    if (isNaN(newEnemyFloorSelect)) return alert('階層を選択してください');

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

    setFloors(updatedFloors);
    saveGame({ floors: updatedFloors });
    alert(
      `${floors[newEnemyFloorSelect]?.name} に ${newEnemyName.trim()} (タイプ: ${
        newEnemyType || '通常'
      }) を追加しました！`
    );
    setNewEnemyName('');
  };

  const addCustomGachaChar = () => {
    if (!newGachaName.trim()) return alert('名前を入力してください');
    const newChar: MonsterProfile = {
      name: newGachaName.trim(),
      hp: newGachaHp,
      atk: newGachaAtk,
      type: newGachaType,
      rank: newGachaRank,
    };
    const updatedPool = {
      ...gachaPool,
      [newGachaRank]: [...(gachaPool[newGachaRank] || []), newChar],
    };
    setGachaPool(updatedPool);
    alert(`ガチャプール [${newGachaRank}] に ${newChar.name} (タイプ:${newChar.type}) を追加しました！`);
    setNewGachaName('');
  };

  const addNewFloor = () => {
    const num = floors.length + 1;
    const newFloor: Floor = {
      name: `第${num}階層`,
      enemies: [{ name: 'カスタムモンスター', hp: 150, atk: 10 }],
    };
    const updated = [...floors, newFloor];
    setFloors(updated);
    saveGame({ floors: updated });
    alert(`第${num}階層 を追加しました！`);
  };

  // Skill button texts
  const getHealBtnText = () => {
    if (player.type === 'ラリ') return '油を蓄える (消費SP2/回復10)';
    if (player.type === 'オルゴン') return 'ライフフルーツ (消費SP2/回復20)';
    if (player.type === 'ドレイム') return 'ファイアハート (消費SP7/全回復&最大HPUP)';
    if (player.type === 'ゾンビ') return 'ゾーンビー (消費SP4/デスゾンビ消費でHP30回復)';
    return '回復スキル (消費SP2/回復20)';
  };

  const getAtkSkillBtnText = () => {
    if (player.type === 'ラリ') return '抱きつく (消費SP3/困惑)';
    if (player.type === 'オルゴン') return 'ダークアイス (消費SP4/凍結)';
    if (player.type === 'ドレイム') return 'ドットフレイム (消費SP1/火傷)';
    if (player.type === 'ゾンビ') return '感染 (消費SP8/1%即死orデスゾンビ召喚)';
    return '特殊攻撃スキル (消費SP3)';
  };

  const getStatusEffectText = (status: StatusEffect | null) => {
    if (!status) return 'なし';
    if (status.type === 'bind') return `拘束 (残${status.turns}T)`;
    if (status.type === 'burned') return `火傷 (残${status.turns}T)`;
    if (status.type === 'confused') return '困惑';
    if (status.type === 'frozen') return `凍結 (残${status.turns}T)`;
    return 'なし';
  };

  const isBtnDisabled = controlsDisabled || player.status?.type === 'bind';

  return (
    <div className="flex justify-center items-center min-h-screen p-2.5 sm:p-4 select-none">
      <div
        id="game-container"
        className="bg-[#1e1e1e] border-2 border-[#333] rounded-xl p-5 w-full max-w-[450px] shadow-[0_8px_24px_rgba(0,0,0,0.6)] relative"
      >
        <button
          className="admin-btn absolute top-3.5 right-3.5 text-[10px] px-2 py-1 bg-[#444] hover:bg-[#555] text-white border border-[#555] rounded cursor-pointer"
          onClick={() => setIsAdminModalOpen(true)}
        >
          管理者
        </button>
        <h1 className="text-center m-0 text-xl font-bold text-[#f0a500] border-b-2 border-[#333] pb-2.5">
          階層ダンジョン
        </h1>

        {/* 1. Login Screen */}
        {currentScreen === 'login' && (
          <div id="login-screen" className="mt-4">
            <div className="input-group text-left mb-3">
              <label className="text-xs text-[#aaa] block mb-1">
                冒険者名（ネームタグ） <span className="text-[#ff5555]">*必須</span>
              </label>
              <input
                type="text"
                value={playerTagInput}
                onChange={(e) => setPlayerTagInput(e.target.value)}
                placeholder="例: 勇者ポテト"
                className="w-full p-2.5 bg-[#2a2a2a] border border-[#555] text-white rounded-md text-sm outline-none focus:border-[#f0a500]"
              />
            </div>
            <div className="input-group text-left mb-3">
              <label className="text-xs text-[#aaa] block mb-1">
                パスワード <span className="text-[#888]">(任意: 設定するとセーブ機能が有効化)</span>
              </label>
              <input
                type="password"
                value={playerPassInput}
                onChange={(e) => setPlayerPassInput(e.target.value)}
                placeholder="未入力でも開始可能"
                className="w-full p-2.5 bg-[#2a2a2a] border border-[#555] text-white rounded-md text-sm outline-none focus:border-[#f0a500]"
              />
            </div>
            <button
              onClick={submitNameTag}
              className="w-full bg-[#27ae60] hover:bg-[#2ecc71] text-white font-bold p-2.5 rounded-md text-sm cursor-pointer transition-colors"
            >
              冒険を開始 / データをロード
            </button>
          </div>
        )}

        {/* 2. Setup / Character Select Screen */}
        {currentScreen === 'setup' && (
          <div id="setup-screen" className="mt-4">
            <p className="text-center text-[#aaa] text-sm mb-3">
              <span className="text-[#f0a500]">{userTag}</span> さん
              <br />
              最初のモンスターを選んでください：
            </p>
            <div className="flex flex-col gap-2" id="monster-select-list">
              {playerSelectableMonsters.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => selectMonster(m.name, m.hp, m.atk, m.type)}
                  className="bg-[#3a3a3a] hover:bg-[#555] text-white border border-[#555] p-2.5 text-xs sm:text-[13px] font-bold rounded-md cursor-pointer transition-all duration-200 text-left"
                >
                  {m.name} (HP:{m.hp} / 攻:{m.atk} / 能力:{m.type})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Home Screen */}
        {currentScreen === 'home' && (
          <div id="home-screen" className="mt-2.5">
            <h2 className="text-center mt-2.5 mb-2.5 text-base font-bold text-[#cccccc]">
              🏠 <span className="text-[#f0a500]">{userTag}</span> のホーム
            </h2>

            <div className="home-box bg-[#252525] border border-[#444] rounded-lg p-3 mb-3 text-center">
              <div className="text-base font-bold text-[#00cec9]">
                所持ダイヤ: 💎 <span id="home-gems">{gems}</span> 個
              </div>
            </div>

            <div className="home-box bg-[#252525] border border-[#444] rounded-lg p-3 mb-3">
              <div className="text-[13px] font-bold text-[#f0a500] text-left mb-1">
                🐾 所持モンスター一覧
              </div>
              <div
                className="monster-list-box max-h-[110px] overflow-y-auto bg-[#1a1a1a] border border-[#333] rounded p-2 text-left space-y-1"
                id="my-monster-list"
              >
                {playerSelectableMonsters.map((m, idx) => (
                  <div
                    key={idx}
                    className="monster-item text-xs py-1 px-1.5 border-b border-[#2a2a2a] last:border-b-0 flex justify-between items-center"
                  >
                    <span>
                      <strong>{m.name}</strong>{' '}
                      <span className={`tag-rank font-bold px-1 py-0.5 rounded text-[10px] rank-${m.rank}`}>
                        {m.rank}
                      </span>
                    </span>
                    <span className="text-[#aaa]">
                      HP:{m.hp} / 攻:{m.atk} [{m.type}]
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-box bg-[#252525] border border-[#444] rounded-lg p-3 mb-3 text-center">
              <div className="flex flex-col gap-2">
                <div className="action-btns grid grid-cols-2 gap-2">
                  <button
                    onClick={() => drawGacha(1)}
                    className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white p-2 text-xs font-bold rounded cursor-pointer transition-colors"
                  >
                    🎁 単発ガチャ
                    <br />
                    <small>(💎50個)</small>
                  </button>
                  <button
                    onClick={() => drawGacha(10)}
                    className="bg-[#6c5ce7] hover:bg-[#a29bfe] text-white p-2 text-xs font-bold rounded cursor-pointer transition-colors"
                  >
                    🎁 10連ガチャ
                    <br />
                    <small>(💎480個)</small>
                  </button>
                </div>
                <button
                  onClick={openEnhanceNotice}
                  className="bg-[#2980b9] hover:bg-[#3498db] text-white p-2 text-xs font-bold rounded cursor-pointer transition-colors"
                >
                  ⚔️ モンスター強化 (開発中)
                </button>
              </div>
            </div>

            <div
              className="log-box bg-[#0d0d0d] border border-[#333] h-[140px] overflow-y-auto p-2.5 text-[13px] leading-relaxed mb-3.5 rounded-md"
              ref={homeLogBoxRef}
            >
              {homeLogs.map((log, index) => (
                <p key={index} className="my-[3px] text-[#e0e0e0] break-words">
                  {log}
                </p>
              ))}
            </div>

            <button
              onClick={returnToDungeon}
              className="w-full bg-[#27ae60] hover:bg-[#2ecc71] text-white font-bold p-2.5 rounded-md text-sm cursor-pointer transition-colors"
            >
              ダンジョン攻略を再開する
            </button>
          </div>
        )}

        {/* 4. Dungeon / Game Screen */}
        {currentScreen === 'game' && (
          <div id="game-screen" className="mt-2.5">
            <h2 id="floor-title" className="text-center mt-2.5 mb-2.5 text-base font-bold text-[#cccccc]">
              {floors[currentFloorIndex]?.name}
            </h2>

            {/* Player Status */}
            <div className="status-box bg-[#2a2a2a] border border-[#444] p-2.5 px-3.5 mb-2.5 rounded-lg text-sm">
              <div className="status-row flex justify-between mb-1">
                <strong>
                  【<span className="text-[#f0a500]">{userTag}</span>】{' '}
                  <span id="player-name">{player.name}</span>
                </strong>
                <span className="sp-bar text-[#00d2d3] font-bold">
                  SP: <span id="player-sp">{player.sp}</span> pt
                </span>
              </div>
              <div className="status-row flex justify-between mb-1">
                <span className="hp-bar text-[#ff5555] font-bold">
                  HP: <span id="player-hp">{player.hp}</span> / <span id="player-max-hp">{player.maxHp}</span>
                </span>
                <span className="gem-bar text-[#00cec9] font-bold">
                  💎 <span id="dungeon-gems">{gems}</span>
                </span>
              </div>
              <div className="status-effect text-[#fabca1] text-[13px] font-bold" id="player-status">
                状態: {getStatusEffectText(player.status)}
              </div>
              {player.type === 'ゾンビ' && (
                <div id="zombie-summons" className="text-[11px] text-[#a29bfe] mt-0.5 font-bold">
                  召喚デスゾンビ: <span id="death-zombie-count">{player.deathZombies}</span>体
                </div>
              )}
            </div>

            {/* Enemy Status */}
            <div className="status-box bg-[#2a2a2a] border border-[#444] p-2.5 px-3.5 mb-2.5 rounded-lg text-sm">
              <div className="status-row flex justify-between mb-1">
                <strong>
                  【敵】{' '}
                  <span id="enemy-name">
                    {enemy.bossType ? `【${enemy.bossType}】` : ''}
                    {enemy.name}
                  </span>
                </strong>
                <span className="status-effect text-[#fabca1] text-[13px] font-bold" id="enemy-status">
                  状態: {getStatusEffectText(enemy.status)}
                </span>
              </div>
              <div className="hp-bar text-[#ff5555] font-bold">
                HP: <span id="enemy-hp">{enemy.hp}</span> / <span id="enemy-max-hp">{enemy.maxHp}</span>
              </div>
            </div>

            {/* Log Box */}
            <div
              id="log-box"
              ref={logBoxRef}
              className="log-box bg-[#0d0d0d] border border-[#333] h-[140px] overflow-y-auto p-2.5 text-[13px] leading-relaxed mb-3.5 rounded-md"
            >
              {logs.map((log, index) => (
                <p key={index} className="my-[3px] text-[#e0e0e0] break-words">
                  {log}
                </p>
              ))}
            </div>

            {/* Battle Controls */}
            {!showNextBtn && !isGameOver && (
              <div id="battle-controls" className="btn-group flex flex-col gap-2">
                <div className="action-btns grid grid-cols-2 gap-2">
                  <button
                    id="atk-btn"
                    disabled={isBtnDisabled}
                    onClick={() => handlePlayerAction('attack')}
                    className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] disabled:border-[#333] disabled:cursor-not-allowed text-white border border-[#555] hover:border-[#777] p-2.5 text-xs sm:text-[13px] font-bold rounded-md cursor-pointer transition-all duration-200"
                  >
                    通常攻撃
                  </button>
                  <button
                    id="heal-btn"
                    disabled={isBtnDisabled}
                    onClick={() => handlePlayerAction('heal_skill')}
                    className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] disabled:border-[#333] disabled:cursor-not-allowed text-white border border-[#555] hover:border-[#777] p-2.5 text-xs sm:text-[13px] font-bold rounded-md cursor-pointer transition-all duration-200 truncate"
                  >
                    {getHealBtnText()}
                  </button>
                </div>
                <button
                  id="atk-skill-btn"
                  disabled={isBtnDisabled}
                  onClick={() => handlePlayerAction('atk_skill')}
                  className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] disabled:border-[#333] disabled:cursor-not-allowed text-white border border-[#555] hover:border-[#777] p-2.5 text-xs sm:text-[13px] font-bold rounded-md cursor-pointer transition-all duration-200 truncate"
                >
                  {getAtkSkillBtnText()}
                </button>
              </div>
            )}

            {/* Navigation / Next Stage / Restart */}
            <div className="btn-group flex flex-col gap-2 mt-2.5">
              {showHomeBtn && isHomeUnlocked && (
                <button
                  id="home-btn"
                  onClick={goToHome}
                  className="bg-[#d35400] hover:bg-[#e67e22] text-white font-bold p-2.5 rounded-md text-sm cursor-pointer transition-colors shadow-md"
                >
                  🏠 ホームへ行く
                </button>
              )}

              {showNextBtn && (
                <button
                  id="next-btn"
                  onClick={nextStage}
                  className="bg-[#f0a500] hover:bg-[#e09400] text-[#121212] font-black p-2.5 rounded-md text-sm cursor-pointer transition-all shadow-md"
                >
                  次の階層へ
                </button>
              )}

              {isGameOver && (
                <button
                  id="restart-btn"
                  onClick={handleRestart}
                  className="bg-[#3a3a3a] hover:bg-[#555] text-white border border-[#555] hover:border-[#777] p-2.5 text-sm font-bold rounded-md cursor-pointer transition-all duration-200"
                >
                  最初からやり直す
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin Modal */}
      {isAdminModalOpen && (
        <div className="modal fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
          <div className="modal-content bg-[#222] border border-[#555] p-5 rounded-xl w-[90%] max-w-[420px] max-h-[85vh] overflow-y-auto text-white shadow-2xl relative">
            <span
              className="float-right cursor-pointer text-gray-400 hover:text-white text-lg font-bold"
              onClick={() => setIsAdminModalOpen(false)}
            >
              ✕
            </span>

            {!isAdminLoggedIn ? (
              <div id="admin-login-view" className="mt-2">
                <h3 className="text-base font-bold mb-3">管理者ログイン</h3>
                <input
                  type="password"
                  value={adminCodeInput}
                  onChange={(e) => setAdminCodeInput(e.target.value)}
                  placeholder="パスワードを入力"
                  className="w-full p-2 mb-2.5 bg-[#333] border border-[#555] text-white text-xs rounded outline-none"
                />
                <button
                  onClick={checkAdminCode}
                  className="w-full bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2 text-xs rounded cursor-pointer"
                >
                  ログイン
                </button>
              </div>
            ) : (
              <div id="admin-room-view" className="mt-2 text-left">
                <h3 className="text-sm font-bold mb-2.5">🛠️ 仕様変更・管理者ルーム</h3>
                <div className="flex flex-wrap gap-1 mb-3">
                  <button
                    className={`tab-btn px-2 py-1 text-[10px] rounded cursor-pointer ${
                      adminTab === 'status' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                    }`}
                    onClick={() => setAdminTab('status')}
                  >
                    ステータス調整
                  </button>
                  <button
                    className={`tab-btn px-2 py-1 text-[10px] rounded cursor-pointer ${
                      adminTab === 'enemy' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                    }`}
                    onClick={() => setAdminTab('enemy')}
                  >
                    敵追加
                  </button>
                  <button
                    className={`tab-btn px-2 py-1 text-[10px] rounded cursor-pointer ${
                      adminTab === 'gacha' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                    }`}
                    onClick={() => setAdminTab('gacha')}
                  >
                    ガチャ調整
                  </button>
                  <button
                    className={`tab-btn px-2 py-1 text-[10px] rounded cursor-pointer ${
                      adminTab === 'floor' ? 'bg-[#f0a500] text-black font-bold' : 'bg-[#333] text-white'
                    }`}
                    onClick={() => setAdminTab('floor')}
                  >
                    階層追加
                  </button>
                </div>

                {/* Tab 1: Status Adjustments */}
                {adminTab === 'status' && (
                  <div id="tab-status" className="text-xs space-y-2">
                    <p className="text-[11px] text-[#aaa] m-0">
                      戦闘中のステータスや仕様を直接書き換えます。
                    </p>
                    <button
                      onClick={adminFullHeal}
                      className="w-full bg-[#27ae60] hover:bg-[#2ecc71] text-white font-bold p-2 rounded cursor-pointer"
                    >
                      💖 プレイヤー全回復＆SP+10
                    </button>
                    <div>
                      <label className="block text-[11px] text-[#aaa]">ダイヤ付与:</label>
                      <input
                        type="number"
                        value={adminSetGems}
                        onChange={(e) => setAdminSetGems(e.target.value)}
                        placeholder="例: 500"
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      />
                      <button
                        onClick={adminAddGems}
                        className="w-full mt-1 bg-[#3a3a3a] hover:bg-[#555] text-white p-1.5 rounded font-bold"
                      >
                        ダイヤを追加
                      </button>
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#aaa]">攻撃力変更:</label>
                      <input
                        type="number"
                        value={adminSetAtk}
                        onChange={(e) => setAdminSetAtk(e.target.value)}
                        placeholder="例: 999"
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      />
                      <button
                        onClick={adminSetAtkValue}
                        className="w-full mt-1 bg-[#3a3a3a] hover:bg-[#555] text-white p-1.5 rounded font-bold"
                      >
                        攻撃力を適用
                      </button>
                    </div>
                    <hr className="border-[#444] my-2" />
                    <div>
                      <label className="block text-[11px] text-[#aaa] font-bold">
                        新スタートモンスターの追加:
                      </label>
                      <input
                        type="text"
                        value={adminCustomMName}
                        onChange={(e) => setAdminCustomMName(e.target.value)}
                        placeholder="名前"
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      />
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <input
                          type="number"
                          value={adminCustomMHp}
                          onChange={(e) => setAdminCustomMHp(parseInt(e.target.value, 10) || 0)}
                          placeholder="HP"
                          className="p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                        />
                        <input
                          type="number"
                          value={adminCustomMAtk}
                          onChange={(e) => setAdminCustomMAtk(parseInt(e.target.value, 10) || 0)}
                          placeholder="攻撃力"
                          className="p-2 bg-[#333] border border-[#555] text-white rounded text-xs"
                        />
                      </div>
                      <label className="block text-[11px] text-[#aaa] mt-1">能力（タイプ）:</label>
                      <select
                        value={adminCustomMType}
                        onChange={(e) => setAdminCustomMType(e.target.value as AbilityType)}
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      >
                        <option value="オルゴン">オルゴン (凍結/ライフフルーツ)</option>
                        <option value="ラリ">ラリ (困惑/油蓄え)</option>
                        <option value="ドレイム">ドレイム (火傷/全回復&最大HPUP)</option>
                        <option value="ゾンビ">ゾンビ (即死or召喚/ゾーンビー)</option>
                        <option value="ノーマル">なし (通常の攻撃・回復スキル)</option>
                      </select>
                      <button
                        onClick={adminAddSelectableMonster}
                        className="w-full mt-2 bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2 rounded cursor-pointer"
                      >
                        初期選択可能リストに追加
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 2: Enemy Addition */}
                {adminTab === 'enemy' && (
                  <div id="tab-enemy" className="text-xs space-y-2">
                    <div>
                      <label className="block text-[11px] text-[#aaa]">配置先の階層を選択:</label>
                      <select
                        value={newEnemyFloorSelect}
                        onChange={(e) => setNewEnemyFloorSelect(parseInt(e.target.value, 10))}
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      >
                        {floors.map((fl, idx) => (
                          <option key={idx} value={idx}>
                            {fl.name} (現在 {fl.enemies.length} 体)
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
                        placeholder="名前"
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
                      <label className="block text-[11px] text-[#aaa]">特殊行動パターン（能力）:</label>
                      <select
                        value={newEnemyType}
                        onChange={(e) =>
                          setNewEnemyType(e.target.value as 'golem' | 'enon' | 'ushi' | 'obadora' | '')
                        }
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      >
                        <option value="">なし (通常の攻撃のみ)</option>
                        <option value="golem">ドラッグ飲む (回復 & 攻撃UP/ダウン)</option>
                        <option value="enon">自己回復を試みる</option>
                        <option value="ushi">突進攻撃 (25ダメ)</option>
                        <option value="obadora">アビス (拘束 / 火傷 / 固定ダメ)</option>
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
                      onClick={addCustomEnemy}
                      className="w-full mt-2 bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2 rounded cursor-pointer"
                    >
                      指定した階層に敵を追加
                    </button>
                  </div>
                )}

                {/* Tab 3: Gacha Adjustments */}
                {adminTab === 'gacha' && (
                  <div id="tab-gacha" className="text-xs space-y-2">
                    <p className="text-[11px] text-[#aaa] m-0">ガチャ確率（%）を設定します。</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] text-[#aaa]">UR(%):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={rateUrInput}
                          onChange={(e) => setRateUrInput(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#aaa]">SSR(%):</label>
                        <input
                          type="number"
                          step="0.1"
                          value={rateSsrInput}
                          onChange={(e) => setRateSsrInput(parseFloat(e.target.value) || 0)}
                          className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                        />
                      </div>
                    </div>
                    <button
                      onClick={updateGachaRates}
                      className="w-full bg-[#3a3a3a] hover:bg-[#555] text-white font-bold p-1.5 rounded cursor-pointer"
                    >
                      確率を更新
                    </button>
                    <hr className="border-[#444] my-2" />
                    <div>
                      <label className="block text-[11px] text-[#aaa] font-bold">ガチャキャラ追加:</label>
                      <input
                        type="text"
                        value={newGachaName}
                        onChange={(e) => setNewGachaName(e.target.value)}
                        placeholder="名前"
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      />
                      <label className="block text-[11px] text-[#aaa] mt-1">レアリティ:</label>
                      <select
                        value={newGachaRank}
                        onChange={(e) =>
                          setNewGachaRank(e.target.value as 'N' | 'R' | 'SR' | 'SSR' | 'UR')
                        }
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      >
                        <option value="N">N</option>
                        <option value="R">R</option>
                        <option value="SR">SR</option>
                        <option value="SSR">SSR</option>
                        <option value="UR">UR</option>
                      </select>
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
                      <label className="block text-[11px] text-[#aaa] mt-1">能力（タイプ）:</label>
                      <select
                        value={newGachaType}
                        onChange={(e) => setNewGachaType(e.target.value as AbilityType)}
                        className="w-full p-2 bg-[#333] border border-[#555] text-white rounded text-xs mt-1"
                      >
                        <option value="オルゴン">オルゴン (凍結/ライフフルーツ)</option>
                        <option value="ラリ">ラリ (困惑/油蓄え)</option>
                        <option value="ドレイム">ドレイム (火傷/全回復&最大HPUP)</option>
                        <option value="ゾンビ">ゾンビ (即死or召喚/ゾーンビー)</option>
                        <option value="ノーマル">なし (通常の攻撃・回復スキル)</option>
                      </select>
                      <button
                        onClick={addCustomGachaChar}
                        className="w-full mt-2 bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2 rounded cursor-pointer"
                      >
                        ガチャプールに追加
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 4: Floor Addition */}
                {adminTab === 'floor' && (
                  <div id="tab-floor" className="text-xs space-y-3">
                    <p className="text-xs">現在の階層数: {floors.length}</p>
                    <button
                      onClick={addNewFloor}
                      className="w-full bg-[#f0a500] hover:bg-[#e09400] text-black font-bold p-2.5 rounded cursor-pointer"
                    >
                      末尾に新階層を追加
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

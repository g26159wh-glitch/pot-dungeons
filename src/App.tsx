import React, { useState, useEffect, useRef } from 'react';
import {
  Player,
  Enemy,
  AbilityType,
  MonsterProfile,
  Floor,
  GachaRates,
  StatusEffect,
  GachaPullResult,
} from './types';
import {
  BOSS_REWARDS,
  RARITY_REFUND_GEMS,
  RARITY_DEFAULT_MAX_LEVEL,
  DEFAULT_PLAYER_SELECTABLE_MONSTERS,
  DEFAULT_GACHA_POOL,
  DEFAULT_FLOORS,
} from './data/gameData';
import { GachaModal } from './components/GachaModal';
import { TransferModal } from './components/TransferModal';
import { EnhanceModal } from './components/EnhanceModal';
import { AdminModal } from './components/AdminModal';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'login' | 'setup' | 'home' | 'game'>('login');

  // User state
  const [userTag, setUserTag] = useState('冒険者');
  const [userPass, setUserPass] = useState('');
  const [playerTagInput, setPlayerTagInput] = useState('');
  const [playerPassInput, setPlayerPassInput] = useState('');
  const [gems, setGems] = useState(0);
  const [isHomeUnlocked, setIsHomeUnlocked] = useState(false);

  // Monsters, Gacha, Floors
  const [playerSelectableMonsters, setPlayerSelectableMonsters] = useState<MonsterProfile[]>(
    DEFAULT_PLAYER_SELECTABLE_MONSTERS
  );
  const [gachaPool, setGachaPool] = useState(DEFAULT_GACHA_POOL);
  const [floors, setFloors] = useState<Floor[]>(DEFAULT_FLOORS);
  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);

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
    level: 1,
    maxLevel: 10,
    rank: '初期',
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

  // Modals state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isGachaModalOpen, setIsGachaModalOpen] = useState(false);
  const [gachaResults, setGachaResults] = useState<GachaPullResult[]>([]);
  const [gachaTotalRefund, setGachaTotalRefund] = useState(0);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);

  const logBoxRef = useRef<HTMLDivElement>(null);
  const homeLogBoxRef = useRef<HTMLDivElement>(null);
  const enemyTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (homeLogBoxRef.current) {
      homeLogBoxRef.current.scrollTop = homeLogBoxRef.current.scrollHeight;
    }
  }, [homeLogs]);

  useEffect(() => {
    return () => {
      if (enemyTimerRef.current) clearInterval(enemyTimerRef.current);
    };
  }, []);

  const addLog = (text: string) => {
    setLogs((prev) => [...prev, text]);
  };

  const addHomeLog = (text: string) => {
    setHomeLogs((prev) => [...prev, text]);
  };

  const stopEnemyTimer = () => {
    if (enemyTimerRef.current) {
      clearInterval(enemyTimerRef.current);
      enemyTimerRef.current = null;
    }
  };

  // Save / Load logic
  const saveGame = (
    overrideFields?: Partial<{
      gems: number;
      currentFloorIndex: number;
      currentEnemyIndex: number;
      isHomeUnlocked: boolean;
      playerSelectableMonsters: MonsterProfile[];
      player: Player;
      floors: Floor[];
    }>
  ) => {
    if (!userTag) return;
    const dataToSave = {
      userTag,
      userPass,
      gems: overrideFields?.gems !== undefined ? overrideFields.gems : gems,
      currentFloorIndex:
        overrideFields?.currentFloorIndex !== undefined
          ? overrideFields.currentFloorIndex
          : currentFloorIndex,
      currentEnemyIndex:
        overrideFields?.currentEnemyIndex !== undefined
          ? overrideFields.currentEnemyIndex
          : currentEnemyIndex,
      isHomeUnlocked:
        overrideFields?.isHomeUnlocked !== undefined
          ? overrideFields.isHomeUnlocked
          : isHomeUnlocked,
      playerSelectableMonsters:
        overrideFields?.playerSelectableMonsters || playerSelectableMonsters,
      player: overrideFields?.player || player,
      floors: overrideFields?.floors || floors,
    };
    try {
      localStorage.setItem(`monster_rpg_save_${userTag}`, JSON.stringify(dataToSave));
    } catch {
      // ignore
    }
  };

  const loadGameData = (tag: string) => {
    const raw = localStorage.getItem(`monster_rpg_save_${tag}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  // Login handler
  const handleLogin = () => {
    const tag = playerTagInput.trim();
    const pass = playerPassInput.trim();

    if (!tag) {
      alert('ネームタグを入力してください！');
      return;
    }

    setUserTag(tag);
    setUserPass(pass);

    const saved = loadGameData(tag);
    if (saved) {
      if (saved.userPass && saved.userPass !== pass) {
        alert('パスワードが一致しません！');
        return;
      }
      const loadedGems = saved.gems || 0;
      setGems(loadedGems);
      setCurrentFloorIndex(saved.currentFloorIndex || 0);
      setCurrentEnemyIndex(saved.currentEnemyIndex || 0);
      setIsHomeUnlocked(saved.isHomeUnlocked ?? true);
      const loadedMonsters = saved.playerSelectableMonsters || DEFAULT_PLAYER_SELECTABLE_MONSTERS;
      setPlayerSelectableMonsters(loadedMonsters);
      if (saved.player) setPlayer(saved.player);
      if (saved.floors) setFloors(saved.floors);

      setCurrentScreen('home');
      addHomeLog(`💾 **「${tag}」のセーブデータを読み込みました！ (所持💎: ${loadedGems}個)**`);
    } else {
      setGems(0);
      setCurrentScreen('setup');
    }
  };

  // Select monster to start
  const handleSelectMonster = (m: MonsterProfile) => {
    const newPlayer: Player = {
      name: m.name,
      hp: m.hp,
      maxHp: m.hp,
      atk: m.atk,
      sp: 0,
      type: m.type,
      status: null,
      hasRevived: false,
      deathZombies: 0,
      level: m.level || 1,
      maxLevel: m.maxLevel || 10,
      rank: m.rank,
    };
    setPlayer(newPlayer);
    setCurrentFloorIndex(0);
    setCurrentEnemyIndex(0);
    setLogs([]);
    setShowNextBtn(false);
    setShowHomeBtn(false);
    setIsGameOver(false);
    setCurrentScreen('game');

    addLog(`【ゲーム開始】 ${userTag} は相棒「${m.name}」を選んだ！`);
    loadEnemy(0, 0, floors, newPlayer);
    saveGame({ player: newPlayer, currentFloorIndex: 0, currentEnemyIndex: 0 });
  };

  // Enemy timer
  const startEnemyTimer = (targetEnemy: Enemy) => {
    stopEnemyTimer();

    if (targetEnemy.type === 'golem') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currEnemy) => {
          setPlayer((currPlayer) => {
            if (currEnemy.hp <= 0 || currPlayer.hp <= 0) return currPlayer;
            addLog(`🧪 ${currEnemy.name} はドラッグを服用した！`);
            if (Math.random() < 0.75) {
              const newHp = Math.min(currEnemy.maxHp, currEnemy.hp + 20);
              const turns = getRandomInt(3, 4);
              const newAtk = currEnemy.baseAtk + 4;
              addLog(`HPが 20 回復し、攻撃力が 4 上昇！（${turns}ターン持続）`);
              setEnemy({ ...currEnemy, hp: newHp, atk: newAtk, buffTurns: turns });
            } else {
              const newHp = Math.max(0, currEnemy.hp - 15);
              const turns = getRandomInt(3, 4);
              const newAtk = Math.max(1, currEnemy.baseAtk - 5);
              addLog(`💀 悪影響！ HPが 15 低下し、攻撃力が 5 下がった！（${turns}ターン持続）`);
              setEnemy({ ...currEnemy, hp: newHp, atk: newAtk, buffTurns: turns });
              if (newHp <= 0) {
                setTimeout(() => handleEnemyDefeated(currEnemy.name, currEnemy.bossType), 100);
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
            addLog(`✨ ${currEnemy.name} は自己回復の魔力を練り上げた！`);
            if (Math.random() < 0.5) {
              const newHp = Math.min(currEnemy.maxHp, currEnemy.hp + 20);
              addLog(`成功！ HPが 20 回復した！`);
              setEnemy({ ...currEnemy, hp: newHp });
            } else {
              addLog(`しかし集中が途切れて失敗した…`);
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
            addLog(`🦬 ${currEnemy.name} の猛烈な突進攻撃！`);
            if (Math.random() < 0.25) {
              const nextHp = Math.max(0, currPlayer.hp - 25);
              addLog(`直撃！ ${currPlayer.name} は 25 ダメージを受けた！`);
              if (nextHp <= 0) {
                setTimeout(() => handlePlayerDefeat(), 100);
              }
              return { ...currPlayer, hp: nextHp };
            } else {
              addLog(`しかし間一髪で回避した！`);
            }
            return currPlayer;
          });
          return currEnemy;
        });
      }, 10000);
    } else if (targetEnemy.type === 'obadora') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currEnemy) => {
          setPlayer((currPlayer) => {
            if (currEnemy.hp <= 0 || currPlayer.hp <= 0) return currPlayer;
            addLog(`🌑 ${currEnemy.name} の「深淵のアビス」が発動した！`);
            const nextHp = Math.max(0, currPlayer.hp - 15);
            addLog(`${currPlayer.name} は闇の波動で 15 ダメージを受け、拘束された！`);
            if (nextHp <= 0) {
              setTimeout(() => handlePlayerDefeat(), 100);
            }
            return {
              ...currPlayer,
              hp: nextHp,
              status: { type: 'bind', turns: 2 },
            };
          });
          return currEnemy;
        });
      }, 15000);
    }
  };

  const loadEnemy = (
    floorIdx = currentFloorIndex,
    enemyIdx = currentEnemyIndex,
    floorList = floors,
    _playerRef = player
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
    const bossBadge = newEnemy.bossType ? `【${newEnemy.bossType}】` : '';
    addLog(`＞ ${bossBadge}${newEnemy.name} が立ちはだかった！`);
    setControlsDisabled(false);
    startEnemyTimer(newEnemy);
  };

  // Player attack & skill actions
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
          addLog(`デスゾンビがいません！発動に失敗した。`);
          setControlsDisabled(false);
          return;
        }
        nextPlayer.sp -= cost;
        nextPlayer.deathZombies--;
        nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 30);
        addLog(`🧟 ${nextPlayer.name}の「ゾーンビー」！ デスゾンビを喰らって HPが 30 回復した！`);
      } else {
        nextPlayer.sp -= cost;
        if (nextPlayer.type === 'ラリ') {
          nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 10);
          addLog(`${nextPlayer.name}の「油を蓄える」！ HPが 10 回復した！`);
        } else if (nextPlayer.type === 'オルゴン') {
          nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 20);
          addLog(`${nextPlayer.name}の「ライフフルーツ」！ HPが 20 回復した！`);
        } else if (nextPlayer.type === 'ドレイム') {
          const newMax = getRandomInt(90, 120);
          nextPlayer.maxHp = newMax;
          nextPlayer.hp = newMax;
          addLog(`🔥 ${nextPlayer.name}の「ファイアハート」！ 最大HPが ${newMax} に増加し全快！`);
        } else {
          nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 25);
          addLog(`${nextPlayer.name}の「ハイポーション」！ HPが 25 回復した！`);
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
        addLog(`${nextEnemy.name} は混乱に陥った！`);
      } else if (nextPlayer.type === 'オルゴン') {
        addLog(`${nextPlayer.name}の「ダークアイス」！`);
        if (Math.random() < 0.45) {
          nextEnemy.status = { type: 'frozen', turns: 2 };
          addLog(`極寒の冷気！ ${nextEnemy.name} を 2ターン 凍結させた！`);
        } else {
          addLog(`追加の凍結付与には失敗した。`);
        }
        nextEnemy.hp = Math.max(0, nextEnemy.hp - nextPlayer.atk);
        addLog(`${nextEnemy.name} に ${nextPlayer.atk} ダメージ！`);
      } else if (nextPlayer.type === 'ドレイム') {
        addLog(`${nextPlayer.name}の「ドットフレイム」！`);
        nextEnemy.status = { type: 'burned', turns: 3 };
        addLog(`烈火の炎！ ${nextEnemy.name} は 3ターン 火傷状態になった！`);
        nextEnemy.hp = Math.max(0, nextEnemy.hp - nextPlayer.atk);
        addLog(`${nextEnemy.name} に ${nextPlayer.atk} ダメージ！`);
      } else if (nextPlayer.type === 'ゾンビ') {
        addLog(`🧟 ${nextPlayer.name}の「感染」！`);
        if (Math.random() < 0.01) {
          nextEnemy.hp = 0;
          addLog(`💀 奇跡の即死発動！ ${nextEnemy.name} は一撃で息絶えた！`);
        } else {
          nextPlayer.deathZombies++;
          addLog(`感染が広がり、デスゾンビを 1体 召喚した！（合計: ${nextPlayer.deathZombies}体）`);
        }
      } else {
        const dmg = Math.round(nextPlayer.atk * 1.5);
        nextEnemy.hp = Math.max(0, nextEnemy.hp - dmg);
        addLog(`⚔️ ${nextPlayer.name}のパワースラッシュ！ ${nextEnemy.name} に ${dmg} ダメージ！`);
      }
    } else {
      // Normal attack
      addLog(`${nextPlayer.name} のこうげき！`);
      nextEnemy.hp = Math.max(0, nextEnemy.hp - nextPlayer.atk);
      addLog(`${nextEnemy.name} に ${nextPlayer.atk} ダメージ！`);
    }

    nextPlayer.sp += 1;
    setPlayer(nextPlayer);
    setEnemy(nextEnemy);

    if (nextEnemy.hp <= 0) {
      handleEnemyDefeated(nextEnemy.name, nextEnemy.bossType);
      return;
    }

    setTimeout(() => {
      executeEnemyTurn(nextPlayer, nextEnemy);
    }, 600);
  };

  const executeEnemyTurn = (currPlayer: Player, currEnemy: Enemy) => {
    let nextP = { ...currPlayer };
    let nextE = { ...currEnemy };

    // Burn check on enemy
    if (nextE.status?.type === 'burned') {
      nextE.hp = Math.max(0, nextE.hp - 2);
      addLog(`🔥 火傷のダメージ！ ${nextE.name} は 2 ダメージを受けた！`);
      nextE.status.turns -= 1;
      if (nextE.status.turns <= 0) {
        nextE.status = null;
        addLog(`${nextE.name} の火傷がおさまった。`);
      }
      setEnemy({ ...nextE });
      if (nextE.hp <= 0) {
        handleEnemyDefeated(nextE.name, nextE.bossType);
        return;
      }
    }

    // Freeze check on enemy
    if (nextE.status?.type === 'frozen') {
      addLog(`❄️ ${nextE.name} は凍りついて行動できない！`);
      nextE.status.turns -= 1;
      if (nextE.status.turns <= 0) {
        nextE.status = null;
        addLog(`${nextE.name} の氷が溶けた！`);
      }
      setEnemy({ ...nextE });
      finishTurnCycle(nextP);
      return;
    }

    // Confusion check on enemy
    if (nextE.status?.type === 'confused') {
      if (Math.random() < 0.5) {
        addLog(`🌀 ${nextE.name} は混乱して自分を攻撃した！`);
        nextE.hp = Math.max(0, nextE.hp - nextE.atk);
        addLog(`${nextE.name} は自らに ${nextE.atk} ダメージ！`);
        setEnemy({ ...nextE });
        if (nextE.hp <= 0) {
          handleEnemyDefeated(nextE.name, nextE.bossType);
          return;
        }
        finishTurnCycle(nextP);
        return;
      }
    }

    // Enemy attacks player
    addLog(`＞ ${nextE.name} の攻撃！`);
    let finalDmg = nextE.atk;
    nextP.hp = Math.max(0, nextP.hp - finalDmg);
    addLog(`${nextP.name} は ${finalDmg} ダメージを受けた！`);

    // Buff turns decay
    if (nextE.buffTurns > 0) {
      nextE.buffTurns -= 1;
      if (nextE.buffTurns === 0) {
        nextE.atk = nextE.baseAtk;
        addLog(`${nextE.name} の薬品バフ・弱体効果が切れた。`);
      }
      setEnemy({ ...nextE });
    }

    if (nextP.hp <= 0) {
      setPlayer(nextP);
      handlePlayerDefeat();
      return;
    }

    finishTurnCycle(nextP);
  };

  const finishTurnCycle = (pState: Player) => {
    let nextP = { ...pState };
    if (nextP.status?.type === 'bind') {
      nextP.status.turns -= 1;
      if (nextP.status.turns <= 0) {
        nextP.status = null;
        addLog(`${nextP.name} の拘束が解けた！`);
      }
    }
    setPlayer(nextP);
    setControlsDisabled(false);
  };

  const handleEnemyDefeated = (enemyName: string, bossType: string) => {
    stopEnemyTimer();
    addLog(`💥 **${enemyName} を倒した！**`);

    let currentG = gems;
    if (bossType && bossType in BOSS_REWARDS) {
      const reward = BOSS_REWARDS[bossType as keyof typeof BOSS_REWARDS];
      currentG += reward;
      setGems(currentG);
      addLog(`💎 **【ボス撃破ボーナス】 ダイヤを ${reward}個 獲得した！（合計: 💎${currentG}個）**`);
    }

    const currentFloor = floors[currentFloorIndex];
    const isLastEnemyOnFloor = currentEnemyIndex + 1 >= currentFloor.enemies.length;

    if (isLastEnemyOnFloor) {
      // Floor clear reward!
      const floorReward = currentFloor.clearRewardGems ?? (currentFloorIndex + 1) * 15;
      currentG += floorReward;
      setGems(currentG);
      addLog(`🏆 **【階層制覇報酬】 第${currentFloorIndex + 1}階層クリア！ ダイヤ 💎${floorReward}個 を獲得！**`);

      setIsHomeUnlocked(true);
      setShowHomeBtn(true);

      const isFinalFloor = currentFloorIndex + 1 >= floors.length;
      if (isFinalFloor) {
        addLog(`🎉🎉 **おめでとうございます！ 全ダンジョンを完全制覇しました！！** 🎉🎉`);
        setIsGameOver(true);
      } else {
        setShowNextBtn(true);
      }
    } else {
      setShowNextBtn(true);
    }

    saveGame({ gems: currentG, isHomeUnlocked: true });
    setControlsDisabled(true);
  };

  const handlePlayerDefeat = () => {
    stopEnemyTimer();
    if (player.type === 'ゾンビ' && !player.hasRevived) {
      addLog(`💀 ${player.name} は倒れた…！`);
      addLog(`🧟 しかし不死の力により、HP 20 で蘇生した！！`);
      setPlayer((p) => ({ ...p, hp: 20, hasRevived: true }));
      setControlsDisabled(false);
      return;
    }

    addLog(`💀 **${player.name} は力尽きた… ゲームオーバー！**`);
    setIsGameOver(true);
    setControlsDisabled(true);
  };

  const handleNextStage = () => {
    setShowNextBtn(false);
    setShowHomeBtn(false);
    const currFloor = floors[currentFloorIndex];
    if (currentEnemyIndex + 1 < currFloor.enemies.length) {
      const nextEnemyIdx = currentEnemyIndex + 1;
      setCurrentEnemyIndex(nextEnemyIdx);
      loadEnemy(currentFloorIndex, nextEnemyIdx);
      saveGame({ currentEnemyIndex: nextEnemyIdx });
    } else {
      const nextFloorIdx = currentFloorIndex + 1;
      setCurrentFloorIndex(nextFloorIdx);
      setCurrentEnemyIndex(0);
      addLog(`⏩ **【${floors[nextFloorIdx]?.name || '新階層'}】へ進んだ！**`);
      loadEnemy(nextFloorIdx, 0);
      saveGame({ currentFloorIndex: nextFloorIdx, currentEnemyIndex: 0 });
    }
  };

  const handleRestart = () => {
    stopEnemyTimer();
    setCurrentScreen('setup');
    setIsGameOver(false);
    setShowNextBtn(false);
    setShowHomeBtn(false);
    setLogs([]);
  };

  // Gacha logic
  const handleDrawGacha = (count: 1 | 10) => {
    const cost = count === 1 ? 50 : 480;
    if (gems < cost) {
      alert(`ダイヤが足りません！（必要ダイヤ: 💎${cost}個 / 所持: 💎${gems}個）`);
      return;
    }

    let remainingGems = gems - cost;
    const pulledResults: GachaPullResult[] = [];
    let totalRefund = 0;
    let updatedRoster = [...playerSelectableMonsters];

    for (let i = 0; i < count; i++) {
      const rand = Math.random() * 100;
      let targetRank: 'UR' | 'SSR' | 'SR' | 'R' | 'N' = 'N';

      if (rand < gachaRates.UR) {
        targetRank = 'UR';
      } else if (rand < gachaRates.UR + gachaRates.SSR) {
        targetRank = 'SSR';
      } else if (rand < gachaRates.UR + gachaRates.SSR + gachaRates.SR) {
        targetRank = 'SR';
      } else if (rand < gachaRates.UR + gachaRates.SSR + gachaRates.SR + gachaRates.R) {
        targetRank = 'R';
      } else {
        targetRank = 'N';
      }

      const pool = gachaPool[targetRank];
      const picked = pool[Math.floor(Math.random() * pool.length)];

      const existingIndex = updatedRoster.findIndex((m) => m.name === picked.name);

      if (existingIndex === -1) {
        // New monster acquired!
        const newMonster: MonsterProfile = {
          ...picked,
          level: 1,
          maxLevel: RARITY_DEFAULT_MAX_LEVEL[picked.rank] || 10,
          baseHp: picked.hp,
          baseAtk: picked.atk,
        };
        updatedRoster.push(newMonster);
        pulledResults.push({
          monster: newMonster,
          isNew: true,
          levelUp: false,
          refundGems: 0,
        });
      } else {
        // Duplicate monster
        const existing = updatedRoster[existingIndex];
        if (existing.level < existing.maxLevel) {
          // Level Up!
          const oldLevel = existing.level;
          const newLevel = oldLevel + 1;
          const updatedMonster = {
            ...existing,
            level: newLevel,
            hp: existing.hp + Math.round(existing.baseHp * 0.15),
            atk: existing.atk + Math.max(1, Math.round(existing.baseAtk * 0.15)),
          };
          updatedRoster[existingIndex] = updatedMonster;
          pulledResults.push({
            monster: updatedMonster,
            isNew: false,
            levelUp: true,
            oldLevel,
            newLevel,
            refundGems: 0,
          });
        } else {
          // Already at Max Level -> Diamond Refund!
          const refund = RARITY_REFUND_GEMS[existing.rank] || 25;
          totalRefund += refund;
          remainingGems += refund;
          pulledResults.push({
            monster: existing,
            isNew: false,
            levelUp: false,
            refundGems: refund,
          });
        }
      }
    }

    setGems(remainingGems);
    setPlayerSelectableMonsters(updatedRoster);
    setGachaResults(pulledResults);
    setGachaTotalRefund(totalRefund);
    setIsGachaModalOpen(true);

    addHomeLog(
      `🎁 **${count === 1 ? '単発' : '10連'}ガチャを引きました！ (消費: 💎${cost}個 / 返還: 💎${totalRefund}個 / 残高: 💎${remainingGems}個)**`
    );

    saveGame({ gems: remainingGems, playerSelectableMonsters: updatedRoster });
  };

  // Diamond transfer between players
  const handleTransferDiamonds = (targetTag: string, amount: number) => {
    if (gems < amount) {
      alert('所持ダイヤが足りません！');
      return false;
    }

    const newSenderGems = gems - amount;
    setGems(newSenderGems);

    // Save to recipient save file if exists or create deposit
    const recipientKey = `monster_rpg_save_${targetTag}`;
    const rawTarget = localStorage.getItem(recipientKey);
    if (rawTarget) {
      try {
        const parsed = JSON.parse(rawTarget);
        parsed.gems = (parsed.gems || 0) + amount;
        localStorage.setItem(recipientKey, JSON.stringify(parsed));
      } catch {
        // ignore
      }
    } else {
      // Pending recipient save file
      const initialData = {
        userTag: targetTag,
        userPass: '',
        gems: amount,
        currentFloorIndex: 0,
        currentEnemyIndex: 0,
        isHomeUnlocked: false,
        playerSelectableMonsters: DEFAULT_PLAYER_SELECTABLE_MONSTERS,
      };
      localStorage.setItem(recipientKey, JSON.stringify(initialData));
    }

    saveGame({ gems: newSenderGems });
    addHomeLog(`🎁 **【ダイヤ送金】 「${targetTag}」さんに 💎${amount}個 を送金しました！ (残高: 💎${newSenderGems}個)**`);
    alert(`「${targetTag}」さんに 💎${amount}個 を送金しました！`);
    return true;
  };

  // Enhance monster with diamonds
  const handleEnhanceMonster = (idx: number, cost: number) => {
    if (gems < cost) return;
    const target = playerSelectableMonsters[idx];
    if (!target || target.level >= target.maxLevel) return;

    const newG = gems - cost;
    const updated = [...playerSelectableMonsters];
    const newL = target.level + 1;
    const newHp = target.hp + Math.round(target.baseHp * 0.15);
    const newAtk = target.atk + Math.max(1, Math.round(target.baseAtk * 0.15));

    updated[idx] = {
      ...target,
      level: newL,
      hp: newHp,
      atk: newAtk,
    };

    setGems(newG);
    setPlayerSelectableMonsters(updated);

    // If active player is this monster, update player too
    if (player.name === target.name) {
      setPlayer((prev) => ({
        ...prev,
        level: newL,
        maxHp: newHp,
        hp: Math.min(newHp, prev.hp + Math.round(target.baseHp * 0.15)),
        atk: newAtk,
      }));
    }

    saveGame({ gems: newG, playerSelectableMonsters: updated });
    addHomeLog(`⚔️ **「${target.name}」を強化！ Lv.${newL} にアップしました！ (消費: 💎${cost}個)**`);
  };

  // Switch active monster in home
  const handleSetActiveMonster = (m: MonsterProfile) => {
    setPlayer({
      name: m.name,
      hp: m.hp,
      maxHp: m.hp,
      atk: m.atk,
      sp: 0,
      type: m.type,
      status: null,
      hasRevived: false,
      deathZombies: 0,
      level: m.level,
      maxLevel: m.maxLevel,
      rank: m.rank,
    });
    addHomeLog(`🐾 出撃相棒を「${m.name}」に変更しました！`);
  };

  const getHealBtnText = () => {
    if (player.type === 'ラリ') return '油を蓄える (SP2/HP+10)';
    if (player.type === 'オルゴン') return 'ライフフルーツ (SP2/HP+20)';
    if (player.type === 'ドレイム') return 'ファイアハート (SP7/全快&HPUP)';
    if (player.type === 'ゾンビ') return 'ゾーンビー (SP4/ゾンビ消費+30)';
    return 'ハイポーション (SP2/HP+25)';
  };

  const getAtkSkillBtnText = () => {
    if (player.type === 'ラリ') return '抱きつく (SP3/困惑付与)';
    if (player.type === 'オルゴン') return 'ダークアイス (SP4/45%凍結)';
    if (player.type === 'ドレイム') return 'ドットフレイム (SP1/火傷付与)';
    if (player.type === 'ゾンビ') return '感染 (SP8/1%即死or召喚)';
    return 'パワースラッシュ (SP3/強撃)';
  };

  const getStatusEffectText = (st: StatusEffect | null) => {
    if (!st) return '正常';
    if (st.type === 'bind') return `拘束 (残${st.turns}T)`;
    if (st.type === 'burned') return `火傷 (残${st.turns}T)`;
    if (st.type === 'confused') return '困惑';
    if (st.type === 'frozen') return `凍結 (残${st.turns}T)`;
    return '正常';
  };

  const isBtnDisabled = controlsDisabled || player.status?.type === 'bind';

  return (
    <div className="flex justify-center items-center min-h-screen p-2.5 sm:p-4 select-none bg-[#121212] text-white">
      <div
        id="game-container"
        className="bg-[#1e1e1e] border-2 border-[#333] rounded-2xl p-5 w-full max-w-[460px] shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative"
      >
        <button
          className="absolute top-4 right-4 text-[10px] px-2 py-1 bg-[#333] hover:bg-[#444] text-[#ccc] border border-[#555] rounded cursor-pointer transition-colors"
          onClick={() => setIsAdminModalOpen(true)}
        >
          ⚙️ 管理者
        </button>

        <h1 className="text-center m-0 text-xl font-black text-[#f0a500] border-b-2 border-[#333] pb-2.5 tracking-wide">
          モンスターダンジョン RPG 完全版
        </h1>

        {/* 1. Login Screen */}
        {currentScreen === 'login' && (
          <div className="mt-4">
            <p className="text-xs text-[#aaa] text-center mb-3">
              冒険者名を入力してダンジョンへ突入しましょう！
            </p>
            <div className="text-left mb-3">
              <label className="text-xs text-[#bbb] block mb-1">
                冒険者名（ネームタグ） <span className="text-[#ff5555]">*必須</span>
              </label>
              <input
                type="text"
                value={playerTagInput}
                onChange={(e) => setPlayerTagInput(e.target.value)}
                placeholder="例: 勇者ポテト"
                className="w-full p-2.5 bg-[#2a2a2a] border border-[#555] text-white rounded-lg text-sm outline-none focus:border-[#f0a500]"
              />
            </div>
            <div className="text-left mb-4">
              <label className="text-xs text-[#bbb] block mb-1">
                パスワード <span className="text-[#888]">(任意: セーブ保護用)</span>
              </label>
              <input
                type="password"
                value={playerPassInput}
                onChange={(e) => setPlayerPassInput(e.target.value)}
                placeholder="任意設定"
                className="w-full p-2.5 bg-[#2a2a2a] border border-[#555] text-white rounded-lg text-sm outline-none focus:border-[#f0a500]"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-[#27ae60] hover:bg-[#2ecc71] text-white font-bold p-3 rounded-xl text-sm cursor-pointer shadow-lg transition-transform active:scale-95"
            >
              冒険を開始 / セーブ読込
            </button>
          </div>
        )}

        {/* 2. Character Setup Screen */}
        {currentScreen === 'setup' && (
          <div className="mt-4">
            <p className="text-center text-sm text-[#ddd] mb-3">
              冒険者 <span className="text-[#f0a500] font-bold">{userTag}</span> さん
              <br />
              最初の相棒モンスターを選んでください：
            </p>
            <div className="flex flex-col gap-2">
              {playerSelectableMonsters.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectMonster(m)}
                  className="bg-[#2a2a2a] hover:bg-[#383838] text-white border border-[#444] hover:border-[#f0a500] p-3 rounded-xl cursor-pointer text-left transition-all duration-150"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-white">{m.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold">
                      {m.rank}
                    </span>
                  </div>
                  <div className="text-xs text-[#aaa]">
                    HP: {m.hp} / 攻撃力: {m.atk} / 能力: <span className="text-[#f0a500]">{m.type}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Home Screen */}
        {currentScreen === 'home' && (
          <div className="mt-3">
            <div className="flex justify-between items-center bg-[#252525] border border-[#444] rounded-xl p-3 mb-3">
              <div>
                <span className="text-xs text-[#aaa] block">冒険者</span>
                <span className="font-bold text-sm text-[#f0a500]">{userTag}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#aaa] block">所持ダイヤ</span>
                <span className="font-black text-base text-[#00cec9]">💎 {gems} 個</span>
              </div>
            </div>

            {/* Quick Action: Diamond Transfer */}
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex-1 bg-[#00cec9] hover:bg-[#81ecec] text-black font-bold p-2 text-xs rounded-xl cursor-pointer shadow transition-colors flex items-center justify-center gap-1"
              >
                💎 ダイヤ送金・受渡
              </button>
              <button
                onClick={() => setIsEnhanceModalOpen(true)}
                className="flex-1 bg-[#2980b9] hover:bg-[#3498db] text-white font-bold p-2 text-xs rounded-xl cursor-pointer shadow transition-colors flex items-center justify-center gap-1"
              >
                ⚔️ モンスター強化
              </button>
            </div>

            {/* Monsters Roster */}
            <div className="bg-[#252525] border border-[#444] rounded-xl p-3 mb-3 text-left">
              <div className="text-xs font-bold text-[#f0a500] mb-2 flex justify-between">
                <span>🐾 所持モンスター一覧 ({playerSelectableMonsters.length}体)</span>
                <span className="text-[10px] text-[#aaa]">タップで出撃切り替え</span>
              </div>
              <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
                {playerSelectableMonsters.map((m, idx) => {
                  const isActive = player.name === m.name;
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg border text-xs flex justify-between items-center ${
                        isActive
                          ? 'bg-[#332b18] border-[#f0a500]'
                          : 'bg-[#1a1a1a] border-[#333]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-white">{m.name}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-[#444] text-[#ddd]">
                            {m.rank}
                          </span>
                          <span className="text-[#f0a500] font-bold text-[11px]">
                            Lv.{m.level}/{m.maxLevel}
                          </span>
                          {isActive && (
                            <span className="text-[9px] bg-[#f0a500] text-black font-black px-1 rounded">
                              出撃中
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#aaa]">
                          HP: {m.hp} / 攻: {m.atk} [{m.type}]
                        </div>
                      </div>
                      {!isActive && (
                        <button
                          onClick={() => handleSetActiveMonster(m)}
                          className="bg-[#444] hover:bg-[#555] text-white text-[10px] px-2 py-1 rounded cursor-pointer"
                        >
                          出撃
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gacha Section */}
            <div className="bg-[#252525] border border-[#444] rounded-xl p-3 mb-3">
              <div className="text-xs text-[#aaa] mb-2">
                確率: UR: {gachaRates.UR}% / SSR: {gachaRates.SSR}% (被りはLvUP、上限到達で💎返還)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDrawGacha(1)}
                  className="bg-[#8e44ad] hover:bg-[#9b59b6] text-white p-2.5 rounded-xl font-bold text-xs cursor-pointer transition-transform active:scale-95 shadow"
                >
                  🎁 単発ガチャ
                  <br />
                  <span className="text-[10px] text-amber-200">💎 50 個</span>
                </button>
                <button
                  onClick={() => handleDrawGacha(10)}
                  className="bg-[#6c5ce7] hover:bg-[#a29bfe] text-white p-2.5 rounded-xl font-bold text-xs cursor-pointer transition-transform active:scale-95 shadow"
                >
                  🎁 10連ガチャ
                  <br />
                  <span className="text-[10px] text-amber-200">💎 480 個 (お得!)</span>
                </button>
              </div>
            </div>

            {/* Home Logs */}
            <div
              className="bg-[#0f0f0f] border border-[#333] h-[100px] overflow-y-auto p-2 text-xs leading-relaxed rounded-xl mb-3 text-left"
              ref={homeLogBoxRef}
            >
              {homeLogs.map((log, index) => (
                <p key={index} className="my-1 text-[#ccc] break-words">
                  {log}
                </p>
              ))}
            </div>

            <button
              onClick={() => {
                setCurrentScreen('game');
                loadEnemy(currentFloorIndex, currentEnemyIndex);
              }}
              className="w-full bg-[#27ae60] hover:bg-[#2ecc71] text-white font-black p-3 rounded-xl text-sm cursor-pointer shadow-lg transition-transform active:scale-95"
            >
              ダンジョン攻略へ突入！ ({floors[currentFloorIndex]?.name})
            </button>
          </div>
        )}

        {/* 4. Dungeon Battle Screen */}
        {currentScreen === 'game' && (
          <div className="mt-3">
            <h2 className="text-center my-2 text-sm font-bold text-[#e0e0e0]">
              {floors[currentFloorIndex]?.name}
            </h2>

            {/* Player Status Card */}
            <div className="bg-[#252525] border border-[#444] p-3 mb-2.5 rounded-xl text-xs text-left">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-sm">
                  【<span className="text-[#f0a500]">{userTag}</span>】 {player.name}
                  <span className="ml-1 text-[11px] text-[#f0a500]">Lv.{player.level}</span>
                </strong>
                <span className="text-[#00d2d3] font-bold">SP: {player.sp} pt</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[#ff5555] font-bold">
                  HP: {player.hp} / {player.maxHp}
                </span>
                <span className="text-[#00cec9] font-bold">💎 {gems}</span>
              </div>
              <div className="text-[11px] text-[#fabca1]">
                状態: {getStatusEffectText(player.status)}
              </div>
              {player.type === 'ゾンビ' && (
                <div className="text-[11px] text-[#a29bfe] mt-0.5 font-bold">
                  召喚デスゾンビ: {player.deathZombies}体
                </div>
              )}
            </div>

            {/* Enemy Status Card */}
            <div className="bg-[#252525] border border-[#444] p-3 mb-2.5 rounded-xl text-xs text-left">
              <div className="flex justify-between items-center mb-1">
                <strong className="text-sm">
                  【敵】 {enemy.bossType ? `【${enemy.bossType}】` : ''}
                  {enemy.name}
                </strong>
                <span className="text-[#fabca1] text-[11px]">
                  状態: {getStatusEffectText(enemy.status)}
                </span>
              </div>
              <div className="text-[#ff5555] font-bold">
                HP: {enemy.hp} / {enemy.maxHp}
              </div>
            </div>

            {/* Battle Log Box */}
            <div
              ref={logBoxRef}
              className="bg-[#0f0f0f] border border-[#333] h-[130px] overflow-y-auto p-2.5 text-xs leading-relaxed mb-3 rounded-xl text-left"
            >
              {logs.map((log, index) => (
                <p key={index} className="my-1 text-[#e0e0e0] break-words">
                  {log}
                </p>
              ))}
            </div>

            {/* Action Buttons */}
            {!showNextBtn && !isGameOver && (
              <div className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    disabled={isBtnDisabled}
                    onClick={() => handlePlayerAction('attack')}
                    className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] text-white p-2.5 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    通常攻撃
                  </button>
                  <button
                    disabled={isBtnDisabled}
                    onClick={() => handlePlayerAction('heal_skill')}
                    className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] text-white p-2.5 text-xs font-bold rounded-xl cursor-pointer transition-colors truncate"
                  >
                    {getHealBtnText()}
                  </button>
                </div>
                <button
                  disabled={isBtnDisabled}
                  onClick={() => handlePlayerAction('atk_skill')}
                  className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] text-white p-2.5 text-xs font-bold rounded-xl cursor-pointer transition-colors truncate"
                >
                  {getAtkSkillBtnText()}
                </button>
              </div>
            )}

            {/* Floor Navigation / Restart */}
            <div className="flex flex-col gap-2 mt-2.5">
              {showHomeBtn && isHomeUnlocked && (
                <button
                  onClick={() => {
                    stopEnemyTimer();
                    setCurrentScreen('home');
                  }}
                  className="bg-[#d35400] hover:bg-[#e67e22] text-white font-bold p-2.5 rounded-xl text-sm cursor-pointer shadow"
                >
                  🏠 ホームへ戻る
                </button>
              )}

              {showNextBtn && (
                <button
                  onClick={handleNextStage}
                  className="bg-[#f0a500] hover:bg-[#e09400] text-black font-black p-2.5 rounded-xl text-sm cursor-pointer shadow"
                >
                  次の敵・階層へ
                </button>
              )}

              {isGameOver && (
                <button
                  onClick={handleRestart}
                  className="bg-[#3a3a3a] hover:bg-[#555] text-white p-2.5 text-sm font-bold rounded-xl cursor-pointer transition-colors"
                >
                  最初からやり直す
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GachaModal
        isOpen={isGachaModalOpen}
        onClose={() => setIsGachaModalOpen(false)}
        results={gachaResults}
        totalRefundGems={gachaTotalRefund}
      />

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        currentGems={gems}
        currentUserTag={userTag}
        onTransfer={handleTransferDiamonds}
      />

      <EnhanceModal
        isOpen={isEnhanceModalOpen}
        onClose={() => setIsEnhanceModalOpen(false)}
        monsters={playerSelectableMonsters}
        currentGems={gems}
        onEnhance={handleEnhanceMonster}
      />

      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        player={player}
        gems={gems}
        floors={floors}
        playerSelectableMonsters={playerSelectableMonsters}
        onUpdatePlayer={(up) => {
          const updated = { ...player, ...up };
          setPlayer(updated);
          saveGame({ player: updated });
        }}
        onUpdateGems={(newG) => {
          setGems(newG);
          saveGame({ gems: newG });
        }}
        onUpdateFloors={(newF) => {
          setFloors(newF);
          saveGame({ floors: newF });
        }}
        onUpdateSelectableMonsters={(newM) => {
          setPlayerSelectableMonsters(newM);
          saveGame({ playerSelectableMonsters: newM });
        }}
        onAddGachaCharacter={(newChar) => {
          setGachaPool((prev) => ({
            ...prev,
            [newChar.rank as 'N' | 'R' | 'SR' | 'SSR' | 'UR']: [
              ...(prev[newChar.rank as 'N' | 'R' | 'SR' | 'SSR' | 'UR'] || []),
              newChar,
            ],
          }));
        }}
        onUpdateGachaRates={(ur, ssr) => {
          setGachaRates((prev) => ({ ...prev, UR: ur, SSR: ssr }));
        }}
        gachaRateUr={gachaRates.UR}
        gachaRateSsr={gachaRates.SSR}
        addLog={addLog}
      />
    </div>
  );
}

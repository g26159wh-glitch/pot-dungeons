import { useState, useEffect, useRef } from 'react';
import { Player, Enemy, MonsterType, StatusEffect } from './types';
import { FLOORS, INITIAL_MONSTERS } from './data/gameData';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function App() {
  const [gameState, setGameState] = useState<'setup' | 'battle' | 'cleared' | 'gameover'>('setup');
  const [player, setPlayer] = useState<Player>({
    name: '',
    hp: 0,
    maxHp: 0,
    atk: 0,
    sp: 0,
    type: '',
    status: null,
  });

  const [enemy, setEnemy] = useState<Enemy>({
    name: '',
    hp: 0,
    maxHp: 0,
    atk: 0,
    baseAtk: 0,
    status: null,
    type: '',
    buffTurns: 0,
  });

  const [currentFloorIndex, setCurrentFloorIndex] = useState(0);
  const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [controlsDisabled, setControlsDisabled] = useState(false);
  const [showNextBtn, setShowNextBtn] = useState(false);

  const logBoxRef = useRef<HTMLDivElement>(null);
  const enemyTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  // Clean up timer on unmount
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

  const stopEnemyTimer = () => {
    if (enemyTimerRef.current) {
      clearInterval(enemyTimerRef.current);
      enemyTimerRef.current = null;
    }
  };

  // Select monster
  const handleSelectMonster = (name: string, hp: number, atk: number, type: MonsterType) => {
    const newPlayer: Player = {
      name,
      hp,
      maxHp: hp,
      atk,
      sp: 0,
      type,
      status: null,
    };
    setPlayer(newPlayer);
    setCurrentFloorIndex(0);
    setCurrentEnemyIndex(0);
    setShowNextBtn(false);
    setLogs([]);
    setGameState('battle');

    addLog(`【ゲーム開始】 ${name} を選んだ！`);
    loadEnemy(0, 0, newPlayer);
  };

  const startEnemyTimer = (targetEnemy: Enemy) => {
    stopEnemyTimer();

    if (targetEnemy.type === 'golem') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currentEnemy) => {
          setPlayer((currentPlayer) => {
            if (currentEnemy.hp <= 0 || currentPlayer.hp <= 0) return currentPlayer;

            addLog(`🧪 ${currentEnemy.name} はドラッグを飲んだ！`);
            if (Math.random() < 0.75) {
              const newHp = Math.min(currentEnemy.maxHp, currentEnemy.hp + 20);
              const turns = getRandomInt(3, 4);
              const newAtk = currentEnemy.baseAtk + 4;
              addLog(`HPが 20 回復し、攻撃力が 4 アップした！（${turns}ターン持続）`);
              setEnemy({
                ...currentEnemy,
                hp: newHp,
                atk: newAtk,
                buffTurns: turns,
              });
            } else {
              const newHp = Math.max(0, currentEnemy.hp - 15);
              const turns = getRandomInt(3, 4);
              const newAtk = Math.max(1, currentEnemy.baseAtk - 5);
              addLog(`💀 悪影響！ HPが 15 減少し、攻撃力が 5 下がった！（${turns}ターン持続）`);
              setEnemy({
                ...currentEnemy,
                hp: newHp,
                atk: newAtk,
                buffTurns: turns,
              });
              if (newHp <= 0) {
                setTimeout(() => handleCheckEnemyDefeated(0, currentFloorIndex, currentEnemyIndex), 100);
              }
            }
            return currentPlayer;
          });
          return currentEnemy;
        });
      }, 20000);
    } else if (targetEnemy.type === 'enon') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currentEnemy) => {
          setPlayer((currentPlayer) => {
            if (currentEnemy.hp <= 0 || currentPlayer.hp <= 0) return currentPlayer;

            addLog(`✨ ${currentEnemy.name} は回復を試みた！`);
            if (Math.random() < 0.5) {
              const newHp = Math.min(currentEnemy.maxHp, currentEnemy.hp + 20);
              addLog(`成功！ HPが 20 回復した！`);
              setEnemy({ ...currentEnemy, hp: newHp });
            } else {
              addLog(`しかし失敗した…`);
            }
            return currentPlayer;
          });
          return currentEnemy;
        });
      }, 30000);
    } else if (targetEnemy.type === 'ushi') {
      enemyTimerRef.current = setInterval(() => {
        setEnemy((currentEnemy) => {
          setPlayer((currentPlayer) => {
            if (currentEnemy.hp <= 0 || currentPlayer.hp <= 0) return currentPlayer;

            addLog(`🦬 ${currentEnemy.name} の突進攻撃！`);
            if (Math.random() < 0.25) {
              const nextPlayerHp = Math.max(0, currentPlayer.hp - 25);
              addLog(`激突！ ${currentPlayer.name} は 25 ダメージを受けた！`);
              if (nextPlayerHp <= 0) {
                setTimeout(() => handleGameOver(currentPlayer.name), 100);
              }
              return { ...currentPlayer, hp: nextPlayerHp };
            } else {
              addLog(`しかし交わされた！`);
            }
            return currentPlayer;
          });
          return currentEnemy;
        });
      }, 10000);
    }
  };

  const loadEnemy = (floorIdx: number, enemyIdx: number, _playerState = player) => {
    const floorData = FLOORS[floorIdx];
    const enemyData = floorData.enemies[enemyIdx];

    const newEnemy: Enemy = {
      name: enemyData.name,
      hp: enemyData.hp,
      maxHp: enemyData.hp,
      atk: enemyData.atk,
      baseAtk: enemyData.atk,
      status: null,
      type: enemyData.type || '',
      buffTurns: 0,
    };

    setEnemy(newEnemy);
    addLog(`＞ ${newEnemy.name} が現れた！`);
    setControlsDisabled(false);
    startEnemyTimer(newEnemy);
  };

  // Player action handler
  const handlePlayerAction = (actionType: 'attack' | 'heal_skill' | 'atk_skill') => {
    setControlsDisabled(true);

    let nextPlayer = { ...player };
    let nextEnemy = { ...enemy };

    if (actionType === 'heal_skill') {
      const cost = player.type === 'ドレイム' ? 7 : 2;
      if (player.sp < cost) {
        addLog(`SPが足りません！（必要SP: ${cost}）`);
        setControlsDisabled(false);
        return;
      }
      nextPlayer.sp -= cost;

      if (player.type === 'ラリ') {
        nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 10);
        addLog(`${nextPlayer.name}の「油を蓄える」！ HPが 10 回復した！`);
      } else if (player.type === 'オルゴン') {
        nextPlayer.hp = Math.min(nextPlayer.maxHp, nextPlayer.hp + 20);
        addLog(`${nextPlayer.name}の「ライフフルーツ」！ HPが 20 回復した！`);
      } else if (player.type === 'ドレイム') {
        const newMaxHp = getRandomInt(90, 120);
        nextPlayer.maxHp = newMaxHp;
        nextPlayer.hp = newMaxHp;
        addLog(`🔥 ${nextPlayer.name}の「ファイアハート」！`);
        addLog(`最大HPが ${newMaxHp} に増え、HPが全回復した！`);
      }
    } else if (actionType === 'atk_skill') {
      const cost = player.type === 'ラリ' ? 3 : player.type === 'オルゴン' ? 4 : 1;
      if (player.sp < cost) {
        addLog(`SPが足りません！（必要SP: ${cost}）`);
        setControlsDisabled(false);
        return;
      }
      nextPlayer.sp -= cost;

      if (player.type === 'ラリ') {
        addLog(`${nextPlayer.name}の「抱きつく」！`);
        nextEnemy.status = { type: 'confused', turns: 999 };
        addLog(`${nextEnemy.name} は困惑した！`);
      } else if (player.type === 'オルゴン') {
        addLog(`${nextPlayer.name}の「ダークアイス」！`);
        if (Math.random() < 0.45) {
          const turns = getRandomInt(2, 4);
          nextEnemy.status = { type: 'frozen', turns };
          addLog(`${nextEnemy.name} は凍結した！（${turns}ターン持続）`);
        } else {
          addLog(`しかし凍結しなかった…`);
        }
      } else if (player.type === 'ドレイム') {
        addLog(`${nextPlayer.name}の「ドットフレイム」！`);
        const turns = getRandomInt(2, 4);
        nextEnemy.status = { type: 'burned', turns };
        addLog(`${nextEnemy.name} は火傷を負った！（${turns}ターン持続）`);
      }
    } else if (actionType === 'attack') {
      nextEnemy.hp = Math.max(0, nextEnemy.hp - nextPlayer.atk);
      addLog(`${nextPlayer.name}の攻撃！ ${nextEnemy.name}に ${nextPlayer.atk} のダメージ。`);
    }

    nextPlayer.sp += 2;
    setPlayer(nextPlayer);
    setEnemy(nextEnemy);

    if (nextEnemy.hp <= 0) {
      handleCheckEnemyDefeated(nextEnemy.hp, currentFloorIndex, currentEnemyIndex, nextEnemy.name);
      return;
    }

    setTimeout(() => {
      runEnemyTurn(nextPlayer, nextEnemy);
    }, 500);
  };

  // Enemy Turn
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

    // Player burn damage
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
        handleGameOver(p.name);
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
      handleCheckEnemyDefeated(e.hp, currentFloorIndex, currentEnemyIndex, e.name);
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
          handleCheckEnemyDefeated(e.hp, currentFloorIndex, currentEnemyIndex, e.name);
          return;
        }
        finishEnemyTurn(p, e);
        return;
      }
    }

    // Attack action
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
      handleGameOver(p.name);
      return;
    }

    finishEnemyTurn(p, e);
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
    setGameState('gameover');
  };

  const handleCheckEnemyDefeated = (
    _enemyHp: number,
    fIdx: number,
    eIdx: number,
    defeatedName = enemy.name
  ) => {
    stopEnemyTimer();
    addLog(`★ ${defeatedName} を倒した！`);

    const nextEnemyIdx = eIdx + 1;
    if (nextEnemyIdx < FLOORS[fIdx].enemies.length) {
      setCurrentEnemyIndex(nextEnemyIdx);
      setTimeout(() => {
        loadEnemy(fIdx, nextEnemyIdx);
      }, 500);
    } else {
      const nextFloorIdx = fIdx + 1;
      if (nextFloorIdx < FLOORS.length) {
        setCurrentFloorIndex(nextFloorIdx);
        setCurrentEnemyIndex(0);
        setShowNextBtn(true);
      } else {
        addLog('🎉 **ダンジョン全10階層制覇！おめでとうございます！**');
        setGameState('cleared');
      }
    }
  };

  const handleNextStage = () => {
    setShowNextBtn(false);
    loadEnemy(currentFloorIndex, 0);
  };

  const handleRestart = () => {
    stopEnemyTimer();
    setGameState('setup');
    setPlayer({
      name: '',
      hp: 0,
      maxHp: 0,
      atk: 0,
      sp: 0,
      type: '',
      status: null,
    });
    setEnemy({
      name: '',
      hp: 0,
      maxHp: 0,
      atk: 0,
      baseAtk: 0,
      status: null,
      type: '',
      buffTurns: 0,
    });
    setCurrentFloorIndex(0);
    setCurrentEnemyIndex(0);
    setLogs([]);
    setShowNextBtn(false);
    setControlsDisabled(false);
  };

  // Status effect text helper
  const getPlayerStatusText = (status: StatusEffect | null) => {
    if (!status) return 'なし';
    if (status.type === 'bind') return `拘束 (残${status.turns}T)`;
    if (status.type === 'burned') return `火傷 (残${status.turns}T)`;
    return 'なし';
  };

  const getEnemyStatusText = (status: StatusEffect | null) => {
    if (!status) return 'なし';
    if (status.type === 'confused') return '困惑';
    if (status.type === 'frozen') return `凍結 (残${status.turns}T)`;
    if (status.type === 'burned') return `火傷 (残${status.turns}T)`;
    return 'なし';
  };

  // Skill button texts
  const getHealBtnText = () => {
    if (player.type === 'ラリ') return '油を蓄える (消費SP2/回復10)';
    if (player.type === 'オルゴン') return 'ライフフルーツ (消費SP2/回復20)';
    if (player.type === 'ドレイム') return 'ファイアハート (消費SP7/全回復&最大HPUP)';
    return '回復スキル';
  };

  const getAtkSkillBtnText = () => {
    if (player.type === 'ラリ') return '抱きつく (消費SP3/困惑)';
    if (player.type === 'オルゴン') return 'ダークアイス (消費SP4/凍結)';
    if (player.type === 'ドレイム') return 'ドットフレイム (消費SP1/火傷)';
    return '攻撃スキル';
  };

  const isBtnDisabled = controlsDisabled || (player.status?.type === 'bind');

  return (
    <div className="flex justify-center items-center min-h-screen p-2.5 sm:p-4 select-none">
      <div
        id="game-container"
        className="bg-[#1e1e1e] border-2 border-[#333] rounded-xl p-5 w-full max-w-[400px] shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
      >
        <h1 className="text-center m-0 text-xl font-bold text-[#f0a500] border-b-2 border-[#333] pb-2.5">
          階層ダンジョン
        </h1>

        {gameState === 'setup' && (
          <div id="setup-screen" className="mt-4">
            <p className="text-center text-[#aaa] text-sm mb-3">
              最初のモンスターを選んでください：
            </p>
            <div className="flex flex-col gap-2">
              {INITIAL_MONSTERS.map((m) => (
                <button
                  key={m.name}
                  onClick={() => handleSelectMonster(m.name, m.hp, m.atk, m.type)}
                  className="bg-[#3a3a3a] hover:bg-[#555] active:bg-[#666] text-white border border-[#555] hover:border-[#777] p-3 text-sm font-bold rounded-md cursor-pointer transition-all duration-200"
                >
                  {m.name} (HP:{m.hp} / 攻:{m.atk})
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState !== 'setup' && (
          <div id="game-screen" className="mt-2.5">
            <h2 id="floor-title" className="text-center mt-2.5 mb-2.5 text-base font-bold text-[#cccccc]">
              {FLOORS[currentFloorIndex]?.name}
            </h2>

            {/* Player Status Box */}
            <div className="bg-[#2a2a2a] border border-[#444] p-2.5 px-3.5 mb-2.5 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <strong>【味方】 <span id="player-name">{player.name}</span></strong>
                <span className="text-[#00d2d3] font-bold">
                  SP: <span id="player-sp">{player.sp}</span> pt
                </span>
              </div>
              <div className="text-[#ff5555] font-bold">
                HP: <span id="player-hp">{player.hp}</span> / <span id="player-max-hp">{player.maxHp}</span>
              </div>
              <div className="text-[#fabca1] text-[13px] font-bold" id="player-status">
                状態: {getPlayerStatusText(player.status)}
              </div>
            </div>

            {/* Enemy Status Box */}
            <div className="bg-[#2a2a2a] border border-[#444] p-2.5 px-3.5 mb-2.5 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <strong>【敵】 <span id="enemy-name">{enemy.name}</span></strong>
                <span className="text-[#fabca1] text-[13px] font-bold" id="enemy-status">
                  状態: {getEnemyStatusText(enemy.status)}
                </span>
              </div>
              <div className="text-[#ff5555] font-bold">
                HP: <span id="enemy-hp">{enemy.hp}</span> / <span id="enemy-max-hp">{enemy.maxHp}</span>
              </div>
            </div>

            {/* Log Box */}
            <div
              id="log-box"
              ref={logBoxRef}
              className="log-box bg-[#0d0d0d] border border-[#333] h-[160px] overflow-y-auto p-2.5 text-[13px] leading-relaxed mb-3.5 rounded-md"
            >
              {logs.map((log, index) => (
                <p key={index} className="my-[3px] text-[#e0e0e0] break-words">
                  {log}
                </p>
              ))}
            </div>

            {/* Battle Controls */}
            {gameState === 'battle' && !showNextBtn && (
              <div id="battle-controls" className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="atk-btn"
                    disabled={isBtnDisabled}
                    onClick={() => handlePlayerAction('attack')}
                    className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] disabled:border-[#333] disabled:cursor-not-allowed text-white border border-[#555] hover:border-[#777] p-3 text-xs sm:text-[13px] font-bold rounded-md cursor-pointer transition-all duration-200"
                  >
                    通常攻撃
                  </button>
                  <button
                    id="heal-btn"
                    disabled={isBtnDisabled}
                    onClick={() => handlePlayerAction('heal_skill')}
                    className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] disabled:border-[#333] disabled:cursor-not-allowed text-white border border-[#555] hover:border-[#777] p-3 text-xs sm:text-[13px] font-bold rounded-md cursor-pointer transition-all duration-200"
                  >
                    {getHealBtnText()}
                  </button>
                </div>
                <button
                  id="atk-skill-btn"
                  disabled={isBtnDisabled}
                  onClick={() => handlePlayerAction('atk_skill')}
                  className="bg-[#3a3a3a] hover:bg-[#555] disabled:bg-[#222] disabled:text-[#555] disabled:border-[#333] disabled:cursor-not-allowed text-white border border-[#555] hover:border-[#777] p-3 text-xs sm:text-[13px] font-bold rounded-md cursor-pointer transition-all duration-200"
                >
                  {getAtkSkillBtnText()}
                </button>
              </div>
            )}

            {/* Next / Restart Buttons */}
            <div className="flex flex-col gap-2 mt-2">
              {showNextBtn && (
                <button
                  id="next-btn"
                  onClick={handleNextStage}
                  className="bg-[#f0a500] hover:bg-[#e09400] text-[#121212] font-black p-3 text-sm rounded-md cursor-pointer transition-all shadow-md"
                >
                  次の階層へ
                </button>
              )}

              {(gameState === 'gameover' || gameState === 'cleared') && (
                <button
                  id="restart-btn"
                  onClick={handleRestart}
                  className="bg-[#3a3a3a] hover:bg-[#555] text-white border border-[#555] hover:border-[#777] p-3 text-sm font-bold rounded-md cursor-pointer transition-all duration-200"
                >
                  最初からやり直す
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

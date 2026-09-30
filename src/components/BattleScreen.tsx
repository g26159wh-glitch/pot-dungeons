import React, { useState, useEffect, useRef } from 'react';
import { CalculatedUnit, SkillEffectType } from '../types';

interface BattleScreenProps {
  initialPlayer: CalculatedUnit;
  enemyQueue: CalculatedUnit[];
  floor: number;
  onFloorClear: () => void;
  onExit: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  initialPlayer,
  enemyQueue: initialEnemyQueue,
  floor,
  onFloorClear,
  onExit,
}) => {
  const [player, setPlayer] = useState<CalculatedUnit>(initialPlayer);
  const [enemy, setEnemy] = useState<CalculatedUnit | null>(null);
  const [queue, setQueue] = useState<CalculatedUnit[]>(initialEnemyQueue);
  const [logs, setLogs] = useState<string[]>(['ダンジョン侵入！戦闘開始！']);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showExit, setShowExit] = useState<boolean>(false);

  const logBoxRef = useRef<HTMLDivElement>(null);
  const drugTimerRef = useRef<NodeJS.Timeout | null>(null);
  const enonTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cowTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const clearIntervals = () => {
    if (drugTimerRef.current) clearInterval(drugTimerRef.current);
    if (enonTimerRef.current) clearInterval(enonTimerRef.current);
    if (cowTimerRef.current) clearInterval(cowTimerRef.current);
  };

  useEffect(() => {
    // Start battle with first enemy
    startNextEnemy(queue, player);
    return () => {
      clearIntervals();
    };
  }, []);

  const setupEnemyTimer = (targetEnemy: CalculatedUnit) => {
    clearIntervals();
    if (targetEnemy.name === 'ドラッグゴーレム') {
      drugTimerRef.current = setInterval(() => {
        setEnemy((curr) => {
          if (!curr || curr.hp <= 0) return curr;
          const next = { ...curr, status: { ...curr.status } };
          if (Math.random() < 0.75) {
            next.hp = Math.min(next.maxHp, next.hp + 20);
            next.status.atkBuff = (next.status.atkBuff || 0) + 4;
            addLog(`【ドラッグゴーレム】ドラッグ服用！ HP20回復、攻撃力+4！`);
          } else {
            next.hp = Math.max(1, next.hp - 15);
            next.status.atkBuff = (next.status.atkBuff || 0) - 5;
            addLog(`【ドラッグゴーレム】ドラッグ失敗！ HP15低下、攻撃力-5！`);
          }
          return next;
        });
      }, 20000);
    } else if (targetEnemy.name === 'ゑノン') {
      enonTimerRef.current = setInterval(() => {
        setEnemy((curr) => {
          if (!curr || curr.hp <= 0) return curr;
          const next = { ...curr };
          if (Math.random() < 0.5) {
            next.hp = Math.min(next.maxHp, next.hp + 20);
            addLog(`【ゑノン】能力成功！ HP20回復！`);
          } else {
            addLog(`【ゑノン】能力失敗！`);
          }
          return next;
        });
      }, 30000);
    } else if (targetEnemy.name === 'レインボーウシ') {
      cowTimerRef.current = setInterval(() => {
        if (Math.random() < 0.25) {
          addLog(`【レインボーウシ】突進成功！ 25ダメージ！`);
          setPlayer((p) => {
            const nextP = { ...p, hp: Math.max(0, p.hp - 25) };
            if (nextP.hp <= 0) {
              handlePlayerDeath(nextP);
            }
            return nextP;
          });
        } else {
          addLog(`【レインボーウシ】突進失敗！`);
        }
      }, 10000);
    }
  };

  const startNextEnemy = (currentQueue: CalculatedUnit[], currPlayer: CalculatedUnit) => {
    if (currentQueue.length === 0) {
      addLog(`<strong>第 ${floor} 階層 クリア！</strong>`);
      clearIntervals();
      setShowExit(true);
      onFloorClear();
      return;
    }

    const nextE = currentQueue[0];
    const remQueue = currentQueue.slice(1);
    setEnemy(nextE);
    setQueue(remQueue);
    addLog(`【${nextE.name}】が現れた！`);

    setupEnemyTimer(nextE);
    startTurn(currPlayer, nextE);
  };

  const applySkillEffect = (
    effectType: SkillEffectType,
    _attacker: CalculatedUnit,
    target: CalculatedUnit
  ) => {
    if (effectType === 'freeze') {
      target.status.freeze = Math.floor(Math.random() * 3) + 2;
      addLog(`【${target.name}】を凍結させた！（2～4ターン）`);
    } else if (effectType === 'burn') {
      target.status.burn = Math.floor(Math.random() * 3) + 2;
      addLog(`【${target.name}】を火傷状態にした！（2～4ターン）`);
    } else if (effectType === 'confuse') {
      target.status.confuse = Math.floor(Math.random() * 3) + 5;
      addLog(`【${target.name}】を困惑させた！（5～7ターン）`);
    } else if (effectType === 'bound') {
      target.status.bound = Math.floor(Math.random() * 3) + 3;
      addLog(`【${target.name}】を拘束した！（3～5ターン）`);
    } else if (effectType === 'abyss') {
      const r = Math.random();
      if (r < 0.25) {
        target.status.bound = Math.floor(Math.random() * 3) + 3;
        addLog(`【アビス】拘束発動！`);
      } else if (r < 0.75) {
        target.status.burn = Math.floor(Math.random() * 3) + 2;
        addLog(`【アビス】火傷発動！`);
      } else {
        const dmg = Math.floor(Math.random() * 8) + 10;
        target.hp = Math.max(0, target.hp - dmg);
        addLog(`【アビス】棺桶をぶつけた！ (${dmg}ダメージ)`);
      }
    } else if (effectType === 'bleed') {
      target.status.bleed = 4;
      addLog(`【${target.name}】を出血状態にした！（4ターン）`);
    } else if (effectType === 'shock') {
      target.status.shock = Math.floor(Math.random() * 3) + 6;
      addLog(`【${target.name}】を感電させた！（6～8ターン）`);
    } else if (effectType === 'fear') {
      if (Math.random() < 0.6) {
        target.status.atkBuff = (target.status.atkBuff || 0) - 4;
        addLog(`【${target.name}】は恐怖して攻撃力が4下がった！`);
      } else {
        addLog(`【${target.name}】は恐怖に打ち勝った！`);
      }
    } else if (effectType === 'blind') {
      target.status.blind = Math.floor(Math.random() * 3) + 3;
      addLog(`【${target.name}】を暗闇状態にした！`);
    }
  };

  const handlePlayerDeath = (pState: CalculatedUnit) => {
    if (pState.ability === '起死回生' && !pState.revived) {
      pState.revived = true;
      pState.hp = pState.maxHp;
      addLog(`<strong>【起死回生】死から蘇った！</strong>`);
      return false;
    }
    addLog(`<strong>全滅しました... ホームに戻ります。</strong>`);
    clearIntervals();
    setShowExit(true);
    setIsProcessing(true);
    return true;
  };

  const handleStatusEffects = (unit: CalculatedUnit, label: string) => {
    if (unit.status.burn > 0) {
      unit.status.burn--;
      unit.hp = Math.max(0, unit.hp - 2);
      addLog(`【${label}】火傷ダメージ(2)`);
    }
    if (unit.status.bleed > 0) {
      unit.status.bleed--;
      unit.hp = Math.max(0, unit.hp - 7);
      addLog(`【${label}】出血ダメージ(7)`);
    }
  };

  const startTurn = (currP: CalculatedUnit, currE: CalculatedUnit) => {
    const p = { ...currP, status: { ...currP.status } };
    const e = { ...currE, status: { ...currE.status } };

    p.pt = (p.pt || 0) + 2;

    handleStatusEffects(p, '味方');
    handleStatusEffects(e, '敵');

    if (p.hp <= 0) {
      if (handlePlayerDeath(p)) {
        setPlayer(p);
        setEnemy(e);
        return;
      }
    }
    if (e.hp <= 0) {
      addLog(`【${e.name}】を倒した！`);
      setPlayer(p);
      setEnemy(e);
      setTimeout(() => startNextEnemy(queue, p), 600);
      return;
    }

    if (p.status.bound > 0) {
      p.status.bound--;
      addLog(`【味方】は拘束されて動けない！`);
      setPlayer(p);
      setEnemy(e);
      setIsProcessing(true);
      setTimeout(() => enemyTurn(p, e), 600);
      return;
    }
    if (p.status.freeze > 0) {
      p.status.freeze--;
      p.hp = Math.max(0, p.hp - 5);
      addLog(`【味方】は凍結ダメージ(5)を受け動けない！`);
      setPlayer(p);
      setEnemy(e);
      if (p.hp <= 0 && handlePlayerDeath(p)) return;
      setIsProcessing(true);
      setTimeout(() => enemyTurn(p, e), 600);
      return;
    }
    if (p.status.shock > 0) {
      p.status.shock--;
      if (Math.random() < 0.7) {
        addLog(`【味方】は感電して動けない！`);
        setPlayer(p);
        setEnemy(e);
        setIsProcessing(true);
        setTimeout(() => enemyTurn(p, e), 600);
        return;
      } else {
        p.hp = Math.max(0, p.hp - 1);
        addLog(`【味方】は感電ダメージ(1)を受けた！`);
        if (p.hp <= 0 && handlePlayerDeath(p)) {
          setPlayer(p);
          setEnemy(e);
          return;
        }
      }
    }

    addLog(`--- あなたのターン (PT: ${p.pt}) ---`);
    setPlayer(p);
    setEnemy(e);
    setIsProcessing(false);
  };

  const playerAction = (type: 'atk' | 'satk' | 'srec') => {
    if (isProcessing || !enemy) return;
    setIsProcessing(true);

    const p = { ...player, status: { ...player.status } };
    const e = { ...enemy, status: { ...enemy.status } };

    if (p.status.confuse > 0) {
      p.status.confuse--;
      if (Math.random() < 0.3) {
        const selfDmg = Math.max(1, p.atk + (p.status.atkBuff || 0));
        p.hp = Math.max(0, p.hp - selfDmg);
        addLog(`【味方】は困惑して自分を攻撃した！ (${selfDmg}ダメージ)`);
        setPlayer(p);
        setEnemy(e);
        if (p.hp <= 0 && handlePlayerDeath(p)) return;
        setTimeout(() => enemyTurn(p, e), 600);
        return;
      }
    }

    if (p.status.blind > 0) {
      const r = Math.random();
      if (r < 0.25) {
        addLog(`【暗闇】攻撃を外してしまった！`);
        setPlayer(p);
        setEnemy(e);
        setTimeout(() => enemyTurn(p, e), 600);
        return;
      } else if (r < 0.5 && type === 'satk') {
        const selfDmg = Math.max(1, p.atk + (p.status.atkBuff || 0));
        p.hp = Math.max(0, p.hp - selfDmg);
        addLog(`【暗闇】スキルが自分に当たってしまった！ (${selfDmg}ダメージ)`);
        setPlayer(p);
        setEnemy(e);
        if (p.hp <= 0 && handlePlayerDeath(p)) return;
        setTimeout(() => enemyTurn(p, e), 600);
        return;
      } else if (r < 0.75 && type === 'srec') {
        e.hp = Math.min(e.maxHp, e.hp + 20);
        addLog(`【暗闇】回復スキルを敵に使ってしまった！`);
        setPlayer(p);
        setEnemy(e);
        setTimeout(() => enemyTurn(p, e), 600);
        return;
      } else if (r >= 0.75) {
        p.status.atkBuff = (p.status.atkBuff || 0) - 4;
        addLog(`【暗闇】恐怖により攻撃力が4下がった！`);
      }
    }

    if (type === 'atk') {
      const dmg = Math.max(1, p.atk + (p.status.atkBuff || 0));
      e.hp = Math.max(0, e.hp - dmg);
      addLog(`【${p.name}】の通常攻撃！ ${e.name} に ${dmg} ダメージ！`);
    } else if (type === 'satk' && p.skillAtk) {
      const skill = p.skillAtk;
      p.pt = (p.pt || 0) - skill.cost;
      addLog(`【${p.name}】の ${skill.name}！`);
      const baseDmg = Math.max(1, p.atk + (p.status.atkBuff || 0));
      e.hp = Math.max(0, e.hp - baseDmg);
      if (skill.effect) applySkillEffect(skill.effect, p, e);
    } else if (type === 'srec' && p.skillRec) {
      const skill = p.skillRec;
      p.pt = (p.pt || 0) - skill.cost;
      const healAmt = skill.calcAmount || skill.amount || 20;
      p.hp = Math.min(p.maxHp, p.hp + healAmt);
      addLog(`【${p.name}】の ${skill.name}！ HP${healAmt}回復！`);
    }

    setPlayer(p);
    setEnemy(e);

    if (e.hp <= 0) {
      addLog(`【${e.name}】を倒した！`);
      setTimeout(() => startNextEnemy(queue, p), 600);
      return;
    }

    setTimeout(() => enemyTurn(p, e), 600);
  };

  const enemyTurn = (currP: CalculatedUnit, currE: CalculatedUnit) => {
    if (currE.hp <= 0) return;

    const p = { ...currP, status: { ...currP.status } };
    const e = { ...currE, status: { ...currE.status } };

    if (e.status.bound > 0) {
      e.status.bound--;
      addLog(`【${e.name}】は拘束されていて動けない！`);
      setPlayer(p);
      setEnemy(e);
      setTimeout(() => startTurn(p, e), 600);
      return;
    }
    if (e.status.freeze > 0) {
      e.status.freeze--;
      e.hp = Math.max(0, e.hp - 5);
      addLog(`【${e.name}】は凍結して動けない！(5ダメージ)`);
      setPlayer(p);
      setEnemy(e);
      if (e.hp <= 0) {
        addLog(`【${e.name}】を倒した！`);
        setTimeout(() => startNextEnemy(queue, p), 600);
        return;
      }
      setTimeout(() => startTurn(p, e), 600);
      return;
    }
    if (e.status.shock > 0) {
      e.status.shock--;
      if (Math.random() < 0.7) {
        addLog(`【${e.name}】は感電して動けない！`);
        setPlayer(p);
        setEnemy(e);
        setTimeout(() => startTurn(p, e), 600);
        return;
      } else {
        e.hp = Math.max(0, e.hp - 1);
        addLog(`【${e.name}】は感電ダメージ(1)を受けた！`);
        if (e.hp <= 0) {
          addLog(`【${e.name}】を倒した！`);
          setPlayer(p);
          setEnemy(e);
          setTimeout(() => startNextEnemy(queue, p), 600);
          return;
        }
      }
    }

    if (e.skillAtk && Math.random() < 0.5) {
      addLog(`【${e.name}】の ${e.skillAtk.name}！`);
      const dmg = Math.max(1, e.atk + (e.status.atkBuff || 0));
      p.hp = Math.max(0, p.hp - dmg);
      if (e.skillAtk.effect) applySkillEffect(e.skillAtk.effect, e, p);
    } else {
      const dmg = Math.max(1, e.atk + (e.status.atkBuff || 0));
      p.hp = Math.max(0, p.hp - dmg);
      addLog(`【${e.name}】の通常攻撃！ あなたに ${dmg} ダメージ！`);
    }

    setPlayer(p);
    setEnemy(e);

    if (p.hp <= 0) {
      if (handlePlayerDeath(p)) return;
    }

    setTimeout(() => startTurn(p, e), 600);
  };

  const pPt = player.pt || 0;
  const satkCost = player.skillAtk ? player.skillAtk.cost : 99;
  const srecCost = player.skillRec ? player.skillRec.cost : 99;

  return (
    <div id="screen-battle" className="active">
      <h2>第 <span id="battle-floor-num">{floor}</span> 階層</h2>

      <div className="battle-display">
        {/* 味方 */}
        <div className="unit-card">
          <div id="player-img" className="unit-img">
            {player.img ? <img src={player.img} alt={player.name} /> : '立ち絵なし'}
          </div>
          <strong id="player-name">{player.name} (Lv.{player.level})</strong>
          <div className="hp-bar-bg">
            <div
              id="player-hp-bar"
              className="hp-bar-fill"
              style={{ width: `${Math.max(0, (player.hp / player.maxHp) * 100)}%` }}
            />
          </div>
          <div>HP: <span id="player-hp">{player.hp}</span>/<span id="player-max-hp">{player.maxHp}</span></div>
        </div>

        {/* 敵 */}
        <div className="unit-card">
          <div id="enemy-img" className="unit-img">
            {enemy?.img ? <img src={enemy.img} alt={enemy.name} /> : '立ち絵なし'}
          </div>
          <strong id="enemy-name">{enemy ? enemy.name : '-'}</strong>
          <div className="hp-bar-bg">
            <div
              id="enemy-hp-bar"
              className="hp-bar-fill"
              style={{
                background: '#ff1744',
                width: `${enemy ? Math.max(0, (enemy.hp / enemy.maxHp) * 100) : 0}%`,
              }}
            />
          </div>
          <div>HP: <span id="enemy-hp">{enemy ? enemy.hp : 0}</span>/<span id="enemy-max-hp">{enemy ? enemy.maxHp : 0}</span></div>
        </div>
      </div>

      <p>現在所持PT: <strong id="battle-pt" style={{ color: '#ffd600', fontSize: '18px' }}>{pPt}</strong></p>

      {/* コマンド */}
      <div>
        <button
          id="btn-atk"
          disabled={isProcessing || !enemy}
          onClick={() => playerAction('atk')}
        >
          通常攻撃
        </button>
        <button
          id="btn-satk"
          disabled={isProcessing || !player.skillAtk || pPt < satkCost || !enemy}
          onClick={() => playerAction('satk')}
        >
          <span id="name-satk">{player.skillAtk ? player.skillAtk.name : '攻撃スキルなし'}</span> (
          <span id="cost-satk">{satkCost}</span>PT)
        </button>
        <button
          id="btn-srec"
          disabled={isProcessing || !player.skillRec || pPt < srecCost || !enemy}
          onClick={() => playerAction('srec')}
        >
          <span id="name-srec">{player.skillRec ? player.skillRec.name : '回復スキルなし'}</span> (
          <span id="cost-srec">{srecCost}</span>PT)
        </button>
      </div>

      <div
        id="battle-log"
        className="log-box"
        ref={logBoxRef}
      >
        {logs.map((log, i) => (
          <div key={i} dangerouslySetInnerHTML={{ __html: log }} />
        ))}
      </div>

      {showExit && (
        <button id="btn-battle-exit" onClick={onExit}>
          ホームへ戻る
        </button>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { MasterMonster, GachaRank, SkillEffectType } from '../types';

interface AdminScreenProps {
  masterMonsters: Record<string, MasterMonster>;
  gachaPool: Record<GachaRank, string[]>;
  floorConfig: Record<number, string[]>;
  db: Record<string, any>;
  onSaveMasterMonsters: (monsters: Record<string, MasterMonster>) => void;
  onSaveGachaPool: (pool: Record<GachaRank, string[]>) => void;
  onSaveFloorConfig: (floors: Record<number, string[]>) => void;
  onSaveDB: (newDb: Record<string, any>) => void;
  onLogout: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({
  masterMonsters,
  gachaPool,
  floorConfig,
  db,
  onSaveMasterMonsters,
  onSaveGachaPool,
  onSaveFloorConfig,
  onSaveDB,
  onLogout,
}) => {
  // 1. Monster create inputs
  const [newMName, setNewMName] = useState('');
  const [newMHp, setNewMHp] = useState<number | ''>('');
  const [newMAtk, setNewMAtk] = useState<number | ''>('');
  const [newSatkName, setNewSatkName] = useState('');
  const [newSatkCost, setNewSatkCost] = useState(3);
  const [newSatkEffect, setNewSatkEffect] = useState<SkillEffectType>('');
  const [newSrecName, setNewSrecName] = useState('');
  const [newSrecCost, setNewSrecCost] = useState(2);
  const [newSrecAmount, setNewSrecAmount] = useState(20);
  const [newMImg, setNewMImg] = useState('');

  // 2. Existing monster edit state
  const [editMonsters, setEditMonsters] = useState<Record<string, MasterMonster>>({ ...masterMonsters });

  // 3. Gacha inputs
  const [gachaMName, setGachaMName] = useState('');
  const [gachaRank, setGachaRank] = useState<GachaRank>('N');

  // 4. Player cheats inputs
  const [cheatPlayerName, setCheatPlayerName] = useState('');
  const [cheatGems, setCheatGems] = useState<number | ''>('');

  // 5. Floor enemy inputs
  const [floorNum, setFloorNum] = useState<number | ''>('');
  const [floorMName, setFloorMName] = useState('');

  // 6. JS Console
  const [jsCode, setJsCode] = useState('');
  const [jsOutput, setJsOutput] = useState('実行ログがここに表示されます。');

  // Handle new monster file upload
  const handleNewMonsterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setNewMImg(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMonster = () => {
    const name = newMName.trim();
    const hp = Number(newMHp);
    const atk = Number(newMAtk);

    if (!name || isNaN(hp) || isNaN(atk)) {
      alert('名前・HP・攻撃力を正しく入力してください');
      return;
    }

    const updated = {
      ...masterMonsters,
      [name]: {
        hp,
        atk,
        img: newMImg,
        skillAtk: newSatkName.trim()
          ? {
              name: newSatkName.trim(),
              cost: Number(newSatkCost) || 3,
              effect: newSatkEffect,
            }
          : null,
        skillRec: newSrecName.trim()
          ? {
              name: newSrecName.trim(),
              cost: Number(newSrecCost) || 2,
              amount: Number(newSrecAmount) || 20,
            }
          : null,
      },
    };

    onSaveMasterMonsters(updated);
    setEditMonsters(updated);
    alert(`新規モンスター [${name}] を追加保存しました。`);

    setNewMName('');
    setNewMHp('');
    setNewMAtk('');
    setNewSatkName('');
    setNewSrecName('');
    setNewMImg('');
  };

  const handleSaveMonsterEdit = (mName: string) => {
    const target = editMonsters[mName];
    if (!target) return;

    const updated = {
      ...masterMonsters,
      [mName]: { ...target },
    };
    onSaveMasterMonsters(updated);
    alert(`[${mName}] のパラメータ設定を更新しました！`);
  };

  const handleUploadExistingImage = (mName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setEditMonsters((prev) => ({
        ...prev,
        [mName]: {
          ...prev[mName],
          img: base64,
        },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddGachaMonster = () => {
    const name = gachaMName.trim();
    if (!name) {
      alert('モンスター名を入力してください。');
      return;
    }
    if (!masterMonsters[name]) {
      alert(`モンスター [${name}] は登録されていません。`);
      return;
    }

    const rankList = gachaPool[gachaRank] ? [...gachaPool[gachaRank]] : [];
    if (!rankList.includes(name)) {
      rankList.push(name);
      const updated = {
        ...gachaPool,
        [gachaRank]: rankList,
      };
      onSaveGachaPool(updated);
      alert(`[${name}] を ${gachaRank} レアガチャに追加しました！`);
      setGachaMName('');
    } else {
      alert(`すでに ${gachaRank} ガチャに登録されています。`);
    }
  };

  const handleRemoveGachaMonster = (rank: GachaRank, name: string) => {
    if (gachaPool[rank]) {
      const updated = {
        ...gachaPool,
        [rank]: gachaPool[rank].filter((n) => n !== name),
      };
      onSaveGachaPool(updated);
    }
  };

  const handleAddGems = () => {
    const target = cheatPlayerName.trim();
    const amt = Number(cheatGems);
    if (db[target] && !isNaN(amt)) {
      const newDb = {
        ...db,
        [target]: {
          ...db[target],
          gems: (db[target].gems || 0) + amt,
        },
      };
      onSaveDB(newDb);
      alert(`${target} に ${amt}💎 を付与しました。`);
    } else {
      alert('ユーザーが見つかりません。');
    }
  };

  const handleGiveAdminCat = () => {
    const target = cheatPlayerName.trim();
    if (db[target]) {
      const monsters = [...(db[target].monsters || [])];
      monsters.push({ name: '管理猫', level: 100 });
      const newDb = {
        ...db,
        [target]: {
          ...db[target],
          monsters,
        },
      };
      onSaveDB(newDb);
      alert(`${target} に 「管理猫 (Lv.100)」 を付与しました！`);
    } else {
      alert('ユーザーが見つかりません。');
    }
  };

  const handleResetPlayer = () => {
    const target = cheatPlayerName.trim();
    if (db[target]) {
      if (confirm(`本当にプレイヤー [${target}] のデータを初期状態にリセットしますか？`)) {
        const pass = db[target].pass;
        const newDb = {
          ...db,
          [target]: {
            pass,
            gems: 0,
            floor: 1,
            monsters: [{ name: 'スライム', level: 1 }],
            selectedIndex: 0,
          },
        };
        onSaveDB(newDb);
        alert(`[${target}] のデータをリセットしました。`);
      }
    } else {
      alert('ユーザーが見つかりません。');
    }
  };

  const handleSetFloorEnemy = () => {
    const fNum = Number(floorNum);
    const mName = floorMName.trim();
    if (isNaN(fNum) || !mName) return;

    const list = floorConfig[fNum] ? [...floorConfig[fNum]] : [];
    list.push(mName);
    const updated = {
      ...floorConfig,
      [fNum]: list,
    };
    onSaveFloorConfig(updated);
    alert(`第 ${fNum} 階層に [${mName}] を配置しました。`);
    setFloorMName('');
  };

  const handleRunCode = () => {
    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' '));
        originalLog.apply(console, args);
      };
      // eslint-disable-next-line no-eval
      const result = eval(jsCode);
      console.log = originalLog;

      let out = '実行成功:\n';
      if (logs.length > 0) out += logs.join('\n') + '\n';
      if (result !== undefined) {
        out += '戻り値: ' + (typeof result === 'object' ? JSON.stringify(result) : result);
      }
      setJsOutput(out);
    } catch (err: any) {
      setJsOutput(`エラー: ${err.message}`);
    }
  };

  return (
    <div id="screen-admin" className="active">
      <h2>★ 管理者ルーム ★</h2>

      {/* 1. モンスター新規追加 */}
      <h3>1. モンスター新規追加</h3>
      <input
        type="text"
        id="adm-m-name"
        placeholder="モンスター名"
        value={newMName}
        onChange={(e) => setNewMName(e.target.value)}
      />
      <input
        type="number"
        id="adm-m-hp"
        placeholder="基本HP (Lv.1)"
        value={newMHp}
        onChange={(e) => setNewMHp(e.target.value === '' ? '' : Number(e.target.value))}
      />
      <input
        type="number"
        id="adm-m-atk"
        placeholder="基本攻撃力 (Lv.1)"
        value={newMAtk}
        onChange={(e) => setNewMAtk(e.target.value === '' ? '' : Number(e.target.value))}
      />

      <div className="skill-box">
        <h4 style={{ margin: '0 0 5px 0', color: '#ffd600' }}>攻撃スキル設定</h4>
        <input
          type="text"
          id="adm-s-name"
          placeholder="攻撃スキル名（例: ダークアイス）"
          value={newSatkName}
          onChange={(e) => setNewSatkName(e.target.value)}
        />
        <input
          type="number"
          id="adm-s-cost"
          placeholder="消費PT（例: 3）"
          value={newSatkCost}
          onChange={(e) => setNewSatkCost(Number(e.target.value))}
        />
        <select
          id="adm-s-effect"
          value={newSatkEffect}
          onChange={(e) => setNewSatkEffect(e.target.value as SkillEffectType)}
        >
          <option value="">追加効果なし</option>
          <option value="freeze">凍結（毎ターン5ダメ+動けない 2～4ターン）</option>
          <option value="burn">火傷（毎ターン2ダメ 2～4ターン）</option>
          <option value="confuse">困惑（攻撃時30%で自分攻撃 5～7ターン）</option>
          <option value="bound">拘束（3～5ターン動けない）</option>
          <option value="abyss">アビス（25%拘束/50%火傷/25%棺桶10-17ダメ）</option>
          <option value="bleed">出血（毎ターン7ダメ 4ターン）</option>
          <option value="shock">感電（70%動けない/30%1ダメ 6～8ターン）</option>
          <option value="fear">恐怖（60%で攻撃力4低下）</option>
          <option value="blind">暗闇（25%攻撃ミス/誤爆/恐怖）</option>
        </select>
      </div>

      <div className="skill-box">
        <h4 style={{ margin: '0 0 5px 0', color: '#00e676' }}>回復スキル設定</h4>
        <input
          type="text"
          id="adm-rec-name"
          placeholder="回復スキル名（例: ライフフルーツ）"
          value={newSrecName}
          onChange={(e) => setNewSrecName(e.target.value)}
        />
        <input
          type="number"
          id="adm-rec-cost"
          placeholder="消費PT（例: 2）"
          value={newSrecCost}
          onChange={(e) => setNewSrecCost(Number(e.target.value))}
        />
        <input
          type="number"
          id="adm-rec-amount"
          placeholder="基本回復量 (Lv.1)"
          value={newSrecAmount}
          onChange={(e) => setNewSrecAmount(Number(e.target.value))}
        />
      </div>

      <label className="file-label">
        立ち絵画像ファイルを選択
        <input
          type="file"
          id="adm-m-file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleNewMonsterFileUpload}
        />
      </label>
      <input
        type="text"
        id="adm-m-img"
        placeholder="または画像URLを入力"
        value={newMImg}
        onChange={(e) => setNewMImg(e.target.value)}
      />
      <button onClick={handleCreateMonster} style={{ marginTop: '10px', width: '100%' }}>
        モンスターデータ追加
      </button>

      {/* 2. 既存モンスターのステータス・能力編集 */}
      <h3>2. 既存モンスターのステータス・能力編集</h3>
      <div id="adm-monster-edit-list">
        {(Object.entries(editMonsters) as [string, MasterMonster][]).map(([mName, m]) => {
          const satk = m.skillAtk || { name: '', cost: 3, effect: '' as SkillEffectType };
          const srec = m.skillRec || { name: '', cost: 2, amount: 20 };

          return (
            <div key={mName} className="admin-edit-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="unit-img" style={{ width: '60px', height: '60px' }}>
                  {m.img ? <img src={m.img} alt={mName} /> : 'なし'}
                </div>
                <strong>{mName}</strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '5px' }}>
                <label style={{ fontSize: '11px' }}>
                  基本HP:
                  <input
                    type="number"
                    value={m.hp}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditMonsters((prev) => ({
                        ...prev,
                        [mName]: { ...prev[mName], hp: val },
                      }));
                    }}
                  />
                </label>
                <label style={{ fontSize: '11px' }}>
                  基本ATK:
                  <input
                    type="number"
                    value={m.atk}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditMonsters((prev) => ({
                        ...prev,
                        [mName]: { ...prev[mName], atk: val },
                      }));
                    }}
                  />
                </label>
              </div>

              <div className="skill-box" style={{ margin: '5px 0', padding: '5px' }}>
                <span style={{ fontSize: '11px', color: '#ffd600' }}>【攻撃スキル】</span>
                <input
                  type="text"
                  value={satk.name}
                  placeholder="スキル名"
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditMonsters((prev) => ({
                      ...prev,
                      [mName]: {
                        ...prev[mName],
                        skillAtk: val ? { ...satk, name: val } : null,
                      },
                    }));
                  }}
                />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="number"
                    value={satk.cost}
                    placeholder="消費PT"
                    style={{ width: '50%' }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditMonsters((prev) => ({
                        ...prev,
                        [mName]: {
                          ...prev[mName],
                          skillAtk: { ...satk, cost: val },
                        },
                      }));
                    }}
                  />
                  <select
                    value={satk.effect || ''}
                    style={{ width: '50%' }}
                    onChange={(e) => {
                      const val = e.target.value as SkillEffectType;
                      setEditMonsters((prev) => ({
                        ...prev,
                        [mName]: {
                          ...prev[mName],
                          skillAtk: { ...satk, effect: val },
                        },
                      }));
                    }}
                  >
                    <option value="">効果なし</option>
                    <option value="freeze">凍結</option>
                    <option value="burn">火傷</option>
                    <option value="confuse">困惑</option>
                    <option value="bound">拘束</option>
                    <option value="abyss">アビス</option>
                    <option value="bleed">出血</option>
                    <option value="shock">感電</option>
                    <option value="fear">恐怖</option>
                    <option value="blind">暗闇</option>
                  </select>
                </div>
              </div>

              <div className="skill-box" style={{ margin: '5px 0', padding: '5px' }}>
                <span style={{ fontSize: '11px', color: '#00e676' }}>【回復スキル】</span>
                <input
                  type="text"
                  value={srec.name}
                  placeholder="スキル名"
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditMonsters((prev) => ({
                      ...prev,
                      [mName]: {
                        ...prev[mName],
                        skillRec: val ? { ...srec, name: val } : null,
                      },
                    }));
                  }}
                />
                <div style={{ display: 'flex', gap: '5px' }}>
                  <input
                    type="number"
                    value={srec.cost}
                    placeholder="消費PT"
                    style={{ width: '50%' }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditMonsters((prev) => ({
                        ...prev,
                        [mName]: {
                          ...prev[mName],
                          skillRec: { ...srec, cost: val },
                        },
                      }));
                    }}
                  />
                  <input
                    type="number"
                    value={srec.amount || 20}
                    placeholder="基本回復量"
                    style={{ width: '50%' }}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditMonsters((prev) => ({
                        ...prev,
                        [mName]: {
                          ...prev[mName],
                          skillRec: { ...srec, amount: val },
                        },
                      }));
                    }}
                  />
                </div>
              </div>

              <label className="file-label">
                立ち絵変更
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => handleUploadExistingImage(mName, e)}
                />
              </label>
              <button
                className="btn-success"
                style={{ width: '100%', marginTop: '5px' }}
                onClick={() => handleSaveMonsterEdit(mName)}
              >
                このモンスターを保存
              </button>
            </div>
          );
        })}
      </div>

      {/* 3. ガチャ排出モンスター設定 */}
      <h3>3. ガチャ排出モンスター設定</h3>
      <div className="skill-box">
        <input
          type="text"
          id="adm-gacha-mname"
          placeholder="ガチャに追加するモンスター名"
          value={gachaMName}
          onChange={(e) => setGachaMName(e.target.value)}
        />
        <select
          id="adm-gacha-rank"
          value={gachaRank}
          onChange={(e) => setGachaRank(e.target.value as GachaRank)}
        >
          <option value="N">N (ノーマル - 45%)</option>
          <option value="R">R (レア - 35%)</option>
          <option value="SR">SR (Sレア - 14.999%)</option>
          <option value="SSR">SSR (SSレア - 4.5%)</option>
          <option value="UR">UR (ウルトラレア - 0.5%)</option>
          <option value="SCR">SCR (シークレット - 0.001%)</option>
        </select>
        <button className="btn-success" onClick={handleAddGachaMonster} style={{ width: '100%', marginTop: '5px' }}>
          ガチャに追加
        </button>
      </div>

      <div
        id="adm-gacha-pool-display"
        style={{
          fontSize: '12px',
          color: '#aaa',
          textAlign: 'left',
          background: '#111',
          padding: '10px',
          borderRadius: '6px',
          marginTop: '5px',
        }}
      >
        <strong>【現在のガチャ排出ラインナップ】</strong>
        <br />
        {(['N', 'R', 'SR', 'SSR', 'UR', 'SCR'] as GachaRank[]).map((r) => (
          <div key={r} style={{ marginTop: '4px' }}>
            <strong>{r}:</strong>{' '}
            {gachaPool[r] && gachaPool[r].length > 0 ? (
              gachaPool[r].map((mName) => (
                <span key={mName} className="gacha-tag">
                  {mName}
                  <button onClick={() => handleRemoveGachaMonster(r, mName)}>✕</button>
                </span>
              ))
            ) : (
              <span style={{ color: '#666' }}>なし</span>
            )}
          </div>
        ))}
      </div>

      {/* 4. プレイヤー操作・チート管理 */}
      <h3>4. プレイヤー操作・チート管理</h3>
      <div className="skill-box">
        <input
          type="text"
          id="adm-p-name"
          placeholder="対象プレイヤーのネームタグ"
          value={cheatPlayerName}
          onChange={(e) => setCheatPlayerName(e.target.value)}
        />
        <input
          type="number"
          id="adm-p-gems"
          placeholder="付与する💎の数"
          value={cheatGems}
          onChange={(e) => setCheatGems(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <button className="btn-success" onClick={handleAddGems} style={{ width: '100%' }}>
          💎を直接付与
        </button>
        <button className="btn-warning" onClick={handleGiveAdminCat} style={{ width: '100%', marginTop: '5px' }}>
          管理猫（HP:∞ / ATK:10000）を付与
        </button>
        <button className="btn-danger" onClick={handleResetPlayer} style={{ width: '100%', marginTop: '5px' }}>
          対象プレイヤーをリセット（最初から）
        </button>
      </div>

      {/* 5. 階層に敵を設定 */}
      <h3>5. 階層に敵を設定</h3>
      <input
        type="number"
        id="adm-f-num"
        placeholder="配置する階層番号 (例: 1)"
        value={floorNum}
        onChange={(e) => setFloorNum(e.target.value === '' ? '' : Number(e.target.value))}
      />
      <input
        type="text"
        id="adm-f-mname"
        placeholder="配置するモンスター名 (例: スライム)"
        value={floorMName}
        onChange={(e) => setFloorMName(e.target.value)}
      />
      <button onClick={handleSetFloorEnemy}>指定階層に敵を配置</button>

      <hr style={{ borderColor: '#444', margin: '20px 0' }} />

      {/* 6. JSコード実行コンソール */}
      <h3 style={{ color: '#ffd600' }}>6. JSコード実行コンソール（開発用）</h3>
      <textarea
        id="adm-code-input"
        placeholder="// JavaScriptコードをここに入力"
        value={jsCode}
        onChange={(e) => setJsCode(e.target.value)}
      />
      <button className="btn-success" onClick={handleRunCode} style={{ width: '100%' }}>
        コードを実行
      </button>
      <div
        id="adm-code-output"
        className="log-box"
        style={{ marginTop: '10px', height: '100px', color: '#00e676', whiteSpace: 'pre-wrap' }}
      >
        {jsOutput}
      </div>

      <br />
      <button
        className="btn-danger"
        onClick={onLogout}
        style={{ width: '100%', padding: '15px', marginTop: '10px' }}
      >
        管理者ルームを出る (ログアウト)
      </button>
    </div>
  );
};

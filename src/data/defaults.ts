import { MasterMonster, GachaRank, UnitStatus, CalculatedUnit, UserMonster } from '../types';

export const ADMIN_CODE = 'minecraftnohitopoteto723';

export const INITIAL_MASTER_MONSTERS: Record<string, MasterMonster> = {
  オルゴン: {
    hp: 140,
    atk: 5,
    img: '',
    skillAtk: { name: 'ダークアイス', cost: 4, effect: 'freeze' },
    skillRec: { name: 'ライフフルーツ', cost: 2, amount: 20 },
  },
  ラリ: {
    hp: 120,
    atk: 6,
    img: '',
    skillAtk: { name: '抱きつく', cost: 3, effect: 'confuse' },
    skillRec: { name: '油を蓄える', cost: 2, amount: 15 },
  },
  ドレイム: {
    hp: 80,
    atk: 6,
    img: '',
    skillAtk: { name: 'ドットフレイム', cost: 1, effect: 'burn' },
    skillRec: { name: 'ファイアハート', cost: 7, amount: 40 },
  },
  スライム: { hp: 100, atk: 3, img: '' },
  'the ko': { hp: 1, atk: 1, img: '' },
  ゴブリン: { hp: 120, atk: 4, img: '' },
  フレアスライム: { hp: 105, atk: 11, img: '' },
  ホワイトナイト: { hp: 270, atk: 15, img: '' },
  ドラッグゴーレム: { hp: 300, atk: 10, img: '' },
  ゑノン: { hp: 290, atk: 17, img: '' },
  レインボーウシ: { hp: 450, atk: 5, img: '' },
  リゴーレム: { hp: 1000, atk: 1, img: '' },
  ウェザーボーン: { hp: 400, atk: 18, img: '' },
  オバドラ: {
    hp: 550,
    atk: 25,
    img: '',
    skillAtk: { name: 'アビス', cost: 5, effect: 'abyss' },
  },
  ゾンビ: {
    hp: 100,
    atk: 7,
    ability: '起死回生',
    img: '',
    skillAtk: { name: '感染', cost: 8 },
    skillRec: { name: 'ゾーンビー', cost: 4, amount: 25 },
  },
  管理猫: {
    hp: 999999999,
    atk: 10000,
    img: '',
    skillAtk: { name: '神罰', cost: 1, effect: 'abyss' },
    skillRec: { name: '全回復', cost: 1, amount: 999999999 },
  },
};

export const STARTER_KEYS = ['オルゴン', 'ラリ', 'ドレイム'];

export const INITIAL_GACHA_POOL: Record<GachaRank, string[]> = {
  N: ['ゾンビ'],
  R: ['スライム', 'the ko', 'ゴブリン'],
  SR: ['フレアスライム', 'オルゴン', 'ラリ', 'ドレイム'],
  SSR: ['ホワイトナイト', 'ゑノン'],
  UR: ['オバドラ'],
  SCR: [],
};

export const REFUND_GEMS: Record<GachaRank, number> = {
  N: 10,
  R: 20,
  SR: 30,
  SSR: 50,
  UR: 100,
  SCR: 500,
};

export const INITIAL_FLOOR_CONFIG: Record<number, string[]> = {
  1: ['スライム'],
  2: ['the ko', 'ゴブリン'],
  3: ['フレアスライム'],
  4: ['ホワイトナイト'],
  5: ['ドラッグゴーレム'],
  6: ['ゑノン'],
  7: ['レインボーウシ'],
  8: ['リゴーレム'],
  9: ['ウェザーボーン'],
  10: ['the ko', 'the ko', 'the ko', 'オバドラ'],
};

export function initStatus(): UnitStatus {
  return {
    freeze: 0,
    burn: 0,
    confuse: 0,
    bound: 0,
    bleed: 0,
    shock: 0,
    blind: 0,
    atkBuff: 0,
  };
}

export function getCalculatedStats(
  monster: UserMonster,
  masterMonsters: Record<string, MasterMonster>
): CalculatedUnit {
  const level = monster.level || 1;
  const lvBonus = level - 1;

  const base = masterMonsters[monster.name] || {
    hp: 100,
    atk: 5,
    img: '',
  };

  const baseHp = base.hp || 100;
  const baseAtk = base.atk || 5;

  const calcMaxHp = baseHp + lvBonus * 20;
  const calcAtk = baseAtk + lvBonus * 5;

  const skillAtk = base.skillAtk ? JSON.parse(JSON.stringify(base.skillAtk)) : null;
  const skillRec = base.skillRec ? JSON.parse(JSON.stringify(base.skillRec)) : null;

  if (skillRec) {
    const baseAmount = skillRec.amount || 20;
    skillRec.calcAmount = baseAmount + lvBonus * 8;
  }

  return {
    name: monster.name,
    level,
    hp: monster.hp !== undefined ? monster.hp : calcMaxHp,
    maxHp: calcMaxHp,
    atk: calcAtk,
    img: base.img || '',
    ability: base.ability || null,
    skillAtk,
    skillRec,
    pt: 0,
    revived: false,
    status: initStatus(),
  };
}

import { Floor, MonsterProfile, BossType, RarityRank } from '../types';

export const ADMIN_CODE = 'minecraftnohitopoteto723';

export const BOSS_REWARDS: Record<Exclude<BossType, ''>, number> = {
  '中BOSS': 10,
  'BOSS': 25,
  '強BOSS': 50,
  '狂BOSS': 100,
  '最恐BOSS': 1000,
};

export const RARITY_REFUND_GEMS: Record<RarityRank, number> = {
  初期: 20,
  N: 10,
  R: 25,
  SR: 50,
  SSR: 100,
  UR: 250,
  カスタム: 20,
};

export const RARITY_DEFAULT_MAX_LEVEL: Record<RarityRank, number> = {
  初期: 10,
  N: 5,
  R: 10,
  SR: 15,
  SSR: 20,
  UR: 30,
  カスタム: 25,
};

export const DEFAULT_PLAYER_SELECTABLE_MONSTERS: MonsterProfile[] = [
  {
    name: 'オルゴン',
    hp: 140,
    atk: 5,
    type: 'オルゴン',
    rank: '初期',
    level: 1,
    maxLevel: 10,
    baseHp: 140,
    baseAtk: 5,
  },
  {
    name: 'ラリ',
    hp: 120,
    atk: 6,
    type: 'ラリ',
    rank: '初期',
    level: 1,
    maxLevel: 10,
    baseHp: 120,
    baseAtk: 6,
  },
  {
    name: 'ドレイム',
    hp: 80,
    atk: 6,
    type: 'ドレイム',
    rank: '初期',
    level: 1,
    maxLevel: 10,
    baseHp: 80,
    baseAtk: 6,
  },
];

export const DEFAULT_GACHA_POOL: Record<'N' | 'R' | 'SR' | 'SSR' | 'UR', MonsterProfile[]> = {
  N: [
    {
      name: 'ゾンビ',
      hp: 100,
      atk: 7,
      type: 'ゾンビ',
      rank: 'N',
      level: 1,
      maxLevel: 5,
      baseHp: 100,
      baseAtk: 7,
    },
    {
      name: 'ゴブリンソルジャー',
      hp: 90,
      atk: 6,
      type: 'ノーマル',
      rank: 'N',
      level: 1,
      maxLevel: 5,
      baseHp: 90,
      baseAtk: 6,
    },
  ],
  R: [
    {
      name: 'スケルトン',
      hp: 120,
      atk: 9,
      type: 'ノーマル',
      rank: 'R',
      level: 1,
      maxLevel: 10,
      baseHp: 120,
      baseAtk: 9,
    },
    {
      name: 'アイスウルフ',
      hp: 130,
      atk: 10,
      type: 'オルゴン',
      rank: 'R',
      level: 1,
      maxLevel: 10,
      baseHp: 130,
      baseAtk: 10,
    },
  ],
  SR: [
    {
      name: 'ダークナイト',
      hp: 180,
      atk: 14,
      type: 'ノーマル',
      rank: 'SR',
      level: 1,
      maxLevel: 15,
      baseHp: 180,
      baseAtk: 14,
    },
    {
      name: 'ファイアゴーレム',
      hp: 210,
      atk: 13,
      type: 'ドレイム',
      rank: 'SR',
      level: 1,
      maxLevel: 15,
      baseHp: 210,
      baseAtk: 13,
    },
  ],
  SSR: [
    {
      name: 'ドラゴン',
      hp: 250,
      atk: 22,
      type: 'ノーマル',
      rank: 'SSR',
      level: 1,
      maxLevel: 20,
      baseHp: 250,
      baseAtk: 22,
    },
    {
      name: 'スペクターロード',
      hp: 230,
      atk: 25,
      type: 'ゾンビ',
      rank: 'SSR',
      level: 1,
      maxLevel: 20,
      baseHp: 230,
      baseAtk: 25,
    },
  ],
  UR: [
    {
      name: '魔王',
      hp: 400,
      atk: 35,
      type: 'ノーマル',
      rank: 'UR',
      level: 1,
      maxLevel: 30,
      baseHp: 400,
      baseAtk: 35,
    },
    {
      name: '原初のアビスドラゴン',
      hp: 450,
      atk: 38,
      type: 'オルゴン',
      rank: 'UR',
      level: 1,
      maxLevel: 30,
      baseHp: 450,
      baseAtk: 38,
    },
  ],
};

export const DEFAULT_FLOORS: Floor[] = [
  {
    name: '第1階層',
    enemies: [{ name: 'スライム', hp: 100, atk: 3 }],
    clearRewardGems: 10,
  },
  {
    name: '第2階層',
    enemies: [
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'ゴブリン', hp: 120, atk: 4 },
    ],
    clearRewardGems: 15,
  },
  {
    name: '第3階層',
    enemies: [{ name: 'フレアスライム', hp: 105, atk: 11, bossType: '中BOSS' }],
    clearRewardGems: 20,
  },
  {
    name: '第4階層',
    enemies: [{ name: 'ホワイトナイト', hp: 270, atk: 15 }],
    clearRewardGems: 25,
  },
  {
    name: '第5階層 (中BOSS)',
    enemies: [{ name: 'ドラッグゴーレム', hp: 300, atk: 10, type: 'golem', bossType: '中BOSS' }],
    clearRewardGems: 30,
  },
  {
    name: '第6階層',
    enemies: [{ name: 'ゑノン', hp: 290, atk: 17, type: 'enon' }],
    clearRewardGems: 35,
  },
  {
    name: '第7階層',
    enemies: [{ name: 'レインボーウシ', hp: 450, atk: 5, type: 'ushi' }],
    clearRewardGems: 40,
  },
  {
    name: '第8階層',
    enemies: [{ name: 'リゴーレム', hp: 1000, atk: 1, bossType: '強BOSS' }],
    clearRewardGems: 50,
  },
  {
    name: '第9階層',
    enemies: [{ name: 'ウェザーボーン', hp: 400, atk: 18, bossType: '狂BOSS' }],
    clearRewardGems: 60,
  },
  {
    name: '第10階層 (BOSS)',
    enemies: [
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'オバドラ', hp: 550, atk: 25, type: 'obadora', bossType: '最恐BOSS' },
    ],
    clearRewardGems: 200,
  },
];

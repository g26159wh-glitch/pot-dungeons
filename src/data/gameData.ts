import { Floor, MonsterProfile, BossType } from '../types';

export const ADMIN_CODE = 'minecraftnohitopoteto723';

export const BOSS_REWARDS: Record<Exclude<BossType, ''>, number> = {
  '中BOSS': 10,
  'BOSS': 25,
  '強BOSS': 50,
  '狂BOSS': 100,
  '最恐BOSS': 1000,
};

export const DEFAULT_PLAYER_SELECTABLE_MONSTERS: MonsterProfile[] = [
  { name: 'オルゴン', hp: 140, atk: 5, type: 'オルゴン', rank: '初期' },
  { name: 'ラリ', hp: 120, atk: 6, type: 'ラリ', rank: '初期' },
  { name: 'ドレイム', hp: 80, atk: 6, type: 'ドレイム', rank: '初期' },
];

export const DEFAULT_GACHA_POOL: Record<'N' | 'R' | 'SR' | 'SSR' | 'UR', MonsterProfile[]> = {
  N: [{ name: 'ゾンビ', hp: 100, atk: 7, type: 'ゾンビ', rank: 'N' }],
  R: [{ name: 'スケルトン', hp: 120, atk: 9, type: 'ノーマル', rank: 'R' }],
  SR: [{ name: 'ダークナイト', hp: 180, atk: 14, type: 'ノーマル', rank: 'SR' }],
  SSR: [{ name: 'ドラゴン', hp: 250, atk: 22, type: 'ノーマル', rank: 'SSR' }],
  UR: [{ name: '魔王', hp: 400, atk: 35, type: 'ノーマル', rank: 'UR' }],
};

export const DEFAULT_FLOORS: Floor[] = [
  { name: '第1階層', enemies: [{ name: 'スライム', hp: 100, atk: 3 }] },
  {
    name: '第2階層',
    enemies: [
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'ゴブリン', hp: 120, atk: 4 },
    ],
  },
  {
    name: '第3階層',
    enemies: [{ name: 'フレアスライム', hp: 105, atk: 11, bossType: '中BOSS' }],
  },
  { name: '第4階層', enemies: [{ name: 'ホワイトナイト', hp: 270, atk: 15 }] },
  {
    name: '第5階層 (中BOSS)',
    enemies: [{ name: 'ドラッグゴーレム', hp: 300, atk: 10, type: 'golem', bossType: '中BOSS' }],
  },
  { name: '第6階層', enemies: [{ name: 'ゑノン', hp: 290, atk: 17, type: 'enon' }] },
  {
    name: '第7階層',
    enemies: [{ name: 'レインボーウシ', hp: 450, atk: 5, type: 'ushi' }],
  },
  {
    name: '第8階層',
    enemies: [{ name: 'リゴーレム', hp: 1000, atk: 1, bossType: '強BOSS' }],
  },
  {
    name: '第9階層',
    enemies: [{ name: 'ウェザーボーン', hp: 400, atk: 18, bossType: '狂BOSS' }],
  },
  {
    name: '第10階層 (BOSS)',
    enemies: [
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'オバドラ', hp: 550, atk: 25, type: 'obadora', bossType: '最恐BOSS' },
    ],
  },
];

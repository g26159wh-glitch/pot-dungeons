import { Floor } from '../types';

export const INITIAL_MONSTERS = [
  { name: 'オルゴン', hp: 140, atk: 5, type: 'オルゴン' as const },
  { name: 'ラリ', hp: 120, atk: 6, type: 'ラリ' as const },
  { name: 'ドレイム', hp: 80, atk: 6, type: 'ドレイム' as const },
];

export const FLOORS: Floor[] = [
  { name: '第1階層', enemies: [{ name: 'スライム', hp: 100, atk: 3 }] },
  {
    name: '第2階層',
    enemies: [
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'ゴブリン', hp: 120, atk: 4 },
    ],
  },
  { name: '第3階層', enemies: [{ name: 'フレアスライム', hp: 105, atk: 11 }] },
  { name: '第4階層', enemies: [{ name: 'ホワイトナイト', hp: 270, atk: 15 }] },
  {
    name: '第5階層 (中BOSS)',
    enemies: [{ name: 'ドラッグゴーレム', hp: 300, atk: 10, type: 'golem' }],
  },
  { name: '第6階層', enemies: [{ name: 'ゑノン', hp: 290, atk: 17, type: 'enon' }] },
  {
    name: '第7階層',
    enemies: [{ name: 'レインボーウシ', hp: 450, atk: 5, type: 'ushi' }],
  },
  { name: '第8階層', enemies: [{ name: 'リゴーレム', hp: 1000, atk: 1 }] },
  { name: '第9階層', enemies: [{ name: 'ウェザーボーン', hp: 400, atk: 18 }] },
  {
    name: '第10階層 (BOSS)',
    enemies: [
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'the ko', hp: 1, atk: 1 },
      { name: 'オバドラ', hp: 550, atk: 25, type: 'obadora' },
    ],
  },
];

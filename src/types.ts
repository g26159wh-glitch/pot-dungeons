export type AbilityType = 'オルゴン' | 'ラリ' | 'ドレイム' | 'ゾンビ' | 'ノーマル';

export type StatusType = 'burned' | 'frozen' | 'confused' | 'bind';

export type RarityRank = '初期' | 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'カスタム';

export type BossType = '' | '中BOSS' | 'BOSS' | '強BOSS' | '狂BOSS' | '最恐BOSS';

export interface StatusEffect {
  type: StatusType;
  turns: number;
}

export interface MonsterProfile {
  id?: string;
  name: string;
  hp: number;
  atk: number;
  type: AbilityType;
  rank: RarityRank;
  level: number;
  maxLevel: number;
  baseHp: number;
  baseAtk: number;
}

export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  sp: number;
  type: AbilityType | '';
  status: StatusEffect | null;
  hasRevived: boolean;
  deathZombies: number;
  level: number;
  maxLevel: number;
  rank: RarityRank;
}

export interface EnemyDef {
  name: string;
  hp: number;
  atk: number;
  type?: 'golem' | 'enon' | 'ushi' | 'obadora' | '';
  bossType?: BossType;
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  baseAtk: number;
  status: StatusEffect | null;
  type: 'golem' | 'enon' | 'ushi' | 'obadora' | '';
  bossType: BossType;
  buffTurns: number;
}

export interface Floor {
  name: string;
  enemies: EnemyDef[];
  clearRewardGems?: number;
}

export interface GachaRates {
  UR: number;
  SSR: number;
  SR: number;
  R: number;
  N: number;
}

export interface GachaPullResult {
  monster: MonsterProfile;
  isNew: boolean;
  levelUp: boolean;
  oldLevel?: number;
  newLevel?: number;
  refundGems: number;
}

export interface TransferHistoryItem {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string;
}

export interface SaveData {
  userTag: string;
  userPass: string;
  gems: number;
  currentFloorIndex: number;
  currentEnemyIndex: number;
  isHomeUnlocked: boolean;
  playerSelectableMonsters: MonsterProfile[];
  player: Player;
  floors: Floor[];
  gachaRates?: GachaRates;
  transferHistory?: TransferHistoryItem[];
}

export type MonsterType = 'オルゴン' | 'ラリ' | 'ドレイム';

export type StatusType = 'burned' | 'frozen' | 'confused' | 'bind';

export interface StatusEffect {
  type: StatusType;
  turns: number;
}

export interface Player {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  sp: number;
  type: MonsterType | '';
  status: StatusEffect | null;
}

export interface EnemyDef {
  name: string;
  hp: number;
  atk: number;
  type?: 'golem' | 'enon' | 'ushi' | 'obadora' | '';
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  baseAtk: number;
  status: StatusEffect | null;
  type: 'golem' | 'enon' | 'ushi' | 'obadora' | '';
  buffTurns: number;
}

export interface Floor {
  name: string;
  enemies: EnemyDef[];
}

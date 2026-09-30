export type SkillEffectType =
  | ''
  | 'freeze'
  | 'burn'
  | 'confuse'
  | 'bound'
  | 'abyss'
  | 'bleed'
  | 'shock'
  | 'fear'
  | 'blind';

export type GachaRank = 'N' | 'R' | 'SR' | 'SSR' | 'UR' | 'SCR';

export interface SkillAtkDef {
  name: string;
  cost: number;
  effect?: SkillEffectType;
}

export interface SkillRecDef {
  name: string;
  cost: number;
  amount: number;
  calcAmount?: number;
}

export interface MasterMonster {
  hp: number;
  atk: number;
  img: string;
  ability?: string;
  skillAtk?: SkillAtkDef | null;
  skillRec?: SkillRecDef | null;
}

export interface UserMonster {
  name: string;
  level: number;
  hp?: number;
}

export interface CalculatedUnit {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  atk: number;
  img: string;
  ability?: string | null;
  skillAtk?: SkillAtkDef | null;
  skillRec?: SkillRecDef | null;
  pt?: number;
  revived?: boolean;
  status: UnitStatus;
}

export interface UnitStatus {
  freeze: number;
  burn: number;
  confuse: number;
  bound: number;
  bleed: number;
  shock: number;
  blind: number;
  atkBuff: number;
}

export interface UserAccount {
  name: string;
  pass: string;
  gems: number;
  floor: number;
  monsters: UserMonster[];
  selectedIndex: number;
}

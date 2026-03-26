// src/Data/index.js
import { BasicProblems } from './BasicProblems';
import { Tier5Problems } from './Tier-5';
import { Tier4Problems } from './Tier-4';
import { Tier3Problems } from './Tier-3';
import { Tier2Problems } from './Tier-2';
import { Tier1Problems } from './Tier-1';
import { MasterProblems } from './Master';

// We map these to an object so we can access them by a simple key
export const AllTierData = {
  basic: { data: BasicProblems, infoIndex: 0 },
  tier5: { data: Tier5Problems, infoIndex: 1 },
  tier4: { data: Tier4Problems, infoIndex: 2 },
  tier3: { data: Tier3Problems, infoIndex: 3 },
  tier2: { data: Tier2Problems, infoIndex: 4 },
  tier1: { data: Tier1Problems, infoIndex: 5 },
  master: { data: MasterProblems, infoIndex: 6 },
};
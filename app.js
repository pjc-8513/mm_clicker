// Global debug configuration
const DEBUG_CONFIG = {
  enabled: false,         // Master switch to enable/disable debug features
  
  // Character/Level debug
  forceStartingLevel: 12,  // Set to 0 or false to disable
  startingGold: 100000,
  currentAreaId: "goblinwatch", // or set to false
  
  // Loot debug
  forceDrops: true,        // Every enemy drops loot
  defaultDropTier: false, // Force all drops to this tier (or false for normal)
  forceArtifactId: null, // e.g. "robinsBow" or "bloodmore"
  
  // Attribute forcing (will guarantee these on every item)
  forceAttributes: {
    stun: false,
    lifesteal: false,
    baseDmg: false,
    critDmg: false,
    spellDmg: false,
    evasion: false,
    ofFireball: false,
    reflectDmg: false,
    manaRegen: false,
    hpRegen: false,
    hunter: false,
    executioner: true,
    excommunicator: false,
    banisher: false,
    slayer: false,
    backstab: false

  },
  
  // Future debug options can go here
  godMode: false,
  unlimitedMana: false
};

// Loot system constants
const LOOT_TIERS = {
  common: { name: "Common", attrCount: 1 },
  magic: { name: "Magic", attrCount: 2 },
  rare: { name: "Rare", attrCount: 3 },
  legendary: { name: "Legendary", attrCount: 4 },
  artifact:  { name: "Artifact", attrCount: 0 }, // Unique items, no random stats
};

const LOOT_ATTRIBUTES = [
  { key: "stun", name: "Stun Chance", type: "percent", weight: 5 }, // averagish
  { key: "lifesteal", name: "Lifesteal", type: "percent", weight: 5 }, // averagish
  { key: "baseDmg", name: "Base Damage", type: "percent", weight: 9 }, // fairly common
  { key: "spellDmg", name: "Spell Power", type: "percent", weight: 7 }, // fairly common
  { key: "critDmg", name: "Critical Damage", type: "percent", weight: 7 }, // fairly common
  { key: "evasion", name: "Evasion", type: "percent", weight: 6 }, // averagish
  { key: "ofFireball", name: "Of Fireball", type: "cast", weight: 2 }, // not too common
  { key: "reflectDmg", name: "Reflect Damage", type: "percent", weight: 4 }, // slightly more rare
  { key: "manaRegen", name: "Mana Regen", type: "percent", weight: 0 }, // 0% because it doesn't exist yet; future attribute
  { key: "hpRegen", name: "Health Regen", type: "percent", weight: 0 }, // 0% because it doesn't exist yet; future attribute
  { key: "hunter", name: "Hunter's Mark", type: "percent", weight: 8 }, // fairly common extra damage to beasts
  { key: "executioner", name: "Executioner", type: "percent", weight: 8 }, // fairly common extra damage to humans
  { key: "excommunicator", name: "Excommunicator", type: "percent", weight: 3 }, // slightly more rare extra damage to demons (there aren't any demons yet)
  { key: "banisher", name: "Banisher", type: "percent", weight: 8 }, // fairly common extra damage to undead
  { key: "slayer", name: "Slayer", type: "percent", weight: 3 }, // slightly more rare extra damage to dragons (there are only a few dragons so far)
  { key: "backstab", name: "Backstab", type: "percent", weight: 7 } // averagish extra damage on weapons only

];

const WEAPON_FLAVORS = [
  { min: 0, max: 8, name: "Longsword" },
  { min: 9, max: 17, name: "Mage Dagger" },
  { min: 18, max: 27, name: "Wonder Mace" },
  { min: 28, max: 36, name: "Savage Spear" },
  { min: 37, max: 45, name: "Crusader Sword" },
  { min: 46, max: Infinity, name: "Supreme Axe" },
];

const ARMOR_FLAVORS = [
  { min: 0, max: 8, name: "Leather Armor" },
  { min: 9, max: 17, name: "Studded Leather" },
  { min: 18, max: 27, name: "Steel Chain Mail" },
  { min: 28, max: 36, name: "Royal Chain Mail" },
  { min: 37, max: 45, name: "Steel Plate Armor" },
  { min: 46, max: Infinity, name: "Golden Plate Armor" },
];

const HELM_FLAVORS = [
  { min: 0, max: 6, name: "Cloth Hat" },
  { min: 7, max: 13, name: "Wizard Cap" },
  { min: 14, max: 19, name: "Helm" },
  { min: 20, max: 26, name: "Steel Helm" },
  { min: 27, max: 33, name: "Regal Crown" },
  { min: 34, max: Infinity, name: "Almighty Crown" },
];

const GLOVE_FLAVORS = [
  { min: 0, max: 6, name: "Cloth Gloves" },
  { min: 7, max: 13, name: "Leather Gloves" },
  { min: 14, max: 19, name: "Studded Gloves" },
  { min: 20, max: 26, name: "Steel Gauntlets" },
  { min: 27, max: 33, name: "Knight's Gauntlets" },
  { min: 34, max: Infinity, name: "Ultimate Gauntlets" },
];

const BOOT_FLAVORS = [
  { min: 0, max: 6, name: "Leather Boots" },
  { min: 7, max: 13, name: "Steel Boots" },
  { min: 14, max: 19, name: "Armored Boots" },
  { min: 20, max: 26, name: "Sterling Boots" },
  { min: 27, max: 33, name: "Knight's Boots" },
  { min: 34, max: Infinity, name: "Ultimate Boots" },
];

const EQUIP_SLOTS = ["weapon", "helm", "armor", "gloves", "boots"];

const ARTIFACTS = {
  bloodmore: {
    id: "bloodmore",
    name: "Bloodmore",
    slot: "weapon",
    tier: "artifact",
    flavorName: "Bloodmore, the Soul-Drinker",
    description: "AOE life-drain. Half's weilder's HP.",
    stats: {
      hp: 0,
      might: 25,
      bonuses: [
        { key: "baseDmg", value: 50 },
        { key: "lifesteal", value: 20 }
      ]
    },
    special: {
      aoeAttack: true,   // custom effect in combat loop
      lifesteal: true,   // redundant with stat, but nice for hooks
    }
  },

  robinsBow: {
    id: "robinsBow",
    name: "Robin's Bow",
    slot: "weapon",
    tier: "artifact",
    flavorName: "Robin’s Bow",
    description: "Casts Volley every 3.5s, raining arrows on random enemies.",
    stats: {
      hp: 100,
      might: 5,
      bonuses: [
        { key: "Dexterity", value: 10 },
        { key: "Accuracy", value: 10 }
      ]
    },
    special: {
      castsVolley: { interval: 3500 } // ms between casts
    }
  },

  torchWand: {
  id: "torchWand",
  name: "Torch Wand",
  slot: "weapon",
  tier: "artifact",
  flavorName: "Torch Wand",
  description: "+4 Of Fireball.",
  stats: {
    hp: 200,
    might: 5,
    bonuses: [
      { key: "Intellect", value: 15 },
      { key: "Personality", value: 5 }
    ]
  }
},

brambleArmor: {
  id: "brambleArmor",
  name: "Bramble Armor",
  slot: "armor",
  tier: "artifact",
  flavorName: "Bramble Armor",
  description: "Adds damage reflection 75%.",
  stats: {
    hp: 500,
    might: 5,
    bonuses: [
      { key: "reflectDmg", value: 75 }
    ]
  }
},

assassinsBlade: {
  id: "assassinsBlade",
  name: "Assassin's Blade",
  slot: "weapon",
  tier: "artifact",
  flavorName: "Assassin's Blade",
  description: "High critical damage and backstab bonus.",
  stats: {
    hp: 100,
    might: 10,
    bonuses: [
      { key: "critDmg", value: 50 },
      { key: "backstab", value: 1 },
      { key: "Dexterity", value: 10 }
    ]
  }
}

};


// Guide book data organized for easy expansion
const guideData = {
  "Character Stats": {
    "Might": "Physical damage.",
    "Intellect": "Mana pool for sorcerer, archer, monk, and druid.",
    "Personality": "Linked to cleric mana pool and healing effectiveness (cleric, paladin, druid). <br> Also adds bonus to equipment sell value.",
    "Endurance": "HP pool.",
    "Accuracy": "Decreases chance of enemy dodge.",
    "Speed": "Auto-attack speed.",
    "Luck": "Small bonus to critical hits, dual wield chains, dodging, and blocking [Not fully integrated yet].",
    "Dexterity": "Bonus to critical chance, dual wield chains, and dodging."
  },
  "Skills": {
    "Weapon Mastery": "Bonus damage per rank. Classes: Knight, Paladin, Archer, Monk.",
    "Spellpower": "Bonus damage/healing per rank. Classes: Sorcerer, Archer, Cleric, Druid.",
    "Body Building": "Bonus HP per rank. Classes: Knight, Paladin, Cleric, Archer, Monk.",
    "Meditation": "Bonus MP per rank. Classes: Sorcerer, Cleric, Druid.",
    "Focus": "Critical hit chance per rank. Classes: Archer, Monk.",
    "Dodging": "Chance to dodge per rank. Classes: Archer, Monk.",
    "Dual Wield": "Chance to chain attacks. Classes: Archer, Monk.",
    "Pick Pocket": "Chance to steal gold. Classes: Archer.",
    "Learning": "Bonus XP from mobs. Classes: Sorcerer, Cleric, Druid, Monk, Paladin.",
    "Block": "Chance to block 50% damage. Classes: Knight, Paladin.",
    "Intimidate": "Chance to draw attacks. Classes: Knight, Paladin.",
    "HP Pot": "Auto-use HP potion at low HP. Classes: Knight, Paladin, Archer, Monk.",
    "MP Pot": "Auto-use MP potion at low MP. Classes: Sorcerer, Druid, Monk, Cleric."
  },
  "Spells": {
    "Fire Bolt": "Single target fire damage. Classes: Sorcerer, Archer.",
    "Heal": "Single target heal. Classes: Paladin, Cleric, Druid.",
    "Lightning": "Single target lightning (high variance). Classes: Druid.",
    "Cure All": "Party wide heal. Classes: Cleric, Druid.",
    "Meteor": "AOE fire damage. Classes: Sorcerer.",
    "Destroy Undead": "AOE damage to undead. Classes: Cleric, Paladin.",
    "Bless": "Guaranteed critical hits. Bonus hits linked to Spell Power. Classes: Cleric, Paladin.",
    "Quickstep": "Guaranteed dodge. Classes: Archer, Monk.",
    "Touch of Death": "Chance to kill enemy. Classes: Sorcerer.",
    "Mass Distortion": "Damage based on enemy max HP. Classes: Druid.",
    "Regeneration": "Heal over time for party. Classes: Cleric, Monk.",
    "Revive": "Bring back dead ally. Classes: Cleric, Monk, Paladin.",
    "Remedy": "Remove status effect. Classes: Cleric, Monk, Paladin.",
    "Weakspot": "Increase critical damage. Classes: Monk.",
    "Volley": "Multi-target arrow volley. Classes: Archer.",
    "Shrapnel": "Multi-target dark magic. Classes: Sorcerer.",
    "Haste": "Increase party autoattack speed. Classes: Monk.",
    "Preservation": "Prevent HP falling below 1. Classes: Monk.",
    "Sparks": "Multi-target charged sparks (high variance). Classes: Druid."
  },
  "Status Effects": {
    "Weakness": "Lowers physical damage. Yellow health bar.",
    "Poison": "Damage over time. Green health bar.",
    "Disease": "Half healing effect; Diseased characters will not heal at the Inn. Orange health bar.",
    "Curse": "Chance to fail spells/attacks. <br> Cursed characters cannot dodge, block, or get dual wield chains. Purple health bar."
  }
};

// Core data: classes and base stats inspired by MM6
const ATTRIBUTE_KEYS = [
  "Might",
  "Intellect",
  "Personality",
  "Endurance",
  "Accuracy",
  "Speed",
  "Luck",
  "Dexterity"
];

const DEFAULT_KEY_SPELL_MAP = {
  q: "heal",
  w: "regeneration",
  e: "cure",
  r: "remedy",
  t: "revive",
  y: "destroyUndead",
  a: "fireBolt",
  s: "meteor",
  d: "touchOfDeath",
  f: "shrapnel",
  z: "lightning",
  x: "massDistortion",
  h: "haste",
  j: "preservation",
  p: "bless",
  o: "quickstep",
  k: "weakSpot",
  v: "volley",
  c: "sparks"
};

//SOUND
const soundEffects = {
  heal: new Audio('sounds/heal.wav'),
  revive: new Audio('sounds/revive.wav'),
  gameOver: new Audio('sounds/gameover.mp3'),
  fire: new Audio('sounds/fire.wav'),
  lightning: new Audio('sounds/lightning.wav'),
  block: new Audio('sounds/block.wav'),
  level: new Audio('sounds/level.wav'),
  statuse: new Audio('sounds/status.ogg'),
  //death: new Audio('sounds/death.wav'),
  //boss: new Audio('sounds/boss.wav'),
  //critical: new Audio('sounds/critical.wav'),
  //spell: new Audio('sounds/spell.wav'),
  play: function(soundName) {
    if (this[soundName]) {
      this[soundName].currentTime = 0;
      this[soundName].play();
    } else {
      console.error(`Sound effect "${soundName}" not found.`);
    }
  },
};

// Preload sounds (optional)
Object.values(soundEffects).forEach(sound => {
  if (sound instanceof Audio) sound.preload = 'auto';
});




const CLASS_DEFS = {
  knight: {
    name: "Knight",
    baseStats: { Might: 15, Intellect: 7, Personality: 7, Endurance: 15, Accuracy: 13, Speed: 10, Luck: 10, Dexterity: 8 },
    hp: (s) => 35 + Math.floor(s.Endurance * 3.0),
    mp: (s) => 0,
    image: "knight_p.png",
    statusEffect: [],
  },
  paladin: {
    name: "Paladin",
    baseStats: { Might: 13, Intellect: 8, Personality: 12, Endurance: 13, Accuracy: 10, Speed: 10, Luck: 10, Dexterity: 9 },
    hp: (s) => 30 + Math.floor(s.Endurance * 2.6),
    mp: (s) => 5 + Math.floor(s.Personality * 1.0),
    image: "paladin_p.png",
    statusEffect: [],
  },
  archer: {
    name: "Archer",
    baseStats: { Might: 12, Intellect: 10, Personality: 8, Endurance: 10, Accuracy: 14, Speed: 12, Luck: 10, Dexterity: 15 },
    hp: (s) => 28 + Math.floor(s.Endurance * 2.2),
    mp: (s) => 5 + Math.floor(s.Intellect * 1.0),
    image: "rogue_p.png",
    statusEffect: [],
  },
  cleric: {
    name: "Cleric",
    baseStats: { Might: 8, Intellect: 10, Personality: 15, Endurance: 12, Accuracy: 8, Speed: 10, Luck: 10, Dexterity: 11 },
    hp: (s) => 24 + Math.floor(s.Endurance * 1.9),
    mp: (s) => 10 + Math.floor(s.Personality * 2.0),
    image: "cleric_p.png",
    statusEffect: [],
  },
  sorcerer: {
    name: "Sorcerer",
    baseStats: { Might: 6, Intellect: 16, Personality: 8, Endurance: 8, Accuracy: 10, Speed: 12, Luck: 10, Dexterity: 10 },
    hp: (s) => 20 + Math.floor(s.Endurance * 1.6),
    mp: (s) => 10 + Math.floor(s.Intellect * 2.0),
    image: "sorcerer_p.png",
    statusEffect: [],
  },
  druid: {
    name: "Druid",
    baseStats: { Might: 9, Intellect: 12, Personality: 12, Endurance: 10, Accuracy: 10, Speed: 10, Luck: 10, Dexterity: 9 },
    hp: (s) => 22 + Math.floor(s.Endurance * 1.8),
    mp: (s) => 10 + Math.floor(Math.max(s.Intellect, s.Personality) * 1.4),
    image: "druid_p.png",
    statusEffect: [],
  },
  monk: {
    name: "Monk",
    baseStats: { Might: 12, Intellect: 10, Personality: 8, Endurance: 12, Accuracy: 12, Speed: 14, Luck: 10, Dexterity: 12 },
    hp: (s) => 26 + Math.floor(s.Endurance * 2.1),
    mp: (s) => 10 + Math.floor(s.Intellect * 1.5),
    image: "monk_p.png",
    statusEffect: [],
  },
};

const DEFAULT_BONUS_POINTS = 12;
const PARTY_SIZE = 4;

// Skills and Spells (simplified)
const SKILL_DEFS = {
  weaponMastery: { key: "weaponMastery", name: "Weapon Mastery", desc: "+5% click dmg per rank", baseCost: 15,
    allowedClasses: ["knight", "paladin", "archer", "monk"]
   },
  spellpower: { key: "spellpower", name: "Spellpower", desc: "+5% spell power per rank", baseCost: 15,
    allowedClasses: ["sorcerer", "archer", "cleric", "druid"]
   },
  bodyBuilding: { key: "bodyBuilding", name: "Body Building", desc: "+5% max HP per rank", baseCost: 20,
    allowedClasses: ["knight", "paladin", "cleric", "archer", "monk"]
   },
  meditation: { key: "meditation", name: "Meditation", desc: "+5% max MP per rank", baseCost: 20,
    allowedClasses: ["sorcerer", "cleric", "druid"]
   },
  focus: { key: "focus", name: "Focus", desc: "+3% critical hit chance per rank", baseCost: 18,
    allowedClasses: ["archer", "monk"]
   },
   dodging: {key: "dodging", name: "Dodging", desc: "+2% Chance to dodge per rank", baseCost: 50,
    allowedClasses: ["archer", "monk"]
   },
   dualWield: {key: "dualWield", name: "Dual Wield", desc: "+3% chance to strike twice", baseCost: 20,
    allowedClasses: ["archer", "monk"]
   },
   pickPocket: {key: "pickPocket", name: "Pick Pocket", desc: "+10% gold from mobs", baseCost: 20,
    allowedClasses: ["archer"]
   },
   learning: {key: "learning", name: "Learning", desc: "+10% exp from mobs", baseCost: 40,
    allowedClasses: ["sorcerer", "cleric", "druid", "monk", "paladin"]
   },
    block: {key: "block", name: "Block", desc: "+3% chance to block 50% of damage", baseCost: 40,
    allowedClasses: ["knight", "paladin"]
   },
    intimidate: {key: "intimidate", name: "Intimidate", desc: "+3% chance to draw aggro", baseCost: 40,
    allowedClasses: ["knight", "paladin"]
   },
    hpPotion: {key: "hpPotion", name: "HP potion", desc: "Automatically use HP potion on low health", baseCost: 60,
    allowedClasses: ["knight", "paladin", "archer", "monk"]
   },
    mpPotion: {key: "mpPotion", name: "MP potion", desc: "Automatically use MP potion on low mana", baseCost: 60,
    allowedClasses: ["sorcerer", "druid", "monk", "cleric"]
   },
    disarmTrap: {key: "disarmTrap", name: "Disarm Trap", desc: "Lower chance of trap exploding when clicked", baseCost: 60,
    allowedClasses: ["archer", "knight", "paladin"]   
  }
};

const SPELL_DEFS = {
  fireBolt: { key: "fireBolt", name: "Fire Bolt", mpCost: 6, type: "damage", cost: 100,
    allowedClasses: ["sorcerer", "archer"], cooldown: 2000
   },
  heal: { key: "heal", name: "Heal", mpCost: 8, type: "heal", cost: 100,
    allowedClasses: ["paladin", "cleric", "druid"], cooldown: 1000
   },
  lightning: { key: "lightning", name: "Lightning Bolt", mpCost: 8, type: "damage", cost: 200,
    allowedClasses: ["druid"], cooldown: 3000
   },
  shield: { key: "shield", name: "Magic Shield", mpCost: 10, type: "buff", cost: 150,
    allowedClasses: ["sorcerer", "cleric", "paladin"], cooldown: 1000
   },
  cure: { key: "cure", name: "Cure All", mpCost: 20, type: "heal", cost: 250,
    allowedClasses: ["cleric", "druid"], cooldown: 4000
   },
  meteor: { key: "meteor", name: "Meteor", mpCost: 15, type: "damage", cost: 400,
    allowedClasses: ["sorcerer"], cooldown: 9000
   },
  destroyUndead: { key: "destroyUndead", name: "Destroy Undead", mpCost: 15, type: "damage", cost: 400,
    allowedClasses: ["cleric", "paladin"], cooldown: 9000
   },
  bless: { key: "bless", name: "Bless", mpCost: 8, type: "buff", cost: 180,
    allowedClasses: ["cleric", "paladin"], cooldown: 3000
   },
   quickstep: { key: "quickstep", name: "Quickstep", mpCost: 8, type: "buff", cost: 180,
    allowedClasses: ["archer", "monk"], cooldown: 3000
   },
   touchOfDeath: { key: "touchOfDeath", name: "Touch of Death", mpCost: 20, type: "damage", cost: 500,
    allowedClasses: ["sorcerer"], cooldown: 7000
    },
   massDistortion: { key: "massDistortion", name: "Mass Distortion", mpCost: 10, type: "damage", cost: 500,
    allowedClasses: ["druid"], cooldown: 5000
   },
   regeneration: { key: "regeneration", name: "Regeneration", mpCost: 25, type: "buff", cost: 400,
    allowedClasses: ["cleric", "monk"], cooldown: 20000
   },
   revive: { key: "revive", name: "Revive", mpCost: 40, type: "heal", cost: 200,
    allowedClasses: ["cleric", "monk", "paladin"], cooldown: 4000
   },
   remedy: { key: "remedy", name: "Remedy", mpCost: 15, type: "heal", cost: 100,
    allowedClasses: ["cleric", "monk", "paladin"], cooldown: 2000
   },
    weakSpot: { key: "weakSpot", name: "Weak Spot", mpCost: 15, type: "buff", cost: 500,
    allowedClasses: ["monk"], cooldown: 15000
   },
    shrapnel: { key: "shrapnel", name: "Shrapnel", mpCost: 35, type: "damage", cost: 1000,
    allowedClasses: ["sorcerer"], cooldown: 6000
   },
    volley: { key: "volley", name: "Volley", mpCost: 10, type: "damage", cost: 500,
    allowedClasses: ["archer"], cooldown: 4000
   },
    haste: { key: "haste", name: "Haste", mpCost: 15, type: "buff", cost: 100,
    allowedClasses: ["monk"], cooldown: 15000
   },
    preservation: { key: "preservation", name: "Preservation", mpCost: 35, type: "buff", cost: 1000,
    allowedClasses: ["monk"], cooldown: 60000
   },
    sparks: { key: "sparks", name: "Sparks", mpCost: 12, type: "damage", cost: 400,
    allowedClasses: ["druid"], cooldown: 3500
  },
};

const CLASS_STARTING_SPELLS = {
  knight: [],
  paladin: ["heal"],
  archer: ["fireBolt"],
  cleric: ["heal"],
  sorcerer: ["fireBolt"],
  druid: ["heal", "lightning"],
  monk: ["remedy"],
};

const LEVEL_UP_GAINS = {
  knight: { Might: 2, Endurance: 3, Accuracy: 1, Speed: 1 },
  paladin: { Might: 1, Endurance: 2, Personality: 1, Accuracy: 1, Speed: 1 },
  archer: { Might: 2, Accuracy: 2, Speed: 2, Endurance: 1, Dexterity: 1, Intellect: 1 },
  cleric: { Might: 1, Personality: 2, Endurance: 2, Intellect: 1, Accuracy: 1 },
  sorcerer: { Intellect: 2, Speed: 1, Accuracy: 1, Endurance: 1 },
  druid: { Intellect: 1, Personality: 1, Endurance: 2, Accuracy: 1 },
  monk: { Might: 1, Speed: 3, Accuracy: 1, Endurance: 2, Intellect: 1, Dexterity: 1 },
};

// Global state
const state = {
  completedAreas: [],
  currentWave: 1,
  party: [], // array of Character
  gold: 0,
  enemyLevel: 1,
  enemy: null,
  waveComplete: true,
  enemyAttackTimerId: null,
  autoAttackTimerId: null,
  cooldownUiTimerId: null,
  currentAreaId: "newSorpigal",
  guaranteedCrits: 0, // Tracks remaining guaranteed critical hits from Bless
  spellCoolDowns: {},
  dualWieldCooldowns: {}, // New cooldown tracking for dualWield
  hpPotionCoolDowns: {}, // new cooldown tracking for hp potion
  mpPotionCoolDowns: {}, // new cooldown tracking for mp potion
  availableHPPotions: 5,
  availableMPPotions: 5,
  ofFireballCount: 0,
  fireballInterval: null,
  enemyAttackTimers: [],
  pendingLoot: [], // list of loot boxes waiting to be opened
  foundArtifacts: new Set(),
  backstabCount: 0, // tracks backstab procs for weapons with attribute
  backstabReady: 5, // attacks needed to guarantee next backstab
  partyBuffs: {
    weakSpot: false,
    haste: false,
    preservation: false,
  } // New state for tracking buffs
};
const storedKeySpellMap = JSON.parse(localStorage.getItem('keySpellMap'));
const version = localStorage.getItem('keySpellMapVersion');
const DEFAULT_VERSION = 1;

if (!storedKeySpellMap || version !== DEFAULT_VERSION) {
  keySpellMap = { ...DEFAULT_KEY_SPELL_MAP, ...storedKeySpellMap };
  localStorage.setItem('keySpellMap', JSON.stringify(keySpellMap));
  localStorage.setItem('keySpellMapVersion', DEFAULT_VERSION);
} else {
  keySpellMap = storedKeySpellMap;
}
//let keySpellMap = JSON.parse(localStorage.getItem('keySpellMap')) || DEFAULT_KEY_SPELL_MAP;
//let keySpellMap = DEFAULT_KEY_SPELL_MAP;

document.addEventListener('keydown', (e) => {
  // Ignore key presses if the game screen is hidden (as in your original code)
  if (gameScreen.classList.contains("hidden")) return;

  const key = e.key.toLowerCase();

  // Number keys for character selection
  if (key >= "1" && key <= "4") {
    const characterIndex = parseInt(key) - 1;
    if (characterIndex < state.party.length) {
      selectCharacter(characterIndex);
      e.preventDefault();
    }
    return;
  }

  // Spell casting keys
  if (key in keySpellMap) {
    const spell = keySpellMap[key];
    const isHeal = (spell === "heal"); // or expand if multiple heal spells
    tryCastSpell(spell, isHeal ? "heal" : null);
    renderSidebar(); // keep rendering sidebar after casting, as in your original
    e.preventDefault();
  }
});


// tier multipliers for enemies
const TIER_MULTIPLIERS = {
  1: { hp: 1.0, attack: 1.0, gold: 1.0, xp: 1.0 },
  2: { hp: 1.2, attack: 1.15, gold: 1.2, xp: 1.25 },
  3: { hp: 1.5, attack: 1.3, gold: 1.5, xp: 1.5 },
  // etc.
};


// Area Definition System
const AREAS = {
  newSorpigal: {
    id: "newSorpigal",
    name: "New Sorpigal Outskirts",
    description: "The familiar countryside around New Sorpigal, perfect for beginning adventurers.",
    maxWaves: 10,
    baseLevel: 1,
    enemies: ["goblin", "bandit", "apprenticeMage"],
    boss: null, // No boss for starting area
    unlocks: ["mistyIslands", "castleIronFist"],
    rewards: {
      goldMultiplier: 1.0,
      xpMultiplier: 1.0
    }
  },
  goblinwatch: {
  id: "goblinwatch",
  name: "Goblinwatch Dungeon",
  description: "A treacherous goblin stronghold where waves of enemies attack relentlessly. No rest between battles!",
  type: "dungeon", // New area type
  maxWaves: 5,
  baseLevel: 5,
  trapHP: 8,
  trapDmg: 10,
  maxTraps: 1,
  lootTier: 3,
  enemies: ["goblin", "hobgoblin", "bloodSucker"],
  boss: "goblinKing",
  unlocks: [], // Can add more dungeons later
  requirements: ["newSorpigal"],
  rewards: {
    goldMultiplier: 1.1,
    xpMultiplier: 1.1
  },
    dungeonReward: {
    type: "statBoost",
    target: "party", // or "class:knight" for class-specific
    stats: {
      Might: 5,
      Endurance: 5
      },
      description: "+5 Might and +5 Endurance for all heroes"
    },
    conditions: [] // No special conditions for first dungeon
  },
  mistyIslands: {
    id: "mistyIslands",
    name: "Misty Islands",
    description: "Islands originally intended as a trading port, now known for criminals.",
    maxWaves: 12,
    baseLevel: 13,
    enemies: ["followerBaa", "cutpurse", "bountyHunter", "apprenticeMage", "bandit"],
    boss: [],
    unlocks: ["bootlegBay"],
    requirements: ["newSorpigal"], // Must complete this area first
    rewards: {
      goldMultiplier: 1.2,
      xpMultiplier: 1.1
    }
  },
  castleIronFist: {
    id: "castleIronFist",
    name: "Castle Ironfist Dungeons",
    description: "Ancient dungeons beneath the great castle, filled with dangerous creatures.",
    maxWaves: 12,
    baseLevel: 19,
    enemies: ["followerBaa", "lizardMen", "brainSucker", "skeleton"],
    boss: [],
    unlocks: ["freeHaven"],
    requirements: ["newSorpigal"],
    rewards: {
      goldMultiplier: 1.3,
      xpMultiplier: 1.2
    }
  },
  templeOfBaa: {
    id: "templeOfBaa",
    name: "Temple of Baa",
    description: "A day's travel west of here is a new Temple dedicated to Baa. I've heard that bad things happen to rich people that travel near there.",
    type: "dungeon", // New area type
    maxWaves: 10,
    baseLevel: 21,
    trapHP: 10,
    trapDmg: 10,
    maxTraps: 2,
    lootTier: 3,
    enemies: ["skeleton", "skeletonKnight", "hugeSpider", "acolyteOfBaa", "followerBaa"],
    boss: "priestOfBaa",
    unlocks: [], // Can add more dungeons later
    requirements: ["castleIronFist"],
    rewards: {
      goldMultiplier: 1.1,
      xpMultiplier: 1.1
    },
      dungeonReward: {
      type: "statBoost",
      target: "party", // or "class:knight" for class-specific
      stats: {
        Might: 3,
        Endurance: 3,
        Intellect: 3,
        Personality: 3,
        Accuracy: 3,
        Speed: 3,
        Dexterity: 3,
        Luck: 1
        },
        description: "+3 stats for all heroes"
      },
      conditions: [] // No special conditions for first dungeon
  },
  bootlegBay: {
    id: "bootlegBay",
    name: "Bootleg Bay",
    description: "A coastal town plagued by cannibals and pirates.",
    maxWaves: 8,
    baseLevel: 24,
    enemies: ["cannibal", "pirateRaider", "witchDoctor", "lizardMen"],
    boss: "pirateKing",
    unlocks: ["silverCove"],
    requirements: ["mistyIslands"],
    rewards: {
      goldMultiplier: 1.5,
      xpMultiplier: 1.3
    }
  },
    freeHaven: {
    id: "freeHaven",
    name: "Free Haven",
    description: "Free Haven is the oldest and most prosperous city in the Kingdom.",
    maxWaves: 11,
    baseLevel: 26,
    enemies: ["fireArcher", "mage", "masterArcher", "journeymenMage"],
    boss: null,
    unlocks: ["ethricTheMad", "mireOfDamned", "frozenHighlands"],
    requirements: ["castleIronFist"],
    rewards: {
      goldMultiplier: 1.5,
      xpMultiplier: 1.2
    }
  },
  mireOfDamned: {
    id: "mireOfDamned",
    name: "Mire of the Damned",
    description: "Kingdom plagued with roving hordes of undead.",
    maxWaves: 15,
    baseLevel: 28,
    enemies: ["skeletonLord", "spectre", "evilSpirit", "harpyWitch"],
    boss: null,
    unlocks: [],
    requirements: ["freeHaven"],
    rewards: {
      goldMultiplier: 1.5,
      xpMultiplier: 1.5
    }
  },
    ethricTheMad: {
    id: "ethricTheMad",
    name: "Tomb of Ethric the Mad",
    description: "When Ethric the Necromancer died, he left instructions for his body to be placed in a tomb he had built next to the mountains south of the Pearblossom river. It's said that he rose from the dead a few days later in a sort of infernal miracle.",
    type: "dungeon", // New area type
    maxWaves: 12,
    baseLevel: 23,
    trapHP: 15,
    trapDmg: 20,
    maxTraps: 3,
    lootTier: 4,
    enemies: ["skeletonKnight", "spectre", "powerLich", "zombieWarrior"],
    boss: "ethric",
    unlocks: [], // Can add more dungeons later
    requirements: ["freeHaven"],
    rewards: {
      goldMultiplier: 1.1,
      xpMultiplier: 1.1
    },
      dungeonReward: {
      type: "statBoost",
      target: "party", // or "class:knight" for class-specific
      stats: {
        Endurance: 5,
        Intellect: 10,
        Luck: 1
        },
        description: "+10 Intellect, +5 Endurance for all heroes"
      },
      conditions: [] // No special conditions for first dungeon
  },
  dragonLair: {
    id: "dragonLair",
    name: "Dragon's Lair",
    description: "Lair of Longfang Witherhide.",
    type: "dungeon", // New area type
    maxWaves: 2,
    baseLevel: 27,
    trapHP: 15,
    trapDmg: 20,
    maxTraps: 1,
    lootTier: 4,
    enemies: ["fireDrake"],
    boss: "longFang",
    unlocks: [], // Can add more dungeons later
    requirements: ["mireOfDamned"],
    rewards: {
      goldMultiplier: 1.1,
      xpMultiplier: 1.1
    },
      dungeonReward: {
      type: "statBoost",
      target: "party", // or "class:knight" for class-specific
      stats: {
        Might: 15,
        Endurance: 15,
        Intellect: 1,
        Personality: 10,
        Accuracy: 1,
        Speed: 1,
        Dexterity: 1,
        Luck: 1
        },
        description: "+15 Might and Endurance, +10 Personality for all heroes"
      },
      conditions: [] // No special conditions for first dungeon
  },
  frozenHighlands: {
    id: "frozenHighlands",
    name: "Frozen Highlands",
    description: "White Cap is the third largest town in Enroth, and it's been suffering ever since Lord Stromgard lost Icewind Keep to the ogres last year.",
    maxWaves: 10,
    baseLevel: 29,
    enemies: ["fireArcher", "magyarMatron", "masterArcher", "harpyWitch"],
    boss: null,
    unlocks: ["iceWindKeep"],
    requirements: ["freeHaven"],
    rewards: {
      goldMultiplier: 1.5,
      xpMultiplier: 1.2
    }
  },
  iceWindKeep: {
    id: "iceWindKeep",
    name: "Icewind Keep",
    description: "Icewind Keep was once Lord Stromgard's first castle, but he lost it to an attack of ogres and evil humans about a year ago.",
    type: "dungeon", // New area type
    maxWaves: 9,
    baseLevel: 31,
    trapHP: 20,
    trapDmg: 25,
    maxTraps: 3,
    lootTier: 4,
    enemies: ["ogreRaider", "ogreChieftan"],
    boss: "captain",
    unlocks: [], // Can add more dungeons later
    requirements: ["frozenHighlands"],
    rewards: {
      goldMultiplier: 1.1,
      xpMultiplier: 1.1
    },
      dungeonReward: {
      type: "statBoost",
      target: "party", // or "class:knight" for class-specific
      stats: {
        Might: 10,
        Endurance: 10,
        Intellect: 10,
        Personality: 10,
        Accuracy: 10,
        Speed: 10,
        Dexterity: 10,
        Luck: 1
        },
        description: "+10 all stats for all heroes"
      },
      conditions: [] // No special conditions for first dungeon
  },
};

// Enemy Template System
const ENEMY_TEMPLATES = {
  // Basic Enemies
  goblin: {
    id: "goblin",
    baseName: "Goblin",
    type: "humanoid",
    tier: 1,
    speed: 1.5,
    hpFormula: (level) => Math.floor(10 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 4),
    attackFormula: (level) => Math.floor(3 + level * 1.2),
    goldFormula: (level) => Math.floor(10 + level * 2),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1)),
    //isAOE: true,
    /*
    statusEffect: {
      curse: {
      key: 'curse',
      chance: 1
      }
    }
    */
    //variants: ["Scout", "Warrior", "Chieftain"]
  },

  hobgoblin: {
    id: "hobgoblin",
    baseName: "Hobgoblin",
    type: "humanoid",
    tier: 1,
    dodge: .20,
    hpFormula: (level) => Math.floor(15 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(5 + level * 1.7),
    goldFormula: (level) => Math.floor(13 + level * 3),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1)),
    speed: 3,
    lootTier: 1,
    statusEffect: {
      poison: {
      key: 'poison',
      chance: 0.13,
      tickDamage: 8
      }
    }
    //variants: ["Scout", "Warrior", "Chieftain"]
  },
  
  bandit: {
    id: "bandit",
    baseName: "Bandit",
    type: "humanoid",
    tier: 1,
    dodge: .30,
    speed: 2.5,
    hpFormula: (level) => Math.floor(15 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(4 + level * 1.3),
    goldFormula: (level) => Math.floor(14 + level * 3),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Thief", "Outlaw", "Captain"]
  },
  
  apprenticeMage: {
    id: "apprenticeMage",
    baseName: "Apprentice Mage",
    type: "humanoid",
    tier: 1,
    isMagic: true,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(7 + level * 1.4),
    goldFormula: (level) => Math.floor(10 + level * 1.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
  },

  journeymenMage: {
    id: "journeymenMage",
    baseName: "Journeymen Mage",
    type: "humanoid",
    tier: 2,
    lootTier: 2,
    isMagic: true,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(7 + level * 1.4),
    goldFormula: (level) => Math.floor(10 + level * 1.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
  },

  mage: {
    id: "mage",
    baseName: "mage",
    type: "humanoid",
    tier: 3,
    lootTier: 3,
    speed: 2.5,
    isMagic: true,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(7 + level * 1.4),
    goldFormula: (level) => Math.floor(10 + level * 1.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
  },

  masterArcher: {
    id: "masterArcher",
    baseName: "Master Archer",
    type: "humanoid",
    tier: 2,
    lootTier: 2,
    isMagic: false,
    dodge: .60,
    speed: 2,
    hpFormula: (level) => Math.floor(10 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(11 + level * 1.4),
    goldFormula: (level) => Math.floor(10 + level * 1.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
  },

  fireArcher: {
    id: "fireArcher",
    baseName: "Fire Archer",
    type: "humanoid",
    tier: 3,
    lootTier: 3,
    isMagic: false,
    dodge: .75,
    speed: 1.8,
    hpFormula: (level) => Math.floor(12 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(13 + level * 1.4),
    goldFormula: (level) => Math.floor(10 + level * 1.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
  },

  magyarMatron: {
    id: "magyarMatron",
    baseName: "Magyar Matron",
    type: "humanoid",
    tier: 3,
    lootTier: 3,
    isMagic: false,
    dodge: .50,
    speed: 2,
    isStunnable: false,
    hpFormula: (level) => Math.floor(15 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(10 + level * 1.4),
    goldFormula: (level) => Math.floor(10 + level * 1.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
  },

  acolyteOfBaa: {
    id: "acolyteOfBaa",
    baseName: "Acolyte of Baa",
    type: "humanoid",
    tier: 2,
    lootTier: 2,
    isMagic: true,
    hpFormula: (level) => Math.floor(25 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(8 + level * 1.4),
    goldFormula: (level) => Math.floor(10 + level * 1.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
  },

  hugeSpider: {
    id: "hugeSpider",
    baseName: "Huge Spider",
    type: "beast",
    tier: 1,
    dodge: .40,
    speed: 3,
    lootTier: 1,
    hpFormula: (level) => Math.floor(25 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(6 + level * 1.5),
    goldFormula: (level) => Math.floor(10 + level * 2.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1)),
    statusEffect: {
      poison: {
      key: 'poison',
      chance: 0.27,
      tickDamage: 20
      }
    }
    //variants: ["Warrior", "Archer", "Mage"]
  },
  
  
  skeleton: {
    id: "skeleton",
    baseName: "Skeleton",
    type: "undead",
    tier: 1,
    lootTier: 1,
    hpFormula: (level) => Math.floor(30 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(4 + level * 1.5),
    goldFormula: (level) => Math.floor(10 + level * 2.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Warrior", "Archer", "Mage"]
  },

    skeletonKnight: {
    id: "skeletonKnight",
    baseName: "Skeleton Knight",
    type: "undead",
    tier: 2,
    speed: 3,
    lootTier: 2,
    hpFormula: (level) => Math.floor(35 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(6 + level * 1.5),
    goldFormula: (level) => Math.floor(15 + level * 2.5),
    xpFormula: (level) => Math.floor(25 * Math.pow(1.13, level - 1)),
    statusEffect: {
      curse: {
      key: 'curse',
      chance: 0.17
      }
    }
    //variants: ["Warrior", "Archer", "Mage"]
  },

  skeletonLord: {
    id: "skeletonLord",
    baseName: "Skeleton Lord",
    type: "undead",
    tier: 3,
    hpFormula: (level) => Math.floor(35 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(6 + level * 1.5),
    goldFormula: (level) => Math.floor(15 + level * 2.5),
    xpFormula: (level) => Math.floor(25 * Math.pow(1.13, level - 1)),
    speed: 2.5,
    lootTier: 3,
    isStunnable: false,
    statusEffect: {
      curse: {
      key: 'weakness',
      chance: 0.35
      }
    }
    //variants: ["Warrior", "Archer", "Mage"]
  },

  harpyWitch: {
    id: "harpyWitch",
    baseName: "Harpy Witch",
    type: "beast",
    tier: 3,
    dodge: .45,
    speed: 2,
    lootTier: 3,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(8 + level * 1.5),
    goldFormula: (level) => Math.floor(15 + level * 2.5),
    xpFormula: (level) => Math.floor(25 * Math.pow(1.13, level - 1)),
    statusEffect: {
      curse: {
      key: 'curse',
      chance: 0.19
      }
    }
    //variants: ["Warrior", "Archer", "Mage"]
  },

  bloodSucker: {
    id: "bloodSucker",
    baseName: "Blood Sucker",
    type: "Beast",
    tier: 1,
    dodge: .30,
    lootTier: 1,
    hpFormula: (level) => Math.floor(25 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(5 + level * 2),
    goldFormula: (level) => Math.floor(7 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1)),
    statusEffect: {
      weakness: {
      key: 'weakness',
      chance: 0.3
      }
    }
    //variants: ["Corrupted", "Elite", "Champion"]
  },
  
  // Intermediate Enemies
  zombieWarrior: {
    id: "zombieWarrior",
    baseName: "Zombie Warrior",
    type: "undead",
    tier: 2,
    speed: 4,
    lootTier: 2,
    isStunnable: false,
    hpFormula: (level) => Math.floor(40 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(6 + level * 1.8),
    goldFormula: (level) => Math.floor(16 + level * 4),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1)),
    statusEffect: {
      disease: {
      key: 'disease',
      chance: 0.3
      }
    }
    //variants: ["Corrupted", "Elite", "Champion"]
  },

  brainSucker: {
    id: "brainSucker",
    baseName: "Brain Sucker",
    type: "Beast",
    tier: 2,
    dodge: .30,
    speed: 2.5,
    lootTier: 2,
    hpFormula: (level) => Math.floor(30 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(8 + level * 2),
    goldFormula: (level) => Math.floor(16 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Corrupted", "Elite", "Champion"]
  },

  evilSpirit: {
    id: "evilSpirit",
    baseName: "Evil Spirit",
    type: "undead",
    tier: 2,
    dodge: .40,
    speed: 2.5,
    lootTier: 2,
    isMagic: true,
    hpFormula: (level) => Math.floor(15 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(7 + level * 2),
    goldFormula: (level) => Math.floor(16 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Corrupted", "Elite", "Champion"]
  },

  spectre: {
    id: "spectre",
    baseName: "Spectre",
    type: "undead",
    tier: 3,
    dodge: .55,
    speed: 2.5,
    isMagic: true,
    lootTier: 3,
    isStunnable: false,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(8 + level * 2),
    goldFormula: (level) => Math.floor(16 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Corrupted", "Elite", "Champion"]
  },

  powerLich: {
    id: "powerLich",
    baseName: "Power Lich",
    type: "undead",
    tier: 3,
    isMagic: true,
    isAoe: true,
    speed: 2.5,
    lootTier: 3,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(9 + level * 2),
    goldFormula: (level) => Math.floor(16 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Corrupted", "Elite", "Champion"]
  },

  cutpurse: {
    id: "cutpurse",
    baseName: "Cutpurse",
    type: "humanoid",
    tier: 1,
    dodge: .30,
    speed: 2.5,
    lootTier: 1,
    hpFormula: (level) => Math.floor(25 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(7 + level * 1.5),
    goldFormula: (level) => Math.floor(16 + level * 4),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Warrior", "Archer", "Mage"]
  },

  bountyHunter: {
    id: "bountyHunter",
    baseName: "Bounty Hunter",
    type: "humanoid",
    tier: 2,
    dodge: .45,
    speed: 2,
    lootTier: 2,
    hpFormula: (level) => Math.floor(40 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(9 + level * 1.5),
    goldFormula: (level) => Math.floor(16 + level * 4),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1)),
    isAoe: true,
    //variants: ["Warrior", "Archer", "Mage"]
  },

  followerBaa: {
    id: "followerBaa",
    baseName: "Follower of Baa",
    type: "humanoid",
    tier: 1,
    lootTier: 1,
    isMagic: true,
    hpFormula: (level) => Math.floor(30 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(5 + level * 1.5),
    goldFormula: (level) => Math.floor(13 + level * 2.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Warrior", "Archer", "Mage"]
  },
  
  ghostSpirit: {
    id: "ghostSpirit",
    baseName: "Ghost",
    type: "undead",
    tier: 2,
    lootTier: 2,
    dodge: .50,
    isMagic: true,
    hpFormula: (level) => Math.floor(25 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(7 + level * 2.0),
    goldFormula: (level) => Math.floor(15 + level * 3.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Wraith", "Phantom", "Specter"]
  },

  witchDoctor: {
    id: "witchDoctor",
    baseName: "Witch Doctor",
    type: "humanoid",
    tier: 2,
    lootTier: 1,
    dodge: .30,
    isMagic: true,
    isAoe: true,
    speed: 4,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(7 + level * 2.0),
    goldFormula: (level) => Math.floor(15 + level * 3.5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Wraith", "Phantom", "Specter"]
  },

  cannibal: {
    id: "cannibal",
    baseName: "Cannibal",
    type: "humanoid",
    tier: 2,
    lootTier: 1,
    dodge: .30,
    hpFormula: (level) => Math.floor(35 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(8 + level * 2.2),
    goldFormula: (level) => Math.floor(20 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
   //variants: ["Berserker", "Shaman", "Warlord"]
  },

  lizardMen: {
    id: "lizardMen",
    baseName: "Lizard Men",
    type: "beast",
    tier: 2,
    lootTier: 1,
    speed: 2.5,
    hpFormula: (level) => Math.floor(30 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(10 + level * 2),
    goldFormula: (level) => Math.floor(17 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Berserker", "Shaman", "Warlord"]
  },
  
  prirateRaider: {
    id: "pirateRaider",
    baseName: "Pirate Raider",
    type: "humanoid",
    tier: 2,
    speed: 3,
    lootTier: 2,
    hpFormula: (level) => Math.floor(40 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(10 + level * 1.8),
    goldFormula: (level) => Math.floor(20 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Berserker", "Shaman", "Warlord"]
  },

  orc: {
    id: "orc",
    baseName: "Orc",
    type: "humanoid",
    tier: 2,
    hpFormula: (level) => Math.floor(50 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(8 + level * 2.2),
    goldFormula: (level) => Math.floor(20 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Berserker", "Shaman", "Warlord"]
  },

  ogreRaider: {
    id: "ogreRaider",
    baseName: "Ogre Raider",
    type: "humanoid",
    tier: 3,
    lootTier: 3,
    hpFormula: (level) => Math.floor(40 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(9 + level * 2.2),
    goldFormula: (level) => Math.floor(20 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Berserker", "Shaman", "Warlord"]
  },

  ogreChieftan: {
    id: "ogreChieftan",
    baseName: "Ogre Chieftan",
    type: "humanoid",
    tier: 3,
    lootTier: 3,
    speed: 2.5,
    isStunnable: false,
    hpFormula: (level) => Math.floor(50 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(10 + level * 2.2),
    goldFormula: (level) => Math.floor(20 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Berserker", "Shaman", "Warlord"]
  },

  captain: {
    id: "captain",
    baseName: "Captain",
    type: "humanoid",
    tier: "boss",
    speed: 1.5,
    isBoss: true,
    isAoe: true,
    dodge: .50,
    lootTier: 4,
    isStunnable: false,
    hpFormula: (level) => Math.floor(40 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(9 + level * 2.2),
    goldFormula: (level) => Math.floor(20 + level * 5),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1)),
    statusEffect: {
      weakness: {
      key: 'weakness',
      chance: 0.3
      }
    }
    //variants: ["Berserker", "Shaman", "Warlord"]
  },
  
  // Advanced Enemies
  seaDevil: {
    id: "seaDevil",
    baseName: "Sea Devil",
    type: "demon",
    tier: 3,
    hpFormula: (level) => Math.floor(60 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(12 + level * 2.8),
    goldFormula: (level) => Math.floor(35 + level * 8),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Leviathan", "Kraken Spawn", "Abyssal"]
  },

  fireDrake: {
    id: "fireDrake",
    baseName: "fireDrake",
    type: "beast",
    tier: 3,
    lootTier: 3,
    hpFormula: (level) => Math.floor(20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(8 + level * 1.4),
    goldFormula: (level) => Math.floor(8 + level * 1.5),
    xpFormula: (level) => Math.floor(25 * Math.pow(1.13, level - 1))
  },
  
  // Boss Enemies
  skeletonLordBoss: {
    id: "skeletonLordBoss",
    baseName: "Skeleton Warlord",
    type: "undead",
    tier: "boss",
    isBoss: true,
    hpFormula: (level) => Math.floor(300 + level * 150 + Math.pow(level, 1.6) * 50),
    attackFormula: (level) => Math.floor(15 + level * 4.0),
    goldFormula: (level) => Math.floor(100 + level * 25),
    xpFormula: (level) => Math.floor(20 * Math.pow(1.13, level - 1))
    //variants: ["Ancient", "Lich King", "Death Knight"]
  },
  goblinKing: {
  id: "goblinKing",
  baseName: "Goblin King",
  type: "humanoid",
  tier: "boss",
  isBoss: true,
  lootTier: 4,
  hpFormula: (level) => Math.floor((20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5) * 2),
  attackFormula: (level) => Math.floor(12 + level * 2.5),
  goldFormula: (level) => Math.floor(60 + level * 3),
  xpFormula: (level) => Math.floor(30 * Math.pow(1.13, level - 1)),
  variants: ["Warlord", "Tyrant", "Destroyer"],
  // Special abilities
  specialAbilities: ["doubleDamageChance"]
},
  priestOfBaa: {
    id: "priestOfBaa",
    baseName: "Priest Of Baa",
    type: "humanoid",
    tier: "boss",
    isBoss: true,
    isMagic: true,
    lootTier: 4,
    hpFormula: (level) => Math.floor((20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5) * 2),
    attackFormula: (level) => Math.floor(12 + level * 2.5),
    goldFormula: (level) => Math.floor(60 + level * 3),
    xpFormula: (level) => Math.floor(30 * Math.pow(1.13, level - 1)),
    variants: ["Warlord", "Tyrant", "Destroyer"],
    statusEffect: {
      curse: {
      key: 'curse',
      chance: 0.47
      }
    }
    // Special abilities
    
  },
  ethric: {
    id: "ethric",
    baseName: "Ethric",
    type: "undead",
    tier: "boss",
    isBoss: true,
    isMagic: true,
    isAoe: true,
    lootTier: 4,
    hpFormula: (level) => Math.floor((20 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5) * 2),
    attackFormula: (level) => Math.floor(8 + level * 2.5),
    goldFormula: (level) => Math.floor(60 + level * 3),
    xpFormula: (level) => Math.floor(30 * Math.pow(1.13, level - 1)),
    variants: ["Warlord", "Tyrant", "Destroyer"],
    statusEffect: {
      curse: {
      key: 'curse',
      chance: 0.40
      }
    }
    // Special abilities
    
  },
  longFang: {
    id: "longFang",
    baseName: "Longfang Witherhide",
    type: "undead",
    tier: "boss",
    isBoss: true,
    isMagic: true,
    isAoe: true,
    lootTier: 4,
    isStunnable: false,
    hpFormula: (level) => Math.floor((30 + level * (Math.random() * 2 + 25) + Math.pow(level, 1.2) * 5) * 2),
    attackFormula: (level) => Math.floor(7 + level * 2.5),
    goldFormula: (level) => Math.floor(60 + level * 3),
    xpFormula: (level) => Math.floor(30 * Math.pow(1.13, level - 1)),
    variants: ["Warlord", "Tyrant", "Destroyer"],
    statusEffect: {
      curse: {
      key: 'poison',
      chance: 0.55,
      tickDamage: 50
      }
    }
    // Special abilities
    
  }
};

// Wave Configuration System
const WAVE_CONFIGS = {
  standard: {
    enemyCount: 4,
    levelProgression: (waveNumber, baseLevel) => baseLevel + waveNumber - 1,
    enemySelection: "random", // "random", "sequential", "weighted"
    bossWave: null
  },
  
  boss: {
    enemyCount: 1,
    levelProgression: (waveNumber, baseLevel) => baseLevel + waveNumber + 2,
    enemySelection: "boss",
    bossWave: true
  },
  
  horde: {
    enemyCount: 6,
    levelProgression: (waveNumber, baseLevel) => Math.max(1, baseLevel + waveNumber - 2),
    enemySelection: "weighted",
    bossWave: null
  }
};

// Enemy variant definitions
const ENEMY_VARIANTS = {
  warrior: {
    name: "Warrior",
    prefix: "", // No prefix for base version
    hpMultiplier: 1.0,
    attackMultiplier: 1.0,
    goldMultiplier: 1.0,
    xpMultiplier: 1.0,
    critChance: 0.12, // 12%
    weight: 60, // 60% chance
    color: "default"
  },
  corrupted: {
    name: "Corrupted",
    prefix: "Corrupted",
    hpMultiplier: 1.5, // +50% HP
    attackMultiplier: 1.0,
    goldMultiplier: 1.2, // Slightly more gold for being tougher
    xpMultiplier: 1.3, // More XP for being harder
    critChance: 0.08, // 8%
    weight: 20, // 20% chance
    color: "corrupted"
  },
  elite: {
    name: "Elite",
    prefix: "Elite",
    hpMultiplier: 1.0,
    attackMultiplier: 1.5, // +50% Attack
    goldMultiplier: 1.3, // More gold for being dangerous
    xpMultiplier: 1.2, // More XP
    critChance: 0.12, // 12%
    weight: 15, 
    color: "elite"
  },
  champion: {
    name: "Champion",
    prefix: "Champion",
    hpMultiplier: 1.5, // +50% HP
    attackMultiplier: 1.5, // +50% Attack
    goldMultiplier: 1.8, // Much more gold
    xpMultiplier: 1.6, // Much more XP
    critChance: 0.18, // 18%
    weight: 5, 
    color: "champion"
  }
};

// Character factory
function createCharacter(id, classKey) {
  const classDef = CLASS_DEFS[classKey];
  const baseStats = { ...classDef.baseStats };
  const bonusAllocations = ATTRIBUTE_KEYS.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
  const totalStats = { ...baseStats };
  const { hp, mp } = computeMaxHpMp(classKey, totalStats);

  return {
    id,
    classKey,
    baseStats,
    bonusAllocations,
    totalStats,
    maxHp: hp,
    maxMp: mp,
    hp,
    mp,
    remainingBonus: DEFAULT_BONUS_POINTS,
    level: 1,
    xp: 0,
    reflectAmount: 0,
    nextLevelXp: getNextLevelXp(1),
    skills: { weaponMastery: 0, spellpower: 0, bodyBuilding: 0, meditation: 0, focus: 0, dodging: 0,
      dualWield: 0, pickPocket: 0, learning: 0, intimidate: 0, block: 0, hpPotion: 0, mpPotion: 0,
      disarmTrap: 0
     },
    knownSpells: [...CLASS_STARTING_SPELLS[classKey]],
    quickstepActive: false,
    image: classDef.image,
    statusEffect: []
  };
}

function computeTotals(character) {
  const totals = {};
  for (const key of ATTRIBUTE_KEYS) {
    totals[key] = character.baseStats[key] + character.bonusAllocations[key];
  }
  character.totalStats = totals;
  const { hp, mp } = computeMaxHpMp(character.classKey, totals);
  character.maxHp = hp;
  character.maxMp = mp;
  character.hp = Math.min(character.hp, character.maxHp);
  character.mp = Math.min(character.mp, character.maxMp);
}

function computeMaxHpMp(classKey, stats) {
  const def = CLASS_DEFS[classKey];
  return { hp: def.hp(stats), mp: def.mp(stats) };
}

function randomClassKey() {
  const keys = Object.keys(CLASS_DEFS);
  return keys[Math.floor(Math.random() * keys.length)];
}

function randomizeBonuses(character) {
  // Distribute remaining bonus points randomly across attributes
  let remaining = DEFAULT_BONUS_POINTS;
  const alloc = ATTRIBUTE_KEYS.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
  while (remaining > 0) {
    const key = ATTRIBUTE_KEYS[Math.floor(Math.random() * ATTRIBUTE_KEYS.length)];
    alloc[key] += 1;
    remaining -= 1;
  }
  character.bonusAllocations = alloc;
  character.remainingBonus = 0;
  computeTotals(character);
}

// Show the main menu
function showMainMenu() {
  const menu = document.createElement("div");
  menu.id = "main-menu";
  menu.className = "modal-overlay";
  menu.innerHTML = `
    <div class="modal-content">
      <h1>Might & Magic VI Clicker</h1>
      <p class="subtitle">A Clicker RPG inspired by a classic.</p>
      <div class="menu-buttons">
        <button class="btn large" data-action="new-game">New Game</button>
        <button class="btn large" data-action="load-game" disabled>Load Game</button>
        <button class="btn large" data-action="customize-keys">Customize Keys</button>
        <button class="btn large" data-action="guide-book">Guide Book</button>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  // Add event listeners
  menu.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      closeMainMenu();
      handleMainMenuAction(action);
    });
  });
}

// UI Rendering - Party Creator
const creationRoot = document.getElementById("party-creator");
const creationScreen = document.getElementById("creation-screen");
const gameScreen = document.getElementById("game-screen");
const sidebarEl = document.getElementById("sidebar");
const enemyListEl = document.getElementById("enemy-list");
const waveNumberEl = document.getElementById("wave-number");
const areaNameEl = document.getElementById("area-name");

function renderCreator() {
  creationRoot.innerHTML = "";
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const character = state.party[i];
    const card = document.createElement("div");
    card.className = "char-card";

    const header = document.createElement("div");
    header.className = "char-header";
    header.innerHTML = `
      <div>
        <div class="char-title">Hero ${i + 1}</div>
        <div class="hint">Choose a class and distribute bonus points</div>
      </div>
      <select class="class-select" data-index="${i}">
        ${Object.entries(CLASS_DEFS).map(([key, def]) => `<option value="${key}" ${key === character.classKey ? "selected" : ""}>${def.name}</option>`).join("")}
      </select>
    `;

    const statsGrid = document.createElement("div");
    statsGrid.className = "stats-grid";
    for (const key of ATTRIBUTE_KEYS) {
      const row = document.createElement("div");
      row.className = "stat-row";
      row.innerHTML = `
        <div class="stat-name">${key}</div>
        <div class="stat-controls" data-index="${i}" data-attr="${key}">
          <button class="btn small dec" ${character.bonusAllocations[key] === 0 ? "disabled" : ""}>−</button>
          <div class="stat-value">${character.baseStats[key] + character.bonusAllocations[key]}</div>
          <button class="btn small inc" ${character.remainingBonus === 0 ? "disabled" : ""}>+</button>
        </div>
      `;
      statsGrid.appendChild(row);
    }

    const meta = document.createElement("div");
    meta.className = "meta-row";
    meta.innerHTML = `
      <div>Bonus points left: <strong>${character.remainingBonus}</strong></div>
      <div>
        <button class="btn small" data-action="randomize" data-index="${i}">Randomize</button>
        <button class="btn small" data-action="reset" data-index="${i}">Reset</button>
      </div>
    `;

    card.appendChild(header);
    card.appendChild(statsGrid);
    card.appendChild(meta);
    creationRoot.appendChild(card);
  }

  // Wire events after render
  creationRoot.querySelectorAll("select.class-select").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const index = Number(e.target.getAttribute("data-index"));
      const newClassKey = e.target.value;
      const newCharacter = createCharacter(index, newClassKey);
      state.party[index] = newCharacter;
      renderCreator();
    });
  });

  creationRoot.querySelectorAll(".stat-controls").forEach((el) => {
    el.addEventListener("click", (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const index = Number(el.getAttribute("data-index"));
      const attr = el.getAttribute("data-attr");
      const character = state.party[index];
      if (target.classList.contains("inc")) {
        if (character.remainingBonus > 0) {
          character.bonusAllocations[attr] += 1;
          character.remainingBonus -= 1;
          computeTotals(character);
          renderCreator();
        }
      } else if (target.classList.contains("dec")) {
        if (character.bonusAllocations[attr] > 0) {
          character.bonusAllocations[attr] -= 1;
          character.remainingBonus += 1;
          computeTotals(character);
          renderCreator();
        }
      }
    });
  });

  creationRoot.querySelectorAll("button[data-action='randomize']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = Number(btn.getAttribute("data-index"));
      const chara = state.party[index];
      chara.bonusAllocations = ATTRIBUTE_KEYS.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
      chara.remainingBonus = DEFAULT_BONUS_POINTS;
      randomizeBonuses(chara);
      renderCreator();
    });
  });

  creationRoot.querySelectorAll("button[data-action='reset']").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = Number(btn.getAttribute("data-index"));
      const chara = state.party[index];
      chara.bonusAllocations = ATTRIBUTE_KEYS.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
      chara.remainingBonus = DEFAULT_BONUS_POINTS;
      computeTotals(chara);
      renderCreator();
    });
  });
}

// Creator actions
document.getElementById("randomize-all").addEventListener("click", () => {
  for (const c of state.party) {
    c.bonusAllocations = ATTRIBUTE_KEYS.reduce((acc, k) => { acc[k] = 0; return acc; }, {});
    c.remainingBonus = DEFAULT_BONUS_POINTS;
    randomizeBonuses(c);
  }
  renderCreator();
});

document.getElementById("reset-all").addEventListener("click", () => {
  for (let i = 0; i < PARTY_SIZE; i += 1) {
    const c = state.party[i];
    state.party[i] = createCharacter(i, c.classKey);
  }
  renderCreator();
});

document.getElementById("start-adventure").addEventListener("click", () => {
  // Ensure totals are up-to-date
  state.party.forEach(computeTotals);
  startGame();
});

// Game Screen logic
const partyBarRoot = document.getElementById("party-bar");
const enemyNameEl = document.getElementById("enemy-name");
const enemyHpFillEl = document.getElementById("enemy-hp-fill");
const enemyHpTextEl = document.getElementById("enemy-hp-text");
const enemyLevelEl = document.getElementById("enemy-level");
const goldEl = document.getElementById("gold");

function startGame() {
  creationScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
  initializeDebugMode();
  renderPartyBar();
  setupWaveNew(1);
  beginEnemyAttacksWithVariants();
  beginAutoAttacks();
  selectCharacter(state.selectedIndex);
  //migrateToNewSystem();
  setupKeyboardControls();  
  //console.log(state.party);
}

// Debug initialization function - call this when starting/resetting the game
function initializeDebugMode() {
  console.log("DEBUG: Initializing debug mode");
  if (!DEBUG_CONFIG.enabled) return;
  console.log("DEBUG: Debug mode is enabled");
  
  if (DEBUG_CONFIG.forceStartingLevel > 0) {
    console.log(`DEBUG: Setting party to level ${DEBUG_CONFIG.forceStartingLevel}`);
    
    for (const character of state.party) {
      const targetLevel = DEBUG_CONFIG.forceStartingLevel;
      const currentLevel = character.level;
      
      // Level up each character to the target level
      for (let level = currentLevel; level < targetLevel; level++) {
        character.level++;
        applyLevelGains(character);
      }
      
      // Ensure stats are properly computed
      //recomputeCharacterStats(character); // I don't think this actually works

      state.gold = DEBUG_CONFIG.startingGold;
      character.currentHP = character.maxHP;
      character.currentMP = character.maxMP;
      updatePartyBars();
      renderSidebar();
    }
  }
}

// Utility function to quickly toggle debug features
function toggleDebugFeature(feature, value) {
  if (feature in DEBUG_CONFIG) {
    DEBUG_CONFIG[feature] = value;
    console.log(`DEBUG: ${feature} set to ${value}`);
  } else if (feature in DEBUG_CONFIG.forceAttributes) {
    DEBUG_CONFIG.forceAttributes[feature] = value;
    console.log(`DEBUG: Force ${feature} attribute set to ${value}`);
  } else {
    console.warn(`DEBUG: Unknown feature '${feature}'`);
  }
}

function renderPartyBar() {
  partyBarRoot.innerHTML = "";

  for (const character of state.party) {
    const classDef = CLASS_DEFS[character.classKey];

    const el = document.createElement("div");
    el.className = "portrait";
    el.dataset.index = character.id;

    // First, set the innerHTML to create all the child elements
    el.innerHTML = `
      <div class="face" aria-hidden="true"></div>
      <div class="info">
        <div class="name"></div>
        <div class="class"></div>
        <div class="bars">
          <div class="bar hp">
            <div class="fill"></div>
            <div class="bar-text"></div>
          </div>
          <div class="bar mp">
            <div class="fill"></div>
            <div class="bar-text"></div>
          </div>
        </div>
      </div>
    `;

    // Now, find the 'face' element and set its style.
    // This part should be placed AFTER el.innerHTML is set.
    if (classDef.image) {
      el.querySelector(".face").style.backgroundImage = `url('images/${classDef.image}')`;
    }

    // Store references directly on the element for quick updates
    el._name = el.querySelector(".name");
    el._class = el.querySelector(".class");
    el._hpFill = el.querySelector(".bar.hp .fill");
    el._hpText = el.querySelector(".bar.hp .bar-text");
    el._mpFill = el.querySelector(".bar.mp .fill");
    el._mpText = el.querySelector(".bar.mp .bar-text");

    // Click listener stays intact
    el.addEventListener("click", () => {
      selectCharacter(character.id);
    });

    partyBarRoot.appendChild(el);
  }

  updatePartyBars(); // Fill in the initial data
}

function updatePartyBars() {
  for (const character of state.party) {
    const el = partyBarRoot.querySelector(`.portrait[data-index="${character.id}"]`);
    if (!el) continue;

    const classDef = CLASS_DEFS[character.classKey];
    if (classDef.image) {
      const image = character.hp > 0 ? `url('images/${CLASS_DEFS[character.classKey].image}')` : "url('images/dead_p.png')";
      el.querySelector(".face").style.backgroundImage = image;
    }

    el._name.textContent = `Hero ${character.id + 1}`;
    el._class.textContent = `${classDef.name} • L${character.level} • XP ${character.xp}/${character.nextLevelXp}`;

    const hpPercent = (character.hp / character.maxHp) * 100;
    const mpPercent = character.maxMp === 0 ? 0 : (character.mp / character.maxMp) * 100;

    // --- status CSS animation handling ---
    const effectClasses = {
      poison:  { hp: "poisoned-hp", glow: "poison-glow" },
      weakness:{ hp: "weakness-hp", glow: "weakness-glow" },
      disease: { hp: "disease-hp", glow: "disease-glow" },
      curse: { hp: "curse-hp", glow: "curse-glow"}
    };

    // find the first active effect we care about
    const activeEffect = character.statusEffect?.find(e => effectClasses[e.key]);

    // clear all effect classes first
    for (const eff of Object.values(effectClasses)) {
      el._hpFill.classList.remove(eff.hp);
      el.classList.remove(eff.glow);
    }

    // apply new classes if an effect is active
    if (activeEffect) {
      const { hp, glow } = effectClasses[activeEffect.key];
      el._hpFill.classList.add(hp);
      el.classList.add(glow);
    }


    el._hpFill.style.width = `${hpPercent}%`;
    el._hpText.textContent = `HP ${character.hp} / ${character.maxHp}`;
    el._mpFill.style.width = `${mpPercent}%`;
    el._mpText.textContent = `MP ${character.mp} / ${character.maxMp}`;
  }
}


function flashDamageOnCharacter(id) {
  const portrait = partyBarRoot.querySelector(`.portrait[data-index="${id}"]`);
  if (!portrait) return;

  // Add the class to start the flash animation
  portrait.classList.add("damage-flash");

  // Remove the class after a short delay to allow the animation to play
  setTimeout(() => {
    portrait.classList.remove("damage-flash");
  }, 300); // Set a short delay, e.g., 300ms, to match the CSS transition duration
}

// Weighted random selection for variants
function selectEnemyVariant() {
  const variants = Object.values(ENEMY_VARIANTS);
  const totalWeight = variants.reduce((sum, variant) => sum + variant.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const variant of variants) {
    random -= variant.weight;
    if (random <= 0) {
      return variant;
    }
  }
  
  // Fallback to warrior if something goes wrong
  return ENEMY_VARIANTS.warrior;
}

// Wave / Multiple enemies
function setupWaveNew(waveNumber, areaId = null) {
  let currentAreaId;
  if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.currentAreaId){ 
    currentAreaId = DEBUG_CONFIG.currentAreaId;
  } else {
    currentAreaId = areaId || state.currentAreaId || "newSorpigal";
  }
  const waveData = setupWaveFromArea(currentAreaId, waveNumber);
  
  state.waveComplete = false;
  // Update UI elements
  waveNumberEl.textContent = String(waveData.waveNumber);
  areaNameEl.textContent = waveData.areaName;
  
  // Update state
  state.enemyLevel = waveData.enemies[0]?.level || waveNumber;
  state.enemies = waveData.enemies;
  state.currentAreaId = currentAreaId;
  state.currentWave = waveNumber;
  
  // Check for area completion
  if (waveData.isFinalWave && waveData.hasBoss) {
    state.isAreaFinalBoss = true;
  }
  
  renderEnemyListWithVariants();
  
  return waveData;
}

// Integration wrapper function that replaces the old setupWaveFromArea
function setupWaveFromArea(areaId, waveNumber) {
  const waveData = setupWaveFromAreaWithVariants(areaId, waveNumber);
  
  // Update UI elements
  waveNumberEl.textContent = String(waveData.waveNumber);
  areaNameEl.textContent = waveData.areaName;
  
  // Update state
  state.enemyLevel = waveData.enemies[0]?.level || waveNumber;
  state.enemies = waveData.enemies;
  state.currentAreaId = areaId;
  state.currentWave = waveNumber;
  
  // Check for area completion
  if (waveData.isFinalWave && waveData.hasBoss) {
    state.isAreaFinalBoss = true;
  }
  
  renderEnemyListWithVariants();
  logWaveComposition(); // Optional: show wave composition in console
  
  return waveData;
}

// Enhanced wave setup using variant system
function setupWaveFromAreaWithVariants(areaId, waveNumber) {
  const area = AREAS[areaId];
  if (!area) {
    console.error(`Area not found: ${areaId}`);
    return setupWave(waveNumber); // Fallback
  }
  
  const isFinalWave = waveNumber >= area.maxWaves;
  const hasBoss = area.boss && isFinalWave;
  
  let waveConfig = WAVE_CONFIGS.standard;
  if (hasBoss) {
    waveConfig = WAVE_CONFIGS.boss;
  } else if (waveNumber % 5 === 0) {
    waveConfig = WAVE_CONFIGS.horde;
  }
  
  const enemyLevel = waveConfig.levelProgression(waveNumber, area.baseLevel);
  const enemies = [];
  const enemyCount = waveConfig.enemyCount;

  if (hasBoss) {
    enemies.push(generateEnemyFromTemplateWithVariant(area.boss, enemyLevel + 3, "champion"));
  } else {
    for (let i = 0; i < enemyCount; i++) {
      let enemyTemplate;
      if (waveConfig.enemySelection === "random") {
        enemyTemplate = area.enemies[Math.floor(Math.random() * area.enemies.length)];
      } else if (waveConfig.enemySelection === "sequential") {
        enemyTemplate = area.enemies[i % area.enemies.length];
      } else if (waveConfig.enemySelection === "weighted") {
        const weights = area.enemies.map((_, idx) => Math.max(1, area.enemies.length - idx));
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        let selectedIdx = 0;
        for (let j = 0; j < weights.length; j++) {
          random -= weights[j];
          if (random <= 0) { selectedIdx = j; break; }
        }
        enemyTemplate = area.enemies[selectedIdx];
      }
      
      const levelVariation = Math.floor(Math.random() * 3) - 1;
      const finalLevel = Math.max(1, enemyLevel + levelVariation);
      enemies.push(generateEnemyFromTemplateWithVariant(enemyTemplate, finalLevel));
    }
  }

  // ✅ Insert traps (only if dungeon, not final wave)
  if (area.type === "dungeon" && !hasBoss && area.trapHP) {
    const trapCount = Math.floor(Math.random() * (area.maxTraps + 1)); // 0– max traps
    console.log('trapCount: ', trapCount, ' ; ', 'maxTraps: ', area.maxTraps);
    for (let t = 0; t < trapCount; t++) {
      const trap = {
        id: `trap_${waveNumber}_${t}`,
        name: "Trap",
        type: "trap",
        hp: area.trapHP || 10,
        maxHp: area.trapHP || 10,
        maxTraps: area.maxTraps || 0,
        trapDmg: area.trapDmg || 15,
        lootTier: area.lootTier || 3,
        rewardGold: 100,
        rewardXp: 0,
        isTrap: true
      };

      // Pick a random slot (not the top)
      const insertIndex = Math.floor(Math.random() * (enemies.length)) + 1; 
      enemies.splice(insertIndex, 0, trap);
    }
  }

  // Apply multipliers to monsters only (not traps)
  enemies.forEach(enemy => {
    if (!enemy.isTrap) {
      enemy.rewardGold = Math.floor(enemy.rewardGold * area.rewards.goldMultiplier);
      enemy.rewardXp = Math.floor(enemy.rewardXp * area.rewards.xpMultiplier);
    }
  });

  return {
    areaId,
    areaName: area.name,
    waveNumber,
    enemies,
    isFinalWave,
    hasBoss
  };
}


// Enhanced enemy list rendering with variant styling
function renderEnemyListWithVariants() {
  enemyListEl.innerHTML = "";
  
  // Filter out dead enemies for cleaner UI
  const livingEnemies = state.enemies.filter(e => e.hp > 0);
  
  // Get the current area data
  const currentArea = AREAS[state.currentAreaId];
  
  if (livingEnemies.length === 0) {
    // Check if the current area is a dungeon
    if (currentArea && currentArea.type === "dungeon") {
      enemyListEl.innerHTML = '<div class="no-enemies">Enemies defeated. Searching deeper...</div>';
    } else {
      // Default message for regular areas
      enemyListEl.innerHTML = '<div class="no-enemies">All enemies defeated!</div>';
    }
    return;
  }
  
// Re-index living enemies for proper targeting
livingEnemies.forEach((enemy, displayIndex) => {
  const originalIndex = state.enemies.findIndex(e => e === enemy);

  let row = document.createElement("div");

  if (enemy.isTrap) {
    // ✅ Special trap styling
    const chance = getTrapExplosionChance().toFixed(1); // keep one decimal
    row.className = "enemy-row trap-row";
    row.setAttribute("data-index", String(originalIndex));
    row.setAttribute("data-display-index", String(displayIndex));

    row.innerHTML = `
      <div class="row-head">
        <div class="enemy-info">
          <div class="enemy-name">⚠️ Trap</div>
          <div class="enemy-description">Moves upward — destroy it before it explodes!
          <span class="trap-chance">(~${chance}% per hit)</span></div>
        </div>
      </div>
      <div class="bar hp trap">
        <div class="fill" style="width:${(enemy.hp / enemy.maxHp) * 100}%"></div>
        <div class="bar-text">${enemy.hp} / ${enemy.maxHp}</div>
      </div>
    `;
  } else {
    // ✅ Existing monster logic
    const enemyInfo = getEnemyDisplayInfoWithVariant(enemy);

    row.className = `enemy-row ${enemyInfo.cssClass}`;
    row.setAttribute("data-index", String(originalIndex));
    row.setAttribute("data-display-index", String(displayIndex));

    let variantBadge = '';
    if (enemyInfo.isVariant) {
      const variant = ENEMY_VARIANTS[enemy.variant];
      let bonuses = [];
      if (variant.hpMultiplier > 1.0) bonuses.push('HP↑');
      if (variant.attackMultiplier > 1.0) bonuses.push('ATK↑');
      variantBadge = `<span class="variant-badge ${enemyInfo.variantColor}">${variant.prefix} ${bonuses.join(' ')}</span>`;
    }

    const typeIndicator = `<span class="enemy-type ${enemyInfo.type}">${enemyInfo.type}</span>`;
    const tierIndicator = enemyInfo.tier !== 'boss' ? 
      `<span class="enemy-tier tier-${enemyInfo.tier}">T${enemyInfo.tier}</span>` : 
      '<span class="enemy-tier boss">BOSS</span>';

    row.innerHTML = `
      <div class="row-head">
        <div class="enemy-info">
          <div class="enemy-name">${enemy.name} ${variantBadge}</div>
          ${enemyInfo.description ? `<div class="enemy-description">${enemyInfo.description}</div>` : ''}
        </div> 
        <div class="row-actions">
          <button class="btn small" data-action="focus" ${state.focusedEnemyIndex === originalIndex ? 'class="focused"' : ''}>
            ${state.focusedEnemyIndex === originalIndex ? 'Focused' : 'Focus'}
          </button>
        </div>
      </div>
      <div class="bar hp ${enemyInfo.variantColor}">
        <div class="fill" style="width:${(enemy.hp / enemy.maxHp) * 100}%"></div>
        <div class="bar-text">${enemy.hp} / ${enemy.maxHp}</div>
      </div>
    `;
  }

  enemyListEl.appendChild(row);
});

  
  // Click handlers for attacks - NOW ON THE ENTIRE ENEMY ROW
  enemyListEl.querySelectorAll(".enemy-row").forEach((el) => {
    el.addEventListener("click", (event) => {
      // Don't attack if clicking on the focus button
      if (event.target.closest('[data-action="focus"]')) {
        return;
      }
      
      const originalIndex = Number(el.getAttribute("data-index"));
      clickAttackEnemy(originalIndex);
    });
  });
  
  // Click handlers for focus (same as before)
  enemyListEl.querySelectorAll(".enemy-row [data-action='focus']").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      // Prevent the row click from also firing
      event.stopPropagation();
      
      const originalIndex = Number(btn.closest('.enemy-row').getAttribute("data-index"));
      
      // Toggle focus
      if (state.focusedEnemyIndex === originalIndex) {
        state.focusedEnemyIndex = null;
      } else {
        state.focusedEnemyIndex = originalIndex;
      }
      
      renderEnemyListWithVariants(); // Re-render to update focus indicators
    });
  });
}

// handle trap logic

function checkTrapMovement() {
  if (!state.enemies || state.enemies.length === 0) return;

  // First living enemy
  const topEnemy = state.enemies.find(e => e.hp > 0);
  if (!topEnemy) return;

  if (topEnemy.type === "trap") {
    const trapIndex = state.enemies.indexOf(topEnemy);

    // ✅ Find its row in the DOM
    const trapRow = enemyListEl.querySelector(`.enemy-row[data-index="${trapIndex}"]`);
    if (trapRow) {
      trapRow.classList.add("exploding");

      // Wait for the CSS animation (0.5s) before detonation
      setTimeout(() => {
        triggerTrapExplosion(trapIndex);
      }, 500);
    } else {
      triggerTrapExplosion(trapIndex); // fallback
    }
  }
}



function triggerTrapExplosion(trapIndex) {
  console.log('Boom!');
  const trap = state.enemies[trapIndex];
  if (!trap || !trap.isTrap || trap.hp <= 0) return;

  const currentWaveId = state.currentWave;
  const shards = trap.hp; // number of hits
  const power = trap.trapDmg; // fixed from area template
  console.log('shards: ', shards);

  for (let i = 0; i < shards; i++) {
    if (state.waveComplete) return;
    if (state.currentWave !== currentWaveId) return; // abort if wave changed
    
    // Living party members
    const livingParty = getLivingPartyMembers();
    if (livingParty.length === 0) break;

    const target = livingParty[Math.floor(Math.random() * livingParty.length)];
    target.hp = Math.max(0, target.hp - power);

    flashDamageOnCharacter(target.id); // you'll need a UI hook similar to onEnemyDamaged
  }

  // Destroy trap after detonation
  trap.hp = 0;
  onEnemyDamaged(trapIndex); // remove from UI
    if (getLivingPartyMembers().length === 0) { // check for gameover
    stopEnemyAttacks();
    stopAutoAttacks();
    checkGameOver();
  }
  checkTrapMovement(); // see if the next enemy is a trap
  console.log(`💥 The trap explodes in a deadly spray of shrapnel!`);
}


// loot functions
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getWeaponFlavor(partyLevel) {
  console.log(`Party level: ${partyLevel}`);
  const flavor = WEAPON_FLAVORS.find(f => partyLevel >= f.min && partyLevel <= f.max);
  console.log(`Found flavor: ${JSON.stringify(flavor)}`);
  return flavor?.name || "Weapon";
}

function getArmorFlavor(partyLevel) {
  return ARMOR_FLAVORS.find(f => partyLevel >= f.min && partyLevel <= f.max)?.name || "Armor";
}

function getHelmFlavor(partyLevel) {
  return HELM_FLAVORS.find(f => partyLevel >= f.min && partyLevel <= f.max)?.name || "Helm";
}

function getGloveFlavor(partyLevel) {
  return GLOVE_FLAVORS.find(f => partyLevel >= f.min && partyLevel <= f.max)?.name || "Glove";
}

function getBootFlavor(partyLevel) {
  return BOOT_FLAVORS.find(f => partyLevel >= f.min && partyLevel <= f.max)?.name || "Boot";
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function ensureCharRuntimeFields(char) {
  if (!char.runtime) char.runtime = {};
  if (!char.runtime.equipmentTimers) char.runtime.equipmentTimers = {};
}

function weightedRandomChoice(pool) {
  const totalWeight = pool.reduce((sum, item) => sum + (item.weight || 1), 0);
  let roll = Math.random() * totalWeight;
  for (const item of pool) {
    roll -= (item.weight || 1);
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1]; // fallback
}

// Modified loot generation with debug support
function generateLoot(tierKey, slot) {
  // Override tier if debug is active
  if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.defaultDropTier) {
    tierKey = DEBUG_CONFIG.defaultDropTier;
  }
  console.log(tierKey);
  const tier = LOOT_TIERS[tierKey];
  const partyLevel = Math.round(state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length);

  // Artifact override
if (tierKey === "artifact") {
  let pick;

  // Force artifact if debug specifies one
  if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.forceArtifactId) {
    pick = ARTIFACTS[DEBUG_CONFIG.forceArtifactId];
    if (!pick) {
      console.warn("DEBUG: Artifact ID not found:", DEBUG_CONFIG.forceArtifactId);
      return null;
    }
  } else {
    // Otherwise pick randomly from artifacts matching slot
    const artifactPool = Object.values(ARTIFACTS).filter(a => a.slot === slot);
    if (artifactPool.length === 0) {
      console.warn("No artifacts available for slot:", slot);
      return null;
    }
    pick = randomChoice(artifactPool);
  }

    return JSON.parse(JSON.stringify(pick)); // safe deep copy
  }



  // Base HP roll
  const baseHp = randInt(5, 20) + Math.floor(partyLevel * 2);


  // Tier-based HP bonus
  let hpBonus = 0;
  switch (tierKey) {
    case "common":
      hpBonus = 0;
      break;
    case "magic":
      hpBonus = randInt(10, 30) + Math.floor(partyLevel * 1.5);
      break;
    case "rare":
      hpBonus = randInt(50, 100) + Math.floor(partyLevel * 3);
      break;
    case "legendary":
      hpBonus = randInt(200, 500) + Math.floor(partyLevel * 5);
      break;
  }

  // All gear has HP% and Might
  const hp = baseHp + hpBonus;
  const might = randInt(1, 3) + Math.floor(partyLevel / 5) * (tierKey === "legendary" ? 2 : 1);

  const bonuses = [];

  // FORCE DEBUG ATTRIBUTES FIRST (if debug is enabled)
  if (DEBUG_CONFIG.enabled) {
    if (DEBUG_CONFIG.forceAttributes.stun) {
      bonuses.push({ key: "stun", value: 50 });
    }
    if (DEBUG_CONFIG.forceAttributes.lifesteal) {
      bonuses.push({ key: "lifesteal", value: 10 });
    }
    if (DEBUG_CONFIG.forceAttributes.baseDmg) {
      bonuses.push({ key: "baseDmg", value: 10 + Math.floor(partyLevel / 2) });
    }
    if (DEBUG_CONFIG.forceAttributes.critDmg) {
      bonuses.push({ key: "critDmg", value: 20 + Math.floor(partyLevel / 2) });
    }
    if (DEBUG_CONFIG.forceAttributes.spellDmg) {
      bonuses.push({ key: "spellDmg", value: 20 + Math.floor(partyLevel / 2) });
    }
    if (DEBUG_CONFIG.forceAttributes.evasion) {
      bonuses.push({ key: "evasion", value: 15 + Math.floor(partyLevel / 3) });
    }
    if (DEBUG_CONFIG.forceAttributes.ofFireball) {
      bonuses.push({ key: "ofFireball", value: 1 });
    }
      if (DEBUG_CONFIG.forceAttributes.reflectDmg) {
      bonuses.push({ key: "reflectDmg", value: 50 });
    }
    if (DEBUG_CONFIG.forceAttributes.hunter) {
      bonuses.push({ key: "hunter", value: 50 });
    }
    if (DEBUG_CONFIG.forceAttributes.executioner) {
      bonuses.push({ key: "executioner", value: 50 });
    }
    if (DEBUG_CONFIG.forceAttributes.excommunicator) {
      bonuses.push({ key: "excommunicator", value: 50 });
    }
    if (DEBUG_CONFIG.forceAttributes.banisher) {
      bonuses.push({ key: "banisher", value: 50 });
    }
    if (DEBUG_CONFIG.forceAttributes.slayer) {
      bonuses.push({ key: "slayer", value: 50 });
    }
    if (DEBUG_CONFIG.forceAttributes.backstab && slot === "weapon") {
      bonuses.push({ key: "backstab", value: 1 });
    } 
  }

  // Fill remaining bonus slots with random attributes
  const bonusCount = tier.attrCount;
  const remainingSlots = bonusCount - bonuses.length;
  
  if (remainingSlots > 0) {
    /*
    const bonusPool = ["mp", "Accuracy", "Speed", "Personality", "Luck", "Intellect", 
                        "Dexterity", ...LOOT_ATTRIBUTES.map(a => a.key)];
    */
    const bonusPool = [
      { key: "mp", weight: 10 },
      { key: "Accuracy", weight: 10 },
      { key: "Speed", weight: 10 },
      { key: "Personality", weight: 5 },
      { key: "Luck", weight: 3 },
      { key: "Intellect", weight: 7 },
      { key: "Dexterity", weight: 7 },
      ...LOOT_ATTRIBUTES // already has weights
  ];
    // Remove already-added debug attributes from the pool
    const debugAttributes = [];
    if (DEBUG_CONFIG.enabled) {
      for (const [attr, enabled] of Object.entries(DEBUG_CONFIG.forceAttributes)) {
        if (enabled) debugAttributes.push(attr);
      }
    }
    
   // const filteredPool = bonusPool.filter(attr => !debugAttributes.includes(attr));
   const filteredPool = bonusPool.filter(attr => 
    !debugAttributes.includes(attr.key) && 
    (attr.weight ?? 1) > 0 &&
    (attr.key !== "backstab" || slot === "weapon")
  );


    for (let i = 0; i < remainingSlots; i++) {
      //const stat = randomChoice(filteredPool);
      const chosen = weightedRandomChoice(filteredPool);
      const stat = chosen.key;
      let value = 0;

      switch (stat) {
        case "mp": value = randInt(10, 50) + Math.floor(partyLevel * 1.2); break;
        case "Accuracy": value = randInt(1, 10) + Math.floor(partyLevel * 0.5); break;
        case "Speed": value = randInt(1, 10) + Math.floor(partyLevel * 0.5); break;
        case "Personality": value = randInt(1, 10) + Math.floor(partyLevel * 0.5); break;
        case "Luck": value = randInt(1, 2) + Math.floor(partyLevel / 20); break;
        case "Intellect": value = randInt(1, 10) + Math.floor(partyLevel / 20); break;
        case "Dexterity": value = randInt(1, 10) + Math.floor(partyLevel / 20); break;

        // Improved scaling formulas that feel impactful at all levels
        case "stun":
          // Base 2-8% + level scaling, cap at 25%
          const stunBase = randFloat(2.0, 8.0);
          const stunLevelBonus = (partyLevel / 10) * randFloat(0.5, 1.5);
          value = Math.min(25, +(stunBase + stunLevelBonus).toFixed(1));
          break;

        case "lifesteal":
          // Base 3-12% + level scaling, cap at 40%
          const lifestealBase = randFloat(3.0, 12.0);
          const lifestealLevelBonus = (partyLevel / 8) * randFloat(0.5, 1.2);
          value = Math.min(40, +(lifestealBase + lifestealLevelBonus).toFixed(1));
          break;

        case "baseDmg":
          // Base 8-25% + level scaling, cap at 100%
          const baseDmgBase = randFloat(8.0, 25.0);
          const baseDmgLevelBonus = (partyLevel / 5) * randFloat(0.8, 1.5);
          value = Math.min(100, +(baseDmgBase + baseDmgLevelBonus).toFixed(1));
          break;

        case "spellDmg":
          // Base 10-30% + level scaling, cap at 120%
          const spellDmgBase = randFloat(10.0, 30.0);
          const spellDmgLevelBonus = (partyLevel / 6) * randFloat(0.7, 1.3);
          value = Math.min(120, +(spellDmgBase + spellDmgLevelBonus).toFixed(1));
          break;

        case "critDmg":
          // Base 15-40% + level scaling, cap at 150%
          const critDmgBase = randFloat(15.0, 40.0);
          const critDmgLevelBonus = (partyLevel / 4) * randFloat(1.0, 2.0);
          value = Math.min(150, +(critDmgBase + critDmgLevelBonus).toFixed(1));
          break;

        case "evasion":
          // Base 5-20% + level scaling, cap at 50%
          const evasionBase = randFloat(5.0, 20.0);
          const evasionLevelBonus = (partyLevel / 10) * randFloat(0.5, 1.5);
          value = Math.min(50, +(evasionBase + evasionLevelBonus).toFixed(1));
          break;

        case "ofFireball":
          value = 1;
          break;    
        
        case "reflectDmg":
          value = randInt(10.0, 15.0);
          break;

        case "hunter": // Extra dmg vs beasts
        case "executioner": // Extra dmg vs humanoids
        case "excommunicator": // Extra dmg vs demons
        case "banisher": // Extra dmg vs undead
        case "slayer": // Extra dmg vs dragons
          // Base 5–20% scaling, cap at 150%
          const extraBase = randFloat(5.0, 20.0);
          const extraLevelBonus = (partyLevel / 5) * randFloat(0.5, 1.5);
          value = Math.min(150, Math.round((extraBase + extraLevelBonus) * 10) / 10);
        break;
      }

      bonuses.push({ key: stat, value });
    }
  }

  // Pick flavor name
  let flavorName = slot;
  if (slot === "weapon") {
    flavorName = getWeaponFlavor(partyLevel);
  } else if (slot === "armor") {
    flavorName = getArmorFlavor(partyLevel);
  } else if (slot === "helm") {
    flavorName = getHelmFlavor(partyLevel);
  } else if (slot === "gloves") {
    flavorName = getGloveFlavor(partyLevel);
  } else if (slot === "boots") {
    flavorName = getBootFlavor(partyLevel);
  }

  return {
    id: Date.now() + "-" + Math.random().toString(36).slice(2),
    tier: tierKey,
    slot: slot,
    flavorName,
    stats: {
      hp, 
      might,
      bonuses
    }
  };
}

function applyEquipmentStats(character, item, skipClamp = false) {
  character.maxHp += item.stats.hp;
  character.totalStats.Might += item.stats.might;
  
  for (const b of item.stats.bonuses) {
    if (b.key === 'mp') {
      character.maxMp = (character.maxMp || 0) + b.value;
      if (!skipClamp) character.mp = character.maxMp;
    }
    character.totalStats[b.key] = (character.totalStats[b.key] || 0) + b.value;
  }
  console.log(item);
  // Apply or increase ofFireball
  if (item.stats.bonuses.some(bonus => bonus.key === "ofFireball") || item.id === "torchWand") {
    applyOfFireball(item);
    console.log('ofFireballCount: ', state.ofFireballCount);
    
    if (state.ofFireballCount > 0 && !state.ofFireballSet){
      state.ofFireballSet = true;
      state.fireballInterval = setInterval(() => {
        castFireball();
      }, 2500); // 2500 milliseconds = 2.5 seconds
    }
  }

  // increase backstab if weapon has it
  if (item.stats.bonuses.some(bonus => bonus.key === "backstab") && item.slot === "weapon") {
    state.backstabCount += item.stats.bonuses.find(bonus => bonus.key === "backstab").value;
    console.log('backstab Count: ', state.backstabCount);
  }

  // Update reflect in character
  const reflectBonus = item.stats.bonuses.find(bonus => bonus.key === "reflectDmg");
  if (reflectBonus) {
    character.reflectAmount += reflectBonus.value;
  }

  // Artifact special effects
  if (item.tier === "artifact") {
    ensureCharRuntimeFields(character);

    if (item.id === "robinsBow") {
      // Setup volley timer
      const interval = item.special.castsVolley.interval;
      character.runtime.equipmentTimers.robinsBow = setInterval(() => {
        if (!state.waveComplete) {
          castVolley(character);
        }
      }, interval);
    }
  }
}

function removeEquipmentStats(character, item) {
  character.maxHp -= item.stats.hp;
  character.totalStats.Might -= item.stats.Might;

  for (const b of item.stats.bonuses) {
    if (b.key === 'mp') {
      character.maxMp -= b.value;
      character.mp = Math.min(character.mp, character.maxMp);
    }
    character.totalStats[b.key] -= b.value;
  }

  // decrease ofFireball
  if (item.stats.bonuses.includes("ofFireball") || item.id === "torchWand") {
    decreaseOfFireball(item);
  }

  // Update reflect in character
  if (item.stats.bonuses.some(bonus => bonus.key === "reflectDmg")) {
    character.reflectAmount -= item.stats.bonuses.reflectDmg.value;
  }

  // decrease backstab if weapon has it
  if (item.stats.bonuses.some(bonus => bonus.key === "backstab") && item.slot === "weapon") {
    state.backstabCount -= item.stats.bonuses.find(bonus => bonus.key === "backstab").value;
    if (state.backstabCount < 0) state.backstabCount = 0;
    console.log('backstab Count: ', state.backstabCount);
  }

  // Clean up artifact timers
  if (item.tier === "artifact") {
    ensureCharRuntimeFields(character);

    if (item.id === "robinsBow" && character.runtime.equipmentTimers.robinsBow) {
      clearInterval(character.runtime.equipmentTimers.robinsBow);
      delete character.runtime.equipmentTimers.robinsBow;
    }
  }
}


function recomputeCharacterStats(character) {
  // Store the current HP ratio before recalculating
  const currentHpRatio = character.maxHp > 0 ? character.hp / character.maxHp : 1;
  
  // Reset to base (after level-ups already applied)
  character.totalStats = { ...character.baseStats };
  character.maxHp = computeMaxHpMp(character.classKey, character.totalStats).hp;
  character.maxMp = computeMaxHpMp(character.classKey, character.totalStats).mp;
  
  // Apply skill-derived bonuses
  applySkillDerivedBonuses(character);
  
  // Apply all equipped gear
  let hasBloodmore = false;
  for (const slot in character.equipment) {
    const item = character.equipment[slot];
    if (item) applyEquipmentStats(character, item, true);
    console.log(item);
    if (item && item.id === "bloodmore") {
      hasBloodmore = true;
    }
  }
  
  // Apply Bloodmore's penalty *after* all bonuses
  if (hasBloodmore) {
    character.maxHp = Math.floor(character.maxHp / 2);
  }
  
  // Maintain HP ratio instead of just clamping
  character.hp = Math.floor(character.maxHp * currentHpRatio);
  character.mp = Math.min(character.mp, character.maxMp);
  if (character.hp > character.maxHp) character.hp = character.maxHp;
  if (character.mp > character.maxMp) character.mp = character.maxMp;
}



/*
function getLootDrop() {
  // Simple drop logic: weighted random tier
  const roll = Math.random();
  let tier = "common";
  if (roll > 0.9) tier = "legendary";
  else if (roll > 0.7) tier = "rare";
  else if (roll > 0.4) tier = "magic";

  const slot = randomChoice(EQUIP_SLOTS);
  return generateLoot(tier, slot);
}
*/

function generateLootFromTier(lootTier) {
  const roll = Math.random();
  let tier = "common";

  switch (lootTier) {
    case 0: // forced common
      tier = "common";
      break;
    case 1: // common - magic
      tier = roll > 0.6 ? "magic" : "common";
      break;
    case 2: // common - rare
      if (roll > 0.8) tier = "rare";
      else if (roll > 0.4) tier = "magic";
      else tier = "common";
      break;
    case 3: // magic - legendary
      if (roll > 0.9) tier = "legendary";
      else if (roll > 0.5) tier = "rare";
      else tier = "magic";
      break;
    case 4: // rare - legendary
      tier = roll > 0.7 ? "legendary" : "rare";
      break;
  }

  const slot = randomChoice(EQUIP_SLOTS);
  return generateLoot(tier, slot);
}


function showLootChestMenu(loot) {
  const menu = document.createElement("div");
  menu.className = "modal-overlay";

  // Core stats
  const statList = Object.keys(loot.stats).map(key => {
    if (key === "bonuses") return;
    return `<li>${key}: +${loot.stats[key]}</li>`;
  }).filter(Boolean).join("");

  // Bonus stats
  const bonusList = loot.stats.bonuses.map(bonus => {
    const attrDef = LOOT_ATTRIBUTES.find(a => a.key === bonus.key);
    if (attrDef?.type === "percent") {
      return `<li>${attrDef.name}: +${bonus.value}%</li>`;
    } else {
      return `<li>${bonus.key}: +${bonus.value}</li>`;
    }
  }).join("");

  // Sell value
  let sellValue = loot.stats.hp + loot.stats.might;
  for (const bonus of loot.stats.bonuses) {
    sellValue += Math.round(bonus.value);
  }
  const totalPersonality = state.party.reduce((sum, char) => sum + char.totalStats.Personality, 0);
  sellValue += Math.floor(totalPersonality * 0.1);

  // Extra: description for artifacts
  const descriptionHtml = loot.tier === "artifact" && loot.description
    ? `<p class="artifact-description">${loot.description}</p>`
    : "";

  menu.innerHTML = `
    <div class="modal-content loot-${loot.tier}">
      <h2>${LOOT_TIERS[loot.tier].name} ${loot.flavorName}</h2>
      ${descriptionHtml}
      <ul>
        ${statList || ""}
        ${bonusList || "<li>No extra stats</li>"}
      </ul>
      <div class="menu-buttons">
        <button class="btn large" data-action="equip">Equip</button>
        <button class="btn large" data-action="sell">Sell for ${sellValue} gold</button>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  menu.querySelector("[data-action='equip']").addEventListener("click", () => {
    showEquipMenu(loot);
    menu.remove();
  });
  menu.querySelector("[data-action='sell']").addEventListener("click", () => {
    state.gold += sellValue;
    menu.remove();
    renderSidebar();
    showWaveCompleteMenu();
  });
}



function showEquipMenu(loot) {
  const menu = document.createElement("div");

  let sellValue = loot.stats.hp + loot.stats.might;
  for (const bonus of loot.stats.bonuses) {
    sellValue += Math.round(bonus.value);
  }

  const totalPersonality = state.party.reduce((sum, char) => sum + char.totalStats.Personality, 0);
  sellValue += Math.floor(totalPersonality * 0.1);

  menu.className = "modal-overlay";

  // Helper to format stats (core + bonuses)
  function formatStats(item) {
    if (!item) return "Empty";

    const coreStats = Object.keys(item.stats)
      .map(key => {
        if (key === "bonuses") return;
        return `${key}: +${item.stats[key]}`;
      })
      .filter(Boolean)
      .join(", ");

    const bonusStats = item.stats.bonuses
      .map(bonus => {
        const attrDef = LOOT_ATTRIBUTES.find(a => a.key === bonus.key);
        if (attrDef?.type === "percent") {
          return `${attrDef.name}: +${bonus.value}%`;
        } else {
          return `${bonus.key}: +${bonus.value}`;
        }
      })
      .join(", ");

    return `${LOOT_TIERS[item.tier].name} ${item.flavorName} (${[coreStats, bonusStats].filter(Boolean).join(", ")})`;
  }

  // Character equip options
  let options = state.party.map((char, i) => {
    const classDef = CLASS_DEFS[char.classKey];
    const displayName = char.name || classDef?.name || `Hero ${i+1}`;
    const current = char.equipment?.[loot.slot];

    return `
      <div class="character-section">
        <h3>${displayName} (Lvl ${char.level})</h3>
        <p>Current: ${formatStats(current)}</p>
        <button class="btn small" data-character="${i}" data-action="equip">Equip Here</button>
      </div>
    `;
  }).join("");

  // New item preview
  const newItemStats = formatStats(loot);

  // Extra description for artifacts
  const descriptionHtml = loot.tier === "artifact" && loot.description
    ? `<p class="artifact-description">${loot.description}</p>`
    : "";

  menu.innerHTML = `
    <div class="modal-content loot-${loot.tier}">
      <h2>Equip Item: ${newItemStats}</h2>
      ${descriptionHtml}
      ${options}
      <button class="btn" data-action="sell-item">Sell for ${sellValue} gold</button>
    </div>
  `;

  document.body.appendChild(menu);

  menu.querySelectorAll("[data-action='equip']").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.getAttribute("data-character"));
      const char = state.party[idx];

      // If something is already equipped, push it back to loot box instead of selling
      if (char.equipment?.[loot.slot]) {
        const oldItem = char.equipment[loot.slot];
        removeEquipmentStats(char, oldItem);
        if (!state.pendingLoot) state.pendingLoot = [];
        state.pendingLoot.push(oldItem);
      }

      if (!char.equipment) char.equipment = {};
      char.equipment[loot.slot] = loot;

      // Recompute stats fresh
      recomputeCharacterStats(char);

      updatePartyBars();
      renderSidebar();

      menu.remove();
      showWaveCompleteMenu();
    });
  });

  menu.querySelector("[data-action='sell-item']").addEventListener("click", () => {
    state.gold += sellValue;
    menu.remove();
    renderSidebar();
    showWaveCompleteMenu();
  });
}



/*
function generateEnemy(level) {
  const names = ["Goblin", "Bandit", "Skeleton", "Ogre", "Harpy", "Minotaur", "Hydra", "Devilkin"];
  const base = Math.max(1, level);
  const name = `${names[level % names.length]} L${level}`;
  const maxHp = 50 + Math.floor(level * 30 + Math.pow(level, 1.35) * 8);
  const rewardGold = 6 * base + Math.floor(level * 2);
  const rewardXp = 20 + Math.floor(level * 10);
  return { name, maxHp, hp: maxHp, rewardGold, rewardXp };
}
*/
// Generate enemy from template
// Enhanced enemy generation with variant system
function generateEnemyFromTemplateWithVariant(templateId, level, forceVariant = null) {
  const template = ENEMY_TEMPLATES[templateId];
  if (!template) {
    console.error(`Enemy template not found: ${templateId}`);
    return generateEnemy(level); // Fallback to old system
  }

  // Select variant (or use forced variant)
  const variant = forceVariant ? ENEMY_VARIANTS[forceVariant] : selectEnemyVariant();

  // Deep clone helper
  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  // Deep clone template and variant to avoid shared references
  const templateCopy = deepClone(template);
  const variantCopy = deepClone(variant);

  // Calculate base stats using template formulas
  const baseHp = templateCopy.hpFormula(level);
  const baseAttack = templateCopy.attackFormula(level);
  const baseGold = templateCopy.goldFormula(level);
  const baseXp = templateCopy.xpFormula(level);

  const tierMult = TIER_MULTIPLIERS[templateCopy.tier] || TIER_MULTIPLIERS[1];
  // Apply variant multipliers
  const maxHp = Math.floor(baseHp * variantCopy.hpMultiplier * tierMult.hp);
  const attack = Math.floor(baseAttack * variantCopy.attackMultiplier * tierMult.attack);
  const rewardGold = Math.floor(baseGold * variantCopy.goldMultiplier * tierMult.gold);
  const rewardXp = Math.floor(baseXp * variantCopy.xpMultiplier * tierMult.xp);

  // Generate name with variant prefix
  let name = templateCopy.baseName || "Enemy";
  if (variantCopy.prefix) {
    name = `${variantCopy.prefix} ${templateCopy.baseName}`;
  }
  name += ` L${level}`;
  // Generate unique ID for this instance
  const instanceId = `${templateId}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  return {
    instanceId, // unique ID for THIS enemy
    id: templateId,
    name,
    type: templateCopy.type || "normal",
    tier: templateCopy.tier,
    variant: variantCopy.name.toLowerCase(),
    isBoss: templateCopy.isBoss || false,
    maxHp,
    hp: maxHp,
    attack,
    speed: template.speed || 3.5, // let's just say attacking once every 3.5 secs is the default and I'll adjust this
    rewardGold,
    rewardXp,
    level,
    dodge: template.dodge || .15,
    variantColor: variantCopy.color,
    isVariant: variantCopy.name !== "Warrior",
    statusEffect: deepClone(templateCopy.statusEffect || []), // ensure a cloned array
    isAoe: templateCopy.isAOE || false,
    isMagic: templateCopy.isMagic || false,
    critChance: variantCopy.critChance,
    isStunnable: templateCopy.isStunnable !== false, // default true
    effects: [], // for ongoing effects like stun/burn/poison
    lootTier: template.lootTier || 0
  };
}

// Item and Artifact skills
function castVolley(character) {
  const livingPartyMembers = getLivingPartyMembers();
  if (!character || character.hp <= 0) return; // dead or invalid character
  if (state.waveComplete || livingPartyMembers.length === 0) return;

  const arrows = 5;
  const level = character.level || 1;
  const dex = character.totalStats.dexterity || 0;
  const might = character.totalStats.might || 0;

  // Power formula: scales with level + dex + might
  const power = Math.floor(level * 2 + dex * 0.5 + might * 0.3);

  for (let i = 0; i < arrows; i++) {
    if (state.waveComplete) return;

    // Living enemies
    const livingEnemies = state.enemies
      .map((enemy, idx) => ({ enemy, idx }))
      .filter(e => e.enemy.hp > 0);

    if (livingEnemies.length === 0) break;

    // Random enemy
    const pick = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
    const enemy = pick.enemy;
    const idx = pick.idx;

    // Apply damage
    enemy.hp = Math.max(0, enemy.hp - power);
    onEnemyDamaged(idx);
  }
}

function castFireball() {
  
  const livingPartyMembers = getLivingPartyMembers();
  if (state.waveComplete || livingPartyMembers.length === 0) return;

  //console.log('State enemies:', state.enemies);
  const livingEnemies = state.enemies
    .map((enemy, idx) => ({ enemy, idx }))
    .filter(e => e.enemy.hp > 0);
  //console.log('living enemies: ', livingEnemies);
  if (livingEnemies.length === 0) return;
  
  // Random enemy
  const pick = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
  const enemy = pick.enemy;
  const idx = pick.idx;

  // Calculate fireball damage
  const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
  const baseDamage = partyLevel * 2; // adjust this value as needed
  const fireballDamage = Math.round(baseDamage * (1 + state.ofFireballCount * 0.5)); // each ofFireball adds 50% damage
  
  // Apply damage
  enemy.hp = Math.max(0, enemy.hp - fireballDamage);
  onEnemyDamaged(idx);
  console.log('Fireball damage: ', fireballDamage);
  // Play fire sound
  soundEffects.play('fire');
}

function applyOfFireball(item){
  if (item.id === "torchWand"){
    state.ofFireballCount += 4;
  } else {
    state.ofFireballCount++;
  }
}

function decreaseOfFireball(item){
  if (item.id === "torchWand"){
    state.ofFireballCount -= 4;
  } else {
    state.ofFireballCount--;
  }

  if (state.ofFireballCount <= 0) {
    clearInterval(state.fireballInterval);
  }
}

function computePartySpeed() {
  // Only living party members contribute to speed
  const livingMembers = getLivingPartyMembers();
  if (livingMembers.length === 0) return 0;
  if (!state.partyBuffs.haste)
    {
      return livingMembers.reduce((sum, c) => sum + c.totalStats.Speed, 0) / livingMembers.length;
    } else {
      // console.log(state.partyBuffs);
      // console.log(state.partyBuffs.haste);
      const partySpeed = livingMembers.reduce((sum, c) => sum + c.totalStats.Speed, 0) / livingMembers.length;
      const hasteBonus = 50;
      const totalSpeed = partySpeed + hasteBonus;
      const adjustedSpeed = diminishingReturns(totalSpeed, 200);
      return adjustedSpeed;
    }
}

function computeCriticalChance() {
  // Only living characters contribute to crit chance
  const livingMembers = getLivingPartyMembers();
  if (livingMembers.length === 0) return 0;
  
  const totalLuck = livingMembers.reduce((sum, c) => sum + c.totalStats.Luck, 0);
  const focusBonus = livingMembers.reduce((sum, c) => sum + c.skills.focus * 0.01, 0);
  const baseCritChance = Math.min(0.3, (totalLuck / 4) / 100 + focusBonus); // Cap at 30%
  return baseCritChance;
}

function isAttackCritical() {
  if (state.guaranteedCrits > 0) {
    state.guaranteedCrits--;
    return true;
  }
  return Math.random() < computeCriticalChance();
}

// Enhanced stat computation functions that only count living characters
function getLivingPartyMembers() {
  return state.party.filter(c => c.hp > 0);
}

function diminishingReturns(value, scale = 250) {
  return (value * scale) / (value + scale);
}

function getTrapExplosionChance() {
  const livingMembers = getLivingPartyMembers();
  let totalDisarm = 0;

  livingMembers.forEach(c => {
    // If you store skills like c.skills.disarmTrap
    if (c.skills && c.skills.disarmTrap) {
      totalDisarm += c.skills.disarmTrap;
    }
  });

  let chance = 5 - (totalDisarm * 0.1);
  return Math.max(0, chance); // never below 0%
}


function computeClickDamage(index) {
  const enemy = state.enemies[index];
  // Only living characters contribute to damage
  const livingMembers = getLivingPartyMembers();
  const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
  if (livingMembers.length === 0) {
    stopAutoAttacks();
    stopEnemyAttacks();
    return 0;
  }

  if (enemy.type === "trap") {
    let damage = 1; // ✅ traps always take 1 damage

    // ✅ Explosion check
    const chance = getTrapExplosionChance();
    if (Math.random() * 100 < chance) {
      console.log(`Trap triggered early! (${chance.toFixed(2)}% chance)`);
      triggerTrapExplosion(index);
      return; // skip normal damage logic (trap already exploded)
    } else {
      return damage;
    }
  }


  let usedBloodmore = false;
  let bloodDamage = 0;
  for (const member of livingMembers) {
    const weapon = member.equipment?.weapon;

    // Check for Bloodmore
    if (weapon && weapon.id === "bloodmore") {
      usedBloodmore = true;
      const dmg = computeBloodmoreAOE(member);
      bloodDamage += dmg;
      
    }
  }
    
// Compute Might contribution (reduced if weakened, exclude Bloodmore wielders)
const totalMight = livingMembers.reduce((sum, c) => {
  const weapon = c.equipment?.weapon;
  
  // Skip characters with Bloodmore since they're handled separately
  if (weapon && weapon.id === "bloodmore") {
    return sum;
  }
  
  const isWeakened = c.statusEffect?.some(effect => effect.key === "weakness");
  const mightContribution = isWeakened ? c.totalStats.Might * 0.5 : c.totalStats.Might;
  return sum + mightContribution;
}, 0);

  const adjustedMight = diminishingReturns(totalMight, 300);
  
  const weaponSkillBonus = livingMembers.reduce((sum, c) => sum + c.skills.weaponMastery * 0.05, 0);
  const base = Math.max(1, Math.floor(adjustedMight / 5));

  // Gather baseDmg % bonuses from all equipped gear
  let baseDmgBonus = 0;
  for (const member of livingMembers) {
    for (const slot in member.equipment) {
      const item = member.equipment[slot];
      if (!item) continue;

      for (const b of item.stats.bonuses) {
        if (b.key === "baseDmg") {
          baseDmgBonus += b.value; // flat percent add
        }
      }
    }
  }

  // Gather critical damage % bonuses from all equipped gear
  let critDmgBonus = 0;
  for (const member of livingMembers) {
    for (const slot in member.equipment) {
      const item = member.equipment[slot];
      if (!item) continue;
      for (const b of item.stats.bonuses) {
        if (b.key === "critDmg") {
          critDmgBonus += b.value; // flat percent add
        }
      }
    }
  }

  let baseDamageWithBonus = base;
  // Apply base damage % bonus
  if (baseDmgBonus > 0) {
    baseDamageWithBonus = Math.floor(base * (1 + baseDmgBonus / 100));
    console.log(`Applying baseDmg bonus: ${baseDmgBonus}%, New base damage: ${baseDamageWithBonus}`);
  }

  let totalDamage = Math.floor(baseDamageWithBonus * (1.04 ** partyLevel) + (weaponSkillBonus));
  console.log(`Base Damage: ${base}, After baseDmg Bonus: ${baseDamageWithBonus}, Total Damage before crits: ${totalDamage}`);
  
  // Check for critical hit (only if at least one non-weakened attacker exists)
  const canCrit = livingMembers.some(c => !c.statusEffect?.some(effect => effect.key === "weakness"));
  if (canCrit && isAttackCritical()) {
    const totalDex = livingMembers.reduce((sum, c) => sum + c.totalStats.Dexterity, 0);
    //let critMultiplier = 2.0 + (totalDex * 0.001);
    console.log(`critDmgBonus: ${critDmgBonus}`);
    let critMultiplier = (2.0 + (totalDex * 0.001)) * (1 + critDmgBonus / 100);
    console.log(`critMultiplier after dex and gear: ${critMultiplier}`);
    if (state.partyBuffs.weakSpot) {
      critMultiplier += 0.5;
    }
    console.log(`Crit multiplier: ${critMultiplier}`);
    totalDamage = Math.floor(totalDamage * critMultiplier);
    showFloatingMessage(totalDamage, 'crit');
  }
  
  // Check for dual wield multi-hit system
  let dualWieldHits = 0;
  let dualWieldDamage = 0;
  
  for (const member of livingMembers) {
    const isWeakened = member.statusEffect?.some(effect => effect.key === "weakness");
    if (!isWeakened && canUseDualWield(member)) {
      const hits = attemptDualWieldChain(member);
      if (hits > 0) {
        dualWieldHits = Math.max(2, hits);
        dualWieldDamage = calculateDualWieldDamage(member, dualWieldHits, base, partyLevel, weaponSkillBonus);
        setDualWieldCooldown(member);
        console.log(`${member.id + 1} dual wield chain: ${dualWieldHits} hits!`);
        showFloatingMessage(`${dualWieldHits} Hits!`, 'dual-wield');
        break; // Only one character can trigger dual wield per click
      }
    }
  }

  console.log('Enemy object on click: ', enemy);
  console.log(`Enemy on click: ${enemy.name}, Type: ${enemy.type}, HP: ${enemy.hp}/${enemy.maxHp}`);
  const enemyType = enemy.type; // however you store enemy classification
  console.log(`Enemy type: ${enemyType}`);
  // Apply extra damage vs enemy type bonuses from all equipped gear
  if (enemyType) {
    const extraBonus = getExtraDamageBonus(enemyType, livingMembers);
    if (extraBonus > 0) {
      totalDamage = Math.floor(totalDamage * (1 + extraBonus / 100));
      console.log(`Applied ${extraBonus}% bonus vs ${enemyType}, Damage: ${totalDamage}`);
    }
  }

  // Add backstab bonus if applicable
  if (state.backstabCount > 0 && state.backstabReady == 0) {
    const backstabBonus = 3.0 + (state.backstabCount * 0.5); // each backstab adds 50% damage, base 300%
    totalDamage = Math.floor(totalDamage * (1 + backstabBonus));
    console.log(`Backstab! +${(backstabBonus * 100).toFixed(1)}% damage, New Damage: ${totalDamage}`);
    showFloatingMessage('Backstab!', 'backstab');
    state.backstabReady = 5; // 5 clicks cooldown
  } else if (state.backstabReady > 0) {
    state.backstabReady--;
    console.log(`Backstab cooldown: ${state.backstabReady} clicks remaining`);
  }

  const total = totalDamage + dualWieldDamage;
  // Lifesteal: for Bloodmore we heal based on the wielder only
  if (usedBloodmore) {
    
    const wielder = livingMembers.find(c => c.equipment?.weapon?.id === "bloodmore");
    if (wielder) applyLifestealPerCharacter(bloodDamage, [wielder]);
  } else {
    applyLifestealPerCharacter(total, livingMembers);
  }
    
  return total;
}

// Extra damage vs enemy type system
function getExtraDamageBonus(enemyType, livingMembers) {
  let bonus = 0;
  for (const member of livingMembers) {
    for (const slot in member.equipment) {
      const item = member.equipment[slot];
      if (!item) continue;
      for (const b of item.stats.bonuses) {
        switch (enemyType) {
          case "beast":
            if (b.key === "hunter") bonus += b.value;
            break;
          case "humanoid":
            if (b.key === "executioner") bonus += b.value;
            break;
          case "demon":
            if (b.key === "excommunicator") bonus += b.value;
            break;
          case "undead":
            if (b.key === "banisher") bonus += b.value;
            break;
          case "dragon":
            if (b.key === "slayer") bonus += b.value;
            break;
        }
      }
    }
  }
  return bonus;
}


// Lifesteal system
function applyLifestealPerCharacter(totalDamage, livingMembers) {
  if (totalDamage <= 0) return;
  

  livingMembers.forEach((member, index) => {
    let lifestealPercent = 0;

    // Collect lifesteal from this member's gear
    for (const slot in member.equipment) {
      const item = member.equipment[slot];
      if (!item) continue;

      for (const b of item.stats.bonuses) {
        if (b.key === "lifesteal") {
          lifestealPercent += b.value;
        }
      }
    }

    if (lifestealPercent > 0) {
      const healAmount = Math.floor(totalDamage * (lifestealPercent / 100));
      if (healAmount > 0) {
        member.hp = Math.min(member.maxHp, member.hp + healAmount);

        console.log(`${member.classKey} healed for ${healAmount} via lifesteal`);
        // Show portrait heal effects
        showPortraitFloatingMessage(member.id, `+${healAmount}`, 'lifesteal');
        flashHealOnCharacter(member.id);
      }
    }
  });

  updatePartyBars();
}

function computeBloodmoreAOE(character) {
  const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
  const might = character.totalStats.Might || 0;

  // Base power scales with level and might
  let power = Math.floor((partyLevel * 2) + (might * 1.5));

  let totalDamage = 0;
  for (let i = 0; i < state.enemies.length; i++) {
    if (state.waveComplete) return;
    const enemy = state.enemies[i];
    if (enemy.hp <= 0) continue;
    if (enemy.type === "trap") continue;

    enemy.hp = Math.max(0, enemy.hp - power);
    totalDamage += power;
    onEnemyDamaged(i);
  }

  showFloatingMessage(`AOE ${totalDamage}`, 'crit'); // placeholder effect

  return totalDamage;
}



// Enhanced enemy attack function with boss special abilities
function computeEnemyAttackDamageWithVariantAndAbilities(enemy = null) {
  let { damage, isCrit } = computeEnemyAttackDamageWithVariant(enemy);
  
  if (enemy && enemy.specialAbilities) {
    // Handle special abilities
    if (enemy.specialAbilities.includes("doubleDamageChance")) {
      // Goblin King's double damage chance (30% chance)
      if (Math.random() < 0.3) {
        console.log(`${enemy.name} unleashes a devastating blow!`);
        baseDamage *= 2;
      }
    }
  }
  
  return { damage, isCrit };
}

// Enhanced enemy attack damage calculation using variant attack values
function computeEnemyAttackDamageWithVariant(enemy = null) {
  const livingMembers = getLivingPartyMembers();
  let damage = 0;
  let isCrit = false;

  if (enemy && enemy.attack) {
    const baseAttack = enemy.attack;
    const variation = Math.random() * baseAttack * 0.3; // 30%
    damage = Math.max(1, Math.floor(baseAttack + variation - (baseAttack * 0.15)));

    // Critical hit check
    if (Math.random() < (enemy.critChance || 0)) {
      damage = Math.floor(damage * 2); // Double damage on crit
      console.log(`${enemy.name} lands a CRITICAL HIT!`);
      isCrit = true;
    }


  } else {
    // Fallback
    const level = state.enemyLevel;
    damage = Math.max(1, Math.floor(2 + level * 1.5));
  }
  
  const blocker = attemptBlock(livingMembers);
  if (blocker && !enemy.isMagic) { //if there is a blocker and enemy is not magic
    soundEffects.play('block');
    damage = Math.floor(damage / 2);
  }

  return { damage, isCrit };
}


function getBlockChance(member) {
  if (member.statusEffect && member.statusEffect.some(effect => effect.key === "curse")) return 0; // cursed member can't block
  const baseChance = 0.1; // 10% base chance
  const blockScaling = Math.min(member.skills.block * 0.01, 0.30); // 1% increase per block level, max 30% (total 70%)
  return baseChance + blockScaling;
}

function attemptBlock(livingMembers) {
  const blockers = livingMembers.filter(member => member.skills.block > 0);
  for (const blocker of blockers) {
    if (Math.random() < getBlockChance(blocker)) {
      return blocker; // Block successful, return the blocker
    }
  }
  return null; // No block successful
}

// Dodging system
// Helper function to get evasion bonus from gear
function getEvasionBonus(character) {
  let evasionBonus = 0;
  
  for (const slot in character.equipment) {
    const item = character.equipment[slot];
    if (!item) continue;
    
    for (const bonus of item.stats.bonuses) {
      if (bonus.key === "evasion") {
        evasionBonus += bonus.value;
      }
    }
  }
  
  return evasionBonus;
}

// Updated dodging system with evasion
function computeDodgeChance(character) {
  if (character.hp <= 0) return 0;
  if (character.statusEffect && character.statusEffect.some(effect => effect.key === "curse")) return 0; // cursed character can't dodge
  
  const baseDodge = character.totalStats.Dexterity * 0.8; // 0.8% per dex point
  const luckBonus = character.totalStats.Luck * 0.1; // 0.1% per luck point  
  const skillBonus = (character.skills.dodging || 0) * 2; // 2% per dodging skill rank
  const quickstepBonus = character.quickstepActive ? 100 : 0; // Guaranteed dodge if quickstep active
  const evasionBonus = getEvasionBonus(character); // Direct % bonus from gear
  
  return character.quickstepActive ? 
    quickstepBonus / 100 : 
    Math.min(75, baseDodge + luckBonus + skillBonus + evasionBonus) / 100;
}

function attemptDodge(character) {
  const dodgeChance = computeDodgeChance(character);
  const dodged = Math.random() < dodgeChance;
  
  // Clear quickstep after use
  if (character.quickstepActive) {
    character.quickstepActive = false;
  }
  
  return dodged;
}

// Dual wield multi-hit system
function computeDualWieldChance(character) {
    if (character.hp <= 0 || !character.skills.dualWield || character.skills.dualWield === 0) return 0;
    if (character.statusEffect && character.statusEffect.some(effect => effect.key === "curse")) return 0; // no dual wield for cursed characters

    const skillRank = character.skills.dualWield || 0;
    const dextBonus = Math.floor(character.totalStats.Dexterity * 0.10) || 0;

    // Calculate the raw chance percentage
    const baseChance = skillRank + dextBonus;

    // Cap the chance at 30% and divide by 100 to get a decimal value
    return Math.min(baseChance, 30) / 100;
}

function canUseDualWield(character) {
  if (!character.skills.dualWield || character.skills.dualWield == 0) return 0;
  const now = Date.now();
  const readyAt = state.dualWieldCooldowns[character.id] || 0;
  return now >= readyAt;
}

function attemptDualWieldChain(character) {
  const baseChance = computeDualWieldChance(character);
  console.log('baseChance', baseChance);
  if (Math.random() >= baseChance) return 0; // Failed initial trigger
  
  let hits = 1; // First hit is guaranteed if we pass the initial check
  const maxHits = 6;
  
  // Each subsequent hit has the same chance to trigger
  for (let i = 1; i < maxHits; i++) {
    if (Math.random() < baseChance) {
      hits++;
    } else {
      break; // Chain broken
    }
  }
  
  return hits;
}

function calculateDualWieldDamage(character, hits, baseDamage, partyLevel, weaponSkillBonus) {
  let totalExtraDamage = 0;
  const isWeakened = character.statusEffect?.some(effect => effect.key === "weakness");
  const characterMight = isWeakened ? character.totalStats.Might * 0.5 : character.totalStats.Might;
  const characterWeaponBonus = character.skills.weaponMastery * 0.05;
  
  // Calculate damage for each hit individually
  for (let i = 0; i < hits; i++) {
    // Each hit gets its own damage roll based on the character's stats
    const hitBase = Math.max(1, Math.floor(characterMight / 5));
    let hitDamage = Math.floor(hitBase * (1.04 ** character.level) + characterWeaponBonus);
    
    // Each hit can crit independently
    if (isAttackCritical()) {
      hitDamage = Math.floor(hitDamage * 2.0);
    }
    
    totalExtraDamage += hitDamage;
  }
  
  return totalExtraDamage;
}

function setDualWieldCooldown(character) {
  const baseCoolddown = 20000; // 20 seconds in milliseconds
  const skillRank = character.skills.dualWield || 0;
  const cooldownReduction = skillRank * 333; // ~0.33 seconds per skill point
  const finalCooldown = Math.max(10000, baseCoolddown - cooldownReduction); // Minimum 10 seconds
  
  const now = Date.now();
  state.dualWieldCooldowns[character.id] = now + finalCooldown;
}

function setHPPotionCoolDown(character) {
  const baseCoolddown = 15000; // 15 seconds
  const skillRank = character.skills.hpPotion || 0;
  const cooldownReduction = skillRank * 333; // ~0.33 seconds per skill point
  const finalCooldown = Math.max(15000, baseCoolddown - cooldownReduction); // minimum 15 seconds

  const now = Date.now();
  state.hpPotionCoolDowns[character.id] = now + finalCooldown;
}

function setMPPotionCoolDown(character) {
  const baseCoolddown = 15000; // 15 seconds
  const skillRank = character.skills.mpPotion || 0;
  const cooldownReduction = skillRank * 333; // ~0.33 seconds per skill point
  const finalCooldown = Math.max(20000, baseCoolddown - cooldownReduction); // minimum 20 seconds

  const now = Date.now();
  state.mpPotionCoolDowns[character.id] = now + finalCooldown;
}

function canUseHpPotion(character) {
  if (!character.skills.hpPotion || character.skills.hpPotion == 0) return false;
  const now = Date.now();
  const readyAt = state.hpPotionCoolDowns[character.id] || 0;
  return now >= readyAt;
}

function canUseMpPotion(character) {
  //console.log(character);
  if (!character.skills.mpPotion || character.skills.mpPotion == 0) return false;
  const now = Date.now();
  const readyAt = state.mpPotionCoolDowns[character.id] || 0;
  return now >= readyAt;
}

function useHpPotion(character) {
  if (!canUseHpPotion(character)) {
    console.log(`${character.id} HP potion on cooldown`);
    return;
  } else {
    const healBonus = Math.round(character.skills.hpPotion * 5);
    const healAmount = Math.round(character.maxHp * 0.3); // heals 30% of max HP (adjust as needed)
    const totalHealAmount = healBonus + healAmount
    character.hp = Math.min(character.hp + totalHealAmount, character.maxHp);
    setHPPotionCoolDown(character);
    if (state.availableHPPotions > 0) {
      state.availableHPPotions--;
      updatePartyBars();
    }
  }
}

function useMpPotion(character) {
  if (!canUseMpPotion(character)) {
    console.log(`${character.id} MP potion on cooldown`);
    return;
  } else {
    const restoreBonus = Math.round(character.skills.mpPotion * 5);
    const restoreAmount = Math.round(character.maxMp * 0.3); // restores 30% of max MP (adjust as needed)
    const totalRestoreAmount = restoreBonus + restoreAmount;
    character.mp = Math.min(character.mp + totalRestoreAmount, character.maxMp);
    setMPPotionCoolDown(character);
    if (state.availableMPPotions > 0) {
      state.availableMPPotions--;
      updatePartyBars();
    }
  }
}
/*
// Auto-heal system
function performAutoHeal() {
  const livingMembers = getLivingPartyMembers();
  
  for (const healer of livingMembers) {
    // Check if this character knows heal spells and has MP
    const healSpells = healer.knownSpells.filter(spellKey => {
      const spell = SPELL_DEFS[spellKey] || SPELL_DEFS[spellKey];
      return spell && spell.type === "heal" && healer.mp >= spell.mpCost;
    });
    
    if (healSpells.length === 0) continue;
    
      // Find party members who are alive and under 20% health
      const needHealing = state.party.filter(member => {
        // A living character is one whose HP is greater than 0
        const isLiving = member.hp > 0;
        const healthPercent = member.hp / member.maxHp;
        
        // Only return members who are living and under 20% health
        return isLiving && healthPercent < 0.2; 
    }).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp)); // Lowest HP% first
    
    if (needHealing.length === 0) continue;
    
    // Use the most appropriate heal spell
    let selectedSpell = "heal"; // Default
    if (healSpells.includes("cure") && needHealing.length >= 2) {
      selectedSpell = "cure"; // Use Cure All if multiple people need healing
    } else if (healSpells.includes("heal")) {
      selectedSpell = "heal";
    } else {
      selectedSpell = healSpells[0]; // Use any available heal spell
    }
    
    // Cast the spell
    castSpell(healer, selectedSpell);
    
    // Only one healer acts per auto-heal cycle to avoid spam
    break;
  }
}
  */

// Game Over detection and handling
function checkGameOver() {
  const livingMembers = getLivingPartyMembers();
  if (livingMembers.length === 0) {
    // Delay slightly to let the UI update
    setTimeout(() => {
      showGameOverMenu();
    }, 500);
  }
}

// Clicking to attack
function clickAttackEnemy(index) {
  const livingMembers = getLivingPartyMembers();
  if (livingMembers.length === 0) {
    // Dead party can't attack
    return;
  }
  
  const enemy = state.enemies[index];
  if (!enemy || enemy.hp <= 0) return;

  const isDodge = accuracyCheck(enemy);
  if (!isDodge){
    const dmg = computeClickDamage(index);
    if (dmg > 0) {
      // Apply damage
      enemy.hp = Math.max(0, enemy.hp - dmg);
      // Apply lifesteal healing
      // applyLifestealPerCharacter(dmg);      // moved to computeClickDamage for cleaner code
      if (!state.waveComplete){
        onEnemyDamaged(index);
      }
    }
  } else {
    console.log('Enemy dodged!');
  }
}

function accuracyCheck(enemy){
  // Accuracy check
  const livingMembers = getLivingPartyMembers();
  const totalAccuracy = livingMembers.reduce((sum, c) => sum + c.totalStats.Accuracy, 0);
  // console.log(totalAccuracy);
  const accuracyReduction = 1 - Math.exp(-totalAccuracy * 0.001);
  const reducedDodgeChance = Math.max(0.05, enemy.dodge * (1 - accuracyReduction));
  //console.log(accuracyReduction);
  //console.log(reducedDodgeChance);
  return Math.random() < reducedDodgeChance;
}

function onEnemyDamaged(index) {
  // Update the UI immediately for the damaged enemy
  renderEnemyListWithVariants();

  // Apply animation after the DOM is updated
  const enemyRow = document.querySelector(`.enemy-row[data-index="${index}"] .hp`);
  if (enemyRow) {
    enemyRow.classList.remove("damage-flash");
    enemyRow.offsetHeight; // Force reflow
    enemyRow.classList.add("damage-flash");

    // Remove the animation class after a short delay
    setTimeout(() => {
      enemyRow.classList.remove("damage-flash");
    }, 400);
  }

  const enemy = state.enemies[index];
  if (!enemy) return; // Exit if the enemy no longer exists

  const livingMembers = getLivingPartyMembers();

  // Enemy survived -> attempt to apply stun
  if (enemy.hp > 0 && enemy.isStunnable && !enemy.effects.includes('stun' && !enemy.type === "trap")) {
    applyStunChance(enemy);
  }

  // Enemy defeated: handle rewards and cleanup
  if (enemy.hp <= 0) {
    // Pickpocket bonus and other reward logic
    const pickPocketBonus = livingMembers.reduce((total, character) => {
      return total + (character.skills.pickPocket || 0) * 0.1;
    }, 0);

    // Loot drop chance calculation
    if (enemy.lootTier !== undefined) {
      const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
      const baseDropChance = 0.5;
      const levelDiff = partyLevel - enemy.level;
      let dropChance = baseDropChance;
      
      if (DEBUG_CONFIG.enabled && DEBUG_CONFIG.forceDrops) {
        dropChance = 1.0;
      } else {
        if (enemy.isBoss) {
          dropChance = 1.0;
        } else {
          if (levelDiff > 0) {
            dropChance *= Math.max(0, 1 - (levelDiff / 5));
          }
          if (enemy.variant === "champion") dropChance += 0.10;
          if (enemy.variant === "corrupted") dropChance += 0.05;
          if (enemy.variant === "elite") dropChance += 0.05;
          dropChance = Math.min(dropChance, 1.0);
        }
      }
      
      const isArtifactDrop = (enemy.isBoss && Math.random() < 0.2) || 
                            ((enemy.variant === "champion" || enemy.type === "trap") &&
                              enemy.level > 15 && Math.random() < 0.02);

      // First roll for artifact
      let artifactLoot = null;
      if (isArtifactDrop) {
        artifactLoot = generateLootFromTier("artifact");
        if (artifactLoot && !state.foundArtifacts.has(artifactLoot.id)) {
          state.foundArtifacts.add(artifactLoot.id);
          state.pendingLoot.push(artifactLoot);
        }
      }

      // Then roll for normal loot
      if (Math.random() < dropChance) {
        const loot = generateLootFromTier(enemy.lootTier);
        if (loot) state.pendingLoot.push(loot);
      }
    }

    const bonusGold = Math.round(enemy.rewardGold * pickPocketBonus);
    state.gold += enemy.rewardGold + bonusGold;
    goldEl.textContent = String(state.gold);

    livingMembers.forEach(c => {
      const learningRank = c.skills.learning || 0;
      const learningBonus = learningRank * 0.1;
      const finalXp = Math.round(enemy.rewardXp * (1 + learningBonus));
      c.xp += finalXp;
    });

    updatePartyBars();
    renderSidebar();
    checkTrapMovement(); // see if a trap is at the top of the enemy list

    if (state.focusedEnemyIndex === index) {
      state.focusedEnemyIndex = null;
    }
  }

    if (state.enemies.every((e) => e.hp <= 0)) {
    // The wave is truly over
    console.log("All enemies defeated. Showing wave complete menu.");
    state.waveComplete = true;
    showWaveCompleteMenuOrContinue();
  }

}

// Stun application logic
function applyStunChance(enemy) {
  if (!enemy || enemy.hp <= 0) return;

  const livingMembers = getLivingPartyMembers();
  let stunChance = 0;

  // Sum stun chance across all party gear
  livingMembers.forEach(member => {
    for (const slot in member.equipment) {
      const item = member.equipment[slot];
      if (!item) continue;

      for (const b of item.stats.bonuses) {
        if (b.key === "stun") {
          stunChance += b.value; // add %
        }
      }
    }
  });

  if (stunChance > 0) {
    const roll = Math.random() * 100;
    if (roll < stunChance) {
      addEffectToEnemy(enemy, { key: "stun", duration: 1 });
      console.log(`${enemy.name} is stunned!`);
    }
  }
}

// Add effect to enemy (like stun, burn, poison, etc.)
function addEffectToEnemy(enemy, effect) {
  if (!enemy.effects) enemy.effects = [];
  
  // For now, just push — later we can check for duplicates
  enemy.effects.push(effect);
}

// Enemy attacks party over time
// Enhanced enemy attacks with variant-aware damage
/* attacking without speed
function beginEnemyAttacksWithVariants() {
  stopEnemyAttacks();
 
  // make sure menus are closed
  const existingModals = document.querySelectorAll('.modal-overlay');
  existingModals.forEach(modal => modal.remove());

  state.enemyAttackTimerId = setInterval(() => {
    const livingMembers = getLivingPartyMembers();
    if (livingMembers.length === 0) {
      stopEnemyAttacks();
      stopAutoAttacks();
      checkGameOver();
      return;
    }
    
    const livingEnemies = state.enemies.filter(e => e.hp > 0);
    if (livingEnemies.length === 0) {
      stopAutoAttacks();
      stopEnemyAttacks();
      return;
    }
    
    const attackingEnemy = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
    const target = chooseTarget(livingMembers);

    // Damage calculation
    const { damage: dmg, isCrit } = computeEnemyAttackDamageWithVariantAndAbilities(attackingEnemy);
    //console.log(isCrit);

    if (attackingEnemy.isAoe) {
      console.log(`${attackingEnemy.name} uses an AOE attack!`);

      for (const member of livingMembers) {
        // Check dodge individually
        if (typeof attemptDodge === 'function' && attemptDodge(member)) {
          console.log(`${member.id + 1} dodged AOE attack from ${attackingEnemy.name}!`);
          continue;
        }

        if (state.partyBuffs.preservation) { // check to see if preservation is active
          member.hp = Math.max(1, member.hp - dmg); // can't go below 1 hp when preservation is active
        } else {
          member.hp = Math.max(0, member.hp - dmg);
        }

        if (member.hp === 0 && member.statusEffect) member.statusEffect = [];

        // Apply status effects if any
        applyEnemyStatusEffects(attackingEnemy, member);

        flashDamageOnCharacter(member.id);
        if (isCrit) {
          showPortraitFloatingMessage(member.id, `${dmg} CRIT!`, "crit");
        }
      }

    } else {
      // Single-target attack (original logic)
      if (typeof attemptDodge === 'function' && attemptDodge(target)) {
        console.log(`${target.id + 1} dodged attack from ${attackingEnemy.name}!`);
        updatePartyBars();
        return;
      }

      if (state.partyBuffs.preservation) { // check to see if preservation is active
        target.hp = Math.max(1, target.hp - dmg); // can't go below 1 when preservation is active
      } else {
        target.hp = Math.max(0, target.hp - dmg);
      }
      if (target.hp === 0 && target.statusEffect) target.statusEffect = [];

      applyEnemyStatusEffects(attackingEnemy, target);
      flashDamageOnCharacter(target.id);
      //console.log(target);
      

      if (isCrit) {
        showPortraitFloatingMessage(target.id, `${dmg} CRIT!`, "crit");
      }   

    }

    // Log special attacks
    if (attackingEnemy.specialAbilities && attackingEnemy.specialAbilities.includes("doubleDamageChance") && dmg > attackingEnemy.attack) {
      console.log(`${attackingEnemy.name}'s devastating blow deals ${dmg} damage!`);
    }

    // Check to use HP potion for all party members with hpPotion skill
    const potionUsers = livingMembers.filter(member => member.skills.hpPotion > 0);
    for (const member of potionUsers) {
      const hpPercentage = (member.hp / member.maxHp) * 100;
      if (hpPercentage <= 30 && state.availableHPPotions > 0) {  
        console.log(`${member.id}'s HP is at or below 30% trying potion`);
        useHpPotion(member);
      }
    }

    processStatusEffects();
    updatePartyBars();
    renderSidebar();

    if (getLivingPartyMembers().length === 0) {
      stopEnemyAttacks();
      stopAutoAttacks();
      checkGameOver();
    }
  }, 1500);
}
*/
function beginEnemyAttacksWithVariants() {
  stopEnemyAttacks(); // clear old timers

  state.enemyAttackTimers = [];

  const livingEnemies = state.enemies.filter(e => e.hp > 0);
  if (livingEnemies.length === 0) return;

  for (const enemy of livingEnemies) {
    scheduleEnemyAttack(enemy);
  }
}

function scheduleEnemyAttack(enemy) {
  if (!enemy || enemy.hp <= 0) return;
  if (enemy.type === "trap") return;
  console.log(enemy); // to show the enemy object for adding stun (and maybe other effects later)
  
  // If enemy is stunned, skip this attack and reschedule
  // If stunned, skip this attack
  if (enemy.effects && enemy.effects.some(effect => effect.key === "stun")) {
    console.log(`${enemy.name} is stunned and misses its attack!`);

    // Consume the stun (remove it after skipping)
    enemy.effects = enemy.effects.filter(e => e.key !== "stun");

    const attackDelay = enemy.speed * 1000;
    const timerId = setTimeout(() => {
      scheduleEnemyAttack(enemy);
    }, attackDelay);

    state.enemyAttackTimers.push(timerId);
    return;
  }

  const attackDelay = enemy.speed * 1000; // speed in seconds → ms
  const timerId = setTimeout(() => {
    performEnemyAttack(enemy.instanceId);

    // Reschedule only if both sides still alive
    const updatedEnemy = state.enemies.find(e => e.instanceId === enemy.instanceId);
    if (updatedEnemy && updatedEnemy.hp > 0 && getLivingPartyMembers().length > 0) {
      scheduleEnemyAttack(updatedEnemy);
    }
  }, attackDelay);

  // Keep track so we can cancel all timers later
  state.enemyAttackTimers.push(timerId);
}

function performEnemyAttack(instanceId) {
  const enemy = state.enemies.find(e => e.instanceId === instanceId);
  if (!enemy || enemy.hp <= 0) return; // enemy is dead
  //console.log(enemy); // debug line
  const livingMembers = getLivingPartyMembers();
  if (livingMembers.length === 0) return;

  const target = chooseTarget(livingMembers);
  const { damage: dmg, isCrit } = computeEnemyAttackDamageWithVariantAndAbilities(enemy);

  if (enemy.isAoe) {
    for (const member of livingMembers) {
      if (attemptDodge(member)){
        showPortraitFloatingMessage(member.id, "DODGE!", "dodge"); 
        continue;
      }
      member.hp = Math.max(0, member.hp - dmg);

    // handle reflect damage for AoE attacks
    if (member.reflectAmount > 0){
      const reflectDmgAmount = Math.round((dmg * member.reflectAmount) / 100);
      enemy.hp -= reflectDmgAmount;
      
      // Get the enemy index by finding it in the state.enemies array
      const enemyIndex = state.enemies.findIndex(e => e.instanceId === enemy.instanceId);
      if (enemyIndex !== -1) {
        onEnemyDamaged(enemyIndex);
      }
      
      console.log(`${member.name} reflected ${reflectDmgAmount} damage`);
    }


      applyEnemyStatusEffects(enemy, member);
      flashDamageOnCharacter(member.id);
      if (isCrit) showPortraitFloatingMessage(member.id, `${dmg} CRIT!`, "crit");
    }
  } else {
    if (attemptDodge(target)) {
      showPortraitFloatingMessage(target.id, "DODGE!", "dodge");  
      return;
    }
    target.hp = Math.max(0, target.hp - dmg);

    // handle reflect damage
    if (target.reflectAmount > 0){
      reflectDmgAmount = Math.round((dmg * target.reflectAmount) / 100);
      enemy.hp -= reflectDmgAmount;
      
      // Get the enemy index by finding it in the state.enemies array
      const enemyIndex = state.enemies.findIndex(e => e.instanceId === enemy.instanceId);
      if (enemyIndex !== -1) {
        onEnemyDamaged(enemyIndex);
      }
      
      console.log('Reflected damage amount: ', reflectDmgAmount)
    }
    
    applyEnemyStatusEffects(enemy, target);
    flashDamageOnCharacter(target.id);
    if (isCrit) showPortraitFloatingMessage(target.id, `${dmg} CRIT!`, "crit");
  }

  processStatusEffects();
  updatePartyBars();
  renderSidebar();

  if (getLivingPartyMembers().length === 0) {
    stopEnemyAttacks();
    stopAutoAttacks();
    checkGameOver();
  }
}

function stopEnemyAttacks() {
  if (state.enemyAttackTimers) {
    for (const id of state.enemyAttackTimers) clearTimeout(id);
  }
  state.enemyAttackTimers = [];
}


// helper to avoid copy-paste
function applyEnemyStatusEffects(enemy, target) {
  if (!enemy.statusEffect) return;

  if (enemy.statusEffect.poison) {
    const { chance, tickDamage } = enemy.statusEffect.poison;
    if (Math.random() < chance && !target.statusEffect.some(e => e.key === "poison")) {
      target.statusEffect.push({ key: "poison", remainingTurns: 10, tickDamage });
      soundEffects.play('statuse');
      console.log(`${target.classKey} ${target.id + 1} has been poisoned!`);
    }
  }

  if (enemy.statusEffect.weakness) {
    const chance = enemy.statusEffect.weakness.chance;
    if (Math.random() < chance && !target.statusEffect.some(e => e.key === "weakness")) {
      target.statusEffect.push({ key: "weakness" });
      soundEffects.play('statuse');
      console.log(`${target.classKey} ${target.id + 1} has been weakened!`);
    }
  }

  if (enemy.statusEffect.disease) {
    const chance = enemy.statusEffect.disease.chance;
    if (Math.random() < chance && !target.statusEffect.some(e => e.key === "disease")) {
      target.statusEffect.push({ key: "disease" });
      soundEffects.play('statuse');
      console.log(`${target.classKey} ${target.id + 1} has been diseased!`);
    }
  }

  if (enemy.statusEffect.curse) {
    const chance = enemy.statusEffect.curse.chance;
    if (Math.random() < chance && !target.statusEffect.some(e => e.key === "curse")) {
      target.statusEffect.push({ key: "curse" });
      soundEffects.play('statuse');
      console.log(`${target.classKey} ${target.id + 1} has been cursed!`);
    }
  }

}


function processStatusEffects() {
  const livingMembers = getLivingPartyMembers();
  for (const member of livingMembers) {
    if (!member.statusEffect) continue;

    for (let i = member.statusEffect.length - 1; i >= 0; i--) {
      const effect = member.statusEffect[i];
      
      if (effect.key === "poison") {
        member.hp = Math.max(0, member.hp - effect.tickDamage);
        console.log(`${member.classKey} ${member.id + 1} suffers ${effect.tickDamage} poison damage!`);
        flashDamageOnCharacter(member.id);

        if (member.hp === 0) {
          console.log(`${member.classKey} ${member.id + 1} succumbed to poison!`);
        }
      }
      if (effect.remainingTurns){
      effect.remainingTurns -= 1;
      if (effect.remainingTurns <= 0) {
        console.log(`${member.classKey} ${member.id + 1} is no longer poisoned.`);
        member.statusEffect.splice(i, 1);
      }}
    }
  }
}

function getMostIntimidatingMember(livingMembers) {
  const intimidators = livingMembers.filter(member => member.skills.intimidate > 0);
  return intimidators.length > 0 ? intimidators.reduce((max, current) => 
    current.skills.intimidate > max.skills.intimidate ? current : max, intimidators[0]) : null;
}

function isAttackDrawn(member) {
  const baseChance = 0.10; // 10% base chance
  const intimidateScaling = member.skills.intimidate * 0.01; // 1% increase per intimidate level
  const totalChance = baseChance + intimidateScaling;
  return Math.random() < totalChance;
}

function chooseTarget(livingMembers) {
  const mostIntimidatingMember = getMostIntimidatingMember(livingMembers);
  if (mostIntimidatingMember && isAttackDrawn(mostIntimidatingMember)) {
    console.log('Attack drawn');
    return mostIntimidatingMember;
  }
  return livingMembers[Math.floor(Math.random() * livingMembers.length)];
}

// Wave statistics for analysis
function getWaveStatistics() {
  if (!state.enemies || state.enemies.length === 0) return null;
  
  const stats = {
    totalEnemies: state.enemies.length,
    variants: {
      warrior: 0,
      corrupted: 0,
      elite: 0,
      champion: 0
    },
    totalHp: 0,
    totalMaxHp: 0,
    averageLevel: 0,
    estimatedGold: 0,
    estimatedXp: 0
  };
  
  state.enemies.forEach(enemy => {
    const variant = enemy.variant || 'warrior';
    stats.variants[variant]++;
    stats.totalHp += enemy.hp;
    stats.totalMaxHp += enemy.maxHp;
    stats.averageLevel += enemy.level;
    stats.estimatedGold += enemy.rewardGold;
    stats.estimatedXp += enemy.rewardXp;
  });
  
  stats.averageLevel = Math.round(stats.averageLevel / state.enemies.length);
  stats.healthPercent = Math.round((stats.totalHp / stats.totalMaxHp) * 100);
  
  return stats;
}

// Helper function to display wave composition in console (for debugging/interest)
function logWaveComposition() {
  const stats = getWaveStatistics();
  if (!stats) return;
  
  console.log(`Wave ${state.currentWave} Composition:`);
  console.log(`- ${stats.variants.warrior} Warriors (${Math.round(stats.variants.warrior/stats.totalEnemies*100)}%)`);
  console.log(`- ${stats.variants.corrupted} Corrupted (${Math.round(stats.variants.corrupted/stats.totalEnemies*100)}%)`);
  console.log(`- ${stats.variants.elite} Elite (${Math.round(stats.variants.elite/stats.totalEnemies*100)}%)`);
  console.log(`- ${stats.variants.champion} Champions (${Math.round(stats.variants.champion/stats.totalEnemies*100)}%)`);
  console.log(`Total Rewards: ${stats.estimatedGold} gold, ${stats.estimatedXp} XP`);
}

function stopEnemyAttacks() {
  if (state.enemyAttackTimerId) {
    clearInterval(state.enemyAttackTimerId);
    state.enemyAttackTimerId = null;
  }
}

// Auto-attack system
function beginAutoAttacks() {
  stopAutoAttacks();
  
  const livingMembers = getLivingPartyMembers();
  if (livingMembers.length === 0) {
    // No living members - can't auto attack
    return;
  }
  
  const speed = computePartySpeed();
  //console.log(speed);
  //console.log('2218');
  if (speed <= 0) return;
  
  // Attack interval based on living party speed
  const interval = Math.max(500, 3000 - (speed * 50));
  
  state.autoAttackTimerId = setInterval(() => {
    // Check if party is still alive
    const currentLiving = getLivingPartyMembers();
    if (currentLiving.length === 0) {
      stopAutoAttacks();
      checkGameOver();
      return;
    }
    
    // Find a living enemy to attack
    const livingEnemies = state.enemies.filter(e => e.hp > 0);
    if (livingEnemies.length === 0) {
      stopAutoAttacks();
      stopEnemyAttacks();
      return;
    }
    
    // Focus on focused enemy, or pick first living enemy
    let targetIndex = state.enemies.findIndex(e => e.hp > 0);
    if (typeof state.focusedEnemyIndex === 'number' && 
        state.enemies[state.focusedEnemyIndex] && 
        state.enemies[state.focusedEnemyIndex].hp > 0) {
      targetIndex = state.focusedEnemyIndex;
    }
    
    if (targetIndex >= 0) {
      const dmg = computeClickDamage(targetIndex);
      if (dmg > 0) { // Only attack if we can do damage
        const enemy = state.enemies[targetIndex];
        const isDodge = accuracyCheck(enemy);
        if (!isDodge){
          enemy.hp = Math.max(0, enemy.hp - dmg);
          // Apply lifesteal healing
         // applyLifestealPerCharacter(dmg); // moved to computeClickDamage for cleaner code
        } else {
          console.log('Enemy dodged!');
        }
        onEnemyDamaged(targetIndex);
      }
    }
  }, interval);
}

function stopAutoAttacks() {
  if (state.autoAttackTimerId) {
    clearInterval(state.autoAttackTimerId);
    state.autoAttackTimerId = null;
  }
}

// Enhanced area progression system
function getAvailableAreas() {
  const completedAreas = state.completedAreas || [];
  const availableAreas = [];
  
  for (const [areaId, area] of Object.entries(AREAS)) {
    // Check if area requirements are met
    if (!area.requirements || area.requirements.every(req => completedAreas.includes(req))) {
      availableAreas.push({
        id: areaId,
        name: area.name,
        description: area.description,
        baseLevel: area.baseLevel,
        maxWaves: area.maxWaves,
        isCompleted: completedAreas.includes(areaId),
        isUnlocked: true,
        type: area.type //new
      });
    }
  }
  
  return availableAreas.sort((a, b) => a.baseLevel - b.baseLevel);
}

// Check if area is complete
function checkAreaCompletion(areaId, waveNumber) {
  const area = AREAS[areaId];
  if (!area) return false;
  
  return waveNumber >= area.maxWaves;
}

// Enhanced enemy display with variant information
function getEnemyDisplayInfoWithVariant(enemy) {
  const template = ENEMY_TEMPLATES[enemy.id];
  const variant = ENEMY_VARIANTS[enemy.variant] || ENEMY_VARIANTS.warrior;
  
  return {
    name: enemy.name,
    type: enemy.type || 'unknown',
    tier: enemy.tier || 1,
    variant: enemy.variant || 'warrior',
    isBoss: enemy.isBoss || false,
    isVariant: enemy.isVariant || false,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    level: enemy.level,
    // Enhanced visual indicators based on variant
    cssClass: `enemy-${enemy.type} tier-${enemy.tier} variant-${enemy.variant}${enemy.isBoss ? ' boss' : ''}`,
    variantColor: enemy.variantColor || 'default',
    description: template ? 
      `A ${variant.prefix ? variant.prefix.toLowerCase() + ' ' : ''}${template.type} creature of tier ${template.tier}` : 
      'A mysterious creature',
    // Stat information for tooltips/UI
    statInfo: {
      hpBonus: variant.hpMultiplier !== 1.0 ? `+${Math.round((variant.hpMultiplier - 1) * 100)}% HP` : null,
      attackBonus: variant.attackMultiplier !== 1.0 ? `+${Math.round((variant.attackMultiplier - 1) * 100)}% Attack` : null,
      goldBonus: variant.goldMultiplier !== 1.0 ? `+${Math.round((variant.goldMultiplier - 1) * 100)}% Gold` : null,
      xpBonus: variant.xpMultiplier !== 1.0 ? `+${Math.round((variant.xpMultiplier - 1) * 100)}% XP` : null
    }
  };
}

// Migration function to update existing game state
function migrateToNewSystem() {
  // Initialize new state properties if they don't exist
  if (!state.currentAreaId) {
    state.currentAreaId = "newSorpigal"; // Default starting area
  }
  if (!state.completedAreas) {
    state.completedAreas = [];
  }
  if (!state.currentWave) {
    state.currentWave = 1;
  }
  
  // If we have old enemy data, try to convert it
  if (state.enemies && state.enemies.length > 0) {
    state.enemies = state.enemies.map((enemy, index) => {
      // Try to guess enemy type from name
      let templateId = "goblin"; // default fallback
      const name = enemy.name.toLowerCase();
      
      if (name.includes("skeleton")) templateId = "skeleton";
      else if (name.includes("bandit")) templateId = "bandit";
      else if (name.includes("orc")) templateId = "orc";
      
      return {
        ...enemy,
        id: templateId,
        type: ENEMY_TEMPLATES[templateId]?.type || 'unknown',
        tier: ENEMY_TEMPLATES[templateId]?.tier || 1,
        level: state.enemyLevel || 1
      };
    });
  }
}

// Wave completion menu
function showWaveCompleteMenu() {
  // Check if menu already exists
  if (document.getElementById("wave-complete-menu")) {
    console.log("Wave complete menu already exists, skipping creation");
    return;
  }

  stopEnemyAttacks();
  stopAutoAttacks();
  const deadMembers = state.party.filter(member => member.hp <= 0);
  const reviveCost = deadMembers.length * 20;
  const canAffordRevive = state.gold >= reviveCost;
  const allMembersAlive = deadMembers.length === 0;
  const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
  const restCost = Math.ceil(50 + partyLevel * 5); // example scaling formula
  const lootCount = state.pendingLoot.length;
  
  const menu = document.createElement("div");
  menu.id = "wave-complete-menu";
  menu.className = "modal-overlay";
  menu.innerHTML = `
  <div class="modal-content">
    <h2>Wave ${state.enemyLevel} Complete!</h2>
    <p>All enemies defeated! What would you like to do next?</p>
    <div class="menu-buttons">
      <button class="btn large" data-action="repeat-wave">Repeat Wave</button>
      <button class="btn large" data-action="next-wave">Next Wave</button>
      <button class="btn large" data-action="upgrade-skills">Upgrade Skills</button>
      <button class="btn large" data-action="buy-spells">Buy Spells</button>
      ${lootCount > 0 
        ? `<button class="btn large" data-action="open-loot">Open Loot Chest (${lootCount})</button>`
        : ""}
      <button class="btn large" data-action="rest" ${state.gold < restCost ? "disabled" : ""}>
        Inn - Rest and refill potions - ${restCost} Gold
      </button>
      <button class="btn large" data-action="revive" ${!canAffordRevive || allMembersAlive ? "disabled" : ""}>
        Revive All (${reviveCost} Gold)
      </button>
      <button class="btn large" data-action="party-stats">View Party Stats</button>
    </div>

  </div>
`;
  
  document.body.appendChild(menu);
  
  // Add event listeners
  menu.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      if (action === "revive"){
        state.gold -= reviveCost; 
      }
      closeWaveCompleteMenu();
      handleWaveMenuActionNew(action);
    });
  });
}

// Modified wave completion handling for dungeons
function showWaveCompleteMenuOrContinue() {
  const currentArea = AREAS[state.currentAreaId];
  
  // Check if this is a dungeon
  if (currentArea && currentArea.type === "dungeon") {
    const nextWave = state.currentWave + 1;
    
    // Check if dungeon is complete
    if (nextWave > currentArea.maxWaves) {
      stopAutoAttacks();
      showDungeonCompleteMenu();
      return;
    }
    
    // In dungeons, automatically proceed to next wave after a brief delay
    setTimeout(() => {
      console.log(`Dungeon continues... Wave ${nextWave} incoming!`);
      setupWaveNew(nextWave);
      beginEnemyAttacksWithVariants();
      beginAutoAttacks();
    }, 1500); // 1.5 second delay for dramatic effect
    
  } else {
    // Regular areas show the normal menu
    stopAutoAttacks();
    showWaveCompleteMenu();
  }
}

// Dungeon completion menu with stat rewards
function showDungeonCompleteMenu() {
  stopEnemyAttacks();
  stopAutoAttacks();
  
  const currentArea = AREAS[state.currentAreaId];
  const menu = document.createElement("div");
  menu.id = "dungeon-complete-menu";
  menu.className = "modal-overlay";

  const deadMembers = state.party.filter(member => member.hp <= 0);
  const reviveCost = deadMembers.length * 20;
  const canAffordRevive = state.gold >= reviveCost;
  const allMembersAlive = deadMembers.length === 0;
  const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
  const restCost = Math.ceil(50 + partyLevel * 5); // example scaling formula
  //const loot = getLootDrop();
  
  // Apply dungeon reward
  applyDungeonReward(currentArea.dungeonReward);
  
  // Mark dungeon as completed
  if (!state.completedAreas.includes(state.currentAreaId)) {
    state.completedAreas.push(state.currentAreaId);
  }
  
  menu.innerHTML = `
    <div class="modal-content">
      <div class="dungeon-complete-header">
        <h2>🏰 ${currentArea.name} Conquered! 🏰</h2>
        <div class="victory-message">
          The dungeon trembles as its master falls! Your party emerges stronger than ever.
        </div>
      </div>
      
      <div class="dungeon-reward-display">
        <h3>🎁 Dungeon Reward Claimed!</h3>
        <div class="reward-description">${currentArea.dungeonReward.description}</div>
        <div class="reward-details">
          ${Object.entries(currentArea.dungeonReward.stats).map(([stat, value]) => 
            `<span class="stat-boost">+${value} ${stat}</span>`
          ).join(' ')}
        </div>
      </div>
      
      <div class="menu-buttons">
        <button class="btn large primary" data-action="choose-area">Choose Next Adventure</button>
        <button class="btn large" data-action="upgrade-skills">Upgrade Skills</button>
        <button class="btn large" data-action="buy-spells">Buy Spells</button>
        <button class="btn large" data-action="rest" ${state.gold < restCost ? "disabled" : ""}>
          Inn - Rest and refill potions - ${restCost} Gold
        </button>
        <button class="btn large" data-action="revive" ${!canAffordRevive || allMembersAlive ? "disabled" : ""}>Revive All (${reviveCost} Gold)</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Add event listeners
  menu.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      closeDungeonCompleteMenu();
      
      if (action === "choose-area") {
        showAreaSelectionMenu();
      } else {
        if (action === "revive") {
          state.gold -= reviveCost;
        }
      
        handleWaveMenuActionNew(action);
      }
    });
  });
}

function closeDungeonCompleteMenu() {
  const menu = document.getElementById("dungeon-complete-menu");
  if (menu) menu.remove();
}

// Apply dungeon stat rewards
function applyDungeonReward(reward) {
  if (!reward || reward.type !== "statBoost") return;
  
  if (reward.target === "party") {
    // Apply to all party members
    state.party.forEach(character => {
      Object.entries(reward.stats).forEach(([stat, value]) => {
        character.baseStats[stat] += value;
      });
      //computeTotals(character);
      recomputeCharacterStats(character);
      // Heal to new max HP if health increased
      if (reward.stats.Endurance) {
        character.hp = character.maxHp;
      }
    });
    console.log("All party members receive stat bonuses!");
  } else if (reward.target.startsWith("class:")) {
    // Apply to specific class only
    const targetClass = reward.target.split(":")[1];
    state.party.forEach(character => {
      if (character.classKey === targetClass) {
        Object.entries(reward.stats).forEach(([stat, value]) => {
          character.baseStats[stat] += value;
        });
       // computeTotals(character);
       recomputeCharacterStats(character); // updated function name
        if (reward.stats.Endurance) {
          character.hp = character.maxHp;
        }
      }
    });
    console.log(`${targetClass} characters receive stat bonuses!`);
  }
  
  // Update UI
  updatePartyBars();
  renderSidebar();
}


function showAreaCompleteMenu() {
  const currentArea = AREAS[state.currentAreaId];
  const availableAreas = getAvailableAreas();
  const newlyUnlocked = availableAreas.filter(area => 
    currentArea.unlocks && currentArea.unlocks.includes(area.id)
  );
  
  const menu = document.createElement("div");
  menu.id = "area-complete-menu";
  menu.className = "modal-overlay";

  const deadMembers = state.party.filter(member => member.hp <= 0);
  const reviveCost = deadMembers.length * 20;
  const canAffordRevive = state.gold >= reviveCost;
  const allMembersAlive = deadMembers.length === 0;
  const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
  const restCost = Math.ceil(50 + partyLevel * 5); // example scaling formula
  
  let unlockedText = "";
  if (newlyUnlocked.length > 0) {
    unlockedText = `<p class="unlock-text">🎉 New areas unlocked: ${newlyUnlocked.map(a => a.name).join(", ")}</p>`;
  }
  
  menu.innerHTML = `
    <div class="modal-content">
      <h2>${currentArea.name} Complete!</h2>
      <p>Congratulations! You have conquered all waves in this area.</p>
      ${unlockedText}
      <div class="menu-buttons">
        <button class="btn large" data-action="change-area">Choose New Area</button>
        <button class="btn large" data-action="repeat-area">Repeat This Area</button>
        <button class="btn large" data-action="upgrade-skills">Upgrade Skills</button>
        <button class="btn large" data-action="buy-spells">Buy Spells</button>
        <button class="btn large" data-action="rest" ${state.gold < restCost ? "disabled" : ""}>
          Inn - Rest and refill potions - ${restCost} Gold
        </button>
        <button class="btn large" data-action="revive" ${!canAffordRevive || allMembersAlive ? "disabled" : ""}>Revive All (${reviveCost} Gold)</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  menu.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      closeAreaCompleteMenu();
      
      if (action === "repeat-area") {
        state.currentWave = 1;
        setupWaveNew(1);
        beginEnemyAttacksWithVariants();
        beginAutoAttacks();
      } else if (action === "change-area") {
        showAreaSelectionMenu();
      } else {
        handleWaveMenuActionNew(action);
      }
    });
  });
}

function closeAreaCompleteMenu() {
  const menu = document.getElementById("area-complete-menu");
  if (menu) menu.remove();
}

function closeWaveCompleteMenu() {
  const menu = document.getElementById("wave-complete-menu");
  if (menu) {
    menu.remove();
  }
}


function showAreaSelectionMenu() {
  const availableAreas = getAvailableAreas();
  
  const menu = document.createElement("div");
  menu.id = "area-selection-menu";
  menu.className = "modal-overlay";
  
const areaButtons = availableAreas.map(area => {
  const isDungeon = area.type === "dungeon";
  const isCompleted = state.completedAreas.includes(area.id); // unified check
  const isDisabled = isDungeon && isCompleted;

  const completedBadge = isCompleted
    ? '<span class="pill completed">✓ Completed</span>'
    : '';
  const dungeonBadge = isDungeon
    ? '<span class="pill dungeon">⚔️ Dungeon</span>'
    : '';

  const areaTypeClass = isDungeon ? "dungeon-area" : "regular-area";
  const disabledClass = isDisabled ? "disabled" : "";
  //console.log(`Area: ${area.name}, isDungeon: ${isDungeon}, isCompleted: ${isCompleted}, isDisabled: ${isDisabled}, type: ${area.type}`);
  //console.log(area);

  return `
    <div class="area-option ${areaTypeClass} ${disabledClass}">
      <div class="area-info">
        <h3>${area.name}</h3>
        <p>${area.description}</p>
        <div class="area-stats">
          <span class="pill">Level ${area.baseLevel}+</span>
          <span class="pill">${area.maxWaves} Waves</span>
          ${dungeonBadge}
          ${completedBadge}
        </div>
        ${isDungeon ? '<div class="dungeon-warning">⚠️ No rest between waves!</div>' : ''}
      </div>
      <button 
        class="btn" 
        data-action="select-area" 
        data-area="${area.id}" 
        ${isDisabled ? 'disabled aria-disabled="true"' : ''}
      >
        ${isDisabled ? 'Conquered!' : 'Enter Area'}
      </button>
    </div>
  `;
}).join("");

// Insert into DOM
menu.innerHTML = `
  <div class="modal-content large">
    <div class="modal-header">
      <h2>Choose Your Adventure</h2>
      <span class="pill">Select an area to explore</span>
    </div>
    <div class="area-list">
      ${areaButtons}
    </div>
    <div class="modal-footer">
      <button class="btn" data-action="cancel">Cancel</button>
    </div>
  </div>
`;

document.body.appendChild(menu);

// Attach listeners only to enabled buttons
menu.querySelectorAll("[data-action='select-area']:not([disabled])").forEach(btn => {
  btn.addEventListener("click", () => {
    const areaId = btn.getAttribute("data-area");
    closeAreaSelectionMenu();
    state.currentAreaId = areaId;
    state.currentWave = 1;
    setupWaveNew(1);
    beginEnemyAttacksWithVariants();
    beginAutoAttacks();
  });
});

// Cancel button
menu.querySelector("[data-action='cancel']").addEventListener("click", () => {
  closeAreaSelectionMenu();
  showWaveCompleteMenu();
});

}


function closeAreaSelectionMenu() {
  const menu = document.getElementById("area-selection-menu");
  if (menu) menu.remove();
}

function handleWaveMenuActionNew(action) {
  const currentArea = AREAS[state.currentAreaId];
  
  switch (action) {
    case "repeat-wave":
      setupWaveNew(state.currentWave);
      beginEnemyAttacksWithVariants();
      beginAutoAttacks();
      break;
      
    case "next-wave":
      const nextWave = state.currentWave + 1;
      
      // Check if we've completed the area
      if (checkAreaCompletion(state.currentAreaId, nextWave)) {
        if (!state.completedAreas.includes(state.currentAreaId)) {
          state.completedAreas.push(state.currentAreaId);
        }
        // Show area completion screen instead of just next wave
        showAreaCompleteMenu();
        return;
      }
      console.log(state.enemies.map(e => e.name + ":" + e.hp));
      setupWaveNew(nextWave);
      console.log(state.enemies.map(e => e.name + ":" + e.hp));
      beginEnemyAttacksWithVariants();
      beginAutoAttacks();
      break;
      
    case "upgrade-skills":
      showSkillsMenu();
      break;
      
    case "buy-spells":
      showSpellShopMenu();
      break;
      
    case "rest":
      const partyLevel = state.party.reduce((sum, c) => sum + c.level, 0) / state.party.length;
      const restCost = Math.ceil(50 + partyLevel * 5); // match the menu formula

      if (state.gold >= restCost) {
        state.gold -= restCost;
        goldEl.textContent = String(state.gold);
        // this should only work for livingMembers who are not diseased
        livingMembers = getLivingPartyMembers();
        for (const c of livingMembers) {
          const diseased = c.statusEffect?.some(e => e.key === "disease");
          if (!diseased) {
            c.hp = c.maxHp;
            c.mp = c.maxMp;
            state.availableHPPotions = 5;
            state.availableMPPotions = 5;
          }
        }

        updatePartyBars();
        renderSidebar();
      }
      showWaveCompleteMenu();
      break;
      
    case "change-area":
      showAreaSelectionMenu();
      break;

    case "revive":
      reviveAll();
      updatePartyBars();
      renderSidebar();
      showWaveCompleteMenu();
      break;

    case "open-loot":
      if (state.pendingLoot.length > 0) {
        const loot = state.pendingLoot.shift(); // remove first item
        //console.log(loot); // debugging line
        showLootChestMenu(loot);
      } else {
        showWaveCompleteMenu();
      }
      break;

    case "party-stats":
      showPartyStatsMenu();
      break;

  
  }
}

// Skills upgrade menu
function showSkillsMenu() {
  const menu = document.createElement("div");
  menu.id = "skills-menu";
  menu.className = "modal-overlay";

  let skillsContent = "";
  for (let i = 0; i < state.party.length; i++) {
    const character = state.party[i];
    const classDef = CLASS_DEFS[character.classKey] || CLASS_DEFS[character.classKey];

    // Filter skills by class
    const availableSkills = Object.values(SKILL_DEFS).filter(skill => {
      const currentRank = character.skills[skill.key] || 0;
      return skill.allowedClasses.includes(character.classKey) && currentRank < 10;
    });

    const skillRows = availableSkills.map((sk) => {
      const rank = character.skills[sk.key] || 0;
      const cost = getSkillUpgradeCost(sk.baseCost, rank);
      const disabled = state.gold < cost ? "disabled" : "";
      return `
        <div class="skill-row" data-skill-key="${sk.key}">
          <div class="skill-info">
            <div class="skill-name">${sk.name} <span class="pill">Rank ${rank}</span></div>
            <div class="skill-desc">${sk.desc} • Cost: ${cost} gold</div>
          </div>
          <button class="btn small" data-action="upgrade-skill" data-character="${i}" data-skill="${sk.key}" ${disabled}>Upgrade</button>
        </div>
      `;
    }).join("");

    skillsContent += `
      <div class="character-section">
        <h3>Hero ${i + 1} • ${classDef.name}</h3>
        ${skillRows || '<div class="hint">No skills available for this class</div>'}
      </div>
    `;
  }

  menu.innerHTML = `
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Upgrade Skills</h2>
        <span class="pill" id="gold-display">Gold: ${state.gold}</span>
      </div>
      <div class="skills-content" id="skills-list">
        ${skillsContent}
      </div>
      <div class="modal-footer">
        <button class="btn" data-action="return">Return</button>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  // Event listener now calls a more efficient update function
  menu.querySelectorAll("[data-action='upgrade-skill']").forEach(btn => {
    btn.addEventListener("click", () => {
      const characterIndex = parseInt(btn.getAttribute("data-character"));
      const skillKey = btn.getAttribute("data-skill");
      upgradeCharacterSkill(characterIndex, skillKey);
      
      // Instead of closing and reopening the menu, just update the changed parts
      updateSkillsMenuUI();
    });
  });

  menu.querySelector("[data-action='return']").addEventListener("click", () => {
    closeSkillsMenu();
    showWaveCompleteMenu();
  });
}

// Helper function to efficiently update the UI
function updateSkillsMenuUI() {
  const skillsListEl = document.getElementById("skills-list");
  const goldDisplayEl = document.getElementById("gold-display");

  if (!skillsListEl || !goldDisplayEl) {
    // If the menu isn't open, do nothing
    return;
  }

  // Update the gold display
  goldDisplayEl.textContent = `Gold: ${state.gold}`;

  // Loop through all characters and skills to update their content
  state.party.forEach((character, charIndex) => {
    const availableSkills = Object.values(SKILL_DEFS).filter(skill =>
      skill.allowedClasses.includes(character.classKey)
    );

    availableSkills.forEach(sk => {
      const btn = skillsListEl.querySelector(
        `[data-character="${charIndex}"][data-skill="${sk.key}"]`
      );
      if (!btn) return; // Skill row no longer exists (maxed out)

      const row = btn.closest('.skill-row');
      if (!row) return;
      
      const rank = character.skills[sk.key] || 0;
      const cost = getSkillUpgradeCost(sk.baseCost, rank);
      const disabled = state.gold < cost || rank >= 10 ? "disabled" : "";

      // Update rank, cost, and button state
      row.querySelector('.skill-name .pill').textContent = `Rank ${rank}`;
      row.querySelector('.skill-desc').textContent = `${sk.desc} • Cost: ${cost} gold`;

      const button = row.querySelector('button');
      if (disabled) {
        button.setAttribute('disabled', '');
        if (rank >= 10) {
          row.style.display = 'none';
        }
      } else {
        button.removeAttribute('disabled');
      }
    });

  });
}

function closeSkillsMenu() {
  const menu = document.getElementById("skills-menu");
  if (menu) {
    menu.remove();
  }
}

function upgradeCharacterSkill(characterIndex, skillKey) {
  const character = state.party[characterIndex];
  const rank = character.skills[skillKey] || 0;
  const cost = getSkillUpgradeCost(SKILL_DEFS[skillKey].baseCost, rank);
  
  if (state.gold >= cost) {
    state.gold -= cost;
    goldEl.textContent = String(state.gold);
    character.skills[skillKey] = rank + 1;
    
    if (skillKey === "bodyBuilding" || skillKey === "meditation") {
      // Recompute derived maxima
      const beforeHp = character.maxHp;
      const beforeMp = character.maxMp;
      // scomputeTotals(character);
      // Apply skill multipliers to maxima
      // applySkillDerivedBonuses(character); done in recomputeCharacterStats
      recomputeCharacterStats(character); // updated function name
      // keep current hp/mp proportional to new max
      if (beforeHp > 0) character.hp = Math.min(character.maxHp, Math.floor(character.hp * (character.maxHp / beforeHp)));
      if (beforeMp > 0) character.mp = Math.min(character.maxMp, Math.floor(character.mp * (character.maxMp / beforeMp)));
    }
    
    // If upgrading focus, restart auto-attacks to adjust timing
    if (skillKey === "focus") {
      if (state.autoAttackTimerId) {
        beginAutoAttacks(); // Restart with new speed calculation
      }
    }
    
    updatePartyBars();
    renderSidebar();
  }
}

// Spell shop menu
// Spell shop menu
function showSpellShopMenu() {
  const menu = document.createElement("div");
  menu.id = "spell-shop-menu";
  menu.className = "modal-overlay";
  
  let spellsContent = "";
  for (let i = 0; i < state.party.length; i++) {
    const character = state.party[i];
    const classDef = CLASS_DEFS[character.classKey];
    
    // Create the known spells and available spells HTML
    spellsContent += `
      <div class="character-section" data-character-index="${i}">
        <h3>Hero ${i + 1} • ${classDef.name}</h3>
        <div class="known-spells">
          <strong>Known Spells:</strong> <span class="known-spells-list">${
            character.knownSpells.length > 0
              ? character.knownSpells.map(key => SPELL_DEFS[key].name).join(", ")
              : "None"
          }</span>
        </div>
        <div class="available-spells">
          ${generateAvailableSpellsHtml(character, i)}
        </div>
      </div>
    `;
  }
  
  menu.innerHTML = `
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Buy Spells</h2>
        <span class="pill" id="gold-display">Gold: ${state.gold}</span>
      </div>
      <div class="spells-content">
        ${spellsContent}
      </div>
      <div class="modal-footer">
        <button class="btn" data-action="return">Return</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Add event listeners
  menu.querySelectorAll("[data-action='buy-spell']").forEach(btn => {
    btn.addEventListener("click", () => {
      const characterIndex = parseInt(btn.getAttribute("data-character"));
      const spellKey = btn.getAttribute("data-spell");
      
      // Assuming buySpellForCharacter returns true on success
      if (buySpellForCharacter(characterIndex, spellKey)) {
        // Instead of rebuilding the whole menu, just update the UI
        console.log("After purchase:", state.party[characterIndex].knownSpells);
        updateSpellShopUI();
      }
    });
  });
  
  menu.querySelector("[data-action='return']").addEventListener("click", () => {
    closeSpellShopMenu();
    showWaveCompleteMenu();
  });
}

// Helper function to generate the HTML for available spells
function generateAvailableSpellsHtml(character, characterIndex) {
  const availableSpells = Object.values(SPELL_DEFS).filter(
    spell => !character.knownSpells.includes(spell.key) && spell.allowedClasses.includes(character.classKey)
  );

  if (availableSpells.length > 0) {
    return availableSpells.map(spell => {
      const disabled = state.gold < spell.cost ? "disabled" : "";
      return `
        <div class="spell-row" data-spell-key="${spell.key}">
          <div class="spell-info">
            <div class="spell-name">${spell.name}</div>
            <div class="spell-desc">MP Cost: ${spell.mpCost} • Type: ${spell.type} • Cost: ${spell.cost} gold</div>
          </div>
          <button class="btn small" data-action="buy-spell" data-character="${characterIndex}" data-spell="${spell.key}" ${disabled}>Buy</button>
        </div>
      `;
    }).join("");
  } else {
    return '<div class="hint">All spells learned!</div>';
  }
}

// New function to update the spell shop UI after a purchase
function updateSpellShopUI() {
  const goldDisplay = document.getElementById("gold-display");
  const spellsContent = document.querySelector(".spells-content");

  if (!goldDisplay || !spellsContent) {
    return;
  }

  // Update gold count
  goldDisplay.textContent = `Gold: ${state.gold}`;

  // Loop through each character section and update it
  state.party.forEach((character, charIndex) => {
    const characterSection = spellsContent.querySelector(`[data-character-index="${charIndex}"]`);
    if (!characterSection) return;

    // Update the list of known spells
    const knownSpellsList = characterSection.querySelector(".known-spells-list");
    knownSpellsList.textContent = character.knownSpells.length > 0
      ? character.knownSpells.map(key => SPELL_DEFS[key].name).join(", ")
      : "None";

    // Rebuild the list of available spells for this character
    const availableSpellsContainer = characterSection.querySelector(".available-spells");
    availableSpellsContainer.innerHTML = generateAvailableSpellsHtml(character, charIndex);
  });

  // Re-add event listeners for the newly created buttons
  spellsContent.querySelectorAll("[data-action='buy-spell']").forEach(btn => {
    btn.addEventListener("click", () => {
      const characterIndex = parseInt(btn.getAttribute("data-character"));
      const spellKey = btn.getAttribute("data-spell");
      if (buySpellForCharacter(characterIndex, spellKey)) {
        console.log("After purchase:", state.party[characterIndex].knownSpells);
        updateSpellShopUI();
      }
    });
  });
}

function closeSpellShopMenu() {
  const menu = document.getElementById("spell-shop-menu");
  if (menu) {
    menu.remove();
  }
}

function buySpellForCharacter(characterIndex, spellKey) {
  const character = state.party[characterIndex];
  const spell = SPELL_DEFS[spellKey];
  
  if (!spell || !spell.allowedClasses.includes(character.classKey)) {
    console.error(`Spell ${spellKey} not allowed for class ${character.classKey}`);
    return;
  }
  
  if (state.gold >= spell.cost && !character.knownSpells.includes(spellKey)) {
    state.gold -= spell.cost;
    goldEl.textContent = String(state.gold);
    character.knownSpells.push(spellKey);
    renderSidebar();
    return true;
  }
}

function showPartyStatsMenu() {
  let currentIndex = 0; // Track which character is being displayed

  const menu = document.createElement("div");
  menu.className = "modal-overlay";

  function renderCharacter(index) {
  const char = state.party[index];
  const classDef = CLASS_DEFS[char.classKey];
  const displayName = char.name || classDef?.name || `Hero ${index + 1}`;

  // --- Skills (only those with rank > 0) ---
  const skillsHtml = Object.entries(char.skills || {})
    .filter(([_, rank]) => rank > 0)
    .map(([key, rank]) => {
      const skill = SKILL_DEFS[key];
      return `<li>${skill.name} (Rank ${rank})</li>`;
    })
    .join("") || "<li>No skills yet</li>";

  // --- Equipment attribute totals ---
  const totals = {
    Might: 0,
    Dexterity: 0,
    Intellect: 0,
    Personality: 0,
    Endurance: 0,
    Speed: 0,
    Luck: 0,
    Accuracy: 0,
    HP: 0,
    MP: 0,
    stun: 0,
    lifesteal: 0,
    baseDmg: 0,
    critDmg: 0,
    spellDmg: 0,
    evasion: 0
  };

for (const slot in char.equipment) {
  const item = char.equipment[slot];
  if (!item) continue;

  // bonuses[] are things like stun/lifesteal/etc.
  for (const b of item.stats.bonuses) {
    if (totals.hasOwnProperty(b.key)) {
      totals[b.key] += b.value;
    }
  }

  // flat stats directly on the item
  if (item.stats.might) {
    totals.Might += item.stats.might;
  }
  if (item.stats.hp) {
    totals.HP += item.stats.hp;
  }
  if (item.stats.Dexterity) {
    totals.Dexterity += item.stats.Dexterity;
  }
  if (item.stats.Intellect) {
    totals.Intellect += item.stats.Intellect;
  }
  if (item.stats.Personality) {
    totals.Personality += item.stats.Personality;
  }
  if (item.stats.Endurance) {
    totals.Endurance += item.stats.Endurance;
  }
  if (item.stats.Speed) {
    totals.Speed += item.stats.Speed;
  }
  if (item.stats.Luck) {
    totals.Luck += item.stats.Luck;
  }
  if (item.stats.Accuracy) {
    totals.Accuracy += item.stats.Accuracy;
  }
}

  // --- Helper to render stat + bonus ---
  function statLine(label, base, bonus) {
    return bonus > 0
      ? `${label}: ${base} <span style="color:green;">(+${bonus})</span>`
      : `${label}: ${base}`;
  }

  // --- Character stats with bonuses shown separately ---
  const statsHtml = `
    <div class="character-section">
      <h3>${displayName} (Lvl ${char.level})</h3>
    <p>${statLine("HP", `${char.hp}/${char.maxHp}`, totals.HP)}</p>
    <p>${statLine("MP", `${char.mp}/${char.maxMp}`, totals.MP)}</p>
    <p>${statLine("Might", char.totalStats.Might, totals.Might)}</p>
    <p>${statLine("Dexterity", char.totalStats.Dexterity, totals.Dexterity)}</p>
    <p>${statLine("Intellect", char.totalStats.Intellect, totals.Intellect)}</p>
    <p>${statLine("Personality", char.totalStats.Personality, totals.Personality)}</p>
    <p>${statLine("Endurance", char.totalStats.Endurance, totals.Endurance)}</p>
    <p>${statLine("Speed", char.totalStats.Speed, totals.Speed)}</p>
    <p>${statLine("Luck", char.totalStats.Luck, totals.Luck)}</p>
    <p>${statLine("Accuracy", char.totalStats.Accuracy, totals.Accuracy)}</p>
    <p>Evasion: ${getEvasionBonus(char).toFixed(2)}%</p>
    <p>Spell Damage Bonus: ${getSpellDamageBonus(char).toFixed(2)}%</p>

      <h3>Skills</h3>
      <ul>${skillsHtml}</ul>

      <h3>Equipment Attribute Totals</h3>
      <ul>
        <li>Stun Chance: ${totals.stun.toFixed(2)}%</li>
        <li>Lifesteal: ${totals.lifesteal.toFixed(2)}%</li>
        <li>Base Damage+: ${totals.baseDmg.toFixed(2)}%</li>
        <li>Crit Damage+: ${totals.critDmg.toFixed(2)}%</li>
        <li>Spell Damage+: ${totals.spellDmg.toFixed(2)}%</li>
        <li>Evasion+: ${totals.evasion.toFixed(2)}%</li>
      </ul>
    </div>
  `;

  menu.querySelector(".character-container").innerHTML = statsHtml;
}


  // --- Base menu structure ---
  menu.innerHTML = `
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Character Stats</h2>
      </div>
      <div class="character-container"></div>
      <div class="modal-footer">
        <button class="btn" data-action="prev">Previous</button>
        <button class="btn" data-action="next">Next</button>
        <button class="btn" data-action="inventory">Inventory</button>
        <button class="btn" data-action="return">Return</button>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  // --- Render the first character ---
  renderCharacter(currentIndex);

  // --- Button events ---
  menu.querySelector("[data-action='prev']").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + state.party.length) % state.party.length;
    renderCharacter(currentIndex);
  });

  menu.querySelector("[data-action='next']").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % state.party.length;
    renderCharacter(currentIndex);
  });

  menu.querySelector("[data-action='return']").addEventListener("click", () => {
    menu.remove();
    showWaveCompleteMenu(); // back out
  });

  menu.querySelector("[data-action='inventory']").addEventListener("click", () => {
  
    menu.remove();
    showInventoryMenu(); // go to inventory
  });
}

function showInventoryMenu() {
  let currentIndex = 0; // track current character

  const menu = document.createElement("div");
  menu.className = "modal-overlay";

  // Helper to format stats (same as equip menu)
  function formatStats(item) {
    if (!item) return `<span class="hint">Empty</span>`;

    const coreStats = Object.keys(item.stats)
      .map(key => {
        if (key === "bonuses") return;
        return `${key}: +${item.stats[key]}`;
      })
      .filter(Boolean)
      .join(", ");

    const bonusStats = item.stats.bonuses
      .map(bonus => {
        const attrDef = LOOT_ATTRIBUTES.find(a => a.key === bonus.key);
        if (attrDef?.type === "percent") {
          return `${attrDef.name}: +${bonus.value}%`;
        } else {
          return `${bonus.key}: +${bonus.value}`;
        }
      })
      .join(", ");

    return `<span class="loot-${item.tier}">
      ${LOOT_TIERS[item.tier].name} ${item.flavorName}
      <span class="stats">(${[coreStats, bonusStats].filter(Boolean).join(", ")})</span>
    </span>`;
  }

  function renderCharacter(index) {
    const char = state.party[index];
    const classDef = CLASS_DEFS[char.classKey];
    const displayName = char.name || classDef?.name || `Hero ${index + 1}`;

    // Safely handle missing equipment
    const equipment = char.equipment || {};

    // Equipment list
    const equipHtml = Object.entries(equipment)
      .map(([slot, item]) => {
        return `
          <div class="inventory-row">
            <strong class="slot">${slot}:</strong>
            <span class="item">${formatStats(item)}</span>
            ${item ? `<button class="btn small" data-action="unequip" data-slot="${slot}">Unequip</button>` : ""}
          </div>
        `;
      })
      .join("");

    const html = `
      <div class="character-section">
        <h3>${displayName} (Lvl ${char.level})</h3>
        <div class="inventory-list">
          ${equipHtml || "<div class='hint'>No equipment</div>"}
        </div>
      </div>
    `;

    menu.querySelector(".character-container").innerHTML = html;

    // Re-bind Unequip buttons
    menu.querySelectorAll("[data-action='unequip']").forEach(btn => {
      btn.addEventListener("click", () => {
        const slot = btn.getAttribute("data-slot");
        const item = char.equipment?.[slot];
        if (item) {
          state.pendingLoot.push(item);
          char.equipment[slot] = null;
          renderCharacter(currentIndex);
          removeEquipmentStats(char, item);
          recomputeCharacterStats(char);
          updatePartyBars();
          renderSidebar();
        }
      });
    });
  }

  // Base structure
  menu.innerHTML = `
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Inventory</h2>
      </div>
      <div class="character-container"></div>
      <div class="modal-footer">
        <button class="btn" data-action="prev">Previous</button>
        <button class="btn" data-action="next">Next</button>
        <button class="btn" data-action="return">Return</button>
      </div>
    </div>
  `;

  document.body.appendChild(menu);

  // Initial render
  renderCharacter(currentIndex);

  // Navigation buttons
  menu.querySelector("[data-action='prev']").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + state.party.length) % state.party.length;
    renderCharacter(currentIndex);
  });

  menu.querySelector("[data-action='next']").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % state.party.length;
    renderCharacter(currentIndex);
  });

  menu.querySelector("[data-action='return']").addEventListener("click", () => {
    menu.remove();
    showPartyStatsMenu();
  });
}




// Controls

document.getElementById("CSV").addEventListener("click", () => {
  // Replace the original line with a call to the new function
  generateCSV();
});

// Keyboard controls for character selection
function setupKeyboardControls() {
  // Mapping from keys -> spells
  /*
  const keySpellMap = {
    q: "heal",
    w: "regeneration",
    e: "cure",
    r: "remedy",
    t: "revive",
    a: "fireBolt",
    s: "meteor",
    d: "touchOfDeath",
    z: "lightning",
    x: "massDistortion",
  };
  */
  const listEl = document.getElementById("keybinds-list");
  listEl.innerHTML = ""; // Clear existing list
  for (const key in keySpellMap) {
    const spellName = keySpellMap[key];
    const bindItem = document.createElement("div");
    bindItem.className = "keybind-item";
    bindItem.innerHTML = `
      <span>${spellName}</span>
      <input type="text" class="keybind-input" data-spell="${spellName}" value="${key.toUpperCase()}" readonly>
    `;
    listEl.appendChild(bindItem);
  }
  setupInputListeners();
}

function setupInputListeners() {
  const inputs = document.querySelectorAll("#controls-menu .keybind-input");
  inputs.forEach(input => {
    input.addEventListener("click", (e) => {
      e.target.value = "_"; // Placeholder while waiting for key press
      e.target.focus();
    });
    input.addEventListener("keydown", (e) => {
      const newKey = e.key.toLowerCase();
      const spellName = e.target.dataset.spell;

      // Update keySpellMap: remove old key for this spell
      const oldKey = Object.keys(keySpellMap).find(k => keySpellMap[k] === spellName);
      if (oldKey) delete keySpellMap[oldKey];

      // Assign new key
      keySpellMap[newKey] = spellName;

      // Update UI and persist
      e.target.value = newKey.toUpperCase();
      e.target.blur();
      e.preventDefault();
      renderKeybinds();
    });
  });
}
  // Helper: try to cast a spell if someone can
function tryCastSpell(spellName, spellType = null) {
  
  const livingMembers = getLivingPartyMembers();

  for (const caster of livingMembers) {
    if (!caster.knownSpells.includes(spellName)) continue;

    const spellDef = SPELL_DEFS[spellName];
    if (!spellDef) continue;

    // Cooldown check
    const now = Date.now();
    const readyAt = state.spellCoolDowns[caster.id]?.[spellName] || 0;
    const onCooldown = now < readyAt;
    console.log(`${spellName} on ${caster.id} is on cooldown.`);
    if (onCooldown) continue; // skip this caster if spell still cooling down
    if (caster.mp < spellDef.mpCost) useMpPotion(caster);
    // Special case: healing spells
    if (spellType === "heal") {
      if (spellDef.type === "heal" && caster.mp >= spellDef.mpCost) {
        castSpell(caster, spellName);
        //renderSidebar();
        return true; // stop after first successful cast
      }
    } else {
      if (caster.mp >= spellDef.mpCost) {
        castSpell(caster, spellName);
        //renderSidebar();
        return true; // stop after first successful cast
      }
    }
  }
  //renderSidebar();
  // No eligible caster → show floating warning
  showFloatingMessage("⚠️ Cannot cast right now");
  return false;
}

/*
  document.addEventListener("keydown", (e) => {
    if (gameScreen.classList.contains("hidden")) return;

    const key = e.key;

    // Number keys = character select
    if (key >= "1" && key <= "4") {
      const characterIndex = parseInt(key) - 1;
      if (characterIndex < state.party.length) {
        selectCharacter(characterIndex);
        e.preventDefault();
      }
      return;
    }

    // Spellcasting keys
    if (key in keySpellMap) {
      const spell = keySpellMap[key];
      const isHeal = spell === "heal"; // only "heal" uses heal-specific logic
      tryCastSpell(spell, isHeal ? "heal" : null);
      renderSidebar();
    }
  });
*/

function showFloatingMessage(msg, type = "error") {
  const msgEl = document.createElement("div");
  msgEl.className = `floating-message ${type}`;
  msgEl.textContent = msg;

  document.body.appendChild(msgEl);

  // Animate up + fade
  setTimeout(() => msgEl.classList.add("visible"), 10);
  setTimeout(() => {
    msgEl.classList.remove("visible");
    msgEl.addEventListener("transitionend", () => msgEl.remove());
  }, 1500);
}

function showPortraitFloatingMessage(characterId, msg, type = "crit") {
  const el = partyBarRoot.querySelector(`.portrait[data-index="${characterId}"]`);
  if (!el) return;

  const msgEl = document.createElement("div");
  msgEl.className = `portrait-floating-message ${type}`;
  msgEl.textContent = msg;

  el.appendChild(msgEl);

  // Auto-remove after animation ends
  msgEl.addEventListener("animationend", () => msgEl.remove());
}



// Initialization
function init() {
  // Initialize a default party of 4 random classes for variety
  state.party = Array.from({ length: PARTY_SIZE }, (_, i) => createCharacter(i, randomClassKey()));
  state.selectedIndex = 0;
  //let keySpellMap = JSON.parse(localStorage.getItem('keySpellMap')) || DEFAULT_KEY_SPELL_MAP;
  //renderCreator();
  showMainMenu();
}

init();

// Sidebar Character Info & Leveling / Skills / Spells
function getNextLevelXp(level) {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function selectCharacter(index) {
  state.selectedIndex = index;
  renderSidebar();
}

function renderSidebar() {
  const character = state.party[state.selectedIndex] || state.party[0];
  if (!character) return;
  
  const classDef = CLASS_DEFS[character.classKey];
  const canLevel = character.xp >= character.nextLevelXp;
  const isDead = character.hp <= 0;
  const skills = character.skills;
  const spells = character.knownSpells;

  // Only show skills for living characters, or show "DEAD" status
  const skillRows = isDead ? '<div class="death-notice">⚰️ This hero has fallen and cannot act!</div>' :
    Object.values(SKILL_DEFS).map((sk) => {
      const rank = skills[sk.key] || 0;
      const cost = getSkillUpgradeCost(sk.baseCost, rank);
      const disabled = state.gold < cost ? "disabled" : "";
      return `
        <div class="row">
          <div>
            <div>${sk.name} <span class="pill">Rank ${rank}</span></div>
            <div class="cost">${sk.desc} • Cost: ${cost} gold</div>
          </div>
          <button class="btn small" data-action="upgrade-skill" data-skill="${sk.key}" ${disabled}>Upgrade</button>
        </div>
      `;
    }).join("");

  // Only living characters can cast spells
  const now = Date.now();
  const spellRows = isDead ? '<div class="hint">Dead heroes cannot cast spells</div>' :
    spells.map((key) => {
      const s = SPELL_DEFS[key];
      const readyAt = state.spellCoolDowns[character.id]?.[key] || 0;
      const remaining = Math.max(0, Math.ceil((readyAt - now) / 1000));
      const onCooldown = now < readyAt;
      const disabled = character.mp < s.mpCost || onCooldown ? "disabled" : "";

      return `
        <button class="btn" data-action="cast-spell" data-spell="${s.key}" ${disabled}>
          ${s.name} (MP ${s.mpCost}) ${onCooldown ? `⏳ ${remaining}s` : ""}
        </button>
      `;
    }).join("");

  const livingCount = getLivingPartyMembers().length;
  const critChance = Math.round(computeCriticalChance() * 100);
  const partySpeed = Math.round(computePartySpeed());
  
  // Add death indicator to character name
  const characterTitle = isDead ? 
    `💀 Hero ${character.id + 1} • ${classDef.name} • L${character.level} • DEAD` :
    `Hero ${character.id + 1} • ${classDef.name} • L${character.level}`;
  
  sidebarEl.innerHTML = `
  <div class="header">
    <div class="title ${isDead ? 'character-dead' : ''}">${characterTitle}</div>
    <span class="pill">Gold: ${state.gold}</span>
  </div>
  
  <div class="section">
    <h3>Overview</h3>
    <div class="kv"><div>XP</div><div>${character.xp} / ${character.nextLevelXp}</div></div>
    <div class="kv"><div>HP</div><div class="${isDead ? 'dead' : ''}">${character.hp} / ${character.maxHp}</div></div>
    <div class="kv"><div>MP</div><div>${character.mp} / ${character.maxMp}</div></div>
    <div class="kv"><div>HP Pots:</div><div>${state.availableHPPotions}</div></div>
    <div class="kv"><div>MP Pots:</div><div>${state.availableMPPotions}</div></div>
    <div style="margin-top:8px; display:flex; gap:8px;">
      <button class="btn" id="level-up" ${canLevel && !isDead ? "" : "disabled"}>Level Up</button>
    </div>
  </div>

  <div class="section">
    <h3>Spells</h3>
    <div class="grid-2">${spellRows || '<div class="hint">No spells known</div>'}</div>
  </div>

  <div class="section">
    <h3>Party Status</h3>
    <div class="kv"><div>Living Heroes</div><div class="${livingCount === 0 ? 'all-dead' : ''}">${livingCount} / ${state.party.length}</div></div>
    <div class="kv"><div>Party Speed</div><div>${partySpeed}</div></div>
    <div class="kv"><div>Crit Chance</div><div>${critChance}%</div></div>
    ${state.guaranteedCrits > 0 ? `<div class="kv"><div>Blessed Hits</div><div style="color: var(--accent);">${state.guaranteedCrits}</div></div>` : ''}
    ${state.regenerationTimerId > 0 ? `<div class="kv"><div>Regeneration Active</div></div>` : '' }
    ${state.partyBuffs.weakSpot ? `<div class="kv"><div>Weak Spot Active</div></div>` : ''}
    ${state.partyBuffs.haste ? `<div class="kv"><div>Haste Active</div></div>` : ''}
    ${state.partyBuffs.preservation ? `<div class="kv"><div>preservation Active</div></div>` : ''}
  </div>

  <!-- Removed the Stats section -->
`;


  // Level up button (only works for living characters)
  const levelBtn = document.getElementById("level-up");
  if (levelBtn) {
    levelBtn.addEventListener("click", () => {
      if (character.xp >= character.nextLevelXp && !isDead) {
        character.xp -= character.nextLevelXp;
        character.level += 1;
        character.nextLevelXp = getNextLevelXp(character.level);
        applyLevelGains(character);
        //computeTotals(character);
        character.hp = character.maxHp;
        character.mp = character.maxMp;
        updatePartyBars();
        renderSidebar();
        soundEffects.play('level');
        
        // If this was the last dead character, restart auto attacks
        if (getLivingPartyMembers().length === 1 && !state.autoAttackTimerId) {
          beginAutoAttacks();
        }
      }
    });
  }

  // Spell casting (only for living characters)
  if (!isDead) {
    sidebarEl.querySelectorAll("[data-action='cast-spell']").forEach((btn) => {
      btn.addEventListener("click", () => {
        const spellKey = btn.getAttribute("data-spell");
        castSpell(character, spellKey);
        renderSidebar();
        updatePartyBars();
        
        // If we just revived someone, restart systems if needed
        const livingAfterSpell = getLivingPartyMembers().length;
        if (livingAfterSpell > 0 && !state.autoAttackTimerId) {
          beginAutoAttacks();
        }
      });
    });
  }
}

function getSkillUpgradeCost(base, rank) {
  return base * (rank + 1);
}

function applyLevelGains(character) {
  const gains = LEVEL_UP_GAINS[character.classKey];
  for (const [k, v] of Object.entries(gains)) {
    character.baseStats[k] += v;
  }
  recomputeCharacterStats(character);
}


function applySkillDerivedBonuses(character) {
  // Apply bodyBuilding and Meditation percentage bonuses to max stats
  const vit = character.skills.bodyBuilding || 0;
  const med = character.skills.meditation || 0;
  const vitMult = 1 + vit * 0.05;
  const medMult = 1 + med * 0.05;
  const natural = computeMaxHpMp(character.classKey, character.totalStats);
  character.maxHp = Math.floor(natural.hp * vitMult);
  character.maxMp = Math.floor(natural.mp * medMult);
}

function isSpellOnCooldown(casterId, spellKey) {
  const now = Date.now();
  const readyAt = state.spellCoolDowns[casterId]?.[spellKey] || 0;
  return now < readyAt ? readyAt - now : 0;
}

function castSpell(character, spellKey) {
  
  // Dead characters can't cast spells
  if (character.hp <= 0) {
    console.log("Dead characters cannot cast spells!");
    return;
  }
  
  // Curse causes spell failure chance
  if (character.statusEffect && character.statusEffect.some(effect => effect.key === "curse") && Math.random() < 0.2) {
    showFloatingMessage("Spell failed!");
    console.log("Spell failed due to curse");
    return;
  }
  
  const spell = SPELL_DEFS[spellKey];
  const spellDamageScale = 1 + (character.level / 10) * 0.2; // 20% more damage per 10 levels


  if (!spell) return;

   // check cooldown
  const remaining = isSpellOnCooldown(character.id, spellKey);
  if (remaining > 0) {
    console.log(`${spell.name} on ${character.id} is on cooldown for ${Math.ceil(remaining/1000)}s`);
    return;
  }

  if (character.mp < spell.mpCost) return;
  
  character.mp -= spell.mpCost;
  
  // check to use an MP potion
  const mpPercentage = (character.mp / character.maxMp) * 100;
      if (mpPercentage <= 30 && state.availableMPPotions > 0) {  
        console.log(`${character.id}'s MP is at or below 30% trying potion`);
        useMpPotion(character);
      }


  const sp = character.skills.spellpower || 0;
  const spMult = 1 + sp * 0.05;

  if (spell.type === "damage") {
    let power;
    let targetAll = false;
    let specialEffect = null;
    let sparkPower;

    switch (spellKey) {
      case "fireBolt":
        power = 10 + Math.floor(character.totalStats.Intellect * 0.8 * spMult);
        power = Math.floor(power * spellDamageScale);
        soundEffects.play('fire');
        //state.spellCoolDowns[spellKey] = now + 2000;
        break;
      case "lightning":
        // High-variance damage calculation
        // Base damage is now lower than Firebolt to make the variance more impactful
        let basePower = 8 + Math.floor(character.totalStats.Intellect * 0.7 * spMult);
        soundEffects.play('lightning');
        // Random multiplier between 0.5 and 2.5
        const variance = (Math.random() * 2.5) + 0.5; // This gives a range from 0.5 to 3.0
        power = Math.floor(basePower * variance);
        power = Math.floor(power * spellDamageScale);
        console.log(power);
        //state.spellCoolDowns[spellKey] = now + 3000;
        break;
      case "meteor":
        power = 25 + Math.floor(character.totalStats.Intellect * 1.5 * spMult);
        power = Math.floor(power * spellDamageScale);
        targetAll = true;
        //state.spellCoolDowns[spellKey] = now + 10000;
        break;
      case "shrapnel":
        power = 25 + Math.floor(character.totalStats.Intellect * 1.5 * spMult);
        power = Math.floor(power * spellDamageScale);
        break;
      case "volley":
        power = 15 + Math.floor(character.totalStats.Dexterity * 0.5);
        power = Math.floor(power * spellDamageScale);
        break; 
      case "sparks":
        sparkPower = 5 + Math.floor(character.totalStats.Intellect * 0.5 * spMult);
        sparkPower = Math.floor(sparkPower * spellDamageScale);
        soundEffects.play('lightning');
        break;       
      case "destroyUndead":
        power = 40 + Math.floor(character.totalStats.Intellect * 1.5 * spMult);
        power = Math.floor(power * spellDamageScale);
        targetAll = true;
        //state.spellCoolDowns[spellKey] = now + 10000;
        break;
      case "touchOfDeath":
        power = 5 + Math.floor(character.totalStats.Intellect * 0.3 * spMult); // Low base damage
        specialEffect = "instantKill";
        //state.spellCoolDowns[spellKey] = now + 10000;
        break;
      case "massDistortion":
        specialEffect = "percentDamage";
        //state.spellCoolDowns[spellKey] = now + 5000;
        //targetAll = true;
        break;
      default:
        power = 10 + Math.floor(character.totalStats.Intellect * 0.8 * spMult);
        power = Math.floor(power * spellDamageScale);
    }

  // Apply spell damage bonus to all spells (except special effect spells)
  if (specialEffect !== "percentDamage" && spellKey !== "sparks") {
    const spellDmgBonus = getSpellDamageBonus(character);
    if (spellDmgBonus > 0) {
      power = Math.floor(power * (1 + spellDmgBonus / 100));
      console.log(`Spell damage with ${spellDmgBonus}% bonus: ${power}`);
    }
  } else if (spellKey == "sparks") {
    const spellDmgBonus = getSpellDamageBonus(character);
    if (spellDmgBonus > 0){
      sparkPower = Math.floor(sparkPower * (1 + spellDmgBonus / 100));
    }
  }  

  if (spellKey === "sparks") {
  // Determine the number of sparks (between 3 and 6)
  const sparks = Math.floor(Math.random() * 3) + 3;

  for (let i = 0; i < sparks; i++) {
    if (state.waveComplete) return;
    // Build list of living enemies
    const livingEnemies = state.enemies
      .map((enemy, idx) => ({ enemy, idx }))
      .filter(e => e.enemy.hp > 0);

    if (livingEnemies.length === 0) break; // No valid targets left

    // Pick a random living enemy
    const pick = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
    const enemy = pick.enemy;
    const idx = pick.idx;

    // Calculate spark power with high variance
    //let basePower = 8 + Math.floor(character.totalStats.Intellect * 0.7 * spMult);
    const variance = (Math.random() * 2) + 0.5; // Random multiplier between 0.5 and 2.5
    power = Math.floor(sparkPower * variance);
    console.log(`Spark ${i + 1} hit for ${power} damage`);
    // Apply damage
    enemy.hp = Math.max(0, enemy.hp - power);

    // Notify enemy damaged
    onEnemyDamaged(idx);
  }
} else if (spellKey === "volley") {
    // volley: 5 random arrows
    const arrows = 5;
    for (let i = 0; i < arrows; i++) {
      if (state.waveComplete) return;
      // Build list of living enemies
      const livingEnemies = state.enemies
        .map((enemy, idx) => ({ enemy, idx }))
        .filter(e => e.enemy.hp > 0 && e.enemy.type !== "trap");

      if (livingEnemies.length === 0) break; // No valid targets left

      // Pick a random living enemy
      const pick = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
      const enemy = pick.enemy;
      const idx = pick.idx;

      // Apply damage (tune power scaling as needed)
      enemy.hp = Math.max(0, enemy.hp - power);

      onEnemyDamaged(idx);
    }    
  } else if (spellKey === "shrapnel") {
    // Shrapnel: 7 random shards
    const currentWaveId = state.currentWave;
    const shards = 7;
    for (let i = 0; i < shards; i++) {
      if (state.waveComplete) return;
      if (state.currentWave !== currentWaveId) return; // abort if wave changed
      // Build list of living enemies
      const livingEnemies = state.enemies
        .map((enemy, idx) => ({ enemy, idx }))
        .filter(e => e.enemy.hp > 0 && e.enemy.type !== "trap");

      if (livingEnemies.length === 0) break; // No valid targets left

      // Pick a random living enemy
      const pick = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
      const enemy = pick.enemy;
      const idx = pick.idx;

      // Apply damage (tune power scaling as needed)
      enemy.hp = Math.max(0, enemy.hp - power);

      onEnemyDamaged(idx);
    }
  } else if (targetAll) {
      state.enemies.forEach((enemy, idx) => {
        if (enemy.type === "trap") { // skip traps
          return;
        }
        if (enemy.hp > 0) {
          if (specialEffect === "percentDamage") {
            
            const percentDamage = Math.floor(enemy.maxHp * 0.10);
            enemy.hp = Math.max(0, enemy.hp - percentDamage);
          } else if (spellKey === "destroyUndead") { 
            if (enemy.type === "undead") enemy.hp = Math.max(0, enemy.hp - power);
          } else {
            enemy.hp = Math.max(0, enemy.hp - power);
          }
          onEnemyDamaged(idx);
          if (state.waveComplete) return;
        }
      });
    } else {
      // Single target damage - prefer focused enemy, or first living enemy
      let idx = typeof state.focusedEnemyIndex === 'number' ? state.focusedEnemyIndex : -1;
      
      // If focused enemy is dead, find first living enemy
      if (idx === -1 || !state.enemies[idx] || state.enemies[idx].hp <= 0) {
        idx = state.enemies.findIndex(e => e.hp > 0);
        if (idx >= 0) {
          state.focusedEnemyIndex = idx;
        }
      }
      
      if (idx >= 0) {
        const enemy = state.enemies[idx];
        
        if (specialEffect === "instantKill") {
          // Touch of Death - chance for instant kill
          const killChance = enemy.isBoss ? 0.10 : 0.20; // 10% boss, 20% normal
          if (Math.random() < killChance) {
            console.log("Touch of Death - Instant Kill!");
            enemy.hp = 0;
          } else {
            enemy.hp = Math.max(0, enemy.hp - power);
          }
        } else if (specialEffect === "percentDamage") {
            // Apply Mass Distortion's percent damage to a single enemy
            const percentDamage = Math.floor(enemy.maxHp * 0.10);
            enemy.hp = Math.max(0, enemy.hp - percentDamage);
            console.log(percentDamage);
            console.log(enemy.maxHp);
        } else {
          enemy.hp = Math.max(0, enemy.hp - power);
        }
        onEnemyDamaged(idx);
      }
    }
  } else if (spell.type === "heal") {
    let amount;
    let targetAll = false;
    
    switch (spellKey) {
      case "heal":
        amount = 10 + Math.floor(character.totalStats.Personality * 0.6 * spMult);
        amount = Math.floor(amount * (1 + (character.level / 20))); // 5% more heal per 10 levels
        //state.spellCoolDowns[spellKey] = now + 1000;
        break;
      case "cure":
        amount = 20 + Math.floor(character.totalStats.Personality * 1.0 * spMult);
        amount = Math.floor(amount * (1 + (character.level / 20))); // 5% more heal per 10 levels
        targetAll = true;
        //state.spellCoolDowns[spellKey] = now + 4000;
        break;
      case "revive":
        if (!reviveOne()) character.mp += spell.mpCost;
        amount = 0;
        //state.spellCoolDowns[spellKey] = now + 5000;
        break;
      case "remedy":
        console.log('remedy'); 
        amount = 0;
        const livingWithEffects = getLivingPartyMembers()
          .filter(member => member.hp > 0 && member.statusEffect?.length)
          .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));

        if (livingWithEffects.length > 0) {
          const target = livingWithEffects[0]; // lowest HP % among afflicted
          target.statusEffect = [];
          console.log(`All status effects cured for Hero ${target.id + 1}`);
          break;
        }
        //state.spellCoolDowns[spellKey] = now + 2000;
      default:
        amount = 10 + Math.floor(character.totalStats.Personality * 0.6 * spMult);
        amount = Math.floor(amount * (1 + (character.level / 20))); // 5% more heal per 10 levels
    }
    
    if (targetAll) {
      // Cure All heals entire party (living and dead characters)
      state.party.forEach(member => {
        member.hp = Math.min(member.maxHp, member.hp + amount);
        soundEffects.play('heal');
      });
    } else {
      // Single target heal - prioritize lowest HP% living character, but can revive dead ones too
      const healTargets = [...state.party]
      // First, filter out dead characters
      .filter(member => member.hp > 0)
      // Then, sort the remaining living characters by lowest HP percentage
      .sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
                
      const target = healTargets[0] || character;
      if (target.statusEffect.some(effect => effect.key === "disease")){
        target.hp = Math.round(Math.min(target.maxHp, target.hp + (amount / 2)));
      } else {
        target.hp = Math.min(target.maxHp, target.hp + amount);
      }
      flashHealOnCharacter(target.id);
      soundEffects.play('heal');
      // If we just revived someone, restart auto attacks
      if (target.hp > 0 && !state.autoAttackTimerId) {
        beginAutoAttacks();
      }
    }
    updatePartyBars();
  } else if (spell.type === "buff") {
    
    switch (spellKey) {
    case "weakSpot":
      console.log("Weak Spot activated!");
      // Mark buff as active
      state.partyBuffs.weakSpot = true;

      // Set timer to remove after 10 seconds
      if (state.partyBuffs.weakSpotTimerId) {
        clearTimeout(state.partyBuffs.weakSpotTimerId);
      }
      state.partyBuffs.weakSpotTimerId = setTimeout(() => {
        state.partyBuffs.weakSpot = false;
        state.partyBuffs.weakSpotTimerId = null;
        renderSidebar(); // re-render to clear display
      }, 10000);

      renderSidebar(); // immediately update sidebar
      break;
      case "haste":
        // if (partyBuffs.haste) return;
        console.log("Haste activated!");
        // Mark buff as active
        state.partyBuffs.haste = true;
        stopAutoAttacks();
        beginAutoAttacks();

        // Set timer to remove after 10 seconds
        if (state.partyBuffs.hasteTimerId) {
          clearTimeout(state.partyBuffs.hasteTimerId);
        }
        state.partyBuffs.hasteTimerId = setTimeout(() => {
          state.partyBuffs.haste = false;
          state.partyBuffs.hasteTimerId = null;
          stopAutoAttacks();
          beginAutoAttacks();
          renderSidebar(); // re-render to clear display
        }, 10000);

        renderSidebar(); // immediately update sidebar
      break;
      case "preservation":
        console.log("Preservation activated!");
        state.partyBuffs.preservation = true;
        const duration = 4000 + character.skills.spellpower;
        if (state.partyBuffs.preservationTimerId) {
          clearTimeout(state.partyBuffs.preservationTimerId);
        }
        state.partyBuffs.preservationTimerId = setTimeout(() => {
          state.partyBuffs.preservation = false;
          state.partyBuffs.preservationTimerId = null;
          
        }, duration); // 4 second + spell power buff
        renderSidebar();
        break;
      case "shield":
        const restore = 5 + Math.floor(character.totalStats.Intellect * 0.3 * spMult);
        character.mp = Math.min(character.maxMp, character.mp + restore);
        updatePartyBars();
        break;
      case "bless":
        const livingMembers = getLivingPartyMembers();
        if (livingMembers.length > 0) {
          const spellpowerRank = character.skills.spellpower || 0;
          const guaranteedCrits = Math.min(10, 1 + spellpowerRank);
          state.guaranteedCrits += guaranteedCrits;
        }
        break;
      case "quickstep":
        // Grant guaranteed dodge on next attack
        character.quickstepActive = true;
        console.log(`${character.id + 1} activated Quickstep - next attack will be dodged!`);
        break;
      case "regeneration":
        console.log('regeneration case');
        // Start regeneration effect on entire party
        // set cooldown (10s)
        //state.spellCoolDowns[spellKey] = now + 10000;
        startRegenerationEffect(character, spMult);
        break;
    }
    
  }

  // set cooldown for THIS caster
  if (!state.spellCoolDowns[character.id]) {
    state.spellCoolDowns[character.id] = {};
  }
  state.spellCoolDowns[character.id][spellKey] = Date.now() + (spell.cooldown || 0);
  if (!state.cooldownUiTimerId) {
    state.cooldownUiTimerId = setInterval(() => {
      renderSidebar();
    }, 1000);
  }

}

// Add this helper function to gather spell damage bonuses
function getSpellDamageBonus(character) {
  let spellDmgBonus = 0;
  
  // Check all equipped gear for spellDmg bonuses
  for (const slot in character.equipment) {
    const item = character.equipment[slot];
    if (!item) continue;
    
    for (const bonus of item.stats.bonuses) {
      if (bonus.key === "spellDmg") {
        spellDmgBonus += bonus.value;
      }
    }
  }
  
  return spellDmgBonus;
}

function flashHealOnCharacter(id) {
  const portrait = partyBarRoot.querySelector(`.portrait[data-index="${id}"]`);
  if (!portrait) return;

  // Add the class to start the flash animation
  portrait.classList.add("heal-flash");

  // Remove the class after a short delay to allow the animation to play
  setTimeout(() => {
    portrait.classList.remove("heal-flash");
  }, 300); // Set a short delay, e.g., 300ms, to match the CSS transition duration
}

// Regeneration system
function startRegenerationEffect(caster, spellMultiplier) {
  // Clear any existing regeneration
  if (state.regenerationTimerId) {
    clearInterval(state.regenerationTimerId);
    removeRegenGlow(); // Remove glow from previous effect
  }
  
  const healPerTick = 5 + Math.floor(caster.totalStats.Personality * 0.4 * spellMultiplier);
  const duration = 10000; // 10 seconds
  const tickInterval = 2000; // Every 2 seconds
  const totalTicks = duration / tickInterval;
  let currentTick = 0;
  
  console.log(`Regeneration started - ${healPerTick} HP every 2 seconds for 30 seconds`);
  
  // Add the healing glow to all portraits when the effect starts
  addRegenGlow();
  
  state.regenerationTimerId = setInterval(() => {
    currentTick++;
    
    // Heal all living party members
    const livingMembers = getLivingPartyMembers();
    livingMembers.forEach(member => {
      member.hp = Math.min(member.maxHp, member.hp + healPerTick);
      // Play a sound
      soundEffects.play('heal');

    });
    
    updatePartyBars();
    
    if (currentTick >= totalTicks) {
      clearInterval(state.regenerationTimerId);
      state.regenerationTimerId = null;
      renderSidebar();
      removeRegenGlow(); // Remove the glow when the effect ends
      console.log("Regeneration effect ended");
    }
  }, tickInterval);
}

// Helper function to add the visual effect
function addRegenGlow() {
  const portraits = partyBarRoot.querySelectorAll('.portrait');
  portraits.forEach(portrait => {
    portrait.classList.add("regen-glow");
  });
}

// Helper function to remove the visual effect
function removeRegenGlow() {
  const portraits = partyBarRoot.querySelectorAll('.portrait');
  portraits.forEach(portrait => {
    portrait.classList.remove("regen-glow");
  });
}

function reviveOne() {
  const deadMember = state.party.find(member => member.hp <= 0);
  if (deadMember) {
    console.log(deadMember);
    const maxHp = parseInt(deadMember.maxHp, 10);
    if (!Number.isFinite(maxHp) || maxHp <= 0) {
      console.error("Invalid maxHp value for character:", deadMember);
      return 0;
    }

    deadMember.hp = Math.floor(maxHp / 2);
    flashReviveOnCharacter(deadMember.id);
    soundEffects.play("revive");
    return 1;
  }
  return 0;
}


function reviveAll() {
  state.party.forEach(member => {
    if (member.hp <= 0) {
      member.hp = member.maxHp;
      flashReviveOnCharacter(member.id);
      // Play a sound
      soundEffects.play('revive');
      updatePartyBars();
    }
  });
}

function flashReviveOnCharacter(id) {
  const portrait = partyBarRoot.querySelector(`.portrait[data-index="${id}"]`);
  if (!portrait) return;

  // Add the class to start the flash animation
  portrait.classList.add("revive-flash");

  // Remove the class after a short delay to allow the animation to play
  setTimeout(() => {
    portrait.classList.remove("revive-flash");
  }, 300); // Set a short delay, e.g., 300ms, to match the CSS transition duration
}

// Game Over menu with Might & Magic style message
function showGameOverMenu() {
  stopEnemyAttacks();
  stopAutoAttacks();
  soundEffects.play('gameOver');
  
  const menu = document.createElement("div");
  menu.id = "game-over-menu";
  menu.className = "modal-overlay game-over";
  
  const currentArea = AREAS[state.currentAreaId] || { name: "Unknown Area" };
  const isStartingArea = currentArea.id === "newSorpigal";
  
  menu.innerHTML = `
    <div class="modal-content game-over-content">
      <div class="game-over-header">
        <h2>💀 DEFEAT 💀</h2>
        <div class="death-message">
          "Though eternity lies before thee, thy work in the land of the living is not done. 
          Return brave ones. I am certain that we shall meet again."
        </div>
      </div>
      
      <div class="death-stats">
        <div class="stat-row">
          <span>Area:</span>
          <span>${currentArea.name}</span>
        </div>
        <div class="stat-row">
          <span>Wave Reached:</span>
          <span>${state.currentWave || 1}</span>
        </div>
        <div class="stat-row">
          <span>Gold Earned:</span>
          <span>${state.gold}</span>
        </div>
      </div>
      
      <div class="game-over-actions">
        <button class="btn large primary" data-action="restart-area">Return to the Living</button>
        <button class="btn large secondary" data-action="restart-game">Start New Adventure</button>
        ${!isStartingArea 
          ? `<button class="btn large" data-action="leave-area">Leave Area</button>` 
          : ""}
      </div>
      
      <div class="game-over-hint">
        💡 <strong>Tip:</strong> Consider upgrading your skills or buying healing spells before challenging difficult enemies!
      </div>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Add event listeners
  menu.querySelector("[data-action='restart-area']").addEventListener("click", () => {
    closeGameOverMenu();
    restartFromAreaBeginning();
  });
  
  menu.querySelector("[data-action='restart-game']").addEventListener("click", () => {
    if (confirm("Are you sure you want to start a completely new adventure? All progress will be lost!")) {
      closeGameOverMenu();
      restartEntireGame();
    }
  });

  // Leave Area button
  if (!isStartingArea) {
    menu.querySelector("[data-action='leave-area']").addEventListener("click", () => {
      closeGameOverMenu();
      // Instead of restarting, show the area selection menu
      showAreaSelectionMenuFromGameOver();
    });
  }
}

function showAreaSelectionMenuFromGameOver() {
  const availableAreas = getAvailableAreas();
  
  const menu = document.createElement("div");
  menu.id = "area-selection-menu";
  menu.className = "modal-overlay";
  
const areaButtons = availableAreas.map(area => {
  const isDungeon = area.type === "dungeon";
  const isCompleted = state.completedAreas.includes(area.id); // unified check
  const isDisabled = isDungeon && isCompleted;

  const completedBadge = isCompleted
    ? '<span class="pill completed">✓ Completed</span>'
    : '';
  const dungeonBadge = isDungeon
    ? '<span class="pill dungeon">⚔️ Dungeon</span>'
    : '';

  const areaTypeClass = isDungeon ? "dungeon-area" : "regular-area";
  const disabledClass = isDisabled ? "disabled" : "";
  //console.log(`Area: ${area.name}, isDungeon: ${isDungeon}, isCompleted: ${isCompleted}, isDisabled: ${isDisabled}, type: ${area.type}`);
  //console.log(area);

  return `
    <div class="area-option ${areaTypeClass} ${disabledClass}">
      <div class="area-info">
        <h3>${area.name}</h3>
        <p>${area.description}</p>
        <div class="area-stats">
          <span class="pill">Level ${area.baseLevel}+</span>
          <span class="pill">${area.maxWaves} Waves</span>
          ${dungeonBadge}
          ${completedBadge}
        </div>
        ${isDungeon ? '<div class="dungeon-warning">⚠️ No rest between waves!</div>' : ''}
      </div>
      <button 
        class="btn" 
        data-action="select-area" 
        data-area="${area.id}" 
        ${isDisabled ? 'disabled aria-disabled="true"' : ''}
      >
        ${isDisabled ? 'Conquered!' : 'Enter Area'}
      </button>
    </div>
  `;
}).join("");

// Insert into DOM
menu.innerHTML = `
  <div class="modal-content large">
    <div class="modal-header">
      <h2>Choose Your Adventure</h2>
      <span class="pill">Select an area to explore</span>
    </div>
    <div class="area-list">
      ${areaButtons}
    </div>
    <div class="modal-footer">
      <button class="btn" data-action="cancel">Cancel</button>
    </div>
  </div>
`;

document.body.appendChild(menu);

// Attach listeners only to enabled buttons
menu.querySelectorAll("[data-action='select-area']:not([disabled])").forEach(btn => {
  btn.addEventListener("click", () => {
    const areaId = btn.getAttribute("data-area");
    closeAreaSelectionMenu();
    state.currentAreaId = areaId;
    state.currentWave = 1;
    setupWaveNew(1);
    reviveAll();
    beginEnemyAttacksWithVariants();
    beginAutoAttacks();
  });
});

  // Cancel button → go back to Game Over menu
  menu.querySelector("[data-action='cancel']").addEventListener("click", () => {
    closeAreaSelectionMenu();
    showGameOverMenu();
  });
}


// Restart from beginning of current area
function restartFromAreaBeginning() {
  // Fully heal all party members
  state.party.forEach(character => {
    character.hp = character.maxHp;
    character.mp = character.maxMp;
    character.statusEffect = [];
  });
  
  // Reset to wave 1 of current area
  state.currentWave = 1;
  state.focusedEnemyIndex = null;
  
  // Set up the first wave
  if (typeof setupWaveNew === 'function') {
    setupWaveNew(1, state.currentAreaId);
  } else {
    setupWave(1); // Fallback to old system
  }
  
  // Restart combat
  beginEnemyAttacksWithVariants();
  beginAutoAttacks();
  
  // Update UI
  updatePartyBars();
  renderSidebar();
  
  console.log(`Restarted at ${AREAS[state.currentAreaId]?.name || 'current area'}, Wave 1`);
}

// --- Show Controls Menu ---
function showControlsMenu() {
  const menu = document.createElement("div");
  menu.id = "controls-menu";
  menu.className = "modal-overlay";
  menu.innerHTML = `
    <div class="modal-content">
      <header class="topbar">
        <h1>Customize Keyboard Controls</h1>
        <p class="subtitle">Click a key and press a new one to rebind it.</p>
      </header>
      <div id="keybinds-list"></div>
      <div class="creator-actions">
        <button id="save-controls-btn" class="btn primary">Save</button>
        <button id="cancel-controls-btn" class="btn secondary">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(menu);
  renderKeybinds(); // populate UI with current bindings

  // Event listeners for save/cancel
  document.getElementById("save-controls-btn").addEventListener("click", () => {
    saveControls();
    closeControlsMenu();
    showMainMenu();
  });

  document.getElementById("cancel-controls-btn").addEventListener("click", () => {
    keySpellMap = JSON.parse(localStorage.getItem('keySpellMap')) || { ...DEFAULT_KEY_SPELL_MAP };
    closeControlsMenu();
    showMainMenu();
  });
}

function closeControlsMenu() {
      const menu = document.getElementById("controls-menu");
    if (menu) {
        menu.remove();
    }
}

// --- UI Rendering for Controls Menu ---
function renderKeybinds() {
  // Merge new spells from DEFAULT_KEY_SPELL_MAP into keySpellMap
  keySpellMap = { ...DEFAULT_KEY_SPELL_MAP, ...keySpellMap };

  const listEl = document.getElementById("keybinds-list");
  listEl.innerHTML = ""; // Clear existing list
  for (const key in keySpellMap) {
    const spellName = keySpellMap[key];
    const bindItem = document.createElement("div");
    bindItem.className = "keybind-item";
    bindItem.innerHTML = `
      <span>${spellName}</span>
      <input type="text" class="keybind-input" data-spell="${spellName}" value="${key.toUpperCase()}" readonly>
    `;
    listEl.appendChild(bindItem);
  }
  setupInputListeners();
}

function saveControls() {
  localStorage.setItem('keySpellMap', JSON.stringify(keySpellMap));
  localStorage.setItem('keySpellMapVersion', DEFAULT_VERSION);
  closeControlsMenu();
}

function closeGameOverMenu() {
  const menu = document.getElementById("game-over-menu");
  if (menu) {
    menu.remove();
  }
}

// Complete game restart
function restartEntireGame() {
  // Reset all progress
  state.currentAreaId = "newSorpigal";
  state.currentWave = 1;
  state.completedAreas = [];
  state.focusedEnemyIndex = null;
  state.gold = 0;
  state.pendingLoot = [];
  state.guaranteedCrits = 0;
  
  // Reset party to level 1
  state.party.forEach((character, index) => {
    const newChar = createCharacter(index, character.classKey);
    // Copy over any bonus point allocations
    newChar.bonusAllocations = { ...character.bonusAllocations };
    newChar.remainingBonus = character.remainingBonus;
    computeTotals(newChar);
    state.party[index] = newChar;
  });
  
  // Start fresh
  if (typeof setupWaveNew === 'function') {
    setupWaveNew(1, "newSorpigal");
  } else {
    setupWaveNew(1, "newSorpigal");
  }
  
  beginEnemyAttacksWithVariants();
  beginAutoAttacks();
  
  // Update UI
  updatePartyBars();
  renderSidebar();
  goldEl.textContent = "0";
  
  console.log("Started new adventure!");
}

function closeMainMenu() {
  const menu = document.getElementById("main-menu");
  if (menu) {
    menu.remove();
  }
}

// Create a handler function for the main menu buttons
function handleMainMenuAction(action) {
  switch (action) {
    case 'new-game':
     // closeMainMenu();
      renderCreator();
      break;
    case 'load-game':
      // Future logic for loading a game
      console.log("Load game functionality is not yet implemented.");
      break;
    case 'customize-keys':
     // closeMainMenu();
      showControlsMenu(); // Call the function to display the controls menu
      break;
    case 'guide-book':
      // Future logic for showing the guide book
      showGuideBook();
      break;
  }
}

function closeMenus(){
// make sure menus are closed
  const existingModals = document.querySelectorAll('.modal-overlay');
  existingModals.forEach(modal => modal.remove());
}

// Function to dynamically render the Guide Book
function showGuideBook() {
  const guide = document.createElement("div");
  guide.id = "guide-book";
  guide.className = "modal-overlay";

  // Build guide HTML dynamically
  let content = `<div class="modal-content"><h1>Game Guide</h1>`;

  for (const [section, entries] of Object.entries(guideData)) {
    content += `<h2>${section}</h2><ul>`;
    for (const [name, desc] of Object.entries(entries)) {
      content += `<li><strong>${name}:</strong> ${desc}</li>`;
    }
    content += `</ul>`;
  }

  // Add return button
  content += `<button class="btn large" id="return-main-menu">Return to Main Menu</button></div>`;
  guide.innerHTML = content;

  document.body.appendChild(guide);

  // Add listener for return button
  document.getElementById("return-main-menu").addEventListener("click", () => {
    guide.remove();
    showMainMenu();
  });
}


function generateCSV() {
  const data = [];
  const numWavesToGenerate = 100; // Define how many waves you want to test
  const testAreaId = state.currentAreaId; // Change this to the area you want to test
  let totalEnemiesSpawned = 0;

  // Add the CSV header
  data.push([
    "Enemy Name",
    "Tier",
    "Variant",
    "Level",
    "HP",
    "Attack",
    "Gold",
    "XP"
  ]);

  for (let i = 1; i <= numWavesToGenerate; i++) {
    const wave = setupWaveFromAreaWithVariants(testAreaId, i);
    wave.enemies.forEach((enemy) => {
      data.push([
        enemy.name,
        enemy.tier,
        enemy.variant,
        enemy.level,
        enemy.maxHp,
        enemy.attack,
        enemy.rewardGold,
        enemy.rewardXp,
      ]);
      totalEnemiesSpawned++;
    });
  }

  // Convert the array of arrays into a CSV string
  const csvContent = "data:text/csv;charset=utf-8," + data.map(e => e.join(",")).join("\n");

  // Log the total number of enemies spawned
  console.log(`Generated a CSV with data for ${totalEnemiesSpawned} enemies across ${numWavesToGenerate} waves.`);

  // Trigger the download
  downloadCSV(csvContent, `enemy_data_${testAreaId}.csv`);
}

function downloadCSV(csvString, filename) {
  const encodedUri = encodeURI(csvString);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link); // Required for Firefox

  link.click(); // Trigger the download

  document.body.removeChild(link); // Clean up the DOM
}

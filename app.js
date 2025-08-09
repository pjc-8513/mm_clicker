// Core data: classes and base stats inspired by MM6
const ATTRIBUTE_KEYS = [
  "Might",
  "Intellect",
  "Personality",
  "Endurance",
  "Accuracy",
  "Speed",
  "Luck",
];

const CLASS_DEFS = {
  knight: {
    name: "Knight",
    baseStats: { Might: 15, Intellect: 7, Personality: 7, Endurance: 15, Accuracy: 13, Speed: 10, Luck: 10 },
    hp: (s) => 35 + Math.floor(s.Endurance * 3.0),
    mp: (s) => 0,
  },
  paladin: {
    name: "Paladin",
    baseStats: { Might: 13, Intellect: 8, Personality: 12, Endurance: 13, Accuracy: 10, Speed: 10, Luck: 10 },
    hp: (s) => 30 + Math.floor(s.Endurance * 2.6),
    mp: (s) => 5 + Math.floor(s.Personality * 1.0),
  },
  archer: {
    name: "Archer",
    baseStats: { Might: 12, Intellect: 10, Personality: 8, Endurance: 10, Accuracy: 14, Speed: 12, Luck: 10 },
    hp: (s) => 28 + Math.floor(s.Endurance * 2.2),
    mp: (s) => 5 + Math.floor(s.Intellect * 1.0),
  },
  cleric: {
    name: "Cleric",
    baseStats: { Might: 8, Intellect: 10, Personality: 15, Endurance: 12, Accuracy: 8, Speed: 10, Luck: 10 },
    hp: (s) => 24 + Math.floor(s.Endurance * 1.9),
    mp: (s) => 10 + Math.floor(s.Personality * 2.0),
  },
  sorcerer: {
    name: "Sorcerer",
    baseStats: { Might: 6, Intellect: 16, Personality: 8, Endurance: 8, Accuracy: 10, Speed: 12, Luck: 10 },
    hp: (s) => 20 + Math.floor(s.Endurance * 1.6),
    mp: (s) => 10 + Math.floor(s.Intellect * 2.0),
  },
  druid: {
    name: "Druid",
    baseStats: { Might: 9, Intellect: 12, Personality: 12, Endurance: 10, Accuracy: 10, Speed: 10, Luck: 10 },
    hp: (s) => 22 + Math.floor(s.Endurance * 1.8),
    mp: (s) => 10 + Math.floor(Math.max(s.Intellect, s.Personality) * 1.4),
  },
  monk: {
    name: "Monk",
    baseStats: { Might: 12, Intellect: 9, Personality: 8, Endurance: 12, Accuracy: 12, Speed: 14, Luck: 10 },
    hp: (s) => 26 + Math.floor(s.Endurance * 2.1),
    mp: (s) => Math.floor(s.Intellect * 0.5),
  },
};

const DEFAULT_BONUS_POINTS = 20;
const PARTY_SIZE = 4;

// Skills and Spells (simplified)
const SKILL_DEFS = {
  weaponMastery: { key: "weaponMastery", name: "Weapon Mastery", desc: "+5% click dmg per rank", baseCost: 15 },
  spellpower: { key: "spellpower", name: "Spellpower", desc: "+5% spell power per rank", baseCost: 15 },
  vitality: { key: "vitality", name: "Vitality", desc: "+5% max HP per rank", baseCost: 20 },
  meditation: { key: "meditation", name: "Meditation", desc: "+5% max MP per rank", baseCost: 20 },
  focus: { key: "focus", name: "Focus", desc: "+3% critical hit chance per rank", baseCost: 18 },
};

const SPELL_DEFS = {
  fireBolt: { key: "fireBolt", name: "Fire Bolt", mpCost: 6, type: "damage", cost: 100 },
  heal: { key: "heal", name: "Heal", mpCost: 6, type: "heal", cost: 100 },
  lightning: { key: "lightning", name: "Lightning Bolt", mpCost: 8, type: "damage", cost: 200 },
  shield: { key: "shield", name: "Magic Shield", mpCost: 10, type: "buff", cost: 150 },
  cure: { key: "cure", name: "Cure All", mpCost: 12, type: "heal", cost: 250 },
  meteor: { key: "meteor", name: "Meteor", mpCost: 15, type: "damage", cost: 400 },
  bless: { key: "bless", name: "Bless", mpCost: 8, type: "buff", cost: 180 },
};

const CLASS_STARTING_SPELLS = {
  knight: [],
  paladin: ["heal", "shield"],
  archer: ["fireBolt"],
  cleric: ["heal"],
  sorcerer: ["fireBolt"],
  druid: ["heal", "fireBolt"],
  monk: [],
};

const LEVEL_UP_GAINS = {
  knight: { Might: 2, Endurance: 2, Accuracy: 1 },
  paladin: { Might: 1, Endurance: 2, Personality: 1 },
  archer: { Might: 1, Accuracy: 2, Speed: 1 },
  cleric: { Personality: 2, Endurance: 1, Intellect: 1 },
  sorcerer: { Intellect: 2, Speed: 1, Luck: 1 },
  druid: { Intellect: 1, Personality: 1, Endurance: 1, Luck: 1 },
  monk: { Speed: 2, Accuracy: 1, Endurance: 1 },
};

// Global state
const state = {
  party: [], // array of Character
  gold: 0,
  enemyLevel: 1,
  enemy: null,
  enemyAttackTimerId: null,
  autoAttackTimerId: null,
  guaranteedCrits: 0, // Tracks remaining guaranteed critical hits from Bless
};

// Area Definition System
const AREAS = {
  newSorpigal: {
    id: "newSorpigal",
    name: "New Sorpigal Outskirts",
    description: "The familiar countryside around New Sorpigal, perfect for beginning adventurers.",
    maxWaves: 10,
    baseLevel: 1,
    enemies: ["goblin", "bandit", "wolf", "skeleton"],
    boss: null, // No boss for starting area
    unlocks: ["emeraldIsland", "castleIronFirst"],
    rewards: {
      goldMultiplier: 1.0,
      xpMultiplier: 1.0
    }
  },
  emeraldIsland: {
    id: "emeraldIsland",
    name: "Emerald Island",
    description: "A mysterious island shrouded in green mist, home to undead creatures.",
    maxWaves: 12,
    baseLevel: 8,
    enemies: ["skeleton", "zombieWarrior", "ghostSpirit", "banshee"],
    boss: "skeletonLord",
    unlocks: ["sweetWater"],
    requirements: ["newSorpigal"], // Must complete this area first
    rewards: {
      goldMultiplier: 1.2,
      xpMultiplier: 1.1
    }
  },
  castleIronFirst: {
    id: "castleIronFirst",
    name: "Castle Ironfist Dungeons",
    description: "Ancient dungeons beneath the great castle, filled with dangerous creatures.",
    maxWaves: 15,
    baseLevel: 12,
    enemies: ["dungeonRat", "goblinShaman", "orc", "minotaur"],
    boss: "ironGolem",
    unlocks: ["freeHaven"],
    requirements: ["newSorpigal"],
    rewards: {
      goldMultiplier: 1.3,
      xpMultiplier: 1.2
    }
  },
  sweetWater: {
    id: "sweetWater",
    name: "Sweet Water",
    description: "A coastal town plagued by sea monsters and pirates.",
    maxWaves: 18,
    baseLevel: 20,
    enemies: ["seaDevil", "pirateRaider", "waterElemental", "kraken"],
    boss: "pirateKing",
    unlocks: ["bootBay"],
    requirements: ["emeraldIsland"],
    rewards: {
      goldMultiplier: 1.5,
      xpMultiplier: 1.3
    }
  }
};

// Enemy Template System
const ENEMY_TEMPLATES = {
  // Basic Enemies
  goblin: {
    id: "goblin",
    baseName: "Goblin",
    type: "humanoid",
    tier: 1,
    hpFormula: (level) => Math.floor(40 + level * 25 + Math.pow(level, 1.2) * 5),
    attackFormula: (level) => Math.floor(3 + level * 1.2),
    goldFormula: (level) => Math.floor(5 + level * 2),
    xpFormula: (level) => Math.floor(15 + level * 8),
    variants: ["Scout", "Warrior", "Chieftain"]
  },
  
  bandit: {
    id: "bandit",
    baseName: "Bandit",
    type: "humanoid",
    tier: 1,
    hpFormula: (level) => Math.floor(45 + level * 28 + Math.pow(level, 1.25) * 6),
    attackFormula: (level) => Math.floor(4 + level * 1.3),
    goldFormula: (level) => Math.floor(8 + level * 3),
    xpFormula: (level) => Math.floor(18 + level * 9),
    variants: ["Thief", "Outlaw", "Captain"]
  },
  
  wolf: {
    id: "wolf",
    baseName: "Wolf",
    type: "beast",
    tier: 1,
    hpFormula: (level) => Math.floor(35 + level * 22 + Math.pow(level, 1.15) * 4),
    attackFormula: (level) => Math.floor(5 + level * 1.4),
    goldFormula: (level) => Math.floor(4 + level * 1.5),
    xpFormula: (level) => Math.floor(12 + level * 7),
    variants: ["Dire Wolf", "Alpha Wolf", "Fenrir"]
  },
  
  skeleton: {
    id: "skeleton",
    baseName: "Skeleton",
    type: "undead",
    tier: 2,
    hpFormula: (level) => Math.floor(50 + level * 30 + Math.pow(level, 1.3) * 7),
    attackFormula: (level) => Math.floor(4 + level * 1.5),
    goldFormula: (level) => Math.floor(6 + level * 2.5),
    xpFormula: (level) => Math.floor(20 + level * 10),
    variants: ["Warrior", "Archer", "Mage"]
  },
  
  // Intermediate Enemies
  zombieWarrior: {
    id: "zombieWarrior",
    baseName: "Zombie Warrior",
    type: "undead",
    tier: 2,
    hpFormula: (level) => Math.floor(80 + level * 45 + Math.pow(level, 1.35) * 10),
    attackFormula: (level) => Math.floor(6 + level * 1.8),
    goldFormula: (level) => Math.floor(12 + level * 4),
    xpFormula: (level) => Math.floor(25 + level * 12),
    variants: ["Corrupted", "Elite", "Champion"]
  },
  
  ghostSpirit: {
    id: "ghostSpirit",
    baseName: "Ghost",
    type: "spirit",
    tier: 2,
    hpFormula: (level) => Math.floor(60 + level * 35 + Math.pow(level, 1.4) * 8),
    attackFormula: (level) => Math.floor(7 + level * 2.0),
    goldFormula: (level) => Math.floor(10 + level * 3.5),
    xpFormula: (level) => Math.floor(22 + level * 11),
    variants: ["Wraith", "Phantom", "Specter"]
  },
  
  orc: {
    id: "orc",
    baseName: "Orc",
    type: "humanoid",
    tier: 2,
    hpFormula: (level) => Math.floor(90 + level * 50 + Math.pow(level, 1.25) * 12),
    attackFormula: (level) => Math.floor(8 + level * 2.2),
    goldFormula: (level) => Math.floor(15 + level * 5),
    xpFormula: (level) => Math.floor(28 + level * 14),
    variants: ["Berserker", "Shaman", "Warlord"]
  },
  
  // Advanced Enemies
  seaDevil: {
    id: "seaDevil",
    baseName: "Sea Devil",
    type: "demon",
    tier: 3,
    hpFormula: (level) => Math.floor(120 + level * 65 + Math.pow(level, 1.5) * 15),
    attackFormula: (level) => Math.floor(12 + level * 2.8),
    goldFormula: (level) => Math.floor(25 + level * 8),
    xpFormula: (level) => Math.floor(40 + level * 18),
    variants: ["Leviathan", "Kraken Spawn", "Abyssal"]
  },
  
  // Boss Enemies
  skeletonLord: {
    id: "skeletonLord",
    baseName: "Skeleton Lord",
    type: "undead",
    tier: "boss",
    isBoss: true,
    hpFormula: (level) => Math.floor(300 + level * 150 + Math.pow(level, 1.6) * 50),
    attackFormula: (level) => Math.floor(15 + level * 4.0),
    goldFormula: (level) => Math.floor(100 + level * 25),
    xpFormula: (level) => Math.floor(150 + level * 50),
    variants: ["Ancient", "Lich King", "Death Knight"]
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
    nextLevelXp: getNextLevelXp(1),
    skills: { weaponMastery: 0, spellpower: 0, vitality: 0, meditation: 0, focus: 0 },
    knownSpells: [...CLASS_STARTING_SPELLS[classKey]],
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
  renderPartyBar();
  setupWaveNew(1);
  beginEnemyAttacks();
  beginAutoAttacks();
  selectCharacter(state.selectedIndex);
  migrateToNewSystem();
  setupKeyboardControls();
}

function renderPartyBar() {
  partyBarRoot.innerHTML = "";
  for (const character of state.party) {
    const classDef = CLASS_DEFS[character.classKey];
    const el = document.createElement("div");
    el.className = "portrait";
    el.setAttribute("data-index", String(character.id));
    el.innerHTML = `
      <div class="face" aria-hidden="true"></div>
      <div class="info">
        <div class="name">Hero ${character.id + 1}</div>
        <div class="class">${classDef.name} • L${character.level} • XP ${character.xp}/${character.nextLevelXp}</div>
        <div class="bars">
          <div class="bar hp"><div class="fill" style="width:${(character.hp / character.maxHp) * 100}%"></div><div class="bar-text">HP ${character.hp} / ${character.maxHp}</div></div>
          <div class="bar mp"><div class="fill" style="width:${character.maxMp === 0 ? 0 : (character.mp / character.maxMp) * 100}%"></div><div class="bar-text">MP ${character.mp} / ${character.maxMp}</div></div>
        </div>
      </div>
    `;
    partyBarRoot.appendChild(el);
  }

  // Open character panel on click
  partyBarRoot.querySelectorAll(".portrait").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = Number(el.getAttribute("data-index"));
      selectCharacter(idx);
    });
  });
}

function updatePartyBars() {
  // Re-render for simplicity
  renderPartyBar();
}

// Wave / Multiple enemies
function setupWaveNew(waveNumber, areaId = null) {
  const currentAreaId = areaId || state.currentAreaId || "newSorpigal";
  const waveData = setupWaveFromArea(currentAreaId, waveNumber);
  
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
  
  renderEnemyList();
  
  return waveData;
}

// Enhanced wave setup using area system
function setupWaveFromArea(areaId, waveNumber) {
  const area = AREAS[areaId];
  if (!area) {
    console.error(`Area not found: ${areaId}`);
    return setupWave(waveNumber); // Fallback to old system
  }
  
  // Check if this is the final wave and has a boss
  const isFinalWave = waveNumber >= area.maxWaves;
  const hasBoss = area.boss && isFinalWave;
  
  // Determine wave configuration
  let waveConfig = WAVE_CONFIGS.standard;
  if (hasBoss) {
    waveConfig = WAVE_CONFIGS.boss;
  } else if (waveNumber % 5 === 0) { // Every 5th wave is a horde
    waveConfig = WAVE_CONFIGS.horde;
  }
  
  // Calculate enemy level
  const enemyLevel = waveConfig.levelProgression(waveNumber, area.baseLevel);
  
  // Generate enemies
  const enemies = [];
  const enemyCount = waveConfig.enemyCount;
  
  if (hasBoss) {
    // Generate boss enemy
    enemies.push(generateEnemyFromTemplate(area.boss, enemyLevel + 3));
  } else {
    // Generate regular enemies
    for (let i = 0; i < enemyCount; i++) {
      let enemyTemplate;
      
      if (waveConfig.enemySelection === "random") {
        enemyTemplate = area.enemies[Math.floor(Math.random() * area.enemies.length)];
      } else if (waveConfig.enemySelection === "sequential") {
        enemyTemplate = area.enemies[i % area.enemies.length];
      } else if (waveConfig.enemySelection === "weighted") {
        // Weighted selection (favor earlier enemies for easier waves)
        const weights = area.enemies.map((_, idx) => Math.max(1, area.enemies.length - idx));
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        let selectedIdx = 0;
        
        for (let j = 0; j < weights.length; j++) {
          random -= weights[j];
          if (random <= 0) {
            selectedIdx = j;
            break;
          }
        }
        enemyTemplate = area.enemies[selectedIdx];
      }
      
      // Add some level variation for variety
      const levelVariation = Math.floor(Math.random() * 3) - 1; // -1, 0, or +1
      const finalLevel = Math.max(1, enemyLevel + levelVariation);
      
      enemies.push(generateEnemyFromTemplate(enemyTemplate, finalLevel));
    }
  }
  
  // Apply area reward multipliers to enemies
  enemies.forEach(enemy => {
    enemy.rewardGold = Math.floor(enemy.rewardGold * area.rewards.goldMultiplier);
    enemy.rewardXp = Math.floor(enemy.rewardXp * area.rewards.xpMultiplier);
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

function renderEnemyList() {
  enemyListEl.innerHTML = "";
  state.enemies.forEach((e, idx) => {
    const row = document.createElement("div");
    row.className = "enemy-row";
    row.setAttribute("data-index", String(idx));
    row.innerHTML = `
      <div class="row-head">
        <div class="enemy-name">${e.name}</div>
        <div class="row-actions">
          <button class="btn small" data-action="focus">Focus</button>
        </div>
      </div>
      <div class="bar hp"><div class="fill" style="width:${(e.hp / e.maxHp) * 100}%"></div><div class="bar-text">${e.hp} / ${e.maxHp}</div></div>
      <div class="click-area">Click to Attack</div>
    `;
    enemyListEl.appendChild(row);
  });

  // Click handlers
  enemyListEl.querySelectorAll(".enemy-row .click-area").forEach((el) => {
    el.addEventListener("click", () => {
      const idx = Number(el.parentElement.getAttribute("data-index"));
      clickAttackEnemy(idx);
    });
  });

  enemyListEl.querySelectorAll(".enemy-row [data-action='focus']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.closest('.enemy-row').getAttribute("data-index"));
      state.focusedEnemyIndex = idx;
    });
  });
}

function generateEnemy(level) {
  const names = ["Goblin", "Bandit", "Wolf", "Skeleton", "Ogre", "Harpy", "Minotaur", "Hydra", "Devilkin"];
  const base = Math.max(1, level);
  const name = `${names[level % names.length]} L${level}`;
  const maxHp = 50 + Math.floor(level * 30 + Math.pow(level, 1.35) * 8);
  const rewardGold = 6 * base + Math.floor(level * 2);
  const rewardXp = 20 + Math.floor(level * 10);
  return { name, maxHp, hp: maxHp, rewardGold, rewardXp };
}

// Generate enemy from template
function generateEnemyFromTemplate(templateId, level, variantIndex = null) {
  const template = ENEMY_TEMPLATES[templateId];
  if (!template) {
    console.error(`Enemy template not found: ${templateId}`);
    return generateEnemy(level); // Fallback to old system
  }
  
  // Calculate stats using formulas
  const maxHp = template.hpFormula(level);
  const attack = template.attackFormula(level);
  const rewardGold = template.goldFormula(level);
  const rewardXp = template.xpFormula(level);
  
  // Choose variant name
  let name = template.baseName;
  if (template.variants && template.variants.length > 0) {
    const variantIdx = variantIndex !== null ? variantIndex : Math.floor(Math.random() * template.variants.length);
    const variant = template.variants[variantIdx];
    name = `${variant} ${template.baseName}`;
  }
  name += ` L${level}`;
  
  return {
    id: templateId,
    name,
    type: template.type,
    tier: template.tier,
    isBoss: template.isBoss || false,
    maxHp,
    hp: maxHp,
    attack,
    rewardGold,
    rewardXp,
    level
  };
}

function computePartySpeed() {
  // Average speed across living party members
  const livingMembers = state.party.filter(c => c.hp > 0);
  if (livingMembers.length === 0) return 0;
  return livingMembers.reduce((sum, c) => sum + c.totalStats.Speed, 0) / livingMembers.length;
}

function computeCriticalChance() {
  // Base crit chance from luck + focus skill bonus
  const totalLuck = state.party.reduce((sum, c) => sum + c.totalStats.Luck, 0);
  const focusBonus = state.party.reduce((sum, c) => sum + c.skills.focus * 0.03, 0);
  const baseCritChance = Math.min(0.5, (totalLuck / 4) / 100 + focusBonus); // Cap at 50%
  return baseCritChance;
}

function isAttackCritical() {
  if (state.guaranteedCrits > 0) {
    state.guaranteedCrits--;
    return true;
  }
  return Math.random() < computeCriticalChance();
}

function computeClickDamage() {
  // Simple: sum Might across party, scaled
  const totalMight = state.party.reduce((sum, c) => sum + c.totalStats.Might, 0);
  const weaponSkillBonus = state.party.reduce((sum, c) => sum + c.skills.weaponMastery * 0.05, 0);
  const base = Math.max(1, Math.floor(totalMight / 6));
  let damage = Math.floor(base * (1 + weaponSkillBonus));
  
  // Check for critical hit
  if (isAttackCritical()) {
    damage = Math.floor(damage * 2.0); // 2x damage on crit
  }
  
  return damage;
}

function computeEnemyAttackDamage() {
  const level = state.enemyLevel;
  return Math.max(1, Math.floor(2 + level * 1.5));
}

// Clicking to attack
function clickAttackEnemy(index) {
  const enemy = state.enemies[index];
  if (!enemy || enemy.hp <= 0) return;
  const dmg = computeClickDamage();
  enemy.hp = Math.max(0, enemy.hp - dmg);
  onEnemyDamaged(index);
}

function onEnemyDamaged(index) {
  const enemy = state.enemies[index];
  const row = enemyListEl.querySelector(`.enemy-row[data-index='${index}']`);
  if (!row) return;
  const pct = Math.max(0, Math.min(100, (enemy.hp / enemy.maxHp) * 100));
  row.querySelector('.bar .fill').setAttribute('style', `width:${pct}%`);
  row.querySelector('.bar .bar-text').textContent = `${enemy.hp} / ${enemy.maxHp}`;
  if (enemy.hp <= 0) {
    state.gold += enemy.rewardGold;
    goldEl.textContent = String(state.gold);
    for (const c of state.party) c.xp += enemy.rewardXp;
    updatePartyBars();
    // Check if all enemies are defeated -> show wave completion menu
    if (state.enemies.every((e) => e.hp <= 0)) {
      showWaveCompleteMenu();
    }
  }
}

// Enemy attacks party over time
function beginEnemyAttacks() {
  stopEnemyAttacks();
  state.enemyAttackTimerId = setInterval(() => {
    const living = state.party.filter((c) => c.hp > 0);
    if (living.length === 0) return;
    const target = living[Math.floor(Math.random() * living.length)];
    const dmg = computeEnemyAttackDamage();
    target.hp = Math.max(0, target.hp - dmg);
    updatePartyBars();
  }, 1500);
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
  const speed = computePartySpeed();
  if (speed <= 0) return;
  
  // Attack interval based on party speed (faster = more frequent attacks)
  // Base interval of 3000ms, reduced by speed
  const interval = Math.max(500, 3000 - (speed * 50));
  
  state.autoAttackTimerId = setInterval(() => {
    // Find a living enemy to attack
    const livingEnemies = state.enemies.filter(e => e.hp > 0);
    if (livingEnemies.length === 0) return;
    
    // Focus on focused enemy, or pick first living enemy
    let targetIndex = state.enemies.findIndex(e => e.hp > 0);
    if (typeof state.focusedEnemyIndex === 'number' && 
        state.enemies[state.focusedEnemyIndex] && 
        state.enemies[state.focusedEnemyIndex].hp > 0) {
      targetIndex = state.focusedEnemyIndex;
    }
    
    if (targetIndex >= 0) {
      const dmg = computeClickDamage();
      const enemy = state.enemies[targetIndex];
      enemy.hp = Math.max(0, enemy.hp - dmg);
      onEnemyDamaged(targetIndex);
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
        isUnlocked: true
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

// Get enemy display info for UI
function getEnemyDisplayInfo(enemy) {
  const template = ENEMY_TEMPLATES[enemy.id];
  
  return {
    name: enemy.name,
    type: enemy.type || 'unknown',
    tier: enemy.tier || 1,
    isBoss: enemy.isBoss || false,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    level: enemy.level,
    // Add visual indicators based on type/tier
    cssClass: `enemy-${enemy.type} tier-${enemy.tier}${enemy.isBoss ? ' boss' : ''}`,
    description: template ? `A ${template.type} creature of tier ${template.tier}` : 'A mysterious creature'
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
      else if (name.includes("wolf")) templateId = "wolf";
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
  stopEnemyAttacks();
  stopAutoAttacks();
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
        <button class="btn large" data-action="rest" ${state.gold < 50 ? "disabled" : ""}>Rest (Full Heal/MP) - 50 Gold</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Add event listeners
  menu.querySelectorAll("[data-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.getAttribute("data-action");
      closeWaveCompleteMenu();
      handleWaveMenuActionNew(action);
    });
  });
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
        <button class="btn large" data-action="rest" ${state.gold < 50 ? "disabled" : ""}>Rest (Full Heal/MP) - 50 Gold</button>
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
        beginEnemyAttacks();
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
    const completedBadge = area.isCompleted ? '<span class="pill completed">✓ Completed</span>' : '';
    return `
      <div class="area-option">
        <div class="area-info">
          <h3>${area.name}</h3>
          <p>${area.description}</p>
          <div class="area-stats">
            <span class="pill">Level ${area.baseLevel}+</span>
            <span class="pill">${area.maxWaves} Waves</span>
            ${completedBadge}
          </div>
        </div>
        <button class="btn" data-action="select-area" data-area="${area.id}">Enter Area</button>
      </div>
    `;
  }).join("");
  
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
  
  menu.querySelectorAll("[data-action='select-area']").forEach(btn => {
    btn.addEventListener("click", () => {
      const areaId = btn.getAttribute("data-area");
      closeAreaSelectionMenu();
      
      // Start in the selected area
      state.currentAreaId = areaId;
      state.currentWave = 1;
      setupWaveNew(1);
      beginEnemyAttacks();
      beginAutoAttacks();
    });
  });
  
  menu.querySelector("[data-action='cancel']").addEventListener("click", () => {
    closeAreaSelectionMenu();
    showWaveCompleteMenu(); // Return to previous menu
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
      beginEnemyAttacks();
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
      
      setupWaveNew(nextWave);
      beginEnemyAttacks();
      beginAutoAttacks();
      break;
      
    case "upgrade-skills":
      showSkillsMenu();
      break;
      
    case "buy-spells":
      showSpellShopMenu();
      break;
      
    case "rest":
      if (state.gold >= 50) {
        state.gold -= 50;
        goldEl.textContent = String(state.gold);
        for (const c of state.party) {
          c.hp = c.maxHp;
          c.mp = c.maxMp;
        }
        updatePartyBars();
        renderSidebar();
      }
      showWaveCompleteMenu();
      break;
      
    case "change-area":
      showAreaSelectionMenu();
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
    const classDef = CLASS_DEFS[character.classKey];
    
    const skillRows = Object.values(SKILL_DEFS).map((sk) => {
      const rank = character.skills[sk.key] || 0;
      const cost = getSkillUpgradeCost(sk.baseCost, rank);
      const disabled = state.gold < cost ? "disabled" : "";
      return `
        <div class="skill-row">
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
        ${skillRows}
      </div>
    `;
  }
  
  menu.innerHTML = `
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Upgrade Skills</h2>
        <span class="pill">Gold: ${state.gold}</span>
      </div>
      <div class="skills-content">
        ${skillsContent}
      </div>
      <div class="modal-footer">
        <button class="btn" data-action="return">Return</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(menu);
  
  // Add event listeners
  menu.querySelectorAll("[data-action='upgrade-skill']").forEach(btn => {
    btn.addEventListener("click", () => {
      const characterIndex = parseInt(btn.getAttribute("data-character"));
      const skillKey = btn.getAttribute("data-skill");
      upgradeCharacterSkill(characterIndex, skillKey);
      closeSkillsMenu();
      showSkillsMenu(); // Refresh the menu
    });
  });
  
  menu.querySelector("[data-action='return']").addEventListener("click", () => {
    closeSkillsMenu();
    showWaveCompleteMenu(); // Return to wave completion menu
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
    
    if (skillKey === "vitality" || skillKey === "meditation") {
      // Recompute derived maxima
      const beforeHp = character.maxHp;
      const beforeMp = character.maxMp;
      computeTotals(character);
      // Apply skill multipliers to maxima
      applySkillDerivedBonuses(character);
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
function showSpellShopMenu() {
  const menu = document.createElement("div");
  menu.id = "spell-shop-menu";
  menu.className = "modal-overlay";
  
  let spellsContent = "";
  for (let i = 0; i < state.party.length; i++) {
    const character = state.party[i];
    const classDef = CLASS_DEFS[character.classKey];
    
    const availableSpells = Object.values(SPELL_DEFS).filter(spell => 
      !character.knownSpells.includes(spell.key)
    );
    
    let spellRows = "";
    if (availableSpells.length > 0) {
      spellRows = availableSpells.map((spell) => {
        const disabled = state.gold < spell.cost ? "disabled" : "";
        return `
          <div class="spell-row">
            <div class="spell-info">
              <div class="spell-name">${spell.name}</div>
              <div class="spell-desc">MP Cost: ${spell.mpCost} • Type: ${spell.type} • Cost: ${spell.cost} gold</div>
            </div>
            <button class="btn small" data-action="buy-spell" data-character="${i}" data-spell="${spell.key}" ${disabled}>Buy</button>
          </div>
        `;
      }).join("");
    } else {
      spellRows = '<div class="hint">All spells learned!</div>';
    }
    
    spellsContent += `
      <div class="character-section">
        <h3>Hero ${i + 1} • ${classDef.name}</h3>
        <div class="known-spells">
          <strong>Known Spells:</strong> ${character.knownSpells.length > 0 ? 
            character.knownSpells.map(key => SPELL_DEFS[key].name).join(", ") : 
            "None"}
        </div>
        <div class="available-spells">
          ${spellRows}
        </div>
      </div>
    `;
  }
  
  menu.innerHTML = `
    <div class="modal-content large">
      <div class="modal-header">
        <h2>Buy Spells</h2>
        <span class="pill">Gold: ${state.gold}</span>
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
      buySpellForCharacter(characterIndex, spellKey);
      closeSpellShopMenu();
      showSpellShopMenu(); // Refresh the menu
    });
  });
  
  menu.querySelector("[data-action='return']").addEventListener("click", () => {
    closeSpellShopMenu();
    showWaveCompleteMenu(); // Return to wave completion menu
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
  
  if (state.gold >= spell.cost && !character.knownSpells.includes(spellKey)) {
    state.gold -= spell.cost;
    goldEl.textContent = String(state.gold);
    character.knownSpells.push(spellKey);
    renderSidebar();
  }
}

// Controls

document.getElementById("next-enemy").addEventListener("click", () => {
  setupWaveNew(state.enemyLevel + 1);
});

// Keyboard controls for character selection
function setupKeyboardControls() {
  document.addEventListener("keydown", (e) => {
    // Only handle number keys 1-4 during gameplay
    if (gameScreen.classList.contains("hidden")) return;
    
    const key = e.key;
    if (key >= "1" && key <= "4") {
      const characterIndex = parseInt(key) - 1;
      if (characterIndex < state.party.length) {
        selectCharacter(characterIndex);
        e.preventDefault(); // Prevent any default behavior
      }
    }
  });
}

// Initialization
function init() {
  // Initialize a default party of 4 random classes for variety
  state.party = Array.from({ length: PARTY_SIZE }, (_, i) => createCharacter(i, randomClassKey()));
  state.selectedIndex = 0;
  renderCreator();
}

init();

// Sidebar Character Info & Leveling / Skills / Spells
function getNextLevelXp(level) {
  return 100 * level;
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
  const skills = character.skills;
  const spells = character.knownSpells;

  const skillRows = Object.values(SKILL_DEFS).map((sk) => {
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

  const spellRows = spells.map((key) => {
    const s = SPELL_DEFS[key];
    const disabled = character.mp < s.mpCost ? "disabled" : "";
    return `
      <button class="btn" data-action="cast-spell" data-spell="${s.key}" ${disabled}>${s.name} (MP ${s.mpCost})</button>
    `;
  }).join("");

  const critChance = Math.round(computeCriticalChance() * 100);
  const partySpeed = Math.round(computePartySpeed());
  
  sidebarEl.innerHTML = `
    <div class="header">
      <div class="title">Hero ${character.id + 1} • ${classDef.name} • L${character.level}</div>
      <span class="pill">Gold: ${state.gold}</span>
    </div>
    <div class="section">
      <h3>Overview</h3>
      <div class="kv"><div>XP</div><div>${character.xp} / ${character.nextLevelXp}</div></div>
      <div class="kv"><div>HP</div><div>${character.hp} / ${character.maxHp}</div></div>
      <div class="kv"><div>MP</div><div>${character.mp} / ${character.maxMp}</div></div>
      <div style="margin-top:8px; display:flex; gap:8px;">
        <button class="btn" id="level-up" ${canLevel ? "" : "disabled"}>Level Up</button>
      </div>
    </div>

    <div class="section">
      <h3>Combat Stats</h3>
      <div class="kv"><div>Crit Chance</div><div>${critChance}%</div></div>
      <div class="kv"><div>Party Speed</div><div>${partySpeed}</div></div>
      ${state.guaranteedCrits > 0 ? `<div class="kv"><div>Blessed Hits</div><div style="color: var(--accent);">${state.guaranteedCrits}</div></div>` : ''}
    </div>

    <div class="section">
      <h3>Spells</h3>
      <div class="grid-2">${spellRows || '<div class="hint">No spells known</div>'}</div>
    </div>

    <div class="section">
      <h3>Stats</h3>
      ${ATTRIBUTE_KEYS.map((k) => `<div class="kv"><div>${k}</div><div>${character.totalStats[k]}</div></div>`).join("")}
    </div>
  `;

  const levelBtn = document.getElementById("level-up");
  if (levelBtn) {
    levelBtn.addEventListener("click", () => {
      if (character.xp >= character.nextLevelXp) {
        character.xp -= character.nextLevelXp;
        character.level += 1;
        character.nextLevelXp = getNextLevelXp(character.level);
        applyLevelGains(character);
        computeTotals(character);
        character.hp = character.maxHp;
        character.mp = character.maxMp;
        updatePartyBars();
        renderSidebar();
      }
    });
  }



  sidebarEl.querySelectorAll("[data-action='cast-spell']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const spellKey = btn.getAttribute("data-spell");
      castSpell(character, spellKey);
      renderSidebar();
    });
  });
}

function getSkillUpgradeCost(base, rank) {
  return base * (rank + 1);
}

function applyLevelGains(character) {
  const gains = LEVEL_UP_GAINS[character.classKey];
  for (const [k, v] of Object.entries(gains)) {
    character.baseStats[k] += v;
  }
  computeTotals(character);
  applySkillDerivedBonuses(character);
}

function applySkillDerivedBonuses(character) {
  // Apply Vitality and Meditation percentage bonuses to max stats
  const vit = character.skills.vitality || 0;
  const med = character.skills.meditation || 0;
  const vitMult = 1 + vit * 0.05;
  const medMult = 1 + med * 0.05;
  const natural = computeMaxHpMp(character.classKey, character.totalStats);
  character.maxHp = Math.floor(natural.hp * vitMult);
  character.maxMp = Math.floor(natural.mp * medMult);
}

function castSpell(character, spellKey) {
  const spell = SPELL_DEFS[spellKey];
  if (!spell) return;
  if (character.mp < spell.mpCost) return;
  character.mp -= spell.mpCost;
  const sp = character.skills.spellpower || 0;
  const spMult = 1 + sp * 0.05;

  if (spell.type === "damage") {
    let power;
    let targetAll = false;
    
    switch (spellKey) {
      case "fireBolt":
        power = 10 + Math.floor(character.totalStats.Intellect * 0.8 * spMult);
        break;
      case "lightning":
        power = 15 + Math.floor(character.totalStats.Intellect * 1.0 * spMult);
        break;
      case "meteor":
        power = 25 + Math.floor(character.totalStats.Intellect * 1.5 * spMult);
        targetAll = true;
        break;
      default:
        power = 10 + Math.floor(character.totalStats.Intellect * 0.8 * spMult);
    }
    
    if (targetAll) {
      // Meteor hits all enemies
      state.enemies.forEach((enemy, idx) => {
        if (enemy.hp > 0) {
          enemy.hp = Math.max(0, enemy.hp - power);
          onEnemyDamaged(idx);
        }
      });
    } else {
      // Single target damage
      let idx = typeof state.focusedEnemyIndex === 'number' ? state.focusedEnemyIndex : 0;
      if (!state.enemies || state.enemies.length === 0) return;
      if (!state.enemies[idx] || state.enemies[idx].hp <= 0) {
        idx = state.enemies.findIndex(e => e.hp > 0);
        state.focusedEnemyIndex = idx;
      }
      if (idx >= 0) {
        const enemy = state.enemies[idx];
        enemy.hp = Math.max(0, enemy.hp - power);
        onEnemyDamaged(idx);
      }
    }
  } else if (spell.type === "heal") {
    let amount;
    let targetAll = false;
    
    switch (spellKey) {
      case "heal":
        amount = 10 + Math.floor(character.totalStats.Personality * 0.6 * spMult);
        break;
      case "cure":
        amount = 20 + Math.floor(character.totalStats.Personality * 1.0 * spMult);
        targetAll = true;
        break;
      default:
        amount = 10 + Math.floor(character.totalStats.Personality * 0.6 * spMult);
    }
    
    if (targetAll) {
      // Cure All heals entire party
      state.party.forEach(member => {
        member.hp = Math.min(member.maxHp, member.hp + amount);
      });
    } else {
      // Single target heal (lowest % hp ally)
      const target = [...state.party].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0] || character;
      target.hp = Math.min(target.maxHp, target.hp + amount);
    }
    updatePartyBars();
  } else if (spell.type === "buff") {
    if (spellKey === "shield") {
      // Magic Shield - restore some MP to the caster
      const restore = 5 + Math.floor(character.totalStats.Intellect * 0.3 * spMult);
      character.mp = Math.min(character.maxMp, character.mp + restore);
      updatePartyBars();
    } else if (spellKey === "bless") {
      // Bless - guarantee next attacks are critical
      const spellpowerRank = character.skills.spellpower || 0;
      const guaranteedCrits = Math.min(10, 1 + spellpowerRank); // 1 base + spellpower rank, max 10
      state.guaranteedCrits += guaranteedCrits;
    }
  }
}



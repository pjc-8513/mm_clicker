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
  paladin: ["heal"],
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
  setupWave(1);
  beginEnemyAttacks();
  beginAutoAttacks();
  selectCharacter(state.selectedIndex);
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
function setupWave(number) {
  waveNumberEl.textContent = String(number);
  areaNameEl.textContent = "New Sorpigal Outskirts";
  state.enemyLevel = number;
  const enemies = Array.from({ length: 4 }).map((_, i) => generateEnemy(number + i));
  state.enemies = enemies; // add to state dynamically
  renderEnemyList();
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
      handleWaveMenuAction(action);
    });
  });
}

function closeWaveCompleteMenu() {
  const menu = document.getElementById("wave-complete-menu");
  if (menu) {
    menu.remove();
  }
}

function handleWaveMenuAction(action) {
  switch (action) {
    case "repeat-wave":
      setupWave(state.enemyLevel);
      beginEnemyAttacks();
      beginAutoAttacks();
      break;
    case "next-wave":
      setupWave(state.enemyLevel + 1);
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
      showWaveCompleteMenu(); // Show the menu again with updated gold
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
  setupWave(state.enemyLevel + 1);
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



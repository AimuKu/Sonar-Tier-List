// ===========================
// API CONFIG
// ===========================
console.log("SCRIPT LOADED");

const API_URL = "https://tier-api.onrender.com";

// ===========================
// DEBUG MODE
// ===========================
const DEBUG = false;

// ===========================
// DATABASE
// ===========================
async function getPlayers() {
    try {
        const res = await fetch(`${API_URL}/players`);
        const data = await res.json();

        if (DEBUG) {
            Object.assign(data, {
                Debug_HT1: mkPlayer("HT1"),
                Debug_HT2: mkPlayer("HT2"),
                Debug_HT3: mkPlayer("HT3"),
                Debug_LT1: mkPlayer("LT1"),
                Debug_LT2: mkPlayer("LT2"),
                Debug_LT3: mkPlayer("LT3"),
                Debug_Unranked_1: { sword: "HT1", axe: null, spearMace: null, elytraMace: null, crystal: null },
                Debug_Unranked_2: { sword: "HT1", axe: "HT2", spearMace: "HT3", elytraMace: null, crystal: null }
            });
        }

        return data;
    } catch (err) {
        console.error("Failed to fetch players:", err);
        return {};
    }
}

function mkPlayer(tier) {
    return { sword: tier, axe: tier, spearMace: tier, elytraMace: tier, crystal: tier };
}

// ===========================
// HEADS
// ===========================
const STEVE = "https://minotar.net/avatar/steve/64";
const getHead = (name) => `https://minotar.net/avatar/${name}/64`;

// ===========================
// KIT SCORES (HT1=6 → LT3=1)
// ===========================
const KIT_SCORE = { HT1: 6, HT2: 5, HT3: 4, LT1: 3, LT2: 2, LT3: 1 };

// ===========================
// OVERALL RANK (? → S+)
// ===========================
function getOverallRank(p) {
    const kits = [p.sword, p.axe, p.spearMace, p.elytraMace, p.crystal];

    if (kits.some(k => !k)) return "?";

    const avg = kits.reduce((a, b) => a + KIT_SCORE[b], 0) / kits.length;

    if (avg >= 6)   return "S+";
    if (avg >= 5)   return "S";
    if (avg >= 4)   return "A";
    if (avg >= 3)   return "B";
    if (avg >= 2.5) return "C";
    if (avg >= 1.5) return "D";
    if (avg >= 1)   return "E";
    return "F";
}

// ===========================
// OVERALL ORDER
// ===========================
const OVERALL_ORDER = { "S+": 9, "S": 8, "A": 7, "B": 6, "C": 5, "D": 4, "E": 3, "F": 2, "?": 1 };

// ===========================
// TEST COUNT
// ===========================
function getTestedCount(p) {
    return [p.sword, p.axe, p.spearMace, p.elytraMace, p.crystal].filter(Boolean).length;
}

// ===========================
// KIT BADGE HTML
// ===========================
const KIT_LABELS = {
    sword:      { label: "Sword",       icon: "⚔️" },
    axe:        { label: "Axe",         icon: "🪓" },
    spearMace:  { label: "Spear/Mace",  icon: "🔱" },
    elytraMace: { label: "Elytra",      icon: "🦅" },
    crystal:    { label: "Crystal",     icon: "💎" }
};

function kitBadge(rank) {
    if (!rank) return `<span class="kit-badge unranked">—</span>`;
    return `<span class="kit-badge ${rank.toLowerCase()}">${rank}</span>`;
}

// ===========================
// LEADERBOARD
// ===========================
async function loadLeaderboard() {
    const players = await getPlayers();
    const container = document.getElementById("leaderboardContainer");
    const count = document.getElementById("rankedPlayersCount");

    if (!container) return;

    const sorted = Object.entries(players)
        .map(([name, p]) => {
            const overall = getOverallRank(p);
            const score = [p.sword, p.axe, p.spearMace, p.elytraMace, p.crystal]
                .reduce((t, k) => t + (KIT_SCORE[k] || 0), 0);
            return { name, p, overall, score, tested: getTestedCount(p) };
        })
        .sort((a, b) => {
            if (OVERALL_ORDER[b.overall] !== OVERALL_ORDER[a.overall])
                return OVERALL_ORDER[b.overall] - OVERALL_ORDER[a.overall];
            if (b.score !== a.score) return b.score - a.score;
            if (b.tested !== a.tested) return b.tested - a.tested;
            return a.name.localeCompare(b.name);
        });

    count.textContent = sorted.filter(p => p.overall !== "?").length;

    container.innerHTML = sorted.map((p, i) => `
        <div class="lb-card">
            <div class="lb-rank">#${i + 1}</div>

            <img class="lb-head"
                src="${getHead(p.name)}"
                onerror="this.src='${STEVE}'">

            <div class="lb-info">
                <div class="lb-name">${p.name}</div>
                <div class="lb-kits">
                    ${Object.keys(KIT_LABELS).map(kit => `
                        <span class="lb-kit-wrap" title="${KIT_LABELS[kit].label}">
                            <span class="lb-kit-icon">${KIT_LABELS[kit].icon}</span>
                            ${kitBadge(p.p[kit])}
                        </span>
                    `).join("")}
                </div>
            </div>

            <div class="lb-overall overall-${p.overall.toLowerCase().replace("+", "plus").replace("?", "unknown")}">
                ${p.overall}
            </div>
        </div>
    `).join("");
}

// ===========================
// SCROLL BUTTONS
// ===========================
function scrollToLeaderboard() {
    document.getElementById("leaderboard").scrollIntoView({ behavior: "smooth" });
}

function scrollToPlayers() {
    document.getElementById("players").scrollIntoView({ behavior: "smooth" });
}

// ===========================
// CACHED PLAYERS FOR SEARCH
// ===========================
let cachedPlayers = {};

async function ensurePlayers() {
    if (Object.keys(cachedPlayers).length === 0) {
        cachedPlayers = await getPlayers();
    }
    return cachedPlayers;
}

// ===========================
// AUTOCOMPLETE
// ===========================
async function showSuggestions() {
    const input = document.getElementById("playerInput").value.trim().toLowerCase();
    const box = document.getElementById("suggestions");
    box.innerHTML = "";
    if (!input) return;

    const players = await ensurePlayers();
    const matches = Object.keys(players).filter(name =>
        name.toLowerCase().includes(input)
    ).slice(0, 6);

    if (matches.length === 0) return;

    box.innerHTML = matches.map(name => `
        <div class="suggestion-item" onclick="selectSuggestion('${name}')">
            <img src="${getHead(name)}" onerror="this.src='${STEVE}'"
                style="width:20px;height:20px;border-radius:4px;vertical-align:middle;margin-right:8px;">
            ${name}
        </div>
    `).join("");
}

function selectSuggestion(name) {
    document.getElementById("playerInput").value = name;
    document.getElementById("suggestions").innerHTML = "";
    searchPlayer();
}

// ===========================
// SEARCH PLAYER
// ===========================
async function searchPlayer() {
    const input = document.getElementById("playerInput").value.trim();
    const result = document.getElementById("searchResult");
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";

    if (!input) {
        result.innerHTML = `<p style="color:#666">Enter a username to search.</p>`;
        return;
    }

    result.innerHTML = `<p style="color:#666">Searching...</p>`;
    const players = await ensurePlayers();

    const key = Object.keys(players).find(
        name => name.toLowerCase() === input.toLowerCase()
    );

    if (!key) {
        result.innerHTML = `<p style="color:#ff3b30">Player <strong>${input}</strong> not found.</p>`;
        return;
    }

    const p = players[key];
    const overall = getOverallRank(p);
    const overallClass = "overall-" + overall.toLowerCase().replace("+", "plus").replace("?", "unknown");

    const kitsHTML = Object.entries(KIT_LABELS).map(([kit, { label, icon }]) => {
        const rank = p[kit];
        return `
            <div class="search-kit-row">
                <span class="search-kit-label">${icon} ${label}</span>
                ${kitBadge(rank)}
            </div>
        `;
    }).join("");

    result.innerHTML = `
        <div class="search-card">
            <div class="search-card-header">
                <img src="${getHead(key)}" onerror="this.src='${STEVE}'" class="search-head">
                <div>
                    <div class="search-name">${key}</div>
                    <span class="overall-badge ${overallClass}">${overall}</span>
                </div>
            </div>
            <div class="search-kits">${kitsHTML}</div>
        </div>
    `;
}

// ===========================
// INIT
// ===========================
console.log("INIT OK");
loadLeaderboard();


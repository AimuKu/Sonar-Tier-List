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
                Debug_Unranked_1: {
                    sword: "HT1",
                    axe: null,
                    spearMace: null,
                    elytraMace: null,
                    crystal: null
                },
                Debug_Unranked_2: {
                    sword: "HT1",
                    axe: "HT2",
                    spearMace: "HT3",
                    elytraMace: null,
                    crystal: null
                }
            });
        }

        return data;

    } catch (err) {
        console.error("Failed to fetch players:", err);
        return {};
    }
}

function mkPlayer(tier) {
    return {
        sword: tier,
        axe: tier,
        spearMace: tier,
        elytraMace: tier,
        crystal: tier
    };
}

// ===========================
// HEADS
// ===========================
const STEVE = "https://minotar.net/avatar/steve/64";
const getHead = (name) => `https://minotar.net/avatar/${name}/64`;

// ===========================
// TIER SYSTEM
// ===========================
const SCORE = {
    HT1: 6,
    HT2: 5,
    HT3: 4,
    LT1: 3,
    LT2: 2,
    LT3: 1
};

// ===========================
// OVERALL RANK
// ===========================
function getOverallRank(p) {
    const kits = [p.sword, p.axe, p.spearMace, p.elytraMace, p.crystal];

    if (kits.some(k => !k)) return "UNRANKED";

    const avg = Math.round(
        kits.reduce((a, b) => a + SCORE[b], 0) / kits.length
    );

    return Object.keys(SCORE).find(k => SCORE[k] === avg) || "UNRANKED";
}

// ===========================
// TEST COUNT
// ===========================
function getTestedCount(p) {
    return [p.sword, p.axe, p.spearMace, p.elytraMace, p.crystal]
        .filter(Boolean).length;
}

// ===========================
// LEADERBOARD
// ===========================
async function loadLeaderboard() {
    const players = await getPlayers();

    const container = document.getElementById("leaderboardContainer");
    const count = document.getElementById("rankedPlayersCount");

    if (!container) return;

    container.innerHTML = "";

    const sorted = Object.entries(players)
        .map(([name, p]) => {
            const kits = [p.sword, p.axe, p.spearMace, p.elytraMace, p.crystal];
            const overall = getOverallRank(p);
            const score = kits.reduce((t, k) => t + (SCORE[k] || 0), 0);
            return { name, overall, score, tested: getTestedCount(p) };
        })
        .sort((a, b) => {
            const tierOrder = { HT1: 6, HT2: 5, HT3: 4, LT1: 3, LT2: 2, LT3: 1, UNRANKED: 0 };
            if (tierOrder[b.overall] !== tierOrder[a.overall]) return tierOrder[b.overall] - tierOrder[a.overall];
            if (b.score !== a.score) return b.score - a.score;
            if (b.tested !== a.tested) return b.tested - a.tested;
            return a.name.localeCompare(b.name);
        });

    count.textContent = sorted.filter(p => p.overall !== "UNRANKED").length;

    container.innerHTML = sorted.map((p, i) => `
        <div class="row">
            <div class="rank">#${i + 1}</div>
            <div class="player-info">
                <img class="player-head"
                    src="${getHead(p.name)}"
                    onerror="this.src='${STEVE}'">
                ${p.name}
            </div>
            <div>
                <span class="tier-badge ${p.overall.toLowerCase()}">
                    ${p.overall}
                </span>
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

    // Case-insensitive match
    const key = Object.keys(players).find(
        name => name.toLowerCase() === input.toLowerCase()
    );

    if (!key) {
        result.innerHTML = `<p style="color:#ff3b30">Player <strong>${input}</strong> not found.</p>`;
        return;
    }

    const p = players[key];
    const overall = getOverallRank(p);

    const kitLabels = {
        sword: "Sword",
        axe: "Axe",
        spearMace: "Spear / Mace",
        elytraMace: "Elytra Mace",
        crystal: "Crystal"
    };

    const kitsHTML = Object.entries(kitLabels).map(([kit, label]) => {
        const rank = p[kit];
        const badgeClass = rank ? rank.toLowerCase() : "unranked";
        const badgeText = rank || "—";
        return `
            <div style="display:flex;justify-content:space-between;align-items:center;
                padding:10px 0;border-bottom:1px solid #1a1a1a;">
                <span style="color:#aaa">${label}</span>
                <span class="tier-badge ${badgeClass}">${badgeText}</span>
            </div>
        `;
    }).join("");

    result.innerHTML = `
        <div style="display:inline-block;background:#171717;border:1px solid #222;
            border-radius:16px;padding:28px;min-width:300px;text-align:left;">

            <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px;">
                <img src="${getHead(key)}" onerror="this.src='${STEVE}'"
                    style="width:52px;height:52px;border-radius:10px;">
                <div>
                    <div style="font-size:1.2rem;font-weight:700">${key}</div>
                    <span class="tier-badge ${overall.toLowerCase()}" style="margin-top:4px">
                        ${overall}
                    </span>
                </div>
            </div>

            ${kitsHTML}
        </div>
    `;
}

// ===========================
// INIT
// ===========================
console.log("INIT OK");
loadLeaderboard();


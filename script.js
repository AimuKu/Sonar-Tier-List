// ===========================
// API CONFIG
// ===========================

const API_URL = "https://tier-api.onrender.com";

// ===========================
// DATABASE (NOW ONLINE)
// ===========================

async function getPlayers() {
    try {
        const res = await fetch(`${API_URL}/players`);
        return await res.json();
    } catch (err) {
        console.error("Failed to fetch players:", err);
        return {};
    }
}

// ❌ no more localStorage save (handled by Minecraft/API)
function savePlayers() {
    console.warn("Save is handled by API (Skript / server)");
}

// ===========================
// HEADS
// ===========================

const STEVE = "https://minotar.net/avatar/steve/64";

function getHead(name) {
    return `https://minotar.net/avatar/${name}/64`;
}

// ===========================
// OVERALL RANK SYSTEM
// ===========================

function getOverallRank(p) {

    const scores = {
        HT1: 6,
        HT2: 5,
        HT3: 4,
        LT1: 3,
        LT2: 2,
        LT3: 1
    };

    const kits = [
        p.sword,
        p.axe,
        p.spearMace,
        p.elytraMace,
        p.crystal
    ];

    let filled = 0;
    let total = 0;

    for (const rank of kits) {
        if (rank && scores[rank]) filled++;
    }

    // ❗ not fully tested
    if (filled < kits.length) {
        return "UNRANKED";
    }

    for (const rank of kits) {
        total += scores[rank];
    }

    const avg = Math.round(total / kits.length);

    const tiers = {
        6: "HT1",
        5: "HT2",
        4: "HT3",
        3: "LT1",
        2: "LT2",
        1: "LT3"
    };

    return tiers[avg] || "UNRANKED";
}

// ===========================
// LEADERBOARD
// ===========================

async function loadLeaderboard() {

    const players = await getPlayers();

    const container = document.getElementById("leaderboardContainer");
    const count = document.getElementById("rankedPlayersCount");

    const names = Object.keys(players);

    count.textContent = names.length;
    container.innerHTML = "";

    names.forEach((name, i) => {

        const p = players[name];
        const overall = getOverallRank(p);

        container.innerHTML += `
        <div class="row">

            <div class="rank">#${i + 1}</div>

            <div class="player-info">
                <img class="player-head"
                     src="${getHead(name)}"
                     onerror="this.src='${STEVE}'">
                ${name}
            </div>

            <div>
                <span class="tier-badge ${overall.toLowerCase()}">
                    ${overall}
                </span>
            </div>

        </div>`;
    });
}

// ===========================
// SEARCH PLAYER
// ===========================

async function searchPlayer() {

    const players = await getPlayers();

    const input = document.getElementById("playerInput").value.trim().toLowerCase();
    const result = document.getElementById("searchResult");

    const matchKey = Object.keys(players).find(name =>
        name.toLowerCase().includes(input)
    );

    if (!matchKey) {
        result.innerHTML = `
            <h2>${input}</h2>
            <br>
            <span style="color:#ff6a00;">No player found.</span>
        `;
        return;
    }

    const p = players[matchKey];
    const overall = getOverallRank(p);

    result.innerHTML = `
        <div class="player-info" style="justify-content:center;">
            <img class="player-head"
                 src="${getHead(matchKey)}"
                 onerror="this.src='${STEVE}'">
            <h2>${matchKey}</h2>
        </div>

        <br><br>

        Overall: <span class="tier-badge ${overall.toLowerCase()}">${overall}</span><br><br>

        Sword: ${p.sword || "UNTESTED"}<br>
        Axe: ${p.axe || "UNTESTED"}<br>
        SpearMace: ${p.spearMace || "UNTESTED"}<br>
        ElytraMace: ${p.elytraMace || "UNTESTED"}<br>
        Crystal: ${p.crystal || "UNTESTED"}
    `;
}

// ===========================
// AUTOCOMPLETE
// ===========================

async function showSuggestions() {

    const players = await getPlayers();

    const input = document.getElementById("playerInput").value.toLowerCase();
    const box = document.getElementById("suggestions");

    if (!input) {
        box.innerHTML = "";
        return;
    }

    const matches = Object.keys(players)
        .filter(name => name.toLowerCase().includes(input))
        .slice(0, 6);

    box.innerHTML = matches.map(name => `
        <div class="suggestion-item" onclick="selectPlayer('${name}')">
            ${name}
        </div>
    `).join("");
}

function selectPlayer(name) {
    document.getElementById("playerInput").value = name;
    document.getElementById("suggestions").innerHTML = "";
    searchPlayer();
}

// ===========================
// SCROLL
// ===========================

function scrollToLeaderboard() {
    document.getElementById("leaderboard")
        .scrollIntoView({ behavior: "smooth" });
}

function scrollToPlayers() {
    document.getElementById("players")
        .scrollIntoView({ behavior: "smooth" });
}

// ===========================
// INIT
// ===========================

loadLeaderboard();

// ===========================
// API CONFIG
// ===========================
console.log("SCRIPT LOADED");


const API_URL = "https://tier-api.onrender.com";

// ===========================
// DATABASE
// ===========================

async function getPlayers() {
    try {
        const res = await fetch(`${API_URL}/players`);
        const data = await res.json();

        // DEBUG PLAYERS
        data["Debug_HT1"] = {
            sword: "HT1",
            axe: "HT1",
            spearMace: "HT1",
            elytraMace: "HT1",
            crystal: "HT1"
        };

        data["Debug_HT2"] = {
            sword: "HT2",
            axe: "HT2",
            spearMace: "HT2",
            elytraMace: "HT2",
            crystal: "HT2"
        };

        data["Debug_HT3"] = {
            sword: "HT3",
            axe: "HT3",
            spearMace: "HT3",
            elytraMace: "HT3",
            crystal: "HT3"
        };

        data["Debug_LT1"] = {
            sword: "LT1",
            axe: "LT1",
            spearMace: "LT1",
            elytraMace: "LT1",
            crystal: "LT1"
        };

        data["Debug_LT2"] = {
            sword: "LT2",
            axe: "LT2",
            spearMace: "LT2",
            elytraMace: "LT2",
            crystal: "LT2"
        };

        data["Debug_LT3"] = {
            sword: "LT3",
            axe: "LT3",
            spearMace: "LT3",
            elytraMace: "LT3",
            crystal: "LT3"
        };

        data["Debug_Unranked_1"] = {
            sword: "HT1",
            axe: null,
            spearMace: null,
            elytraMace: null,
            crystal: null
        };

        data["Debug_Unranked_2"] = {
            sword: "HT1",
            axe: "HT2",
            spearMace: "HT3",
            elytraMace: null,
            crystal: null
        };

        return data;

    } catch (err) {
        console.error("Failed to fetch players:", err);
        return {};
    }
}

function savePlayers() {
    console.warn("Save is handled by API");
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
        if (rank && scores[rank]) {
            filled++;
        }
    }

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
// TEST PROGRESS
// ===========================

function getTestedCount(player) {

    const kits = [
        player.sword,
        player.axe,
        player.spearMace,
        player.elytraMace,
        player.crystal
    ];

    return kits.filter(k => k).length;
}

// ===========================
// LEADERBOARD
// ===========================

async function loadLeaderboard() {

    const players = await getPlayers();

    const container = document.getElementById("leaderboardContainer");
    const count = document.getElementById("rankedPlayersCount");

    container.innerHTML = "";

    const scores = {
        HT1: 6,
        HT2: 5,
        HT3: 4,
        LT1: 3,
        LT2: 2,
        LT3: 1
    };

    const sorted = Object.entries(players)
        .map(([name, p]) => {

            const overall = getOverallRank(p);

            let score = 0;

            if (overall !== "UNRANKED") {

                const kits = [
                    p.sword,
                    p.axe,
                    p.spearMace,
                    p.elytraMace,
                    p.crystal
                ];

                score = kits.reduce((total, kit) => {
                    return total + (scores[kit] || 0);
                }, 0);
            }

            return {
                name,
                player: p,
                overall,
                score,
                tested: getTestedCount(p)
            };
        })
        .sort((a, b) => {

    const tierOrder = {
        HT1: 6,
        HT2: 5,
        HT3: 4,
        LT1: 3,
        LT2: 2,
        LT3: 1,
        UNRANKED: 0
    };

    if (tierOrder[b.overall] !== tierOrder[a.overall]) {
        return tierOrder[b.overall] - tierOrder[a.overall];
    }

    if (b.score !== a.score) {
        return b.score - a.score;
    }

    if (b.tested !== a.tested) {
        return b.tested - a.tested;
    }

    return a.name.localeCompare(b.name);
});

    const rankedCount = sorted.filter(
        p => p.overall !== "UNRANKED"
    ).length;

    count.textContent = rankedCount;

    sorted.forEach((entry, i) => {

        container.innerHTML += `
        <div class="row">

            <div class="rank">#${i + 1}</div>

            <div class="player-info">
                <img class="player-head"
                     src="${getHead(entry.name)}"
                     onerror="this.src='${STEVE}'">

                ${entry.name}
            </div>

            <div>
                <span class="tier-badge ${entry.overall.toLowerCase()}">
                    ${entry.overall}
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

    const input = document.getElementById("playerInput")
        .value
        .trim()
        .toLowerCase();

    const result = document.getElementById("searchResult");

    const matchKey = Object.keys(players).find(name =>
        name.toLowerCase().includes(input)
    );

    if (!matchKey) {

        result.innerHTML = `
            <h2>${input}</h2>
            <br>
            <span style="color:#ff6a00;">
                No player found.
            </span>
        `;

        return;
    }

    const p = players[matchKey];

    const overall = getOverallRank(p);
    const tested = getTestedCount(p);

    result.innerHTML = `
        <div class="player-info" style="justify-content:center;">
            <img class="player-head"
                 src="${getHead(matchKey)}"
                 onerror="this.src='${STEVE}'">

            <h2>${matchKey}</h2>
        </div>

        <br><br>

        Overall:
        <span class="tier-badge ${overall.toLowerCase()}">
            ${overall}
        </span>

        <br>

        Progress:
        ${tested}/5 Kits Tested

        <br><br>

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

    const input = document.getElementById("playerInput")
        .value
        .toLowerCase();

    const box = document.getElementById("suggestions");

    if (!input) {
        box.innerHTML = "";
        return;
    }

    const matches = Object.keys(players)
        .filter(name =>
            name.toLowerCase().includes(input)
        )
        .slice(0, 6);

    box.innerHTML = matches.map(name => `
        <div class="suggestion-item"
             onclick="selectPlayer('${name}')">
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
        .scrollIntoView({
            behavior: "smooth"
        });
}

function scrollToPlayers() {

    document.getElementById("players")
        .scrollIntoView({
            behavior: "smooth"
        });
}

// ===========================
// INIT
// ===========================

console.log("Script Loaded");
loadLeaderboard();

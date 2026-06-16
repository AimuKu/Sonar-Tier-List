
// ===========================
// DATABASE
// ===========================

function getPlayers() {
    return JSON.parse(localStorage.getItem("players") || "{}");
}

function savePlayers(data) {
    localStorage.setItem("players", JSON.stringify(data));
}

// ===========================
// PLAYER HEAD
// ===========================

const STEVE = "https://minotar.net/avatar/steve/64";

function getHead(name) {
    return `https://minotar.net/avatar/${name}/64`;
}

// ===========================
// INIT DATA
// ===========================

(function initData() {

    const players = getPlayers();

    if (!players || Object.keys(players).length === 0) {

        savePlayers({
            "Zhanshen_": {
                overall: "HT1",
                sword: "HT1",
                axe: "HT2",
                mace: "LT1",
                crystal: "HT2"
            },
            ".StuckRhino6771": {
                overall: "LT1",
                sword: "LT1",
                axe: "LT2",
                mace: "LT1",
                crystal: "LT3"
            }
        });
    }

})();

// ===========================
// LEADERBOARD
// ===========================

function loadLeaderboard() {

    const players = getPlayers();

    const container = document.getElementById("leaderboardContainer");
    const count = document.getElementById("rankedPlayersCount");

    const names = Object.keys(players);

    count.textContent = names.length;
    container.innerHTML = "";

    if (names.length === 0) {
        container.innerHTML = `
            <div class="row">
                <div class="rank">-</div>
                <div>No ranked players yet</div>
                <div>-</div>
            </div>
        `;
        return;
    }

    names.forEach((name, i) => {

        const p = players[name];

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
                    <span class="tier-badge ${p.overall.toLowerCase()}">
                        ${p.overall}
                    </span>
                </div>

            </div>
        `;
    });
}

// ===========================
// SEARCH IMPROVEMENTS
// ===========================

function handleSearchKey(event) {
    if (event.key === "Enter") {
        searchPlayer();
    }
}

// ===========================
// SEARCH PLAYER
// ===========================

function searchPlayer() {

    const players = getPlayers();

    const name = document.getElementById("playerInput").value.trim();
    const result = document.getElementById("searchResult");

    if (!name) {
        result.innerHTML = `<span style="color:#ff6a00;">Type a username first</span>`;
        return;
    }

    const p = players[name];

    if (!p) {
        result.innerHTML = `
            <h2>${name}</h2>
            <br>
            <span style="color:#ff6a00;">Not found</span>
        `;
        result.scrollIntoView({ behavior: "smooth" });
        return;
    }

    result.innerHTML = `
        <div class="player-info" style="justify-content:center;">
            <img class="player-head" src="${getHead(name)}">
            <h2>${name}</h2>
        </div>

        <br><br>

        Overall: <span class="tier-badge ${p.overall.toLowerCase()}">${p.overall}</span><br><br>
        Sword: <span class="tier-badge ${p.sword.toLowerCase()}">${p.sword}</span><br><br>
        Axe: <span class="tier-badge ${p.axe.toLowerCase()}">${p.axe}</span><br><br>
        Mace: <span class="tier-badge ${p.mace.toLowerCase()}">${p.mace}</span><br><br>
        Crystal: <span class="tier-badge ${p.crystal.toLowerCase()}">${p.crystal}</span>
    `;

    result.scrollIntoView({ behavior: "smooth" });
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

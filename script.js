const apiUrl = "https://raw.githubusercontent.com/ccox0719/game/main/boardgames.json";

let games = [];
let filteredGames = [];
const recentGamesKey = "recentGames";
const playCountKey = "playCount";
const complexityOrder = ["Light", "Light-Med", "Medium", "Medium-Heavy", "Heavy"];

// ✅ Fetch Game Data
async function fetchGames() {
    try {
        const response = await fetch(apiUrl + "?nocache=" + new Date().getTime());
        games = await response.json();
        filteredGames = [...games];
        populateDropdown(filteredGames);
        populateFilters(games);
        displayRecentGames();
        displayMostPlayedGame();
        displaySuggestedGame();
    } catch (error) {
        console.error("Error fetching game data:", error);
    }
}
function displayRecentGames() {
    const recentList = document.getElementById("recentGamesList");
    let recentGames = JSON.parse(localStorage.getItem(recentGamesKey)) || [];

    recentList.innerHTML = ""; // ✅ Clear existing list

    if (recentGames.length === 0) {
        recentList.innerHTML = "<p>No games played recently.</p>";
        return;
    }

    recentGames.forEach(game => {
        const listItem = document.createElement("li");
        listItem.textContent = game;
        listItem.onclick = () => {
            document.getElementById("gameSelect").value = game;
            displaySelectedGame();
        };
        recentList.appendChild(listItem);
    });
}
// ✅ Populate Filters
function populateFilters(gameList) {
    const playerFilter = document.getElementById("playerFilter");
    const complexityFilter = document.getElementById("complexityFilter");
    const mechanicsFilter = document.getElementById("mechanicsFilter");
    const timeFilter = document.getElementById("timeFilter");

    let maxPlayers = new Set();
    let mechanicsSet = new Set();

    gameList.forEach(game => {
        for (let i = game.Players.Min; i <= Math.min(game.Players.Max, 15); i++) {
            maxPlayers.add(i);
        }
        game.Mechanics.forEach(mechanic => mechanicsSet.add(mechanic));
    });

    populateFilterDropdown(playerFilter, [...maxPlayers].sort((a, b) => a - b), "Players");
    populateFilterDropdown(complexityFilter, complexityOrder, "");
    populateFilterDropdown(mechanicsFilter, [...mechanicsSet].sort(), "");

    // ✅ Populate Time Dropdown in 15-minute increments
    timeFilter.innerHTML = `<option value="">Any</option>`;
    for (let i = 15; i <= 180; i += 15) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = `${i} min`;
        timeFilter.appendChild(option);
    }
}

// ✅ Helper Function to Populate Dropdowns
function populateFilterDropdown(filterElement, dataArray, label = "") {
    filterElement.innerHTML = `<option value="">Any</option>`;
    dataArray.forEach(value => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label ? `${value} ${label}` : value;
        filterElement.appendChild(option);
    });
}

// ✅ Apply Filters to the Game List
function filterGames() {
    const selectedPlayers = document.getElementById("playerFilter").value;
    const selectedComplexity = document.getElementById("complexityFilter").value;
    const selectedMechanic = document.getElementById("mechanicsFilter").value;
    const selectedTime = document.getElementById("timeFilter").value;

    filteredGames = games.filter(game => {
        let matchesPlayers = selectedPlayers === "" || (game.Players.Min <= selectedPlayers && game.Players.Max >= selectedPlayers);
        let matchesComplexity = selectedComplexity === "" || game.Complexity === selectedComplexity;
        let matchesMechanic = selectedMechanic === "" || game.Mechanics.some(mech => mech === selectedMechanic);
        
        // ✅ Time filter: Show games that take equal to OR LESS than the selected time
        let matchesTime = selectedTime === "" || game.Playtime.Max <= selectedTime;

        return matchesPlayers && matchesComplexity && matchesMechanic && matchesTime;
    });

    populateDropdown(filteredGames);
    displaySuggestedGame(); // ✅ Update suggested game after filtering
}

// ✅ Populate Game Dropdown
function populateDropdown(gameList) {
    const dropdown = document.getElementById("gameSelect");
    dropdown.innerHTML = `<option value="">Select a game...</option>`;

    gameList.forEach(game => {
        const option = document.createElement("option");
        option.value = game.Game;
        option.textContent = `${game.Game} (${game.Players.Min}-${game.Players.Max} Players)`;
        dropdown.appendChild(option);
    });

    document.getElementById("gameSelect").value = ""; // ✅ Reset selection
}

function trackRecentGame(gameName) {
    let recentGames = JSON.parse(localStorage.getItem(recentGamesKey)) || [];
    let playCount = JSON.parse(localStorage.getItem(playCountKey)) || {};

    // ✅ Update recent games (limit to 5)
    recentGames = recentGames.filter(game => game !== gameName);
    recentGames.unshift(gameName);
    if (recentGames.length > 5) recentGames.pop();

    // ✅ Increase play count (views)
    playCount[gameName] = (playCount[gameName] || 0) + 1;

    localStorage.setItem(recentGamesKey, JSON.stringify(recentGames));
    localStorage.setItem(playCountKey, JSON.stringify(playCount));

    // ✅ Update UI
    displayRecentGames();
    displayMostPlayedGame();
    displaySuggestedGame();
}

// ✅ Pick Random Game (From Filtered List)
function pickRandomGame() {
    if (filteredGames.length === 0) {
        alert("No games available. Adjust your filters!");
        return;
    }

    let randomIndex = Math.floor(Math.random() * filteredGames.length);
    let randomGame = filteredGames[randomIndex];

    document.getElementById("gameSelect").value = randomGame.Game;
    displaySelectedGame();
}
function displayMostPlayedGame() {
    const mostPlayedElement = document.getElementById("mostPlayedGame");
    let playCount = JSON.parse(localStorage.getItem(playCountKey)) || {};

    if (Object.keys(playCount).length === 0) {
        mostPlayedElement.textContent = "No games played yet.";
        return;
    }

    // ✅ Sort by highest view count
    let sortedGames = Object.entries(playCount).sort((a, b) => b[1] - a[1]);
    let mostPlayed = sortedGames[0]; // Most viewed game

    mostPlayedElement.textContent = mostPlayed ? `${mostPlayed[0]} (${mostPlayed[1]} views)` : "No games played yet.";
}
function displaySuggestedGame() {
    const suggestedGameElement = document.getElementById("suggestedGame");
    let playCount = JSON.parse(localStorage.getItem(playCountKey)) || {};

    // ✅ Filter games that match current filters
    let filteredUnplayed = filteredGames.filter(game => !playCount[game.Game]); // Never played
    let leastPlayedGame = null;

    if (filteredUnplayed.length > 0) {
        // ✅ If unplayed games exist, pick a random one
        leastPlayedGame = filteredUnplayed[Math.floor(Math.random() * filteredUnplayed.length)];
    } else if (Object.keys(playCount).length > 0) {
        // ✅ Otherwise, get the least played game
        let sortedGames = Object.entries(playCount).sort((a, b) => a[1] - b[1]);
        let leastPlayedTiedGames = sortedGames.filter(game => game[1] === sortedGames[0][1]); // Find ties

        // ✅ Pick a random game from the tied least-played games
        leastPlayedGame = games.find(game => game.Game === leastPlayedTiedGames[Math.floor(Math.random() * leastPlayedTiedGames.length)][0]);
    }

    suggestedGameElement.textContent = leastPlayedGame ? leastPlayedGame.Game : "No suggestions available.";
}
function displaySelectedGame() {
    const selectedGameName = document.getElementById("gameSelect").value;
    const selectedGame = games.find(game => game.Game === selectedGameName);

    if (selectedGame) {
        document.getElementById("gameTitle").textContent = selectedGame.Game;
        document.getElementById("gameMechanics").textContent = selectedGame.Mechanics.join(", ");
        document.getElementById("gamePlaytime").textContent = `${selectedGame.Playtime.Min}-${selectedGame.Playtime.Max} min`;
        document.getElementById("gamePlayers").textContent = `${selectedGame.Players.Min}-${selectedGame.Players.Max} Players`;
        document.getElementById("gameComplexity").textContent = selectedGame.Complexity;

        document.getElementById("gameGuide").innerHTML = `
            <h3>Overview</h3>
            <p>${formatText(selectedGame.QuickSetupGuide.Overview)}</p>
            <h3>Setup</h3>
            <p>${formatText(selectedGame.QuickSetupGuide.Setup)}</p>
            <h3>Player Setup</h3>
            <p>${formatText(selectedGame.QuickSetupGuide.PlayerSetup)}</p>
            <h3>Gameplay</h3>
            <p>${formatText(selectedGame.QuickSetupGuide.Gameplay)}</p>
            <h3>End of Game</h3>
            <p>${formatText(selectedGame.QuickSetupGuide.EndOfGame)}</p>
        `;

        document.getElementById("gameDetails").style.display = "block";

        // ✅ Track the game view
        trackRecentGame(selectedGame.Game);
    } else {
        document.getElementById("gameDetails").style.display = "none";
    }
}
// ✅ Format Text (Replace `\n` with `<br>`)
function formatText(text) {
    return text ? text.replace(/\\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") : "No details available.";
}
function clearRecentGames() {
    localStorage.removeItem(recentGamesKey);
    localStorage.removeItem(playCountKey);

    displayRecentGames();
    displayMostPlayedGame();
    displaySuggestedGame();
}
// ✅ Attach Event Listeners
document.getElementById("playerFilter").addEventListener("change", filterGames);
document.getElementById("complexityFilter").addEventListener("change", filterGames);
document.getElementById("mechanicsFilter").addEventListener("change", filterGames);
document.getElementById("timeFilter").addEventListener("change", filterGames);
document.getElementById("gameSelect").addEventListener("change", displaySelectedGame);
document.getElementById("randomButton").addEventListener("click", pickRandomGame);
document.getElementById("clearRecentButton").addEventListener("click", () => {
    localStorage.removeItem(recentGamesKey);
    localStorage.removeItem(playCountKey);
    displayRecentGames();
    displayMostPlayedGame();
    displaySuggestedGame();
});

// ✅ Fetch Games on Page Load
fetchGames();
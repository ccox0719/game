const apiUrl = "https://raw.githubusercontent.com/ccox0719/game/main/boardgames.json";

let games = [];
let filteredGames = [];
const recentGamesKey = "recentGames";
const playCountKey = "playCount";

// ✅ Predefined Complexity Order
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
// ✅ Display Suggested Game
function displaySuggestedGame() {
    const suggestedGameElement = document.getElementById("suggestedGame");
    let playCount = JSON.parse(localStorage.getItem(playCountKey)) || {};

    let neverPlayedGames = games.filter(game => !playCount[game.Game]);
    let leastPlayedGame = null;

    if (neverPlayedGames.length > 0) {
        // ✅ Randomly select from never-played games
        leastPlayedGame = neverPlayedGames[Math.floor(Math.random() * neverPlayedGames.length)];
    } else if (Object.keys(playCount).length > 0) {
        // ✅ If all games have been played, find the least-played
        let sortedGames = Object.entries(playCount).sort((a, b) => a[1] - b[1]);
        leastPlayedGame = games.find(game => game.Game === sortedGames[0][0]);
    }

    suggestedGameElement.textContent = leastPlayedGame ? leastPlayedGame.Game : "No suggestions available.";
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
    populateFilterDropdown(complexityFilter, complexityOrder, ""); // Sorted Complexity
    populateFilterDropdown(mechanicsFilter, [...mechanicsSet].sort(), ""); // Alphabetically Sorted Mechanics

    // ✅ Populate Time Dropdown in 15-minute increments (15 to 180 min)
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

    filteredGames = [...gameList];
}

// ✅ Pick a Random Game
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

// ✅ Display Selected Game
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
            <p>${selectedGame.QuickSetupGuide.Overview || "No overview available."}</p>
            <h3>Setup</h3>
            <p>${selectedGame.QuickSetupGuide.Setup || "No setup details available."}</p>
            <h3>Player Setup</h3>
            <p>${selectedGame.QuickSetupGuide.PlayerSetup || "No player setup details available."}</p>
            <h3>Gameplay</h3>
            <p>${selectedGame.QuickSetupGuide.Gameplay || "No gameplay details available."}</p>
            <h3>End of Game</h3>
            <p>${selectedGame.QuickSetupGuide.EndOfGame || "No end game details available."}</p>
        `;

        document.getElementById("gameDetails").style.display = "block";
        trackRecentGame(selectedGame.Game);
    } else {
        document.getElementById("gameDetails").style.display = "none";
    }
}

// ✅ Display Most Played Game
function displayMostPlayedGame() {
    const mostPlayedElement = document.getElementById("mostPlayedGame");
    let playCount = JSON.parse(localStorage.getItem(playCountKey)) || {};

    if (!Object.keys(playCount).length) {
        mostPlayedElement.textContent = "No games played yet.";
        return;
    }

    let mostPlayed = Object.entries(playCount).sort((a, b) => b[1] - a[1])[0];

    mostPlayedElement.textContent = mostPlayed ? `${mostPlayed[0]} (${mostPlayed[1]} plays)` : "No games played yet.";
}

// ✅ Display Recently Played Games
function displayRecentGames() {
    const recentList = document.getElementById("recentGamesList");
    let recentGames = JSON.parse(localStorage.getItem(recentGamesKey)) || [];

    recentList.innerHTML = recentGames.length === 0 ? "<p>No games played recently.</p>" : "";

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

// ✅ Track Recently Played Games
function trackRecentGame(gameName) {
    let recentGames = JSON.parse(localStorage.getItem(recentGamesKey)) || [];
    let playCount = JSON.parse(localStorage.getItem(playCountKey)) || {};

    recentGames = recentGames.filter(game => game !== gameName);
    recentGames.unshift(gameName);
    if (recentGames.length > 5) recentGames.pop();

    playCount[gameName] = (playCount[gameName] || 0) + 1;

    localStorage.setItem(recentGamesKey, JSON.stringify(recentGames));
    localStorage.setItem(playCountKey, JSON.stringify(playCount));

    // ✅ Ensure `displaySuggestedGame()` exists before calling it
    if (typeof displaySuggestedGame === "function") {
        displaySuggestedGame();
    } else {
        console.error("displaySuggestedGame is not defined!");
    }

    displayRecentGames();
    displayMostPlayedGame();
}


// ✅ Clear Recently Played Games
function clearRecentGames() {
    localStorage.removeItem(recentGamesKey);
    localStorage.removeItem(playCountKey);
    
    displayRecentGames();
    displayMostPlayedGame();
    displaySuggestedGame();
}

// ✅ Event Listeners
document.getElementById("gameSelect").addEventListener("change", displaySelectedGame);
document.getElementById("randomButton").addEventListener("click", pickRandomGame);
document.getElementById("clearRecentButton").addEventListener("click", clearRecentGames);

// ✅ Fetch Games on Page Load
fetchGames();

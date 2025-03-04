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

        // ✅ Ensure filteredGames starts with all games available
        filteredGames = [...games];

        populateDropdown(filteredGames);
        populateFilters(games);
        displayRecentGames();
        displayMostPlayedGame();
        displaySuggestedGame();
        
        // ✅ Apply initial filters (ensures games are available on first load)
        filterGames();
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
    const favoritesFilter = document.getElementById("favoritesFilter");

    let maxPlayers = new Set();
    let complexities = new Set();
    let mechanicsSet = new Set();
    let times = new Set();

    gameList.forEach(game => {
        if (game.Players) {
            let minPlayers = Math.min(game.Players.Min, game.Players.Max);
            let maxPlayersNum = Math.max(game.Players.Min, game.Players.Max);
            for (let i = minPlayers; i <= maxPlayersNum; i++) {
                maxPlayers.add(i);
            }
        }
        if (game.Complexity) complexities.add(game.Complexity);
        if (game.Mechanics) game.Mechanics.forEach(mechanic => mechanicsSet.add(mechanic));
        if (game.Playtime) times.add(game.Playtime.Max);
    });

    populateFilterDropdown(playerFilter, [...maxPlayers].sort((a, b) => a - b), "Players");
    populateFilterDropdown(complexityFilter, complexityOrder, "");
    populateFilterDropdown(mechanicsFilter, [...mechanicsSet].sort(), "");
    populateFilterDropdown(timeFilter, [...times].sort((a, b) => a - b), "min");
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

function filterGames() {
    const selectedPlayers = document.getElementById("playerFilter").value;
    const selectedComplexity = document.getElementById("complexityFilter").value;
    const selectedMechanic = document.getElementById("mechanicsFilter").value;
    const selectedTime = document.getElementById("timeFilter").value;
    const selectedFavorite = document.getElementById("favoritesFilter").value;

    filteredGames = games.filter(game => {
        let matchesPlayers = selectedPlayers === "" || (game.Players.Min <= selectedPlayers && game.Players.Max >= selectedPlayers);
        let matchesComplexity = selectedComplexity === "" || game.Complexity === selectedComplexity;
        let matchesMechanic = selectedMechanic === "" || game.Mechanics.some(mech => mech === selectedMechanic);
        let matchesTime = selectedTime === "" || game.Playtime.Max <= selectedTime;

        // ✅ Handle Favorite Filters
        let matchesFavorite = true;
        if (selectedFavorite) {
            if (selectedFavorite === "Family") {
                let ratings = Object.values(game.Ratings).filter(r => r !== null);
                let avgRating = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
                matchesFavorite = avgRating >= 8; // Define "Family Favorite" as avg rating ≥ 8
            } else if (selectedFavorite === "CrowdFavorite") {
                matchesFavorite = game.CrowdFavorite === true;
            } else if (selectedFavorite === "GatewayGame") {
                matchesFavorite = game.GatewayGame === true;
            } else {
                matchesFavorite = game.Ratings[selectedFavorite] !== null && game.Ratings[selectedFavorite] >= 8;
            }
        }

        return matchesPlayers && matchesComplexity && matchesMechanic && matchesTime && matchesFavorite;
    });

    populateDropdown(filteredGames);
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

    document.getElementById("gameSelect").value = "";
}
// ✅ Display Recently Played Games
function displayRecentGames() {
    const recentList = document.getElementById("recentGamesList");
    let recentGames = JSON.parse(localStorage.getItem(recentGamesKey)) || [];

    // Clear existing list
    recentList.innerHTML = "";

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
// ✅ Pick Random Game (Uses filteredGames with fallback to all games)
function pickRandomGame() {
    // Ensure `filteredGames` is populated correctly
    let availableGames = (filteredGames.length > 0) ? filteredGames : [...games];

    if (availableGames.length === 0) {
        alert("No games available. Adjust your filters!");
        return;
    }

    let randomIndex = Math.floor(Math.random() * availableGames.length);
    let randomGame = availableGames[randomIndex];

    console.log("🎲 Randomly picked:", randomGame.Game); // ✅ Debugging log

    // ✅ Ensure dropdown is updated
    let dropdown = document.getElementById("gameSelect");
    dropdown.value = randomGame.Game;

    // ✅ Directly update and call display function
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
    const dropdown = document.getElementById("gameSelect");
    const selectedGameName = dropdown.value;

    console.log("🎮 Selected Game:", selectedGameName); // Debugging log

    if (!selectedGameName) {
        console.warn("⚠️ No game selected.");
        return;
    }

    const selectedGame = games.find(game => game.Game === selectedGameName);
    if (!selectedGame) {
        console.error(`❌ Game not found: ${selectedGameName}`);
        return;
    }

    document.getElementById("gameTitle").textContent = selectedGame.Game;
    document.getElementById("gameMechanics").textContent = selectedGame.Mechanics ? selectedGame.Mechanics.join(", ") : "N/A";
    document.getElementById("gamePlaytime").textContent = `${selectedGame.Playtime.Min}-${selectedGame.Playtime.Max} min`;
    document.getElementById("gamePlayers").textContent = selectedGame.Players ? `${selectedGame.Players.Min}-${selectedGame.Players.Max} Players` : "N/A";
    document.getElementById("gameComplexity").textContent = selectedGame.Complexity || "N/A";

    if (selectedGame.QuickSetupGuide) {
        document.getElementById("overview").textContent = selectedGame.QuickSetupGuide.Overview || "N/A";
        document.getElementById("setup").textContent = selectedGame.QuickSetupGuide.Setup || "N/A";
        document.getElementById("playerSetup").textContent = selectedGame.QuickSetupGuide.PlayerSetup || "N/A";
        document.getElementById("gameplay").textContent = selectedGame.QuickSetupGuide.Gameplay || "N/A";
        document.getElementById("endOfGame").textContent = selectedGame.QuickSetupGuide.EndOfGame || "N/A";
    }

    document.getElementById("gameDetails").style.display = "block";
    console.log("✅ Displayed details for:", selectedGame.Game);

    // ✅ Track the game view
    trackRecentGame(selectedGame.Game);
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
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("playerFilter").addEventListener("change", filterGames);
    document.getElementById("complexityFilter").addEventListener("change", filterGames);
    document.getElementById("mechanicsFilter").addEventListener("change", filterGames);
    document.getElementById("timeFilter").addEventListener("change", filterGames);
    document.getElementById("favoritesFilter").addEventListener("change", filterGames);
    document.getElementById("gameSelect").addEventListener("change", displaySelectedGame);
    document.getElementById("randomButton").addEventListener("click", pickRandomGame);
    document.getElementById("clearRecentButton").addEventListener("click", () => {
        localStorage.removeItem(recentGamesKey);
        localStorage.removeItem(playCountKey);
        displayRecentGames();
        displayMostPlayedGame();
        displaySuggestedGame();
    });

    fetchGames();
});



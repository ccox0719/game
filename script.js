const apiUrl = "https://raw.githubusercontent.com/ccox0719/game/main/boardgames.json";

let games = []; // Store JSON data

// ✅ Fetch latest JSON (prevents caching issues)
async function fetchGames() {
    try {
        const response = await fetch(apiUrl + "?nocache=" + new Date().getTime()); // Prevents caching
        games = await response.json();
        populateDropdown(games);
        populateFilters(games);
    } catch (error) {
        console.error("Error fetching game data:", error);
    }
}

// ✅ Populate game dropdown
function populateDropdown(gameList) {
    const dropdown = document.getElementById("gameSelect");
    dropdown.innerHTML = `<option value="">Select a game...</option>`; // Reset dropdown

    gameList.forEach(game => {
        const option = document.createElement("option");
        option.value = game.Game;
        option.textContent = `${game.Game} (${game.Players.Min}-${game.Players.Max} Players)`;
        dropdown.appendChild(option);
    });
}

// ✅ Populate filter dropdowns dynamically (Limits Players to Max 15)
function populateFilters(gameList) {
    const playerFilter = document.getElementById("playerFilter");
    const complexityFilter = document.getElementById("complexityFilter");

    let maxPlayers = new Set();
    let complexities = new Set();

    gameList.forEach(game => {
        for (let i = game.Players.Min; i <= Math.min(game.Players.Max, 15); i++) {
            maxPlayers.add(i); // Store all valid player numbers up to 15
        }
        complexities.add(game.Complexity);
    });

    // Populate Player Filter (Limited to 1-15)
    maxPlayers = [...maxPlayers].sort((a, b) => a - b); // Sort numerically
    maxPlayers.forEach(count => {
        const option = document.createElement("option");
        option.value = count;
        option.textContent = `${count} Players`;
        playerFilter.appendChild(option);
    });

    // Populate Complexity Filter
    complexities.forEach(level => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        complexityFilter.appendChild(option);
    });
}


// ✅ Display selected game details
function displaySelectedGame() {
    const selectedGameName = document.getElementById("gameSelect").value;
    const selectedGame = games.find(game => game.Game === selectedGameName);

    if (selectedGame) {
        document.getElementById("gameTitle").textContent = selectedGame.Game;
        document.getElementById("gameMechanics").textContent = selectedGame.Mechanics;
        document.getElementById("gamePlaytime").textContent = selectedGame.Playtime;
        document.getElementById("gamePlayers").textContent = `${selectedGame.Players.Min}-${selectedGame.Players.Max} Players`;
        document.getElementById("gameComplexity").textContent = selectedGame.Complexity;

        // ✅ Display Quick Setup Guide sections
        document.getElementById("gameGuide").innerHTML = `
            <h3>Overview</h3><p>${formatText(selectedGame.QuickSetupGuide.Overview)}</p>
            <h3>Setup</h3><p>${formatText(selectedGame.QuickSetupGuide.Setup)}</p>
            <h3>Player Setup</h3><p>${formatText(selectedGame.QuickSetupGuide.PlayerSetup)}</p>
            <h3>Gameplay</h3><p>${formatText(selectedGame.QuickSetupGuide.Gameplay)}</p>
            <h3>End of Game</h3><p>${formatText(selectedGame.QuickSetupGuide.EndOfGame)}</p>
        `;

        document.getElementById("gameDetails").style.display = "block";
    } else {
        document.getElementById("gameDetails").style.display = "none";
    }
}

// ✅ Selects a random game from the dropdown
function pickRandomGame() {
    const dropdown = document.getElementById("gameSelect");
    const options = dropdown.options;

    if (options.length > 1) {
        let randomIndex = Math.floor(Math.random() * (options.length - 1)) + 1; // Avoids "Select a game..."
        dropdown.selectedIndex = randomIndex;
        displaySelectedGame(); // Shows the details of the selected game
    }
}

// ✅ Filter games based on search, player count, and complexity
function filterGames() {
    let searchQuery = document.getElementById("searchBox").value.toLowerCase();
    let selectedPlayers = parseInt(document.getElementById("playerFilter").value, 10);
    let selectedComplexity = document.getElementById("complexityFilter").value;

    let filteredGames = games.filter(game => {
        let matchesSearch = searchQuery === "" || game.Game.toLowerCase().includes(searchQuery);
        let matchesPlayers = isNaN(selectedPlayers) || (selectedPlayers >= game.Players.Min && selectedPlayers <= game.Players.Max);
        let matchesComplexity = selectedComplexity === "" || game.Complexity === selectedComplexity;

        return matchesSearch && matchesPlayers && matchesComplexity;
    });

    populateDropdown(filteredGames);
}

// ✅ Format text for better readability (adds line breaks after ".")
function formatText(text) {
    return text.replace(/\.\s/g, ".<br>");
}

// Event Listeners
document.getElementById("playerFilter").addEventListener("change", filterGames);
document.getElementById("complexityFilter").addEventListener("change", filterGames);
document.getElementById("searchBox").addEventListener("input", filterGames);

// Fetch games on page load
fetchGames();

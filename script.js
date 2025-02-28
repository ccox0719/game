const apiUrl = "https://raw.githubusercontent.com/ccox0719/game/main/boardgames.json";

let games = []; // Store JSON data
let filteredGames = []; // Store filtered list

// ✅ Fetch latest JSON (prevents caching issues)
async function fetchGames() {
    try {
        const response = await fetch(apiUrl + "?nocache=" + new Date().getTime()); // Prevents caching
        games = await response.json();
        filteredGames = [...games]; // Ensure filteredGames starts as full list
        populateDropdown(filteredGames);
        populateFilters(games); // ✅ Populate filters AFTER loading games
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

    filteredGames = [...gameList]; // Update filtered list for random selection
}

// ✅ Populate filter dropdowns dynamically
function populateFilters(gameList) {
    const playerFilter = document.getElementById("playerFilter");
    const complexityFilter = document.getElementById("complexityFilter");
    const mechanicsFilter = document.getElementById("mechanicsFilter");

    let maxPlayers = new Set();
    let complexities = new Set();
    let mechanicsSet = new Set();

    gameList.forEach(game => {
        for (let i = game.Players.Min; i <= Math.min(game.Players.Max, 15); i++) {
            maxPlayers.add(i);
        }
        complexities.add(game.Complexity);
        game.Mechanics.forEach(mechanic => mechanicsSet.add(mechanic));
    });

    // ✅ Populate Player Filter
    playerFilter.innerHTML = `<option value="">Any</option>`; // Reset before filling
    [...maxPlayers].sort((a, b) => a - b).forEach(count => {
        const option = document.createElement("option");
        option.value = count;
        option.textContent = `${count} Players`;
        playerFilter.appendChild(option);
    });

    // ✅ Populate Complexity Filter
    complexityFilter.innerHTML = `<option value="">Any</option>`; // Reset before filling
    complexities.forEach(level => {
        const option = document.createElement("option");
        option.value = level;
        option.textContent = level;
        complexityFilter.appendChild(option);
    });

    // ✅ Populate Mechanics Filter
    mechanicsFilter.innerHTML = `<option value="">Any</option>`; // Reset before filling
    mechanicsSet.forEach(mechanic => {
        const option = document.createElement("option");
        option.value = mechanic;
        option.textContent = mechanic;
        mechanicsFilter.appendChild(option);
    });
}

// ✅ Display selected game details
function displaySelectedGame() {
    const selectedGameName = document.getElementById("gameSelect").value;
    const selectedGame = games.find(game => game.Game === selectedGameName);

    if (selectedGame) {
        document.getElementById("gameTitle").textContent = selectedGame.Game;
        document.getElementById("gameMechanics").textContent = selectedGame.Mechanics.join(", ");
        document.getElementById("gamePlaytime").textContent = `${selectedGame.Playtime.Min}-${selectedGame.Playtime.Max} min`;
        document.getElementById("gamePlayers").textContent = `${selectedGame.Players.Min}-${selectedGame.Players.Max} Players`;
        document.getElementById("gameComplexity").textContent = selectedGame.Complexity;

        // ✅ Ensure Overview and Setup are properly displayed
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
    } else {
        document.getElementById("gameDetails").style.display = "none";
    }
}

// ✅ Pick a random game from the filtered list
function pickRandomGame() {
    if (filteredGames.length === 0) {
        alert("No games available. Adjust your filters!");
        return;
    }

    let randomIndex = Math.floor(Math.random() * filteredGames.length);
    let randomGame = filteredGames[randomIndex];

    // ✅ Set dropdown to the selected random game
    document.getElementById("gameSelect").value = randomGame.Game;
    
    // ✅ Trigger game details display
    displaySelectedGame();
}

// ✅ Filter games based on search, players, mechanics, playtime, and complexity
function filterGames() {
    let searchQuery = document.getElementById("searchBox").value.toLowerCase();
    let selectedPlayers = parseInt(document.getElementById("playerFilter").value, 10);
    let selectedComplexity = document.getElementById("complexityFilter").value;
    let selectedMechanics = document.getElementById("mechanicsFilter").value;
    let minPlaytime = parseInt(document.getElementById("playtimeMin").value, 10) || 0;
    let maxPlaytime = parseInt(document.getElementById("playtimeMax").value, 10) || Infinity;

    filteredGames = games.filter(game => {
        let matchesSearch = searchQuery === "" || game.Game.toLowerCase().includes(searchQuery);
        let matchesPlayers = isNaN(selectedPlayers) || (selectedPlayers >= game.Players.Min && selectedPlayers <= game.Players.Max);
        let matchesComplexity = selectedComplexity === "" || game.Complexity === selectedComplexity;
        let matchesMechanics = selectedMechanics === "" || game.Mechanics.includes(selectedMechanics);
        let matchesPlaytime = (game.Playtime.Min >= minPlaytime) && (game.Playtime.Max <= maxPlaytime);

        return matchesSearch && matchesPlayers && matchesComplexity && matchesMechanics && matchesPlaytime;
    });

    populateDropdown(filteredGames);
}

// ✅ Event Listeners for Selection & Filtering
document.getElementById("gameSelect").addEventListener("change", displaySelectedGame);
document.getElementById("randomButton").addEventListener("click", pickRandomGame);
document.getElementById("playerFilter").addEventListener("change", filterGames);
document.getElementById("complexityFilter").addEventListener("change", filterGames);
document.getElementById("mechanicsFilter").addEventListener("change", filterGames);
document.getElementById("playtimeMin").addEventListener("input", filterGames);
document.getElementById("playtimeMax").addEventListener("input", filterGames);
document.getElementById("searchBox").addEventListener("input", filterGames);

// Fetch games on page load
fetchGames();

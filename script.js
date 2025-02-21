const apiUrl = "https://raw.githubusercontent.com/ccox0719/game/main/boardgames.json";

let games = []; // Store JSON data

// ✅ Fetch latest JSON (prevents caching issues)
async function fetchGames() {
    try {
        const response = await fetch(apiUrl + "?nocache=" + new Date().getTime()); // Prevents caching
        games = await response.json();
        populateDropdown(games);
    } catch (error) {
        console.error("Error fetching game data:", error);
    }
}

// ✅ Populate dropdown with game names
function populateDropdown(gameList) {
    const dropdown = document.getElementById("gameSelect");
    dropdown.innerHTML = `<option value="">Select a game...</option>`; // Reset dropdown

    gameList.forEach(game => {
        const option = document.createElement("option");
        option.value = game.Game;
        option.textContent = game.Game;
        dropdown.appendChild(option);
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
        document.getElementById("gamePlayers").textContent = selectedGame.Players;
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

// ✅ Format text for better readability (adds line breaks after ".")
function formatText(text) {
    return text.replace(/\.\s/g, ".<br>"); // Adds line breaks for readability
}

// Fetch games on page load
fetchGames();

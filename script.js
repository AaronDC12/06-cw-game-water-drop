
// Variables to control game state
let gameRunning = false; // Keeps track of whether game is active or not
let dropMaker; // Will store our timer that creates drops regularly
let score = 0; // Track player score
let timeLeft = 30; // Initialize timer
let timer; // Store the timer interval

// Wait for button click to start the game
document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", resetGame);

const scoreElement = document.getElementById("score");
const confettiContainer = document.getElementById("confetti-container");
const timeElement = document.getElementById("time");
const newGameButton = document.getElementById("new-game-btn");
const waterLevelElement = document.getElementById("water-level");
const recordListElement = document.getElementById("record-list");
const difficultySelector = document.getElementById("difficulty");

let gameRecords = []; // Array to store the last 5 game records
let badDropFrequency = 3; // Default frequency for bad drops (1 bad drop every 3 good drops)

newGameButton.addEventListener("click", () => {
  resetGame();
  startGame();
});

const messageElement = document.createElement("div");
messageElement.id = "game-message";
messageElement.style.position = "absolute";
messageElement.style.top = "10px";
messageElement.style.left = "50%";
messageElement.style.transform = "translateX(-50%)";
messageElement.style.padding = "10px 20px";
messageElement.style.backgroundColor = "#FFC907";
messageElement.style.color = "#131313";
messageElement.style.fontSize = "18px";
messageElement.style.fontWeight = "bold";
messageElement.style.borderRadius = "8px";
messageElement.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)";
messageElement.style.display = "none";
document.body.appendChild(messageElement);

difficultySelector.addEventListener("change", () => {
  const difficulty = difficultySelector.value;
  if (difficulty === "easy") {
    badDropFrequency = 5; // Fewer bad drops
  } else if (difficulty === "medium") {
    badDropFrequency = 3; // Default medium difficulty
  } else if (difficulty === "hard") {
    badDropFrequency = 2; // More bad drops
  }
});

function displayMessage(message, duration = 3000) {
  messageElement.textContent = message;
  messageElement.style.display = "block";
  setTimeout(() => {
    messageElement.style.display = "none";
  }, duration); // Hide the message after the specified duration
}

function startGame() {
  // Prevent multiple games from running at once
  if (gameRunning) return;

  gameRunning = true;
  timeLeft = 30; // Reset timer
  score = 0; // Reset score
  scoreElement.textContent = score; // Update score display
  timeElement.textContent = timeLeft; // Update timer display
  newGameButton.style.display = "none"; // Hide "Start New Game" button
  displayMessage("Game Started! Catch the drops!", 2000);

  // Start the countdown
  timer = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      timeElement.textContent = timeLeft;
    }

    if (timeLeft <= 0) {
      clearInterval(timer); // Stop the timer
      if (score < 100) {
        endGame(); // End the game if the user hasn't won
      }
    }
  }, 1000);

  // Create new drops every second (1000 milliseconds)
  dropMaker = setInterval(createDrop, 1000);
}

function createDrop() {
  // Create a new div element that will be our drop
  const drop = document.createElement("div");

  // Determine if the drop is a bad drop based on the frequency
  const isBadDrop = Math.random() < 1 / badDropFrequency;
  drop.className = isBadDrop ? "bad-drop" : "water-drop";

  // Make drops different sizes for visual variety
  const initialSize = 60;
  const sizeMultiplier = Math.random() * 0.8 + 0.5;
  const size = initialSize * sizeMultiplier;
  drop.style.width = drop.style.height = `${size}px`;

  // Position the drop randomly across the game width
  const gameWidth = document.getElementById("game-container").offsetWidth;
  const xPosition = Math.random() * (gameWidth - 60);
  drop.style.left = xPosition + "px";

  // Make drops fall for 4 seconds
  drop.style.animationDuration = "4s";

  // Add click event for good and bad drops
  drop.addEventListener("click", () => {
    if (drop.classList.contains("bad-drop")) {
      score -= 5; // Deduct points for bad drops
      showScoreFeedback(drop, "-5");
    } else {
      score += 10; // Increment score for good drops
      showScoreFeedback(drop, "+10");
    }
    scoreElement.textContent = score; // Update score display
    updateWaterLevel(); // Update water level in the bucket
    drop.remove(); // Remove drop after clicking

    // Check if the user has won
    if (score >= 100) {
      clearInterval(timer); // Stop the timer
      clearInterval(dropMaker); // Stop creating drops
      gameRunning = false; // Stop the game
      const timeTaken = 30 - timeLeft; // Calculate time taken
      updateRecordBoard(timeTaken); // Update the record board
      displayMessage(`🎉 Congratulations, You Win! Time Taken: ${timeTaken} seconds 🎉`, 5000); // Display win message with time
      celebrateWin();
      newGameButton.style.display = "block"; // Show "Start New Game" button
    }
  });

  // Add the new drop to the game screen
  document.getElementById("game-container").appendChild(drop);

  // Remove drops that reach the bottom (weren't clicked)
  drop.addEventListener("animationend", () => {
    drop.remove(); // Clean up drops that weren't caught
  });
}

function showScoreFeedback(drop, text) {
  const feedback = document.createElement("div");
  feedback.className = "score-feedback";
  feedback.textContent = text;
  feedback.style.left = drop.style.left;
  feedback.style.top = drop.getBoundingClientRect().top + "px";
  document.body.appendChild(feedback);

  feedback.addEventListener("animationend", () => feedback.remove());
}

function updateWaterLevel() {
  const maxScore = 100; // Score required to fill the bucket
  const waterHeight = (score / maxScore) * 100; // Calculate water level percentage
  waterLevelElement.style.height = `${waterHeight}%`; // Update water level
}

function resetGame() {
  gameRunning = false;
  clearInterval(timer);
  clearInterval(dropMaker);
  document.getElementById("game-container").innerHTML = ""; // Clear drops
  score = 0; // Reset score
  timeLeft = 30; // Reset timer
  scoreElement.textContent = score; // Update score display
  timeElement.textContent = timeLeft; // Update timer display
  waterLevelElement.style.height = "0%"; // Reset water level
  displayMessage("Game Reset! Press Start to play again.", 2000);
}

function endGame() {
  gameRunning = false;
  clearInterval(timer); // Stop the timer
  clearInterval(dropMaker); // Stop creating drops
  displayMessage(`Game Over! Your final score is ${score}. Better luck next time!`, 5000); // Notify the player
  newGameButton.style.display = "block"; // Show "Start New Game" button
}

function celebrateWin() {
  for (let i = 0; i < 100; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = Math.random() * window.innerWidth + "px";

    // Use logo image for some confetti pieces
    if (i % 10 === 0) {
      const logo = document.createElement("img");
      logo.src = "logo.png";
      logo.style.width = "20px";
      logo.style.height = "20px";
      logo.style.position = "absolute";
      logo.style.animation = "confettiFall 2s linear forwards";
      confettiContainer.appendChild(logo);

      logo.addEventListener("animationend", () => logo.remove());
    } else {
      confetti.style.backgroundColor = getRandomColor();
      confettiContainer.appendChild(confetti);

      confetti.addEventListener("animationend", () => confetti.remove());
    }
  }
}

function getRandomColor() {
  const colors = ["#FFC907", "#2E9DF7", "#8BD1CB", "#4FCB53", "#FF902A"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function updateRecordBoard(timeTaken) {
  // Add the new record to the beginning of the array
  gameRecords.unshift(timeTaken);

  // Keep only the last 5 records
  if (gameRecords.length > 5) {
    gameRecords.pop();
  }

  // Update the record board UI
  recordListElement.innerHTML = ""; // Clear the current list
  gameRecords.forEach((record, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Game ${index + 1}: ${record} seconds`;
    recordListElement.appendChild(listItem);
  });
}

// Example: Trigger celebration when score reaches 100
if (score >= 100) celebrateWin();

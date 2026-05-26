const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { spawn, exec } = require('child_process');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  path: '/connect4/socket.io'
});

const PORT = process.env.PORT || 8081;

// Compile the Java class once on server start
console.log('Compiling Connect4.java...');
exec('javac Connect4.java', { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Compilation error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Compilation stderr: ${stderr}`);
  }
  console.log('Connect4.java compiled successfully.');
});

app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Parse the board array from the Java output
function parseBoard(stdout) {
  const lines = stdout.split('\n');
  const board = Array(6).fill(null).map(() => Array(7).fill(' '));
  let foundBoard = false;
  
  for (const line of lines) {
    // Check if line matches a row format e.g., |1| | |H|A| | | |
    const match = line.match(/^\|([1-6])\|(.*)\|$/);
    if (match) {
      foundBoard = true;
      const rowIdx = parseInt(match[1]) - 1;
      const cells = match[2].split('|');
      for (let colIdx = 0; colIdx < 7; colIdx++) {
        if (cells[colIdx] !== undefined) {
          board[rowIdx][colIdx] = cells[colIdx];
        }
      }
    }
  }
  return foundBoard ? board : null;
}

// Check for game states and queries in standard output
function checkGameState(stdout) {
  let prompt = null;
  let winner = null;
  let gameOver = false;

  if (stdout.includes('Do you want to play against another human')) {
    prompt = 'AGAINST_HUMAN';
  } else if (stdout.includes('Do you want to go first')) {
    prompt = 'GO_FIRST';
  } else if (stdout.includes('Enter a column') || stdout.includes('enter a column')) {
    prompt = 'PLAY_MOVE';
  }

  if (stdout.includes('Player 1 has won!')) {
    winner = 'Player 1';
    gameOver = true;
  } else if (stdout.includes('Player 2 has won!')) {
    winner = 'Player 2';
    gameOver = true;
  } else if (stdout.includes('Human player has won!')) {
    winner = 'Human';
    gameOver = true;
  } else if (stdout.includes('AI opponent has won!')) {
    winner = 'AI';
    gameOver = true;
  } else if (stdout.includes('The game is a tie!')) {
    winner = 'Tie';
    gameOver = true;
  }

  return { prompt, winner, gameOver };
}

io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  let javaProcess = null;
  let outputBuffer = '';
  let currentBoard = Array(6).fill(null).map(() => Array(7).fill(' '));
  let currentPrompt = null;

  const startGame = () => {
    if (javaProcess) {
      javaProcess.kill();
    }

    currentBoard = Array(6).fill(null).map(() => Array(7).fill(' '));
    currentPrompt = null;
    
    // Spawn the Java Connect4 process
    javaProcess = spawn('java', ['Connect4'], { cwd: __dirname });

    javaProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      outputBuffer += chunk;
      console.log(`[Java Stdout]: ${chunk}`);
      
      const parsed = parseBoard(outputBuffer);
      if (parsed) {
        currentBoard = parsed;
      }
      const state = checkGameState(outputBuffer);
      if (state.prompt) {
        currentPrompt = state.prompt;
      }

      socket.emit('game-update', {
        board: currentBoard,
        prompt: currentPrompt,
        winner: state.winner,
        gameOver: state.gameOver,
        raw: outputBuffer
      });

      // Clear standard prompts from buffer so we don't repeat them
      if (state.prompt || state.gameOver) {
        outputBuffer = '';
      }
    });

    javaProcess.stderr.on('data', (data) => {
      console.error(`[Java Stderr]: ${data}`);
    });

    javaProcess.on('close', (code) => {
      console.log(`Java process closed with code ${code}`);
      socket.emit('game-terminated', { code });
    });
  };

  socket.on('start-game', () => {
    startGame();
  });

  socket.on('input', (message) => {
    if (javaProcess && javaProcess.stdin && javaProcess.stdin.writable) {
      const cleanMessage = String(message).trim();
      console.log(`[Client Input]: ${cleanMessage}`);
      currentPrompt = null; // Clear prompt immediately on user input consumption!
      javaProcess.stdin.write(cleanMessage + '\n');
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    if (javaProcess) {
      javaProcess.kill();
    }
  });
});

server.listen(PORT, () => {
  console.log(`Connect 4 Web Wrapper running on http://localhost:${PORT}`);
});

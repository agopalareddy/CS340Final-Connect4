# Connect4

Connect4 is a classic two-player board game in which players take turns dropping colored discs into a vertically oriented grid. The goal of the game is to be the first player to create a horizontal, vertical, or diagonal line of four of one's own discs. This project is a Java implementation of Connect4, with a focus on creating a challenging and engaging experience for players. It includes features for both single player mode, where the player competes against an AI opponent, and multiplayer mode, where two human players can compete against each other.

## Getting Started

To start the game, run the `main` method. You will be prompted to choose whether you want to play against another human or the AI. If you choose to play against the AI, you will also be asked whether you want to go first. The game is played by alternating turns between the players. During each turn, the player will be prompted to enter a column where they want to place their piece. The game ends when one of the players gets 4 in a row or the board is full.

## AI Opponent

The AI opponent uses the alpha-beta pruning algorithm to make strategic and efficient moves. This algorithm is based on the minimax search algorithm, which is used to find the best move in a two-player game by considering all possible moves and countermoves. The alpha-beta pruning algorithm improves upon the minimax algorithm by pruning the search tree to avoid exploring branches that are known to be suboptimal. This makes the algorithm more efficient, as it avoids wasting time and resources on exploring suboptimal branches of the game tree.

## Contributions

The base game was developed by **Aadarsha Gopala Reddy**, and **Alex Casper** headed the development of the AI opponent. **Jose Mancilla** played a critical role in the project by finding and reporting bugs in the code. His thorough testing and debugging helped identify and fix many issues with the implementation of the alpha-beta pruning algorithm.

Overall, the project offers an engaging and challenging experience for players of all skill levels. It provides a fun and enjoyable way to play Connect4, with the added challenge of competing against an AI opponent that uses the alpha-beta pruning algorithm to make strategic and efficient moves. The ability to play against another human adds an additional layer of enjoyment and competition, making the project a well-rounded and enjoyable experience for players. However, the algorithm still needs some work, especially in terms of tweaking the evaluation function and the minimax function, in order to make the AI opponent even more challenging and engaging for players. The hard work and dedication of the team has resulted in a successful implementation of the game and its key features, but there is still room for improvement and further development.

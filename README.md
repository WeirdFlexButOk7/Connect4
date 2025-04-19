# Connect Four Game

A web-based **Connect Four** application that supports both **Single Player** and **Multiplayer** modes.

---

## Single Player Mode

Play against an AI opponent that uses the **Minimax Algorithm** with **Alpha-Beta Pruning** for efficient decision-making.

Try it out here: [connect-four-now.vercel.app](https://connect-four-now.vercel.app/)

---

## Multiplayer Mode

Multiplayer functionality is implemented using **WebSockets**. Two players can connect and play from different devices.

To run the multiplayer server locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/connect-four.git
   cd connect-four
   ```

2. Install the required dependencies:
   ```bash
   npm ci
   ```

3. Start the server:
   ```bash
   node server.js
   ```

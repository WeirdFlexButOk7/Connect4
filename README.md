# Connect Four Game 🎮

A web-based **Connect Four** application that supports both **Single Player** and **Multiplayer** modes.

---

## 🚀 Features

- **Single Player Mode**: Challenge an AI powered by the Minimax Algorithm with Alpha-Beta Pruning and game-specific optimizations.
- **Multiplayer Mode**: Play with a friend over the network using WebSockets.

---

## 🧠 Single Player Mode

Play against an AI opponent that uses the **Minimax Algorithm** with **Alpha-Beta Pruning** for efficient decision-making.

👉 Try it out here: [connect-four-now.vercel.app](https://connect-four-now.vercel.app/)

---

## 👥 Multiplayer Mode

Multiplayer functionality is implemented using **WebSockets**. Two players can connect and play from different devices.


To run the multiplayer server locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/connect-four.git
   cd connect-four
   ```

2. Install the required dependencies:
   ```bash
   npm install express websocket cors
   ```

3. Start the server:
   ```bash
   node server.js
   ```

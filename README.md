
# Connect Four Game

A web-based **Connect Four** application with support for both **Single Player** and **Multiplayer** modes.

You can play the game online here: [connect-four-now.vercel.app](https://connect-four-now.vercel.app/)

---

## Features

- **Single Player Mode**: Play against an AI opponent powered by the **Minimax Algorithm** with **Alpha-Beta Pruning** and game-specific optimisations.
  
- **Multiplayer Mode**: Play with friends or others in real-time using **WebSockets**. Two players can connect and play from different devices.

---

## Running the Game Locally

To run the **Multiplayer** server locally, follow these steps:

### 1. Clone the repository

```bash
git clone https://github.com/WeirdFlexButOk7/Connect4.git
cd connect-four
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Update the API and WebSocket URLs

In the `script.js` file, update the URLs for the server and WebSocket to point to your local server.

```javascript
fetch("http://localhost:9090/server-status")
  .then((response) => response.json())
  .then((data) => {
    console.log("Server status:", data.status);
    ws = new WebSocket("ws://localhost:9090");
  })
```

### 4. Start the server

```bash
node server.js
```

This will start the server on your local machine, and you can access the game by opening the `index.html` in your browser.

---

## Deployment

- **Frontend**: The frontend is hosted on [Vercel](https://vercel.com/) and can be accessed at [connect-four-now.vercel.app](https://connect-four-now.vercel.app/).
- **Backend**: The backend server is hosted on [Railway](https://railway.app/) at [connect-four-now.up.railway.app](https://connect-four-now.up.railway.app/).

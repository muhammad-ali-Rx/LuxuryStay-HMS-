// src/utils/socket.mjs

import { io } from "socket.io-client";

// The server URL. This should match where your backend is running.
const SERVER_URL = "http://localhost:3000"; 

// Create the socket connection instance
// This is done once and exported for use throughout the application
const socket = io(SERVER_URL, {
  // Add authentication headers if needed later (e.g., token)
  autoConnect: false, // We'll manually connect in App.jsx
});

// Export it for use in other components
export default socket;
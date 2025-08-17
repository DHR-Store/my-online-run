/ server.js

// Import the required modules
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS (Cross-Origin Resource Sharing)
// This allows your frontend dashboard to make requests to this server.
app.use(cors());

// Enable the express server to parse JSON bodies from incoming requests
app.use(express.json());

// ------------------------------------
// In-Memory Data Store
// A simple object to store user data.
// Key: userId
// Value: { lastActive: Date, platform: string }
// IMPORTANT: This data will be lost when the server restarts.
// ------------------------------------
const users = {};

/**
 * API Endpoint to "ping" the server and update a user's activity.
 *
 * @param {object} req.body - The request body should contain 'userId' and 'platform'.
 * @returns {object} A JSON object with a success message.
 */
app.post('/ping', (req, res) => {
  const { userId, platform } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Error: userId is required.' });
  }

  // Update the user's last active timestamp and platform
  users[userId] = {
    lastActive: new Date(),
    platform: platform || 'unknown'
  };

  console.log(`Ping received from userId: ${userId} on platform: ${platform}`);
  res.status(200).json({ message: 'Ping successful.' });
});

/**
 * API Endpoint to retrieve a list of currently online users.
 *
 * An "online" user is defined as someone who has "pinged" the server
 * within the last 30 seconds.
 *
 * @returns {object} A JSON object containing the count of online users and a list of their details.
 */
app.get('/online-users', (req, res) => {
  const now = new Date();
  const onlineUsers = [];
  const cutoffTime = now.getTime() - (30 * 1000); // 30 seconds ago

  for (const userId in users) {
    if (users[userId].lastActive.getTime() > cutoffTime) {
      onlineUsers.push({
        id: userId,
        platform: users[userId].platform,
        lastActive: users[userId].lastActive.toISOString()
      });
    }
  }

  console.log(`Sending response. ${onlineUsers.length} users online.`);
  res.status(200).json({
    onlineCount: onlineUsers.length,
    users: onlineUsers,
    totalUsers: Object.keys(users).length
  });
});

// Start the server and listen on the defined port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

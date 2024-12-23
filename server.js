const express = require('express');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const wss = new WebSocket.Server({ port: 8080 });

mongoose.connect('mongodb://localhost/collaborative-text-editor', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', {
  username: String,
});

const Document = mongoose.model('Document', {
  content: String,
});

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'join') {
        const user = new User({ username: data.username });
        user.save((err) => {
          if (err) {
            console.error(err);
            ws.send(JSON.stringify({ type: 'error', message: 'Error joining chat' }));
          } else {
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'user', username: user.username }));
              }
            });
          }
        });
      } else if (data.type === 'document') {
        const document = new Document({ content: data.content });
        document.save((err) => {
          if (err) {
            console.error(err);
            ws.send(JSON.stringify({ type: 'error', message: 'Error saving document' }));
          } else {
            wss.clients.forEach((client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'document', content: document.content }));
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({ type: 'error', message: 'Error handling message' }));
    }
  });

  ws.on('error', (error) => {
    console.error('Error occurred:', error);
  });

  ws.on('close', () => {
    console.log('Connection closed');
  });
});

app.use(express.static('public'));

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});
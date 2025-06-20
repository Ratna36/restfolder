const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_PATH = path.join(DATA_DIR, 'users.json');
const INDEX_PATH = path.join(__dirname, 'public', 'userlogin.html'); // adjust if needed

// Ensure data directory and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_PATH)) fs.writeFileSync(DATA_PATH, '[]', 'utf8');

// Create HTTP server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Serve HTML file
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile(INDEX_PATH, (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('Error loading file');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });

  // Handle form submission
  } else if (req.method === 'POST' && req.url === '/submit') {
    let body = '';
    req.on('data', chunk => body += chunk);

    req.on('end', () => {
      try {
        const newUser = JSON.parse(body);

        // Read and update JSON
        fs.readFile(DATA_PATH, 'utf8', (err, data) => {
          let users = [];
          if (!err && data.trim()) {
            try {
              users = JSON.parse(data);
            } catch (jsonErr) {
              console.error('Error parsing existing data:', jsonErr);
            }
          }

          users.push(newUser);

          fs.writeFile(DATA_PATH, JSON.stringify(users, null, 2), err => {
            if (err) {
              res.writeHead(500, { 'Content-Type': 'text/plain' });
              return res.end('Failed to save data');
            }
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Patient info saved successfully!');
          });
        });

      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid JSON data');
      }
    });

  // Handle unknown routes
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

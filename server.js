const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 1665;

// Serve the static files from the "website" directory
app.use(express.static(path.join(__dirname, 'website')));

// Route to serve index.html by default
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

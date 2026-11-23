const path = require('path');
const express = require('express');
const app = require('./app');
const { initScheduler } = require('./services/scheduler');

const PORT = process.env.PORT || 5000;

// Serve frontend build in production / non-Vercel environment
const clientDistPath = path.join(__dirname, '../dist');
app.use(express.static(clientDistPath));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(clientDistPath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
  }
  next();
});

// Start Server & Local Scheduler
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Prioritask Server berjalan di port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`===============================================`);
  initScheduler();
});

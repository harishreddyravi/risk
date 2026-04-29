const express = require('express');
const cors = require('cors');
const { init } = require('./db/database');

async function start() {
  await init();
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/api/dashboard',    require('./routes/dashboard'));
  app.use('/api/regulations',  require('./routes/regulations'));
  app.use('/api/applications', require('./routes/applications'));
  app.use('/api/controls',     require('./routes/controls'));
  app.use('/api/issues',       require('./routes/issues'));
  app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Risk API  http://localhost:${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });

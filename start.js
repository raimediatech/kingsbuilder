// start.js - Simple script to start the app
const app = require('./api/index');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                                                               ║
  ║   KingsBuilder is running!                                    ║
  ║                                                               ║
  ║   🚀 Server:  http://localhost:${PORT}                          ║
  ║   📊 Dashboard: http://localhost:${PORT}/dashboard              ║
  ║                                                               ║
  ║   Ready to build amazing Shopify pages!                       ║
  ║                                                               ║
  ╚═══════════════════════════════════════════════════════════════╝
  `);
});
const { sql } = require('./backend-deploy/config/database.cjs');

(async () => {
  const service = await sql`SELECT * FROM services LIMIT 1`;
  if (service.length > 0) {
    console.log('Service columns:');
    Object.keys(service[0]).forEach(key => {
      console.log(`  ${key}: ${typeof service[0][key]}`);
    });
  }
  process.exit(0);
})();

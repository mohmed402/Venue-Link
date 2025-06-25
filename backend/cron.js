// cron.js
require('dotenv').config({ path: __dirname + '/.env' });
const cron = require('node-cron');
const supabase = require("./supabaseClient");

// Cron job runs every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log(`[${new Date().toISOString()}] Checking for expired bookings...`);

  const { data, error } = await supabase.rpc('auto_cancel_expired_bookings');

  if (error) {
    console.error('Error running auto-cancel:', error.message);
  } else {
    console.log(`✔ Auto-cancelled ${data} bookings.`);
  }
});

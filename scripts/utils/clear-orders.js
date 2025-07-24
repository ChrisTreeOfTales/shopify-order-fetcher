const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

db.serialize(() => {
  db.run('DELETE FROM printing_plates');
  db.run('DELETE FROM order_items'); 
  db.run('DELETE FROM orders');
  console.log('✅ Cleared existing orders to apply 3" Measurement stick fix');
});

db.close();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Checking wound marker variant details structure...');

db.get(`
  SELECT *
  FROM order_items oi 
  WHERE oi.sku = 'TK030'
  LIMIT 1
`, [], (err, row) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (row) {
    console.log('📦 Sample TK030 order item fields:');
    Object.keys(row).forEach(key => {
      console.log(`   ${key}: ${row[key]}`);
    });
  } else {
    console.log('❌ No TK030 orders found');
  }
  
  db.close();
});
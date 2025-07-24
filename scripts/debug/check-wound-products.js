const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Checking existing wound marker products in database...');

db.all('SELECT sku, product_name FROM products WHERE product_name LIKE \'%Wound marker%\'', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('📦 Current wound marker products in database:');
  rows.forEach(row => {
    console.log(`   SKU: ${row.sku} | Product: ${row.product_name}`);
  });
  
  console.log('\n💡 Need these products according to CSV:');
  console.log('   - 16mm Wound marker combo');
  console.log('   - 16mm Wound marker XL set'); 
  console.log('   - 12mm Wound marker combo');
  console.log('   - 12mm Wound marker XL set');
  
  db.close();
});
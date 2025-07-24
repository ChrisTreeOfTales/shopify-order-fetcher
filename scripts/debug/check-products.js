const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Checking products in database...');

// Check all products
db.all('SELECT sku, product_name, number_of_printing_plates FROM products ORDER BY product_name', [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('📦 Products in database:');
  rows.forEach(row => {
    console.log(`   SKU: ${row.sku || 'null'} | Product: ${row.product_name} | Plates: ${row.number_of_printing_plates}`);
  });
  
  // Check for measurement stick specifically
  const measurementStick = rows.find(p => p.product_name.includes('Measurement'));
  if (measurementStick) {
    console.log(`\n✅ Found measurement stick: ${measurementStick.product_name} with ${measurementStick.number_of_printing_plates} plates`);
    
    // Check its plate descriptions
    db.all('SELECT plate_name FROM product_plates WHERE product_id = (SELECT product_id FROM products WHERE product_name LIKE "%Measurement%") ORDER BY plate_order', [], (err, plates) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log('   Plate descriptions:');
      plates.forEach((plate, i) => {
        console.log(`     ${i+1}. ${plate.plate_name}`);
      });
      
      db.close();
    });
  } else {
    console.log('\n⚠️ No measurement stick product found in database');
    db.close();
  }
});
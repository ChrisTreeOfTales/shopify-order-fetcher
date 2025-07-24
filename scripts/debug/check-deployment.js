const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Checking for Deployment Zone orders and their plates...');

// Check for Deployment Zone orders
db.all(`
  SELECT 
    oi.product_name, 
    oi.sku,
    pp.plate_type,
    COUNT(*) as plate_count
  FROM order_items oi 
  LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id 
  WHERE oi.product_name LIKE '%Deployment%'
  GROUP BY oi.product_name, oi.sku, pp.plate_type
  ORDER BY oi.product_name, pp.plate_type
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (rows.length === 0) {
    console.log('📦 No Deployment Zone orders found in this batch');
    
    // Let's also check what orders we do have
    db.all(`
      SELECT DISTINCT oi.product_name, COUNT(*) as count
      FROM order_items oi 
      GROUP BY oi.product_name
      ORDER BY count DESC
      LIMIT 5
    `, [], (err, rows) => {
      if (err) {
        console.error('Error:', err);
        return;
      }
      
      console.log('\n📊 Top 5 products in this batch:');
      rows.forEach(row => {
        console.log(`   ${row.product_name} (${row.count}x)`);
      });
      
      db.close();
    });
  } else {
    console.log('🎯 Found Deployment Zone orders:');
    rows.forEach(row => {
      console.log(`   Product: ${row.product_name}`);
      console.log(`   SKU: ${row.sku || 'null'}`);
      console.log(`   Plate Type: ${row.plate_type}`);
      console.log(`   Count: ${row.plate_count}`);
      console.log('   ---');
    });
    
    db.close();
  }
});
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🎨 Checking color mapping for Deployment Zone orders...');

// Get detailed info about Deployment Zone plates and their colors
db.all(`
  SELECT 
    oi.order_item_id,
    oi.product_name,
    oi.variant_details,
    pp.plate_id,
    pp.plate_type,
    o.order_id,
    o.shopify_order_id
  FROM order_items oi 
  LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id 
  LEFT JOIN orders o ON oi.order_id = o.order_id
  WHERE oi.product_name LIKE '%Deployment%'
  ORDER BY oi.order_item_id, pp.plate_id
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('🔍 Deployment Zone orders and their variant details:');
  console.log('');
  
  let currentOrderItem = null;
  rows.forEach(row => {
    if (currentOrderItem !== row.order_item_id) {
      currentOrderItem = row.order_item_id;
      console.log(`📦 Order Item ID: ${row.order_item_id} (Shopify Order: ${row.shopify_order_id})`);
      console.log(`   Product: ${row.product_name}`);
      console.log(`   Variant Details: ${row.variant_details || 'NULL'}`);
      console.log('   Plates:');
    }
    
    console.log(`     - ${row.plate_type} (Plate ID: ${row.plate_id})`);
  });
  
  console.log('\n💡 Expected behavior:');
  console.log('   - Each Deployment Zone set should have specific colors for each plate type');
  console.log('   - Colors should be extracted from the variant_details field');
  console.log('   - Box, Set 1, and Set 2 might have different color combinations');
  
  db.close();
});
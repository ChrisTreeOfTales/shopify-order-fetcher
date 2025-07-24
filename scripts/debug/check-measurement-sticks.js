const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('📏 Checking 3" Measurement stick orders...');

// Check measurement stick orders and their plates
db.all(`
  SELECT 
    oi.order_item_id,
    oi.product_name,
    oi.quantity,
    oi.sku,
    pp.plate_id,
    pp.plate_type,
    o.shopify_order_id
  FROM order_items oi 
  LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id 
  LEFT JOIN orders o ON oi.order_id = o.order_id
  WHERE oi.product_name LIKE '%3%' AND oi.product_name LIKE '%Measurement%'
  ORDER BY oi.order_item_id, pp.plate_id
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (rows.length === 0) {
    console.log('📦 No 3" Measurement stick orders found');
  } else {
    console.log('🔍 Found 3" Measurement stick orders:');
    console.log('');
    
    let currentOrderItem = null;
    let plateCount = 0;
    
    rows.forEach(row => {
      if (currentOrderItem !== row.order_item_id) {
        if (currentOrderItem !== null) {
          console.log(`   Total plates for order item: ${plateCount}`);
          console.log('   ---');
        }
        
        currentOrderItem = row.order_item_id;
        plateCount = 0;
        
        console.log(`📦 Order Item ID: ${row.order_item_id} (Shopify Order: ${row.shopify_order_id})`);
        console.log(`   Product: ${row.product_name}`);
        console.log(`   Quantity: ${row.quantity}`);
        console.log(`   SKU: ${row.sku || 'null'}`);
        console.log('   Plates:');
      }
      
      plateCount++;
      console.log(`     ${plateCount}. ${row.plate_type} (Plate ID: ${row.plate_id})`);
    });
    
    if (currentOrderItem !== null) {
      console.log(`   Total plates for order item: ${plateCount}`);
    }
  }
  
  // Also check what the CSV says about 3" Measurement stick
  console.log('\n💡 Expected behavior according to CSV:');
  console.log('   - 3" Measurement stick should have 1 plate: "1 Plate (2 colors)"');
  console.log('   - If quantity is 2, there should be 2 separate order items, each with 1 plate');
  console.log('   - If there\'s 1 order item with quantity 2, it should still only have 1 plate');
  
  db.close();
});
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🩹 Checking wound marker orders and their mapping...');

// Check wound marker orders
db.all(`
  SELECT 
    oi.order_item_id,
    oi.product_name,
    oi.sku,
    oi.variant_details,
    pp.plate_type,
    COUNT(pp.plate_id) as plate_count,
    o.shopify_order_id
  FROM order_items oi 
  LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id 
  LEFT JOIN orders o ON oi.order_id = o.order_id
  WHERE oi.product_name LIKE '%wound%' OR oi.product_name LIKE '%Wound%'
  GROUP BY oi.order_item_id, pp.plate_type
  ORDER BY oi.order_item_id
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (rows.length === 0) {
    console.log('📦 No wound marker orders found in current batch');
  } else {
    console.log('🔍 Found wound marker orders:');
    console.log('');
    
    let currentOrderItem = null;
    
    rows.forEach(row => {
      if (currentOrderItem !== row.order_item_id) {
        currentOrderItem = row.order_item_id;
        console.log(`📦 Order Item ID: ${row.order_item_id} (Shopify Order: ${row.shopify_order_id})`);
        console.log(`   Product Name: ${row.product_name}`);
        console.log(`   SKU: ${row.sku || 'null'}`);
        console.log(`   Variant Details: ${row.variant_details || 'null'}`);
        console.log('   Plates:');
      }
      
      console.log(`     - ${row.plate_type} (Count: ${row.plate_count})`);
    });
  }
  
  console.log('\n💡 Expected wound marker products from CSV:');
  console.log('   - 16mm Wound marker combo: 1 plate');
  console.log('   - 16mm Wound marker XL set: 1 plate'); 
  console.log('   - 12mm Wound marker combo: 1 plate');
  console.log('   - 12mm Wound marker XL set: 1 plate');
  
  console.log('\n🔍 Current SKU mappings for wound markers:');
  console.log('   - TK030: "16mm Wound marker combo"');
  console.log('   - ACC139: "16mm Wound marker XL set"');
  console.log('   - Missing: 12mm variations');
  
  db.close();
});
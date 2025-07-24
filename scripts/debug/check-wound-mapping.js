const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🩹 Checking wound marker order to product mapping...');

// Check wound marker orders and what products they're mapped to
db.all(`
  SELECT 
    oi.order_item_id,
    oi.product_name as order_product_name,
    oi.sku,
    oi.variant_details,
    p.product_name as mapped_product_name,
    p.product_id,
    pp.plate_type,
    o.shopify_order_id
  FROM order_items oi 
  LEFT JOIN products p ON oi.product_id = p.product_id
  LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id 
  LEFT JOIN orders o ON oi.order_id = o.order_id
  WHERE oi.sku = 'TK030' OR oi.sku = 'ACC139'
  ORDER BY oi.order_item_id
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  if (rows.length === 0) {
    console.log('📦 No wound marker orders found');
  } else {
    console.log('🔍 Wound marker order-to-product mapping:');
    console.log('');
    
    let currentOrderItem = null;
    
    rows.forEach(row => {
      if (currentOrderItem !== row.order_item_id) {
        currentOrderItem = row.order_item_id;
        console.log(`📦 Order Item ID: ${row.order_item_id}`);
        console.log(`   Order Product: ${row.order_product_name}`);
        console.log(`   SKU: ${row.sku}`);
        console.log(`   Variant Details: ${row.variant_details || 'null'}`);
        console.log(`   Mapped to Product: ${row.mapped_product_name} (ID: ${row.product_id})`);
        console.log(`   Plates: ${row.plate_type}`);
        console.log('');
      }
    });
    
    console.log('💡 Expected mappings:');
    console.log('   - TK030 + "Dice size: 12mm|Type: XL pack" -> "12mm Wound marker XL set"');
    console.log('   - TK030 + "Dice size: 16mm|Type: Combo pack" -> "16mm Wound marker combo"');
    console.log('   - ACC139 (any variant) -> "16mm Wound marker XL set"');
  }
  
  db.close();
});
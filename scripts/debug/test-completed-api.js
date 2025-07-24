const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🔍 Testing completed orders data...');

// Check what order items we have with "Printed" status
db.all(`
  SELECT 
    oi.order_item_id,
    oi.product_name,
    COALESCE(p.product_name, oi.product_name) as display_product_name,
    c.name as customer_name,
    COUNT(pp.plate_id) as total_plates,
    SUM(CASE WHEN pp.status = 'Printed' THEN 1 ELSE 0 END) as printed_plates,
    GROUP_CONCAT(pp.status, ', ') as all_statuses
  FROM order_items oi
  LEFT JOIN customers c ON oi.customer_id = c.customer_id
  LEFT JOIN products p ON oi.product_id = p.product_id
  LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id
  GROUP BY oi.order_item_id
  ORDER BY oi.order_item_id
`, [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('📊 Order items status:');
  console.log('');
  
  rows.forEach(row => {
    const isCompleted = row.total_plates > 0 && row.total_plates === row.printed_plates;
    const status = isCompleted ? '✅ COMPLETED' : '⏳ In Progress';
    
    console.log(`${status} Order Item ${row.order_item_id}:`);
    console.log(`   Customer: ${row.customer_name}`);
    console.log(`   Product: ${row.display_product_name}`);
    console.log(`   Plates: ${row.printed_plates}/${row.total_plates} printed`);
    console.log(`   All statuses: ${row.all_statuses}`);
    console.log('');
  });
  
  const completedCount = rows.filter(row => 
    row.total_plates > 0 && row.total_plates === row.printed_plates
  ).length;
  
  console.log(`🎯 Summary: ${completedCount} completed order items ready for "Mark as Done"`);
  
  db.close();
});
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('orders.db');

console.log('🖨️ Marking some plates as "Printed" for testing...');

// Mark the first few plates from different order items as "Printed"
db.serialize(() => {
  // Get some plates to mark as printed
  db.all(`
    SELECT DISTINCT pp.order_item_id, COUNT(*) as plate_count
    FROM printing_plates pp
    GROUP BY pp.order_item_id
    LIMIT 3
  `, [], (err, orderItems) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    console.log(`Found ${orderItems.length} order items to update`);
    
    // Mark all plates for the first 2 order items as "Printed"
    orderItems.slice(0, 2).forEach((item, index) => {
      db.run(`
        UPDATE printing_plates 
        SET status = 'Printed', updated_at = CURRENT_TIMESTAMP 
        WHERE order_item_id = ?
      `, [item.order_item_id], function(err) {
        if (err) {
          console.error('Error updating plates:', err);
        } else {
          console.log(`✅ Marked ${this.changes} plates as "Printed" for order item ${item.order_item_id}`);
        }
        
        // Close database after last update
        if (index === 1) {
          db.close(() => {
            console.log('🎉 Completed! Some order items now have all plates marked as "Printed"');
          });
        }
      });
    });
  });
});
// Migration script to add product_plates table for storing plate descriptions
const sqlite3 = require('sqlite3').verbose();

console.log('🔄 Creating product_plates table...');

const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Create the product_plates table
db.run(`CREATE TABLE IF NOT EXISTS product_plates (
    product_plate_id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    plate_order INTEGER NOT NULL,
    plate_name TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products (product_id)
)`, (err) => {
    if (err) {
        console.error('❌ Error creating product_plates table:', err.message);
        db.close();
        process.exit(1);
    } else {
        console.log('✅ Successfully created product_plates table');
    }
    
    // Close database connection
    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err.message);
        } else {
            console.log('✅ Migration complete!');
        }
    });
});
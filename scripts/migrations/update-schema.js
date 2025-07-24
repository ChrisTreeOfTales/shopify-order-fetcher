// Script to update the database schema to add new columns
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Add new columns to order_items table
function updateSchema() {
    console.log('🔧 Updating database schema...');

    // Add product_name column
    db.run(`ALTER TABLE order_items ADD COLUMN product_name TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding product_name column:', err.message);
        } else {
            console.log('✓ Added product_name column');
        }
    });

    // Add variant_details column
    db.run(`ALTER TABLE order_items ADD COLUMN variant_details TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding variant_details column:', err.message);
        } else {
            console.log('✓ Added variant_details column');
        }
    });

    // Add sku column
    db.run(`ALTER TABLE order_items ADD COLUMN sku TEXT`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding sku column:', err.message);
        } else {
            console.log('✓ Added sku column');
        }
    });

    // Add product_id column (foreign key to products table)
    db.run(`ALTER TABLE order_items ADD COLUMN product_id INTEGER`, (err) => {
        if (err && !err.message.includes('duplicate column name')) {
            console.error('Error adding product_id column:', err.message);
        } else {
            console.log('✓ Added product_id column');
        }

        // Close database after all operations
        setTimeout(() => {
            db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err.message);
                } else {
                    console.log('✅ Schema update complete!');
                }
            });
        }, 500);
    });
}

updateSchema();
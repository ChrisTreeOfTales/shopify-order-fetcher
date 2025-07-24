// Migration script to add plate_type column to existing printing_plates table
const sqlite3 = require('sqlite3').verbose();

console.log('🔄 Running migration to add plate_type column...');

const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Check if the column already exists
db.get("PRAGMA table_info(printing_plates)", (err, row) => {
    if (err) {
        console.error('❌ Error checking table info:', err);
        db.close();
        process.exit(1);
    }
});

// Add the plate_type column
db.run("ALTER TABLE printing_plates ADD COLUMN plate_type TEXT NOT NULL DEFAULT 'Plate'", (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('ℹ️  Column plate_type already exists, skipping migration');
        } else {
            console.error('❌ Error adding plate_type column:', err.message);
            db.close();
            process.exit(1);
        }
    } else {
        console.log('✅ Successfully added plate_type column');
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
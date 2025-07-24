// This script creates all the database tables based on our schema
// Run this once to set up your database structure

const sqlite3 = require('sqlite3').verbose();

// Create/connect to the database file
const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Function to create all tables
function createTables() {
    console.log('🔨 Creating database tables...');

    // 1. Create customers table
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        number_of_orders INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating customers table:', err);
        else console.log('✓ Customers table created');
    });

    // 2. Create products table
    db.run(`CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_name TEXT NOT NULL,
        category TEXT,
        number_of_printing_plates INTEGER NOT NULL,
        box_size TEXT,
        sku TEXT UNIQUE NOT NULL
    )`, (err) => {
        if (err) console.error('Error creating products table:', err);
        else console.log('✓ Products table created');
    });

    // 3. Create filaments table
    db.run(`CREATE TABLE IF NOT EXISTS filaments (
        filament_id INTEGER PRIMARY KEY AUTOINCREMENT,
        color_name TEXT NOT NULL,
        price REAL,
        hex_code TEXT,
        supplier TEXT
    )`, (err) => {
        if (err) console.error('Error creating filaments table:', err);
        else console.log('✓ Filaments table created');
    });

    // 4. Create orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        shopify_order_id TEXT UNIQUE NOT NULL,
        customer_id INTEGER,
        ship_by_date DATE,
        order_status TEXT,
        total_price REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
    )`, (err) => {
        if (err) console.error('Error creating orders table:', err);
        else console.log('✓ Orders table created');
    });

    // 5. Create order_items table
    db.run(`CREATE TABLE IF NOT EXISTS order_items (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER,
        product_id INTEGER,
        customer_id INTEGER,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        variant_title TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (order_id) REFERENCES orders (order_id),
        FOREIGN KEY (product_id) REFERENCES products (product_id),
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
    )`, (err) => {
        if (err) console.error('Error creating order_items table:', err);
        else console.log('✓ Order Items table created');
    });

    // 6. Create printing_plates table
    db.run(`CREATE TABLE IF NOT EXISTS printing_plates (
        plate_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_item_id INTEGER,
        plate_type TEXT NOT NULL DEFAULT 'Plate',
        status TEXT DEFAULT 'In Queue',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (order_item_id) REFERENCES order_items (order_item_id)
    )`, (err) => {
        if (err) console.error('Error creating printing_plates table:', err);
        else console.log('✓ Printing Plates table created');
    });

    // 7. Create plate_filaments junction table
    db.run(`CREATE TABLE IF NOT EXISTS plate_filaments (
        plate_id INTEGER,
        filament_id INTEGER,
        PRIMARY KEY (plate_id, filament_id),
        FOREIGN KEY (plate_id) REFERENCES printing_plates (plate_id),
        FOREIGN KEY (filament_id) REFERENCES filaments (filament_id)
    )`, (err) => {
        if (err) console.error('Error creating plate_filaments table:', err);
        else console.log('✓ Plate-Filaments junction table created');
    });

    // Close the database connection after a short delay to ensure all tables are created
    setTimeout(() => {
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('✅ Database setup complete! Tables created successfully.');
                console.log('📁 Database file: orders.db');
            }
        });
    }, 1000);
}

// Run the table creation
createTables();
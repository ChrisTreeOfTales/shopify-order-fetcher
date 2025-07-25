// Database Setup V2 - Hierarchical Structure
// Parts -> Items -> Products -> Orders

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'orders.db');

console.log('🗃️  Setting up database v2 with hierarchical structure...');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

// Create tables in the correct order (dependencies first)
db.serialize(() => {
    
    // 1. PARTS TABLE - Individual printed components
    console.log('Creating parts table...');
    db.run(`
        CREATE TABLE IF NOT EXISTS parts (
            part_id INTEGER PRIMARY KEY AUTOINCREMENT,
            part_name TEXT NOT NULL UNIQUE,
            part_description TEXT,
            number_of_colors INTEGER NOT NULL DEFAULT 1,
            printing_cost_sek DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            printing_time_minutes INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating parts table:', err.message);
        } else {
            console.log('✅ Parts table created successfully');
        }
    });

    // 2. ITEMS TABLE - Collections of parts that make up a sellable unit
    console.log('Creating items table...');
    db.run(`
        CREATE TABLE IF NOT EXISTS items (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL UNIQUE,
            item_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating items table:', err.message);
        } else {
            console.log('✅ Items table created successfully');
        }
    });

    // 3. ITEM_PARTS TABLE - Junction table linking items to their component parts
    console.log('Creating item_parts junction table...');
    db.run(`
        CREATE TABLE IF NOT EXISTS item_parts (
            item_part_id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_id INTEGER NOT NULL,
            part_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
            FOREIGN KEY (part_id) REFERENCES parts(part_id) ON DELETE CASCADE,
            UNIQUE(item_id, part_id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating item_parts table:', err.message);
        } else {
            console.log('✅ Item_parts junction table created successfully');
        }
    });

    // 4. PRODUCTS TABLE - What customers see and buy (Shopify products)
    console.log('Creating products table...');
    db.run(`
        CREATE TABLE IF NOT EXISTS products_v2 (
            product_id INTEGER PRIMARY KEY AUTOINCREMENT,
            shopify_product_id TEXT,
            sku TEXT NOT NULL UNIQUE,
            product_name TEXT NOT NULL,
            product_description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating products_v2 table:', err.message);
        } else {
            console.log('✅ Products_v2 table created successfully');
        }
    });

    // 5. PRODUCT_ITEMS TABLE - Junction table linking products to their component items
    console.log('Creating product_items junction table...');
    db.run(`
        CREATE TABLE IF NOT EXISTS product_items (
            product_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id INTEGER NOT NULL,
            item_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (product_id) REFERENCES products_v2(product_id) ON DELETE CASCADE,
            FOREIGN KEY (item_id) REFERENCES items(item_id) ON DELETE CASCADE,
            UNIQUE(product_id, item_id)
        )
    `, (err) => {
        if (err) {
            console.error('❌ Error creating product_items table:', err.message);
        } else {
            console.log('✅ Product_items junction table created successfully');
        }
    });

    // Insert some sample parts to get started
    console.log('Inserting sample parts data...');
    
    const sampleParts = [
        // Battlebox parts (costs converted to SEK: ~10 SEK = 1 USD)
        ['Battlebox Base', 'Bottom foundation component of the Battlebox', 1, 5.50, 15],
        ['Battlebox Lid', 'Top cover with customizable design', 2, 8.25, 25],
        ['Battlebox Dice Rack', 'Internal dice storage component', 1, 4.40, 12],
        ['Battlebox Storage Spacers', 'Internal organization components', 2, 3.30, 10],
        
        // Deployment Zone parts  
        ['Deployment Box Base', 'Storage box base', 1, 4.95, 18],
        ['Deployment Box Lid', 'Storage box lid with text', 2, 3.85, 15],
        ['Deployment Zone Marker Set 1', 'First set of zone markers', 2, 6.60, 20],
        ['Deployment Zone Marker Set 2', 'Second set of zone markers', 2, 6.60, 20],
        
        // Other common parts
        ['Wound Marker 16mm', 'Standard 16mm wound tracking marker', 2, 1.65, 8],
        ['Measurement Stick 3inch', '3 inch measurement tool', 1, 2.75, 10],
        ['Objective Marker', 'Game objective marker', 2, 2.20, 12]
    ];
    
    const insertPart = db.prepare(`
        INSERT INTO parts (part_name, part_description, number_of_colors, printing_cost_sek, printing_time_minutes)
        VALUES (?, ?, ?, ?, ?)
    `);
    
    sampleParts.forEach(part => {
        insertPart.run(part, (err) => {
            if (err) {
                console.error(`❌ Error inserting part ${part[0]}:`, err.message);
            } else {
                console.log(`✅ Inserted part: ${part[0]}`);
            }
        });
    });
    
    insertPart.finalize();
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    db.run('CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(part_name)');
    db.run('CREATE INDEX IF NOT EXISTS idx_items_name ON items(item_name)');
    db.run('CREATE INDEX IF NOT EXISTS idx_products_sku ON products_v2(sku)');
    db.run('CREATE INDEX IF NOT EXISTS idx_item_parts_item ON item_parts(item_id)');
    db.run('CREATE INDEX IF NOT EXISTS idx_product_items_product ON product_items(product_id)');

});

// Close database connection
db.close((err) => {
    if (err) {
        console.error('❌ Error closing database:', err.message);
    } else {
        console.log('✅ Database setup v2 completed successfully');
        console.log('\n📋 Next steps:');
        console.log('1. Run: npm run setup-db-v2');
        console.log('2. View parts: npm run view-parts'); 
        console.log('3. Manually add/edit parts as needed');
        console.log('4. Create items and products');
    }
});
// Script to populate the products table with your actual products and their printing plate requirements
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Helper function to run database queries with promises
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

// Products with their printing plate requirements
const products = [
    {
        sku: 'BB0001',
        product_name: 'The Battlebox (All Variants)',
        category: 'Storage',
        number_of_printing_plates: 4,
        box_size: 'Large',
        plate_descriptions: ['Base', 'Lid', 'Dice Rack', 'Spacers & Storage']
    },
    {
        sku: 'ACC044',
        product_name: '3-Inch Movement & Combat Ruler | Precise Wargame Measuring Gauge (3", 2", 1", 0.5")',
        category: 'Accessories',
        number_of_printing_plates: 1,
        box_size: 'Small',
        plate_descriptions: ['Ruler']
    },
    {
        sku: 'ACC110',
        product_name: '9" & 6" Perimeter marker set | Precise 9" & 6" Wargaming Range Gauges',
        category: 'Accessories',
        number_of_printing_plates: 1,
        box_size: 'Medium',
        plate_descriptions: ['Combined 9" & 6" markers']
    },
    {
        sku: 'TK030',
        product_name: 'Wound Markers & Damage Counters | Dice Slot Holders (1D6 to 4D6) for Wargames',
        category: 'Tokens',
        number_of_printing_plates: 3,
        box_size: 'Medium',
        plate_descriptions: ['Base tokens', 'Dice holders', 'Storage box']
    },
    {
        sku: 'TOK0001',
        product_name: 'Generic token set with magnetic box',
        category: 'Tokens',
        number_of_printing_plates: 2,
        box_size: 'Medium',
        plate_descriptions: ['Tokens', 'Storage box']
    },
    {
        sku: 'DEPLOYMENT001', // This product doesn't seem to have a consistent SKU in your orders
        product_name: 'Deployment Zone Markes w/ Magnetic Box | Double set',
        category: 'Accessories',
        number_of_printing_plates: 3,
        box_size: 'Medium',
        plate_descriptions: ['First set markers', 'Second set markers', 'Storage box']
    }
];

async function setupProducts() {
    console.log('🏭 Setting up products with printing plate requirements...');

    try {
        // Clear existing products (in case we're running this multiple times)
        await runQuery('DELETE FROM products');
        console.log('🗑️ Cleared existing products');

        // Clear existing product plates
        await runQuery('DELETE FROM product_plates');
        console.log('🗑️ Cleared existing product plates');

        // Insert each product
        for (const product of products) {
            const result = await runQuery(
                `INSERT INTO products (sku, product_name, category, number_of_printing_plates, box_size) 
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    product.sku,
                    product.product_name,
                    product.category,
                    product.number_of_printing_plates,
                    product.box_size
                ]
            );

            const productId = result.id;

            // Insert plate descriptions for this product
            for (let i = 0; i < product.plate_descriptions.length; i++) {
                await runQuery(
                    `INSERT INTO product_plates (product_id, plate_order, plate_name) 
                     VALUES (?, ?, ?)`,
                    [productId, i + 1, product.plate_descriptions[i]]
                );
            }

            console.log(`✅ Added: ${product.product_name}`);
            console.log(`   SKU: ${product.sku} | Plates needed: ${product.number_of_printing_plates}`);
            console.log(`   Plates: ${product.plate_descriptions.join(', ')}`);
        }

        console.log(`\n🎉 Successfully added ${products.length} products to the database!`);

    } catch (error) {
        console.error('❌ Error setting up products:', error.message);
    } finally {
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('❌ Error closing database:', err.message);
            } else {
                console.log('✅ Database connection closed');
            }
        });
    }
}

// Run the setup
setupProducts();
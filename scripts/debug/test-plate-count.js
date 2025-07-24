// Test script to show how the new printing plate counts work
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./orders.db', (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
        process.exit(1);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// Helper function to get data from database
function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

async function testPlateRequirements() {
    console.log('🧪 Testing printing plate requirements for each product:\n');

    const products = [
        { sku: 'BB0001', name: 'The Battlebox' },
        { sku: 'ACC044', name: '3-Inch Ruler' },
        { sku: 'ACC110', name: '9" & 6" Perimeter markers' },
        { sku: 'TK030', name: 'Wound Markers' },
        { sku: 'TOK0001', name: 'Generic tokens' },
        { sku: 'DEPLOYMENT001', name: 'Deployment Zone Markers' }
    ];

    for (const testProduct of products) {
        try {
            const product = await getQuery(
                'SELECT product_name, number_of_printing_plates FROM products WHERE sku = ?',
                [testProduct.sku]
            );
            
            if (product) {
                console.log(`📦 ${testProduct.name} (${testProduct.sku})`);
                console.log(`   Printing plates needed: ${product.number_of_printing_plates}`);
                console.log('');
            } else {
                console.log(`❌ ${testProduct.name} (${testProduct.sku}) - Not found in database`);
            }
        } catch (error) {
            console.error(`❌ Error checking ${testProduct.sku}:`, error.message);
        }
    }

    // Show current orders with ACC110 and their plate counts
    console.log('\n🔍 Current orders with 9" & 6" Perimeter markers in database:');
    
    const perimeterOrders = await new Promise((resolve, reject) => {
        db.all(`
            SELECT 
                oi.order_item_id,
                c.name as customer_name,
                oi.sku,
                COUNT(pp.plate_id) as total_plates
            FROM order_items oi
            LEFT JOIN customers c ON oi.customer_id = c.customer_id
            LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id
            WHERE oi.sku = 'ACC110'
            GROUP BY oi.order_item_id
        `, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });

    if (perimeterOrders.length > 0) {
        perimeterOrders.forEach(order => {
            console.log(`   ${order.customer_name}: ${order.total_plates} plates (should be 1 for new orders)`);
        });
    } else {
        console.log('   No orders with ACC110 found');
    }

    // Close database
    db.close();
    console.log('\n✅ Test complete!');
}

testPlateRequirements();
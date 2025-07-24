const { ShopifyService } = require('./dist/services/ShopifyService');
const { DatabaseService } = require('./dist/services/DatabaseService');  
const { OrderService } = require('./dist/services/OrderService');

async function testDeploymentZone() {
  try {
    console.log('🧪 Testing Deployment Zone fix...');
    
    const dbService = new DatabaseService();
    const shopifyService = new ShopifyService();
    const orderService = new OrderService(dbService);
    
    console.log('📡 Fetching orders from Shopify...');
    const orders = await shopifyService.getOrdersSinceLastSync();
    console.log('📦 Found', orders.length, 'orders');
    
    // Process just the first few orders for testing
    for (let i = 0; i < Math.min(3, orders.length); i++) {
      const order = orders[i];
      console.log(`\n🔍 Processing order ${i+1}: #${order.order_number}`);
      
      const exists = await orderService.orderExists(order.id.toString());
      if (!exists) {
        console.log('💾 Creating new order...');
        await orderService.createOrder(order);
      } else {
        console.log('ℹ️ Order already exists, skipping');
      }
    }
    
    console.log('\n✅ Test completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testDeploymentZone();
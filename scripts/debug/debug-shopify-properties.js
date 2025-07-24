const { ShopifyService } = require('./dist/services/ShopifyService');

async function debugShopifyProperties() {
  try {
    console.log('🔍 Debugging Shopify line item properties...');
    
    const shopifyService = new ShopifyService();
    const orders = await shopifyService.getOrdersSinceLastSync();
    
    console.log(`📦 Found ${orders.length} orders`);
    
    // Find wound marker items
    for (const order of orders.slice(0, 5)) { // Check first 5 orders
      for (const item of order.line_items) {
        if (item.sku === 'TK030') {
          console.log('\n🩹 Found TK030 wound marker item:');
          console.log(`   Title: ${item.title}`);
          console.log(`   SKU: ${item.sku}`);
          console.log(`   Variant Title: ${item.variant_title}`);
          console.log(`   Properties:`, item.properties);
          
          if (item.properties && item.properties.length > 0) {
            console.log('   Parsed properties:');
            item.properties.forEach(prop => {
              if (!prop.name.startsWith('_mws')) {
                console.log(`     ${prop.name}: ${prop.value}`);
              }
            });
          } else {
            console.log('   ❌ No properties found!');
          }
          
          break; // Just check first TK030 item
        }
      }
    }
    
    console.log('\n✅ Debug completed');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugShopifyProperties();
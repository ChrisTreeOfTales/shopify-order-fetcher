// Main TypeScript server
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import services
import { DatabaseService } from '@/services/DatabaseService';
import { OrderService } from '@/services/OrderService';
import { ShopifyService } from '@/services/ShopifyService';

// Import routes
import { createOrdersRouter } from '@/routes/orders';
import { createShopifyRouter } from '@/routes/shopify';
import { createPrintingRouter } from '@/routes/printing';

// Types
import { ApiResponse } from '@/types';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize services
let dbService: DatabaseService;
let orderService: OrderService;
let shopifyService: ShopifyService;

try {
  // Initialize database service
  dbService = new DatabaseService({ filename: './orders.db' });
  
  // Initialize business services
  orderService = new OrderService(dbService);
  shopifyService = new ShopifyService();

  console.log('✅ All services initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize services:', error);
  process.exit(1);
}

// Health check endpoint
app.get('/health', (req, res) => {
  const response: ApiResponse<{ status: string; timestamp: string }> = {
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString()
    },
    message: 'Server is running'
  };
  res.json(response);
});

// API routes
app.use('/api/orders', createOrdersRouter(orderService));
app.use('/api/shopify', createShopifyRouter(shopifyService, orderService));
app.use('/api/printing', createPrintingRouter(dbService));

// Serve the main HTML file for SPA
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  const response: ApiResponse<never> = {
    success: false,
    error: 'Endpoint not found',
    message: `API endpoint ${req.originalUrl} not found`
  };
  res.status(404).json(response);
});

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', error);
  
  const response: ApiResponse<never> = {
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  };
  
  res.status(500).json(response);
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🌐 Server running at http://localhost:${PORT}`);
  console.log(`📊 View your orders at http://localhost:${PORT}`);
  console.log(`🔧 API docs: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  server.close(async () => {
    try {
      await dbService.close();
      console.log('✅ Server shut down gracefully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  
  server.close(async () => {
    try {
      await dbService.close();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });
});

export default app;
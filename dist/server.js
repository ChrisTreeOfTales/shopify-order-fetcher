"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Main TypeScript server
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Import services
const DatabaseService_1 = require("@/services/DatabaseService");
const OrderService_1 = require("@/services/OrderService");
const ShopifyService_1 = require("@/services/ShopifyService");
// Import routes
const orders_1 = require("@/routes/orders");
const shopify_1 = require("@/routes/shopify");
const printing_1 = require("@/routes/printing");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
// Initialize services
let dbService;
let orderService;
let shopifyService;
try {
    // Initialize database service
    dbService = new DatabaseService_1.DatabaseService({ filename: './orders.db' });
    // Initialize business services
    orderService = new OrderService_1.OrderService(dbService);
    shopifyService = new ShopifyService_1.ShopifyService();
    console.log('✅ All services initialized successfully');
}
catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
}
// Health check endpoint
app.get('/health', (req, res) => {
    const response = {
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
app.use('/api/orders', (0, orders_1.createOrdersRouter)(orderService));
app.use('/api/shopify', (0, shopify_1.createShopifyRouter)(shopifyService, orderService));
app.use('/api/printing', (0, printing_1.createPrintingRouter)(dbService));
// Serve the main HTML file for SPA
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'public', 'index.html'));
});
// 404 handler for API routes
app.use('/api/*', (req, res) => {
    const response = {
        success: false,
        error: 'Endpoint not found',
        message: `API endpoint ${req.originalUrl} not found`
    };
    res.status(404).json(response);
});
// Global error handler
app.use((error, req, res, next) => {
    console.error('❌ Unhandled error:', error);
    const response = {
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
        }
        catch (error) {
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
        }
        catch (error) {
            console.error('❌ Error during shutdown:', error);
            process.exit(1);
        }
    });
});
exports.default = app;
//# sourceMappingURL=server.js.map
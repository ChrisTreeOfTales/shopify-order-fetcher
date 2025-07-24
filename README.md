# Shopify Order Management System

A complete order management system that fetches orders from Shopify, stores them in a SQLite database, and provides a web interface for viewing orders and tracking printing plate statuses.

## Features

- 🛒 **Shopify Integration**: Automatically fetch orders from your Shopify store
- 🗄️ **Database Storage**: Store orders, customers, and order items in SQLite
- 🖨️ **Printing Plate Tracking**: Track printing plates required for each product
- 🌐 **Web Interface**: Clean, responsive web dashboard for viewing orders
- 📊 **Order Cards**: Display orders as easy-to-read cards with key information
- 🔍 **Order Details**: Click any order to see detailed item information and printing plate status

## Quick Start

### 1. Set up the database
```bash
npm run setup-db
npm run setup-products
```

### 2. Fetch orders from Shopify
```bash
npm run fetch-save
```

### 3. Start the web interface
```bash
npm start
```

Then open your browser to: **http://localhost:3000**

## Available Commands

### Data Management
- `npm run setup-db` - Create database tables
- `npm run setup-products` - Populate products with printing plate requirements
- `npm run update-schema` - Update database schema (when needed)

### Shopify Integration
- `npm run fetch` - Fetch and display orders (no database saving)
- `npm run fetch-save` - Fetch orders and save to database

### Viewing Data
- `npm run view-db` - View database contents in terminal
- `npm run test-plates` - Check product printing plate requirements
- `npm start` - Start web interface at http://localhost:3000

## Web Interface

The web dashboard displays:

### Order Cards
Each order card shows:
- Order number and date
- Customer name and email
- Order total in SEK
- Payment status
- Number of items and quantity

### Order Details Modal
Click any order card to see:
- Complete order summary
- Each order item with product details
- Variant information (colors, sizes, etc.)
- Printing plate status for each item

## Product Configuration

Products are pre-configured with specific printing plate requirements:

- **Battlebox (BB0001)**: 4 plates (Base, Lid, Dice Rack, Spacers & Storage)
- **3-Inch Ruler (ACC044)**: 1 plate (Ruler)
- **9" & 6" Perimeter markers (ACC110)**: 1 plate (Combined markers)
- **Wound Markers (TK030)**: 3 plates (Base tokens, Dice holders, Storage box)
- **Generic tokens (TOK0001)**: 2 plates (Tokens, Storage box)
- **Deployment Zone Markers (DEPLOYMENT001)**: 3 plates (First set, Second set, Storage box)

## Architecture

- **Backend**: Express.js server with SQLite database
- **Frontend**: HTML/CSS/JavaScript with Tailwind CSS
- **Database**: SQLite with tables for customers, orders, order_items, products, and printing_plates
- **API**: RESTful endpoints for orders and order items

## File Structure

```
├── server.js              # Express server
├── public/
│   ├── index.html         # Main dashboard page
│   ├── script.js          # Frontend JavaScript
│   └── styles.css         # Custom CSS styles
├── database-setup.js      # Database initialization
├── setup-products.js     # Product configuration
├── index-with-database.js # Shopify order fetcher
└── orders.db             # SQLite database file
```

## Environment Variables

Make sure your `.env` file contains:
```
SHOPIFY_STORE=your-store.myshopify.com
SHOPIFY_TOKEN=your_access_token
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
```

## Next Steps

- Add printing plate status updates
- Create filtered views by plate status
- Add customer management features
- Implement order status updates
- Add Etsy integration
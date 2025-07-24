# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a minimal Node.js project for fetching Shopify orders. The project is currently in a scaffold state with dependencies installed but no implementation code yet.

## Dependencies

- **axios**: HTTP client for making API requests to Shopify
- **dotenv**: Environment variable management for API credentials
- **sqlite3**: SQLite database for storing order data

## Environment Configuration

The project uses environment variables stored in `.env` for Shopify API configuration:
- `SHOPIFY_STORE`: The Shopify store domain
- `SHOPIFY_TOKEN`: Shopify API access token
- `SHOPIFY_API_KEY`: Shopify API application key
- `SHOPIFY_API_SECRET`: Shopify API application secret

## Development Commands

- `npm run fetch`: Fetch and display orders (no database saving)
- `npm run fetch-save`: Fetch orders and save to SQLite database
- `npm run setup-db`: Initialize database tables (run once)
- `npm run view-db`: View current database contents
- `npm test`: Currently returns an error - no tests configured

## Architecture

This is a Shopify order management system that:
1. Fetches orders from Shopify Admin API
2. Stores order data in SQLite database with full relational structure
3. Tracks printing plate statuses for manufacturing workflow
4. Prevents duplicate orders from being saved
5. Calculates customer lifetime value

### Database Structure
- **customers**: Customer information and order counts
- **orders**: Order details linked to customers
- **order_items**: Individual items within orders
- **printing_plates**: Manufacturing status tracking for each order item
- **products**: Product catalog (to be populated)
- **filaments**: Available colors/materials (to be populated)

### Key Files
- `index.js`: Display-only order fetcher
- `index-with-database.js`: Full database-enabled order processor
- `database-setup.js`: Creates database tables
- `view-database.js`: Shows current database contents
- `docs/database-schema.md`: Complete database schema documentation

## Security Notes

- API credentials are stored in `.env` file (excluded from git via `.gitignore`)
- When implementing, ensure API keys are never logged or exposed in error messages
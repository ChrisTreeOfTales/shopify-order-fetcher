# Cross-Platform Development Guide

This repository is now configured for seamless development across Windows and macOS.

## Line Ending Configuration

### ✅ Fixed: Git Line Ending Issues

The repository now includes:
- **`.gitattributes`**: Handles line endings automatically across platforms
- **Updated `.gitignore`**: Excludes platform-specific and generated files

### Configuration Applied

```bash
# Already configured in the repository:
# - .gitattributes file with proper text/binary file handling
# - Git config for Windows: core.autocrlf = true
```

## Development Setup

### On macOS (after cloning):

```bash
# Clone the repository
git clone https://github.com/ChrisTreeOfTales/shopify-order-fetcher.git
cd shopify-order-fetcher

# Install dependencies
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your Shopify credentials

# Build TypeScript
npm run build

# Start development server
npm run dev
```

### On Windows (already configured):

```bash
# Build and start
npm run build
npm start
```

## Key Files for Cross-Platform Work

### Database Files (Excluded from Git)
- `orders.db` - SQLite database (platform-specific binary)
- `dist/` - Compiled TypeScript (generated files)

### Environment Configuration
- `.env` - Your Shopify API credentials (create from template)
- `package.json` - Dependencies and scripts

### Development Commands
- `npm run dev` - Development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run view-parts` - View parts database
- `npm run setup-db-v2` - Initialize hierarchical database

## Database Initialization

When setting up on a new machine:

```bash
# Initialize the hierarchical database structure
npm run setup-db-v2

# View the parts table
npm run view-parts
```

## Recent Updates

✅ **Hierarchical Database Structure**
- Parts table with SEK pricing
- Admin interface for Parts CRUD operations
- Cross-platform compatibility fixes

✅ **Line Ending Resolution**
- Added `.gitattributes` for consistent line endings
- Updated `.gitignore` to exclude problematic files
- Proper Git configuration for Windows/macOS compatibility

## Troubleshooting

### If you see line ending warnings:
These are normal during the transition and will disappear after the first commit/pull on each platform.

### Database Issues:
Delete `orders.db` and run `npm run setup-db-v2` to recreate with sample data.

---

🤖 *Cross-platform configuration completed*
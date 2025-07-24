"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
// Database service for SQLite operations
const sqlite3_1 = __importDefault(require("sqlite3"));
class DatabaseService {
    constructor(config) {
        this.db = new sqlite3_1.default.Database(config.filename, (err) => {
            if (err) {
                console.error('❌ Error connecting to database:', err.message);
                throw err;
            }
            else {
                console.log('✅ Connected to SQLite database');
            }
        });
    }
    /**
     * Execute a query that returns multiple rows
     */
    async query(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows || []);
                }
            });
        });
    }
    /**
     * Execute a query that returns a single row
     */
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    /**
     * Execute an INSERT, UPDATE, or DELETE statement
     */
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({
                        id: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }
    /**
     * Close the database connection
     */
    async close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    console.log('✅ Database connection closed');
                    resolve();
                }
            });
        });
    }
    /**
     * Get the raw database instance (for legacy compatibility)
     */
    getRawDatabase() {
        return this.db;
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=DatabaseService.js.map
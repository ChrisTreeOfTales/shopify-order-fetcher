// Database service for SQLite operations
import sqlite3 from 'sqlite3';
import { IDatabaseService, DatabaseConfig } from '@/types';

export class DatabaseService implements IDatabaseService {
  private db: sqlite3.Database;

  constructor(config: DatabaseConfig) {
    this.db = new sqlite3.Database(config.filename, (err) => {
      if (err) {
        console.error('❌ Error connecting to database:', err.message);
        throw err;
      } else {
        console.log('✅ Connected to SQLite database');
      }
    });
  }

  /**
   * Execute a query that returns multiple rows
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err: Error | null, rows: T[]) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  /**
   * Execute a query that returns a single row
   */
  async get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err: Error | null, row: T) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Execute an INSERT, UPDATE, or DELETE statement
   */
  async run(sql: string, params: any[] = []): Promise<{ id: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err: Error | null) {
        if (err) {
          reject(err);
        } else {
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
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          console.log('✅ Database connection closed');
          resolve();
        }
      });
    });
  }

  /**
   * Get the raw database instance (for legacy compatibility)
   */
  getRawDatabase(): sqlite3.Database {
    return this.db;
  }
}
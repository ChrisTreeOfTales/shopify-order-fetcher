import sqlite3 from 'sqlite3';
import { IDatabaseService, DatabaseConfig } from '@/types';
export declare class DatabaseService implements IDatabaseService {
    private db;
    constructor(config: DatabaseConfig);
    /**
     * Execute a query that returns multiple rows
     */
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    /**
     * Execute a query that returns a single row
     */
    get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
    /**
     * Execute an INSERT, UPDATE, or DELETE statement
     */
    run(sql: string, params?: any[]): Promise<{
        id: number;
        changes: number;
    }>;
    /**
     * Close the database connection
     */
    close(): Promise<void>;
    /**
     * Get the raw database instance (for legacy compatibility)
     */
    getRawDatabase(): sqlite3.Database;
}
//# sourceMappingURL=DatabaseService.d.ts.map
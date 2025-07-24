import { Customer, ShopifyCustomer, IDatabaseService } from '@/types';
export declare class CustomerModel {
    private db;
    constructor(db: IDatabaseService);
    /**
     * Create a new customer or update existing one
     */
    createOrUpdate(shopifyCustomer: ShopifyCustomer | null): Promise<number | null>;
    /**
     * Get customer by ID
     */
    getById(customerId: number): Promise<Customer | undefined>;
    /**
     * Get all customers
     */
    getAll(): Promise<Customer[]>;
    /**
     * Get customer by email
     */
    getByEmail(email: string): Promise<Customer | undefined>;
}
//# sourceMappingURL=Customer.d.ts.map
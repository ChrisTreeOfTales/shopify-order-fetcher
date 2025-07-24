import { PrintingPlate, PrintingPlateStatus, IDatabaseService } from '@/types';
export declare class PrintingPlateModel {
    private db;
    constructor(db: IDatabaseService);
    /**
     * Create printing plates for an order item with specific plate types
     */
    createForOrderItem(orderItemId: number, plateTypes: string[]): Promise<void>;
    /**
     * Get all printing plates for an order item
     */
    getByOrderItemId(orderItemId: number): Promise<PrintingPlate[]>;
    /**
     * Update printing plate status
     */
    updateStatus(plateId: number, status: PrintingPlateStatus): Promise<void>;
    /**
     * Get printing plate by ID
     */
    getById(plateId: number): Promise<PrintingPlate | undefined>;
    /**
     * Get plates by status
     */
    getByStatus(status: PrintingPlateStatus): Promise<PrintingPlate[]>;
    /**
     * Get plate status summary for an order item
     */
    getStatusSummary(orderItemId: number): Promise<{
        total_plates: number;
        plates_in_queue: number;
        plates_in_progress: number;
        plates_printed: number;
        plates_done: number;
        plates_blocked: number;
    }>;
    /**
     * Get all plates with order item information
     */
    getAllWithOrderInfo(): Promise<Array<PrintingPlate & {
        product_name: string | null;
        customer_name: string | null;
    }>>;
}
//# sourceMappingURL=PrintingPlate.d.ts.map
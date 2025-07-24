// PrintingPlate model for database operations
import { PrintingPlate, PrintingPlateStatus, IDatabaseService } from '@/types';

export class PrintingPlateModel {
  constructor(private db: IDatabaseService) {}

  /**
   * Create printing plates for an order item with specific plate types
   */
  async createForOrderItem(orderItemId: number, plateTypes: string[]): Promise<void> {
    const platePromises: Promise<{ id: number; changes: number }>[] = [];

    for (const plateType of plateTypes) {
      platePromises.push(
        this.db.run(
          'INSERT INTO printing_plates (order_item_id, plate_type, status) VALUES (?, ?, ?)',
          [orderItemId, plateType, 'In Queue']
        )
      );
    }

    await Promise.all(platePromises);
    console.log(`   🖨️ Created ${plateTypes.length} printing plates for order item ${orderItemId}: ${plateTypes.join(', ')}`);
  }

  /**
   * Get all printing plates for an order item
   */
  async getByOrderItemId(orderItemId: number): Promise<PrintingPlate[]> {
    return this.db.query<PrintingPlate>(
      'SELECT * FROM printing_plates WHERE order_item_id = ? ORDER BY created_at ASC',
      [orderItemId]
    );
  }

  /**
   * Update printing plate status
   */
  async updateStatus(plateId: number, status: PrintingPlateStatus): Promise<void> {
    const updateData: any[] = [status, plateId];
    let sql = 'UPDATE printing_plates SET status = ?, updated_at = CURRENT_TIMESTAMP';

    // If marking as done, also set completed_at
    if (status === 'Done') {
      sql += ', completed_at = CURRENT_TIMESTAMP';
    }

    sql += ' WHERE plate_id = ?';

    await this.db.run(sql, updateData);
    console.log(`   🔄 Updated plate ${plateId} status to: ${status}`);
  }

  /**
   * Get printing plate by ID
   */
  async getById(plateId: number): Promise<PrintingPlate | undefined> {
    return this.db.get<PrintingPlate>(
      'SELECT * FROM printing_plates WHERE plate_id = ?',
      [plateId]
    );
  }

  /**
   * Get plates by status
   */
  async getByStatus(status: PrintingPlateStatus): Promise<PrintingPlate[]> {
    return this.db.query<PrintingPlate>(
      'SELECT * FROM printing_plates WHERE status = ? ORDER BY created_at ASC',
      [status]
    );
  }

  /**
   * Get plate status summary for an order item
   */
  async getStatusSummary(orderItemId: number): Promise<{
    total_plates: number;
    plates_in_queue: number;
    plates_in_progress: number;
    plates_printed: number;
    plates_done: number;
    plates_blocked: number;
  }> {
    const result = await this.db.get<{
      total_plates: number;
      plates_in_queue: number;
      plates_in_progress: number;
      plates_printed: number;
      plates_done: number;
      plates_blocked: number;
    }>(`
      SELECT 
        COUNT(*) as total_plates,
        SUM(CASE WHEN status = 'In Queue' THEN 1 ELSE 0 END) as plates_in_queue,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as plates_in_progress,
        SUM(CASE WHEN status = 'Printed' THEN 1 ELSE 0 END) as plates_printed,
        SUM(CASE WHEN status = 'Done' THEN 1 ELSE 0 END) as plates_done,
        SUM(CASE WHEN status = 'Blocked' THEN 1 ELSE 0 END) as plates_blocked
      FROM printing_plates 
      WHERE order_item_id = ?
    `, [orderItemId]);

    return result || {
      total_plates: 0,
      plates_in_queue: 0,
      plates_in_progress: 0,
      plates_printed: 0,
      plates_done: 0,
      plates_blocked: 0
    };
  }

  /**
   * Get all plates with order item information
   */
  async getAllWithOrderInfo(): Promise<Array<PrintingPlate & { 
    product_name: string | null; 
    customer_name: string | null; 
  }>> {
    return this.db.query<PrintingPlate & { 
      product_name: string | null; 
      customer_name: string | null; 
    }>(`
      SELECT 
        pp.*,
        oi.product_name,
        c.name as customer_name
      FROM printing_plates pp
      LEFT JOIN order_items oi ON pp.order_item_id = oi.order_item_id
      LEFT JOIN customers c ON oi.customer_id = c.customer_id
      ORDER BY pp.created_at DESC
    `);
  }
}
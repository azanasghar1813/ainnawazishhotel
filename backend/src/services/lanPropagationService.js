class LanPropagationService {
  /**
   * Broadcasts order create/update events to connected IP waiter tablets and KDS via Socket.IO.
   */
  async propagate(orderId) {
    try {
      const { socketService } = await import('./socketService.js');
      const { orderService } = await import('./orderService.js');
      const order = orderService.getOrderById(orderId);
      if (order) {
        socketService.emitOrderUpserted(order);
      }
    } catch (err) {
      console.error('[SocketPropagation] Failed to broadcast order change:', err.message);
    }
  }

  async propagateDelete(orderId) {
    try {
      const { socketService } = await import('./socketService.js');
      socketService.emitOrderDeleted(orderId);
    } catch (err) {
      console.error('[SocketPropagation] Failed to broadcast order delete:', err.message);
    }
  }
}

export const lanPropagationService = new LanPropagationService();

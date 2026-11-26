import { io, Socket } from 'socket.io-client';
import { useOrderStore, mapHistoryDetailToOrder } from '../store/orderStore';
import { configApi } from './configApi';

let socket: Socket | null = null;

export const initSocket = async () => {
  if (socket) return;
  
  try {
    const res = await configApi.getAllConfig() as any;
    const config = res?.data || res || {};
    const sync = config?.application?.sync || {};
    
    const mode = sync.device_role || localStorage.getItem('app_mode') || 'TERMINAL';
    
    // We connect to the Hub if we are a terminal, or if we are the hub, we connect to ourselves.
    let hubUrl = '';
    
    // If the frontend is hosted on the same origin (e.g. localhost:5055)
    // we can use window.location as base.
    if (mode === 'TERMINAL' && sync.hub_ip) {
      hubUrl = `http://${sync.hub_ip}:${sync.hub_port || 5000}`;
    } else {
      // For single PC or HUB itself
      hubUrl = `${window.location.protocol}//${window.location.hostname}:${sync.hub_port || 5000}`;
    }
    
    socket = io(hubUrl, {
      auth: {
        token: 'AIN_NAWAZISH_HOTEL_POS_SECRET_V1'
      },
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });
    
    socket.on('connect', () => {
      console.log('[Socket] Connected to Hub real-time feed:', hubUrl);
    });
    
    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected from Hub real-time feed');
    });
    
    socket.on('order:upserted', (orderPayload) => {
      if (!orderPayload) return;
      console.log('[Socket] Order Upserted:', orderPayload.order_number);
      try {
        // Hydrate backend payload into frontend Order object
        // orderPayload is already populated with items, timeline, etc from orderUpsertService / orderService
        const frontendOrder = mapHistoryDetailToOrder(orderPayload, orderPayload);
        useOrderStore.getState().upsertOrder(frontendOrder);
      } catch (err) {
        console.error('[Socket] Failed to process incoming order push', err);
      }
    });

    socket.on('order:deleted', (orderId: string) => {
      if (!orderId) return;
      console.log('[Socket] Order Deleted:', orderId);
      useOrderStore.setState(s => ({ orders: s.orders.filter(o => o.id !== orderId) }));
    });

    socket.on('catalog:updated', () => {
      window.dispatchEvent(new Event('catalog-sync-complete'));
    });

    socket.on('order:lock', ({ orderId, isLocked, lockedBy }: any) => {
      if (!orderId) return;
      if (isLocked) {
        useOrderStore.getState().lockOrder(orderId, lockedBy);
      } else {
        useOrderStore.getState().unlockOrder(orderId);
      }
    });

  } catch (err) {
    console.error('[Socket] Failed to initialize socket connection:', err);
  }
};

export const getSocket = () => socket;

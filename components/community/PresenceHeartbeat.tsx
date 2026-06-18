'use client';

import { useEffect } from 'react';
import { SOCKET_CONFIG } from '@/lib/community/socket-config';

export function PresenceHeartbeat() {
  useEffect(() => {
    const ping = () => {
      fetch('/api/community/heartbeat/', { method: 'POST' }).catch(() => undefined);
    };
    ping();
    const id = window.setInterval(ping, SOCKET_CONFIG.pollingIntervalMs);
    return () => window.clearInterval(id);
  }, []);

  return null;
}

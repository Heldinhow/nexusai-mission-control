import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface LiveIndicatorProps {
  connected: boolean;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ connected }) => {
  return (
    <div className="flex items-center gap-2">
      {connected ? (
        <>
          <Wifi className="w-4 h-4 text-nexus-success" />
          <span className="text-xs text-nexus-text-secondary">Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-nexus-danger" />
          <span className="text-xs text-nexus-text-secondary">Desconectado</span>
        </>
      )}
    </div>
  );
};

export default LiveIndicator;

import { getStatusConfig } from '../utils/statusMappings';

export const StatusBadge = ({ status }: { status: string }) => {
  const config = getStatusConfig(status);
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium border ${config.colors}`}>
      {status}
    </span>
  );
};
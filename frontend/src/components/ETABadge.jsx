import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const ETABadge = ({ etaMinutes, etaText, delayMinutes = 0, size = 'normal' }) => {
  const isDelayed = delayMinutes > 2;
  const isArriving = etaMinutes <= 2;

  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let pulseColor = 'bg-emerald-500';

  if (isDelayed) {
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    pulseColor = 'bg-amber-500';
  } else if (isArriving) {
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    pulseColor = 'bg-blue-500';
  }

  const padding = size === 'small' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <div className={`inline-flex items-center gap-1.5 font-bold rounded-full border shadow-2xs ${badgeColor} ${padding}`}>
      <span className={`w-2 h-2 rounded-full ${pulseColor} animate-ping`} />
      <Clock className="w-3.5 h-3.5" />
      <span>{etaText || (etaMinutes ? `${etaMinutes} mins` : 'Calculating...')}</span>
      {isDelayed && (
        <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.2 rounded-full ml-0.5">
          +{delayMinutes}m delay
        </span>
      )}
    </div>
  );
};

export default ETABadge;

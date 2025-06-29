import React from 'react';
import { AvailabilityStatus } from '../types';

interface AvailabilityButtonsProps {
  currentStatus: AvailabilityStatus;
  onSetStatus: (status: AvailabilityStatus) => void;
}

const AvailabilityButton: React.FC<{
  label: string;
  status: AvailabilityStatus;
  currentStatus: AvailabilityStatus;
  onClick: (status: AvailabilityStatus) => void;
  colorClasses: string;
}> = ({ label, status, currentStatus, onClick, colorClasses }) => {
  const isActive = status === currentStatus;
  const baseClasses = 'w-full px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  const activeClasses = `${colorClasses} text-white shadow`;
  const inactiveClasses = 'bg-slate-200 text-slate-600 hover:bg-slate-300';
  
  return (
    <button
      onClick={() => onClick(status)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      {label}
    </button>
  );
};


const AvailabilityButtons: React.FC<AvailabilityButtonsProps> = ({ currentStatus, onSetStatus }) => {
  return (
    <div className="grid grid-cols-3 gap-2 mt-4">
      <AvailabilityButton
        label="Going"
        status={AvailabilityStatus.ATTENDING}
        currentStatus={currentStatus}
        onClick={onSetStatus}
        colorClasses="bg-club-primary hover:bg-club-primary-dark focus:ring-club-primary"
      />
      <AvailabilityButton
        label="Maybe"
        status={AvailabilityStatus.MAYBE}
        currentStatus={currentStatus}
        onClick={onSetStatus}
        colorClasses="bg-slate-400 hover:bg-slate-500 focus:ring-slate-400"
      />
      <AvailabilityButton
        label="Can't Go"
        status={AvailabilityStatus.NOT_ATTENDING}
        currentStatus={currentStatus}
        onClick={onSetStatus}
        colorClasses="bg-slate-500 hover:bg-slate-600 focus:ring-slate-500"
      />
    </div>
  );
};

export default AvailabilityButtons;
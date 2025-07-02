import React from 'react';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onDelete: () => void;
  onClear: () => void;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({ selectedCount, onDelete, onClear }) => {
  return (
    <div className="sticky top-[65px] z-30 mb-4 p-3 bg-primary-800 text-white rounded-lg shadow-lg flex justify-between items-center animate-fade-in-down">
      <div className="flex items-center gap-3">
        <Icon name="check-badge" className="w-6 h-6 text-green-300" />
        <span className="font-semibold">{selectedCount} session{selectedCount > 1 ? 's' : ''} selected</span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="danger" onClick={onDelete}>
          <Icon name="trash" className="w-5 h-5 mr-2" />
          Delete Selected
        </Button>
        <button onClick={onClear} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Clear selection">
          <Icon name="x-circle" className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;

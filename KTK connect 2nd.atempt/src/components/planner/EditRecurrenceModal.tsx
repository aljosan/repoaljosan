import React from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

interface EditRecurrenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (editSeries: boolean) => void;
}

const EditRecurrenceModal: React.FC<EditRecurrenceModalProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Recurring Session">
        <div className="space-y-4">
            <p className="text-gray-700">This is a recurring session. Do you want to edit only this instance, or the entire series?</p>
            
            <Button variant="secondary" className="w-full text-left !p-4" onClick={() => onConfirm(false)}>
                <div className="flex items-center gap-4">
                    <Icon name="calendar" className="w-8 h-8 text-primary-600"/>
                    <div>
                        <p className="font-semibold">Edit this session only</p>
                        <p className="text-sm text-gray-500">Changes will only apply to this specific date.</p>
                    </div>
                </div>
            </Button>
            
            <Button variant="secondary" className="w-full text-left !p-4" onClick={() => onConfirm(true)}>
                 <div className="flex items-center gap-4">
                    <Icon name="calendar-days" className="w-8 h-8 text-indigo-600"/>
                    <div>
                        <p className="font-semibold">Edit the entire series</p>
                        <p className="text-sm text-gray-500">Changes will apply to all future sessions in this series.</p>
                    </div>
                </div>
            </Button>
        </div>
    </Modal>
  );
};

export default EditRecurrenceModal;

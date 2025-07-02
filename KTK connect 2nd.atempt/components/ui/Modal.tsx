import React, { useEffect, useRef } from 'react';
import Icon from './Icon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the element that was focused before the modal opened
      lastActiveElement.current = document.activeElement as HTMLElement;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select'
      );

      if (focusableElements && focusableElements.length > 0) {
        // Focus the first focusable element in the modal
        focusableElements[0].focus();
      } else {
        // Fallback to the modal panel itself if no focusable elements are found
        modalRef.current?.focus();
      }

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
          return;
        }

        if (e.key === 'Tab') {
          if (!focusableElements || focusableElements.length === 0) {
            e.preventDefault();
            return;
          }
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else { // Tab
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        // Restore focus to the last active element when the modal closes
        lastActiveElement.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            ref={modalRef}
            tabIndex={-1}
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start w-full">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold leading-6 text-gray-900" id="modal-title">
                      {title}
                    </h3>
                    <button 
                      onClick={onClose} 
                      className="text-gray-400 hover:text-gray-600 rounded-full p-1 -m-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      aria-label="Close modal"
                    >
                      <Icon name="close" className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="mt-4">
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
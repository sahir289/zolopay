/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import Lucide from '@/components/Base/Lucide';
import renderObjectData from '@/utils/other-details';

interface MoreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data: { [key: string]: any } | any[];
  check?: boolean;
}

const MoreDetailsModal: React.FC<MoreDetailsModalProps> = ({
  isOpen,
  onClose,
  title = 'Additional Details',
  data,
  check = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] bg-black/50 dark:bg-darkmode-900/70"
      onClick={handleBackgroundClick}
    >
      {/* Right-side drawer modal */}
      <div
        ref={modalRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] md:w-[600px] lg:w-[700px] bg-white dark:bg-darkmode-600 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-darkmode-500 flex-shrink-0">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-200 truncate pr-2">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-darkmode-500 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex-shrink-0"
            aria-label="Close modal"
            type="button"
          >
            <Lucide icon="X" className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-4 space-y-3 sm:space-y-4">
          {data && Object.keys(data).length > 0 ? (
            renderObjectData(data as any)
          ) : (
            <div className="text-center text-gray-500 italic py-6 sm:py-10 text-sm sm:text-base">
              No additional details available
            </div>
          )}
        </div>

        {/* Footer */}
        {check && (
          <div className="flex justify-end px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-darkmode-500 bg-gray-50 dark:bg-darkmode-700 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-darkmode-500 dark:hover:bg-darkmode-400 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoreDetailsModal;
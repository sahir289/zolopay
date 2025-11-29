/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-undef */
import React from 'react';
import Button from '@/components/Base/Button';
import Lucide from '@/components/Base/Lucide';

interface ModalProps {
  handleModal: () => void;
  sendButtonRef?: React.RefObject<HTMLButtonElement>;
  title?: string;
  buttonTitle?: string;
  forOpen: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  handleModal,
  // sendButtonRef,
  title,
  buttonTitle,
  forOpen,
  children,
}) => {
  return (
    <>
      {buttonTitle && (
        <Button
          variant="primary"
          className={`
            ${buttonTitle === 'Claims Filter' || buttonTitle === 'Filter' ? 'group-[.mode--light]:!bg-slate-100 group-[.mode--light]:!text-slate-800' : 
            'group-[.mode--light]:!bg-white/[0.12] group-[.mode--light]:!text-slate-200'}
          group-[.mode--light]:!border-transparent dark:group-[.mode--light]:!bg-darkmode-900/30 dark:!box`}
          as="a"
          href="#"
          onClick={() => {
            handleModal();
          }}
        >
          <Lucide icon="PencilLine" className="stroke-[1.3] w-4 h-4 mr-2" />
          {buttonTitle}
        </Button>
      )}
      
      {forOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
            onClick={handleModal}
          />
          
          {/* Slide Panel - Auto width based on content */}
          <div 
            className="fixed inset-y-0 right-0 z-50 w-auto min-w-[320px] max-w-[90vw] sm:max-w-[600px] bg-white dark:bg-darkmode-800 shadow-2xl transform transition-transform duration-300 ease-out overflow-hidden"
            style={{
              transform: forOpen ? 'translateX(0)' : 'translateX(100%)'
            }}
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-darkmode-600 bg-white dark:bg-darkmode-800 flex-shrink-0">
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-200">
                  {title}
                </h2>
                <button
                  onClick={handleModal}
                  className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-darkmode-700 transition-colors"
                >
                  <Lucide icon="X" className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </button>
              </div>

              {/* Content - Auto height based on content */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
                {children}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Modal;
type Props = {
  isOpen: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, children, title, description }: Props) => {
  return (
    <>
      {isOpen && (
        <>
          <div className="fixed z-10 inset-0 overflow-y-auto">
          </div>
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75 dark:bg-gray-900"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>
              &#8203;
              <div
                className="inline-block p-6 align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full dark:bg-gray-800"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
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

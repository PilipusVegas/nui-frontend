// components/Modal.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Modal = ({
  isOpen,
  onClose,
  title,
  note,
  children,
  size = "md",
  footer,
}) => {
  if (!isOpen) return null;

  const sizeClass = {   
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
    full: "w-full max-w-[1400px]",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-3 sm:px-6">
      
      {/* MODAL CONTAINER */}
      <div
        className={`
          w-full ${sizeClass}
          bg-white rounded-2xl shadow-xl
          flex flex-col
          max-h-[92vh]
          animate-[fadeIn_.2s_ease-out]
        `}
      >

        {/* HEADER */}
        <div className="flex items-start justify-between px-5 sm:px-6 py-3 border-b border-gray-300">
          <div className="pr-6">
            <h2 className="text-base sm:text-base font-semibold text-gray-800 leading-tight">
              {title}
            </h2>
            {note && (
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 leading-relaxed">
                {note}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="
              text-gray-400 hover:text-red-500
              transition
              text-lg
              flex-shrink-0
            "
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* BODY */}
        <div
          className="
            flex-1 overflow-y-auto
            px-5 sm:px-6 py-5 sm:py-6
            scrollbar-thin
          "
        >
          <div className="max-w-full">
            {children}
          </div>
        </div>

        {/* FOOTER */}
        {footer && (
          <div className="border-t border-gray-100 px-5 sm:px-6 py-4 flex justify-end gap-2 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
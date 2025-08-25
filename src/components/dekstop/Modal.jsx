// components/Modal.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ isOpen, onClose, title, note, children, size = "md" }) => {
    if (!isOpen) return null;

    const sizeClass = {
        sm: "max-w-lg",
        md: "max-w-2xl",
        lg: "max-w-4xl",
        xl: "max-w-6xl",
        full: "w-[90%] max-w-[1600px]",
    }[size];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-3">
            <div className={`bg-white rounded-2xl shadow-lg w-full ${sizeClass} relative`}>

                {/* Header */}
                <div className="px-4 py-3 sm:py-4 sm:px-6 p-4 relative bg-green-600 text-white rounded-t-2xl">
                {/* Judul & Note */}
                <div className="pr-10">
                    <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
                    {note && (
                    <p className="text-[9px] sm:text-sm text-white/80 -mt-0.5 leading-relaxed">{note}</p>
                    )}
                </div>

                {/* Tombol X */}
                <button onClick={onClose} className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 text-white hover:text-red-500 transition">
                    <FontAwesomeIcon icon={faTimes} size="2xl" />
                </button>
                </div>

                {/* Divider */}
                <hr className="border-t border-gray-200" />

                {/* Content */}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );

};

export default Modal;

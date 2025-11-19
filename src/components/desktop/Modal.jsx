    // components/Modal.jsx
    import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
    import { faTimes } from "@fortawesome/free-solid-svg-icons";

    const Modal = ({ isOpen, onClose, title, note, children, size = "md", footer}) => {
        if (!isOpen) return null;

        const sizeClass = {
            sm: "max-w-lg",
            md: "max-w-2xl",
            lg: "max-w-4xl",
            xl: "max-w-6xl",
            full: "w-[90%] max-w-[1600px]",
        }[size];

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3">
                <div className={`bg-white rounded-2xl shadow-lg w-full ${sizeClass} relative flex flex-col max-h-[90vh]`}>
                    <div className="px-4 py-2 sm:py-3 sm:px-6 bg-green-600 text-white rounded-t-2xl sticky top-0 z-20">
                        <div className="pr-10">
                            <h2 className="text-base sm:text-lg font-semibold">{title}</h2>
                            {note && (
                                <p className="text-[10px] sm:text-sm text-white/80 mt-1 leading-relaxed">
                                    {note}
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="absolute top-1/2 -translate-y-1/2 right-4 sm:right-6 text-white hover:text-red-500 transition">
                            <FontAwesomeIcon icon={faTimes} size="2xl" />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto scrollbar-green flex-1">{children}</div>

                    {footer && (
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-3 rounded-b-2xl flex justify-end z-20">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    export default Modal;

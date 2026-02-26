import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Modal } from "../../components";

const KunjunganActionModal = ({ isOpen, title, noteText, submitLabel, onSubmit, onClose, note, setNote, photoPreview, setPhotoPreview, setPhotoFile,}) => {
    const webcamRef = useRef(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");

    useEffect(() => {
        if (!isOpen) {
            setCameraReady(false);
            setFacingMode("environment");
        }
    }, [isOpen]);

    const capturePhoto = async () => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        const blob = await fetch(imageSrc).then(r => r.blob());
        setPhotoFile(new File([blob], "kunjungan.jpg", { type: "image/jpeg" }));
        setPhotoPreview(imageSrc);
    };

    const toggleCamera = () => {
        setFacingMode(prev => (prev === "user" ? "environment" : "user"));
        setCameraReady(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} note={noteText}
            footer={
                <button onClick={onSubmit} className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold">
                    {submitLabel}
                </button>
            }
        >
            {/* CAMERA / PREVIEW */}
            {!photoPreview ? (
                <div className="flex flex-col items-center gap-3">
                    <div className="w-full max-w-[220px] aspect-[4/5] rounded-xl overflow-hidden border bg-black">
                        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} onUserMedia={() => setCameraReady(true)} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex gap-2 w-full max-w-[220px]">
                        <button type="button" onClick={toggleCamera} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-xs font-medium">
                            Putar Kamera
                        </button>

                        <button type="button" disabled={!cameraReady} onClick={capturePhoto} className={`flex-1 py-2 rounded-lg text-xs font-semibold text-white
                            ${cameraReady ? "bg-blue-600" : "bg-gray-400"}`}
                        >
                            Foto
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-2">
                    <div className="w-full max-w-[220px] aspect-[4/5] rounded-xl overflow-hidden border">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                    <button type="button" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-gray-600 text-xs font-medium hover:bg-gray-100 active:bg-gray-200 transition"
                    >
                        Ambil Ulang Foto
                    </button>
                </div>
            )}

            <div className="mt-3 space-y-1">
                <label className="text-xs font-medium text-gray-700">
                    Keterangan (Opsional)
                </label>

                <textarea rows={2} className="w-full border rounded-lg p-2 text-sm resize-none focus:ring-1 focus:ring-green-500 focus:border-green-500" placeholder="Contoh: Tiba di lokasi, kondisi aman" value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
            </div>
        </Modal>
    );
};

export default KunjunganActionModal;
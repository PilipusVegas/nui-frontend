import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { Modal } from "../../components";

const KunjunganActionModal = ({
    isOpen,
    title,
    noteText,
    submitLabel,
    onSubmit,
    onClose,
    setNote,
    photoPreview,
    note,
    setPhotoPreview,
    setPhotoFile,
    isSubmitting
}) => {
    const webcamRef = useRef(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState("environment");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isCheckedDisclaimer, setIsCheckedDisclaimer] = useState(false);
    const isNoteRequired = Boolean(noteText);
    const isValid = photoPreview && isCheckedDisclaimer && (!isNoteRequired || note?.trim());
    const noteRef = useRef(null);

    const handleSubmit = () => {
        if (isSubmitting) return;
        setIsSubmitted(true);
        if (!isValid) return;
        onSubmit();
    };

    useEffect(() => {
        if (!isOpen) {
            setCameraReady(false);
            setFacingMode("environment");
            setIsSubmitted(false);
            setIsCheckedDisclaimer(false);
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

    const handleDisclaimerChange = (e) => {
        const checked = e.target.checked;
        setIsCheckedDisclaimer(checked);

        // jika dicentang dan ada input tugas
        if (checked && noteText) {
            setTimeout(() => {
                noteRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }, 150);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} note={noteText}
            footer={
                <button onClick={handleSubmit} disabled={!isValid || isSubmitting}
                    className={`w-full py-2.5 rounded-lg font-semibold transition flex items-center justify-center gap-2
                    ${isValid && !isSubmitting ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                    {isSubmitting && (
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    )}
                    {isSubmitting ? "Memproses..." : submitLabel}
                </button>
            }
        >

            {/* CAMERA / PREVIEW */}
            {!photoPreview ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-full max-w-[220px] aspect-[4/5] rounded-xl overflow-hidden border bg-black shadow-sm">
                        <Webcam ref={webcamRef} screenshotFormat="image/jpeg" videoConstraints={{ facingMode }} onUserMedia={() => setCameraReady(true)} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-3">
                            <p className="text-[10px] text-white text-center leading-snug">
                                Pastikan Wajah dan lokasi harus terlihat jelas
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full max-w-[220px]">
                        <button type="button" onClick={toggleCamera} className="flex-1 rounded-lg border border-gray-300 bg-white py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition">
                            Putar Kamera
                        </button>

                        <button type="button" disabled={!cameraReady} onClick={capturePhoto}
                            className={`flex-1 rounded-lg py-2 text-xs font-semibold text-white transition
                            ${cameraReady ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                        >
                            Ambil Foto
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-full max-w-[220px] aspect-[4/5] rounded-xl overflow-hidden border shadow-sm">
                        <img src={photoPreview} alt="Preview Foto" className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-3">
                            <p className="text-[10px] text-white text-center leading-snug">
                                Pastikan Wajah dan lokasi harus terlihat jelas
                            </p>
                        </div>
                    </div>
                    <button type="button" onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition"
                    >
                        Ambil Ulang Foto
                    </button>
                </div>
            )}

            {/* DISCLAIMER */}
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={isCheckedDisclaimer} onChange={handleDisclaimerChange} className="mt-1 accent-green-600" />
                    <span className="text-[9px] text-yellow-800 leading-snug text-justify">
                        Saya memahami bahwa <b>Mulai Kunjungan</b> pertama
                        akan tercatat sebagai <b>absensi masuk</b>, dan <b>Selesai Kunjungan </b>
                        terakhir akan tercatat sebagai <b>absensi pulang</b>. Setiap kunjungan
                        wajib diselesaikan. Jika tidak, kunjungan dapat dianggap tidak valid
                        sehingga absensi dan pembayaran tidak diproses.
                    </span>
                </label>
                {isSubmitted && !isCheckedDisclaimer && (
                    <p className="text-[11px] text-red-500 mt-1">
                        Anda wajib menyetujui pernyataan ini
                    </p>
                )}
            </div>

            {noteText && (
                <div ref={noteRef} className="mt-3 space-y-1">
                    <label className="text-xs font-medium text-gray-700">
                        Tugas Kunjungan <span className="text-red-500">*</span>
                    </label>
                    <textarea rows={2} value={note} className={`w-full border rounded-lg p-2 text-sm resize-none focus:ring-1
                        ${isSubmitted && !note ? "border-red-400 focus:ring-red-400" : "focus:ring-green-500 focus:border-green-500"}`}
                        placeholder="Wajib diisi, isilah dengan lengkap sesuai tugas kunjungan"
                        onChange={(e) => setNote(e.target.value)}
                    />
                    {isSubmitted && !note && (
                        <p className="text-[11px] text-red-500">
                            Keterangan wajib diisi
                        </p>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default KunjunganActionModal;
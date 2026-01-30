import { Modal } from "../../components";

const AttendanceRemarkModal = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    const isCutiOrSakit = [4, 5].includes(data.remark_status);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail Remark Absensi" note={data.remark_label} size="sm">
            <div className="space-y-4 text-sm text-gray-700">

                {/* ===== Informasi Utama ===== */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div className="font-semibold">Nama</div>
                    <div>{data.nama}</div>
                    <div className="font-semibold">Tanggal</div>
                    <div>{data.tanggal}</div>
                    <div className="font-semibold">Jenis Remark</div>
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 font-semibold">
                            {data.remark_label}
                        </span>
                    </div>
                </div>

                {/* ===== Detail Presensi (kecuali Cuti & Izin Sakit) ===== */}
                {!isCutiOrSakit && (
                    <div>
                        <div className="font-semibold mb-2">Detail Presensi</div>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                            <div className="bg-gray-100 rounded p-2">
                                <div className="font-semibold text-gray-600">IN</div>
                                <div>{data.in || "-"}</div>
                            </div>
                            <div className="bg-gray-100 rounded p-2">
                                <div className="font-semibold text-gray-600">LATE</div>
                                <div className="text-red-600 font-semibold">
                                    {data.late || "-"}
                                </div>
                            </div>
                            <div className="bg-gray-100 rounded p-2">
                                <div className="font-semibold text-gray-600">OUT</div>
                                <div>{data.out || "-"}</div>
                            </div>
                            <div className="bg-gray-100 rounded p-2">
                                <div className="font-semibold text-gray-600">T</div>
                                <div>{data.overtime || "-"}</div>
                            </div>
                        </div>
                    </div>
                )}

                <div>
                    <div className="font-semibold mb-1">Keterangan</div>
                    <div className="italic text-gray-700 bg-gray-100 rounded p-2">
                        {data.remark_deskripsi || "-"}
                    </div>
                </div>

                <div className="text-xs text-gray-500">
                    Dibuat oleh: <span className="font-medium">{data.remark_by || "-"}</span>
                </div>

            </div>
        </Modal>
    );
};

export default AttendanceRemarkModal;

import { Modal } from "../../components";

const REMARK_LABEL = {
    4: "CUTI",
    5: "IZIN SAKIT",
};

const AttendanceRemarkModal = ({ isOpen, onClose, data }) => {
    if (!data) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detail Remark Absensi" note="Informasi pengajuan cuti / izin sakit" size="sm">
            <div className="space-y-3 text-sm">
                <div>
                    <span className="font-semibold">Nama</span>
                    <div>{data.nama}</div>
                </div>
                <div>
                    <span className="font-semibold">Tanggal</span>
                    <div>{data.tanggal}</div>
                </div>
                <div>
                    <span className="font-semibold">Jenis Remark</span>
                    <div className="font-bold text-green-700">
                        {REMARK_LABEL[data.remark_status]}
                    </div>
                </div>
                <div>
                    <span className="font-semibold">Keterangan</span>
                    <div className="italic text-gray-700">
                        {data.remark_deskripsi || "-"}
                    </div>
                </div>
                <div>
                    <span className="font-semibold">Diproses oleh</span>
                    <div>{data.remark_by || "-"}</div>
                </div>
            </div>
        </Modal>
    );
};

export default AttendanceRemarkModal;

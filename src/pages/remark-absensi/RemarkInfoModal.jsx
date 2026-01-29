import React from "react";
import { Modal } from "../../components";

const RemarkInfoModal = ({ isOpen, onClose }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Informasi Absensi Manual" note="Panduan penggunaan fitur Remark Absensi" size="xl">
            <div className="text-sm text-gray-700 leading-relaxed space-y-4">
                <p>
                    <strong>Remark Absensi</strong> adalah fitur resmi untuk
                    <strong> menambahkan atau memperbaiki data absensi karyawan secara manual </strong>
                    apabila absensi otomatis tidak dapat dilakukan.
                </p>
                <p>
                    Fitur ini digunakan oleh <strong>Kadiv atau TIM HRD</strong> dalam kondisi tertentu,
                    seperti kendala teknis, izin resmi, atau penyesuaian data yang valid.
                </p>
                <hr className="my-2" />
                <h3 className="font-semibold text-gray-900">
                    Alur Penggunaan
                </h3>
                <ol className="list-decimal pl-5 space-y-1">
                    <li>
                        Pilih <strong>Tanggal</strong> dan <strong>Nama Karyawan</strong>.
                    </li>
                    <li>
                        Klik <strong>Cek Absensi</strong>.
                    </li>
                    <li>
                        Sistem akan:
                        <ul className="list-disc pl-5 mt-1">
                            <li>Mengisi data otomatis jika absensi sudah ada.</li>
                            <li>Menyediakan form kosong jika belum ada absensi.</li>
                        </ul>
                    </li>
                </ol>
                <hr className="my-2" />
                <h3 className="font-semibold text-gray-900">
                    Pengisian Remark & Status
                </h3>
                <p>
                    Pilih <strong>Kategori Remark</strong> sesuai kondisi yang sebenarnya:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Absen Manual</strong> – Digunakan jika absensi tidak bisa dilakukan melalui aplikasi karena kendala teknis.</li>
                    <li><strong>Izin Terlambat</strong> – Karyawan datang terlambat dengan alasan yang dapat dipertanggungjawabkan dan telah mendapat izin.</li>
                    <li><strong>Izin Pulang Awal</strong> – Karyawan pulang lebih cepat dari jam kerja yang seharusnya.</li>
                    <li><strong>Cuti</strong> – Karyawan tidak masuk kerja pada tanggal tersebut dan dicatat sebagai cuti resmi.</li>
                    <li><strong>Izin Sakit</strong> – Karyawan tidak masuk kerja karena sakit dan disertai keterangan atau bukti pendukung.</li>
                    <li><strong>Lupa Absen</strong> – Karyawan hadir bekerja, tetapi lupa melakukan absensi.</li>
                </ul>
                <hr className="my-2" />
                <h3 className="font-semibold text-gray-900">
                    Jam Kerja & Shift
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>
                        Untuk <strong>Absen Manual, Izin Terlambat, dan Pulang Awal</strong>:
                        jam masuk wajib diisi, jam pulang bersifat opsional.
                    </li>
                    <li>
                        Untuk <strong>Cuti</strong> dan <strong>Izin Sakit</strong>:
                        <strong> jam kerja tidak diperlukan</strong> dan akan disembunyikan otomatis.
                    </li>
                    <li>
                        <strong>Shift tetap ditentukan oleh sistem</strong> meskipun tidak ditampilkan,
                        agar data tetap konsisten untuk laporan dan penggajian.
                    </li>
                </ul>
                <hr className="my-2" />

                <h3 className="font-semibold text-gray-900">
                    Jam Pulang Melewati Tengah Malam
                </h3>

                <p>
                    Untuk karyawan dengan <strong>shift malam</strong>, jam pulang
                    bisa terjadi di <strong>hari berikutnya</strong>.
                </p>

                <ul className="list-disc pl-5 space-y-1">
                    <li>
                        <strong>Tanggal yang dipilih</strong> selalu dianggap sebagai
                        tanggal <strong>jam masuk</strong>.
                    </li>
                    <li>
                        Jika <strong>jam pulang lebih kecil dari jam masuk</strong>,
                        sistem otomatis mencatatnya sebagai <strong>hari berikutnya</strong>.
                    </li>
                    <li>
                        HRD <strong>cukup mengisi jam</strong>, tanpa perlu memilih tanggal pulang.
                    </li>
                </ul>

                <p className="text-gray-600 italic">
                    Contoh: Jam masuk 22:00 dan jam pulang 06:00 akan dicatat
                    sebagai pulang keesokan harinya.
                </p>

                <hr className="my-2" />
                <h3 className="font-semibold text-gray-900">
                    Catatan & Penyimpanan
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                    <li>
                        Isi <strong>Catatan</strong> untuk menjelaskan kondisi absensi.
                    </li>
                    <li>
                        Klik <strong>Simpan Perubahan</strong> untuk menyimpan data.
                    </li>
                    <li>
                        Klik <strong>Batalkan</strong> jika tidak ingin menyimpan perubahan.
                    </li>
                </ul>
                <p className="text-gray-600 italic">
                    ⚠️ Gunakan fitur Remark Absensi secara bertanggung jawab
                    dan hanya untuk kondisi yang benar-benar diperlukan.
                </p>

            </div>

        </Modal>
    );
};

export default RemarkInfoModal;

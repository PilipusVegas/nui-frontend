import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileDownload } from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js";
import { fetchWithJwt } from "../../../utils/jwtHelper";
import { formatFullDate } from "../../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader } from "../../../components";

const SuratDinasDetail = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        if (result?.data?.length) {
          setData(result.data[0]);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Gagal memuat detail:", err);
        setError(err.message || "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [apiUrl, id]);

  if (loading) return <LoadingSpinner text="Memuat detail surat dinas..." />;
  if (error) return <ErrorState message="Gagal memuat data" detail={error} />;
  if (!data) return <EmptyState message="Data surat dinas tidak ditemukan" />;

  const handleCetakPDF = () => {
    const element = document.getElementById("cetak-area");
    const tanggal = new Date(data.tgl_berangkat);
    const formattedDate = tanggal.toLocaleDateString("id-ID");

    const opt = {
      margin: 0.1,
      filename: `Surat-Dinas-${data.nama}-${formattedDate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    html2pdf().set(opt).from(element).save();
  };
  
    const getAreaDinas = (kategori) => {
      switch (Number(kategori)) {
        case 1:
          return "Jabodetabek";
        case 2:
          return "Jawa & Bali (Non-Jabodetabek)";
        case 3:
          return "Luar Jawa & Bali";
        default:
          return "-";
      }
    };

  const tanggalPerjalanan = data.tgl_pulang
    ? `${formatFullDate(data.tgl_berangkat)} s/d ${formatFullDate(data.tgl_pulang)}`
    : formatFullDate(data.tgl_berangkat);


  const detailItems = [
    { label: "Nama Karyawan", value: data.nama },
    { label: "Hari/Tanggal", value: tanggalPerjalanan },
    { label: "Divisi", value: data.divisi },
    { label: "Keterangan", value: data.keterangan },
    { label: "Kategori", value: getAreaDinas(data.kategori) },
    { label: "Berangkat Jam", value: data.waktu?.split(":").slice(0, 2).join(":") + " WIB" },
    { label: "Persetujuan Ka Dept/Kadiv", value: data.status === 0 ? "Belum disetujui" : `Disetujui pada ${formatFullDate(data.updated_at)}`, },
  ];


  return (
    <div>
      <SectionHeader title="Detail Surat Dinas" subtitle="Detail Surat Dinas jika dibutuhkan untuk mencetak" onBack={() => navigate(-1)} />
      <div className="max-w-4xl mx-auto mt-20">
        <div id="cetak-area" className="border-y-4 border-double border-gray-700 border-x-8 p-6 rounded-lg bg-white shadow-md">
          <h2 className="text-center text-4xl font-bold mb-4 text-gray-800">
            FORM DINAS KELUAR KANTOR
          </h2>
          <div className="border-t-4 border-double border-gray-600 mb-6" />

          <div className="text-base text-gray-800 space-y-3 px-5">
            {detailItems.map((item, idx) => (
              <div key={idx} className="flex flex-wrap">
                <div className="w-60 font-semibold pt-1">{item.label}</div>
                <div className="flex-1 border-b border-dotted border-gray-600 pb-1">
                  <span className="font-semibold">: {item.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-sm text-gray-500 italic px-5">
            * Form ini harus sudah diterima oleh SDM minimal 2 hari sesudah tugas dilaksanakan
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-white bg-green-600 hover:bg-green-700 transition rounded px-4 py-2 flex items-center">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Kembali
          </button>

          <button onClick={handleCetakPDF} className="text-white bg-blue-600 hover:bg-blue-700 transition rounded px-4 py-2 flex items-center">
            <FontAwesomeIcon icon={faFileDownload} className="mr-2" />
            Cetak PDF
          </button>
        </div>
      </div>
    </div>
  );

};

export default SuratDinasDetail;

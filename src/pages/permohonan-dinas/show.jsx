import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileDownload } from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import {
  LoadingSpinner,
  EmptyState,
  ErrorState,
  SectionHeader,
} from "../../components";

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
        if (result?.data) {
          setData(result.data);
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

  const handleCetakPDF = async () => {
    try {
      const element = document.getElementById("cetak-area");
      if (!element) {
        alert("Area cetak tidak ditemukan.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const tanggal = new Date(data.tgl_berangkat);
      const formattedDate = tanggal.toLocaleDateString("id-ID");
      const safeNama = String(data.nama || "karyawan")
        .replace(/[^a-z0-9-_ ]/gi, "")
        .trim();

      pdf.save(`Surat-Dinas-${safeNama}-${formattedDate}.pdf`);
    } catch (err) {
      console.error("Gagal mencetak PDF:", err);
      alert("Gagal membuat PDF.");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/surat-dinas");
    }
  };

  if (loading) return <LoadingSpinner text="Memuat detail surat dinas..." />;
  if (error) return <ErrorState message="Gagal memuat data" detail={error} />;
  if (!data) return <EmptyState message="Data surat dinas tidak ditemukan" />;

  const tanggalPerjalanan = data.tgl_pulang
    ? `${formatFullDate(data.tgl_berangkat)} s/d ${formatFullDate(data.tgl_pulang)}`
    : formatFullDate(data.tgl_berangkat);

  const detailItems = [
    { label: "Nama Karyawan", value: data.nama },
    { label: "Hari/Tanggal", value: tanggalPerjalanan },
    { label: "Divisi", value: data.divisi },
    { label: "Keterangan", value: data.keterangan },
    { label: "Kategori", value: getAreaDinas(data.kategori) },
    { label: "Berangkat Jam", value: data.waktu ? `${data.waktu} WIB` : "-" },
    {
      label: "Persetujuan Ka Dept/Kadiv",
      value:
        Number(data.status) === 1
          ? `Disetujui pada ${formatFullDate(data.updated_at)}`
          : "Belum disetujui",
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Detail Surat Dinas"
        subtitle="Detail Surat Dinas jika dibutuhkan untuk mencetak"
        onBack={handleBack}
      />

      <div className="max-w-4xl mx-auto mt-20">
        <div
          id="cetak-area"
          className="border-y-4 border-double border-gray-700 border-x-8 p-6 rounded-lg bg-white shadow-md"
        >
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
            * Form ini harus sudah diterima oleh SDM minimal 2 hari sesudah
            tugas dilaksanakan
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 max-w-4xl mx-auto">
          <button onClick={handleBack} className="text-white bg-green-600 hover:bg-green-700 transition rounded px-4 py-2 flex items-center">
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
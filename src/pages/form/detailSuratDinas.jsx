import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileDownload, faTriangleExclamation  } from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js";

const SuratDinasDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`${apiUrl}/surat-dinas/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        setData(Array.isArray(result) ? result[0] : result);
      } catch (err) {
        console.error("Gagal memuat detail:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [apiUrl, id]);

  const formatTanggal = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-600 font-semibold">
        Memuat detail surat dinas...
      </div>
    );
  }

  if (!data) {
  return (
    <div className="flex flex-col justify-center items-center h-64 text-red-600 text-center">
      <FontAwesomeIcon icon={faTriangleExclamation} className="text-5xl mb-4" />
      <p className="text-lg font-semibold">
        Data tidak ditemukan atau terjadi kesalahan saat mengambil detail.
      </p>
    </div>
  );
} 

  const handleCetakPDF = () => {
    const element = document.getElementById("cetak-area");
  
    // Format tanggal ke dd/MM/yyyy
    const tanggal = new Date(data.tgl);
    const formattedDate = tanggal.toLocaleDateString("id-ID"); // hasil: 10/12/2025
  
    const opt = {
      margin: 0.1,
      filename: `Surat-Dinas-${data.nama}-${formattedDate}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
  
    html2pdf().set(opt).from(element).save();
  };
  

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div id="cetak-area" className="border-y-4 border-double border-gray-700 border-x-8 p-6 rounded-lg bg-white shadow-md">
        <h2 className="text-center text-4xl font-bold mb-4 text-gray-800">
          FORM DINAS KELUAR KANTOR
        </h2>
        <div className="border-t-4 border-double border-gray-600 mb-6" />

        <div className="text-base text-gray-800 space-y-3 px-5">
          {[
            { label: "Nama", value: data.nama },
            { label: "Hari/Tanggal", value: formatTanggal(data.tgl) },
            { label: "Bagian", value: data.divisi },
            { label: "Jadwal Tugas ke", value: data.jadwal },
            { label: "Berangkat Jam", value: data.waktu },
            {
              label: "Persetujuan Ka Dept/Kadiv",
              value:
                data.status === 0
                  ? "Belum disetujui"
                  : `Disetujui pada hari ${formatTanggal(data.updated_at)}`,
            },
          ].map((item, index) => (
            <div key={index} className="flex">
              <div className="w-60 font-semibold pt-1">{item.label}</div>
              <div className="flex-1 border-b border-dotted border-gray-600 pb-1">
                <span className="font-semibold">: {item.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="mt-4 relative">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div className="relative">
                  <p className="mb-2 font-medium">Pemohon</p>
                  <div className="h-20 border-b border-gray-600" />
                  <p className="mb-2 font-medium">{data.nama}</p>
                </div>

                <div className="relative">
                  <p className="mb-2 font-medium">Disetujui</p>
                  <div className="h-20 border-b border-gray-600 relative">
                   
                  </div>
                  <p className="mb-2 font-medium">Ka Dept/Kadiv</p>
                </div>
                <div className="relative">
                  <p className="mb-2 font-medium">Diketahui</p>
                  <div className="h-20 border-b border-gray-600 relative">
                  </div>
                  <p className="mb-2 font-medium">SDM</p>
                </div>
              </div>
            </div> */}
        <div className="mt-6 text-sm text-gray-500 italic px-5">
          <span>
            * Form ini harus sudah diterima oleh SDM minimal 2 hari sesudah tugas dilaksanakan
          </span>
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={() => navigate(-1)}
          className="text-white bg-green-600 hover:bg-green-700 transition rounded px-4 py-2"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Kembali
        </button>
        <button
          onClick={handleCetakPDF}
          className="text-white bg-blue-600 hover:bg-blue-700 transition rounded px-4 py-2"
        >
          <FontAwesomeIcon icon={faFileDownload} className="mr-2" />
          Cetak PDF
        </button>
      </div>
    </div>
  );
};

export default SuratDinasDetail;

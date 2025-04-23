import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

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
      <div className="text-center text-red-500">
        Data tidak ditemukan atau terjadi kesalahan.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      <div className="border-y-4 border-double border-gray-700 border-x-8 p-6 rounded-lg bg-white shadow-md">
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
            ].map((item, index) => (
                <div key={index} className="flex">
                <div className="w-48 font-semibold">{item.label} </div>
                <div className="flex-1 border-b border-dotted border-gray-600">
                    <span className="font-semibold">: {item.value}</span>
                </div>
                </div>
            ))}
            </div>
            <div className="mt-12">
            <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                <p className="mb-2 font-medium">Pemohon</p>
                <div className="h-20 border-b border-gray-600" />
                </div>
                <div>
                <p className="mb-2 font-medium">Disetujui</p>
                <div className="h-20 border-b border-gray-600" />
                <p className="mb-2 font-medium">Ka Dept/Kadiv</p>

                </div>
                <div>
                <p className="mb-2 font-medium">Diketahui</p>
                <div className="h-20 border-b border-gray-600" />
                <p className="mb-2 font-medium">SDM</p>

                </div>
            </div>
            </div>


        {/* <div className="mt-6 text-sm text-right text-gray-500 italic">
          Status: {data.status === 1 ? 'Sudah di-ACC' : 'Belum di-ACC'}
        </div> */}
        <div className="mt-6 text-sm text-gray-500 italic px-5">
            <span>* Form ini harus sudah diterima oleh SDM maksimal 2 hari sesudah tugas dilaksanakan</span>
        </div>
      </div>
      <button
        onClick={() => navigate(-1)}
        className="text-white bg-green-600 hover:bg-green-700 transition rounded px-4 py-2 mt-4"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Kembali
      </button>
    </div>
  );
};

export default SuratDinasDetail;

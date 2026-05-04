import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faFileDownload, faBuilding, faUser, faCalendarDays, faClock, faCircleInfo, faCheckCircle, faRoad, faPrint, faFilePdf, faEdit} from "@fortawesome/free-solid-svg-icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { LoadingSpinner, EmptyState, ErrorState, SectionHeader, Button, DetailCard} from "../../components";

const SuratDinasDetail = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/surat-dinas/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const result = await res.json();
        setData(result?.data || null);
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

  const tanggalPerjalanan = useMemo(() => {
    if (!data?.tgl_berangkat) return "-";

    return data.tgl_pulang
      ? `${formatFullDate(data.tgl_berangkat)} s/d ${formatFullDate(
          data.tgl_pulang,
        )}`
      : formatFullDate(data.tgl_berangkat);
  }, [data]);

  const detailItems = useMemo(
    () => [
      { label: "Nama Karyawan", value: data?.nama || "-" },
      { label: "Divisi", value: data?.divisi || "-" },
      { label: "Hari / Tanggal", value: tanggalPerjalanan },
      {
        label: "Waktu Berangkat",
        value: data?.waktu ? `${data.waktu} WIB` : "-",
      },
      { label: "Kategori Perjalanan", value: getAreaDinas(data?.kategori) },
      { label: "Keterangan", value: data?.keterangan || "-" },
      {
        label: "Persetujuan Ka Dept/Kadiv",
        value:
          Number(data?.status) === 1
            ? `Disetujui pada ${data?.updated_at ? formatFullDate(data.updated_at) : "-"}`
            : "Belum disetujui",
      },
    ],
    [data, tanggalPerjalanan],
  );

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/surat-dinas");
    }
  };

  const safeFileName = (name) =>
    String(name || "karyawan")
      .replace(/[^a-z0-9-_ ]/gi, "")
      .trim()
      .replace(/\s+/g, "-");

  const safeDateForFile = (value) => {
    if (!value) return "tanggal-tidak-diketahui";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "tanggal-tidak-diketahui";
    return d.toISOString().slice(0, 10);
  };

  const handleCetakPDF = async () => {
    try {
      const element = printRef.current;
      if (!element) {
        alert("Area cetak tidak ditemukan.");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
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

      const nama = safeFileName(data?.nama);
      const tanggal = safeDateForFile(data?.tgl_berangkat);

      pdf.save(`Surat-Dinas-${nama}-${tanggal}.pdf`);
    } catch (err) {
      console.error("Gagal mencetak PDF:", err);
      alert("Gagal membuat PDF.");
    }
  };

  if (loading) return <LoadingSpinner text="Memuat detail surat dinas..." />;
  if (error) return <ErrorState message="Gagal memuat data" detail={error} />;
  if (!data) return <EmptyState message="Data surat dinas tidak ditemukan" />;

  return (
    <div>
      <SectionHeader
        title="Detail Perjalanan Dinas"
        subtitle="Informasi detail perjalanan dinas dan dokumen siap cetak PDF"
        onBack={handleBack}
        actions={
          <>
          <Button
            size="sm"
            variant="danger"
            onClick={handleCetakPDF}
            icon={faFilePdf}
          >
            Cetak PDF
          </Button>
          {/* <Button
            size="sm"
            variant="warning"
            onClick={() => navigate(`/permohonan-dinas/edit/${data.id}`)}
            icon={faEdit}
          >
            Edit
          </Button> */}
          </>
        }
      />

      <DetailCard>
        <DetailCard.Header
          title={data?.nama || "-"}
          note="Detail perjalanan dinas untuk keperluan verifikasi dan pencetakan dokumen."
          right={
            <div className="text-right">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Status
              </p>
              <p className="text-sm font-bold text-gray-800">
                {Number(data?.status) === 1
                  ? "Disetujui"
                  : "Menunggu Persetujuan"}
              </p>
            </div>
          }
        />

        <DetailCard.Body>
          {/* ================= INFORMASI UTAMA ================= */}
          <DetailCard.Section title="Informasi Perjalanan Dinas">
            <DetailCard.Grid cols="sm:grid-cols-2 xl:grid-cols-3">
              <DetailCard.Item label="Nama Karyawan" value={data?.nama} />
              <DetailCard.Item label="Divisi" value={data?.divisi} />
              <DetailCard.Item
                label="Hari / Tanggal"
                value={tanggalPerjalanan}
              />
              <DetailCard.Item
                label="Waktu Berangkat"
                value={data?.waktu ? `${data.waktu} WIB` : "-"}
              />
              <DetailCard.Item
                label="Kategori Perjalanan"
                value={getAreaDinas(data?.kategori)}
              />
              <DetailCard.Item
                label="Persetujuan"
                value={
                  Number(data?.status) === 1
                    ? `Disetujui pada ${
                        data?.updated_at ? formatFullDate(data.updated_at) : "-"
                      }`
                    : "Belum disetujui"
                }
              />
            </DetailCard.Grid>
          </DetailCard.Section>

          {/* ================= KETERANGAN ================= */}
          <DetailCard.Section title="Keterangan">
            <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
              {data?.keterangan || "-"}
            </div>
          </DetailCard.Section>
        </DetailCard.Body>

      </DetailCard>

      <div
        ref={printRef}
        id="cetak-area"
        className="fixed left-[-10000px] top-0 w-[794px] bg-white text-black"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="border-y-4 border-double border-gray-700 border-x-8 p-6 rounded-lg bg-white shadow-md">
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
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
};

export default SuratDinasDetail;

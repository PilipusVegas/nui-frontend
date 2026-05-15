import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate, formatCustomDateTime } from "../../utils/dateUtils";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";

import {
  SectionHeader,
  DataView,
  Modal,
  Button,
  Badge,
  SearchBar,
  DateRangeField,
} from "../../components";

import { faEye, faInfo } from "@fortawesome/free-solid-svg-icons";

const RiwayatSuratDinas = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");

  useEffect(() => {
    const { start, end } = getDefaultPeriod();
    setStartDate(start);
    setEndDate(end);
  }, []);

  const fetchData = async () => {
    if (!startDate || !endDate) return;

    setLoading(true);

    try {
      const res = await fetchWithJwt(
        `${apiUrl}/surat-dinas/riwayat?startDate=${startDate}&endDate=${endDate}`,
      );

      if (!res.ok) throw new Error("Gagal memuat data");

      const result = await res.json();
      setData(Array.isArray(result.data) ? result.data : []);
      setError(null);
    } catch (err) {
      setData([]);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  const getRiwayatSummary = (riwayat = []) => ({
    areaA: riwayat.filter((r) => r.kategori === "1").length,
    areaB: riwayat.filter((r) => r.kategori === "2").length,
    areaC: riwayat.filter((r) => r.kategori === "3").length,
    approved: riwayat.filter((r) => r.status_dinas === 1).length,
    rejected: riwayat.filter((r) => r.status_dinas === 2).length,
    total: riwayat.length,
  });

  const getKategoriMeta = (kategori) => {
    if (kategori === "1") {
      return {
        label: "Area A",
        desc: "Jabodetabek",
        variant: "info",
      };
    }

    if (kategori === "2") {
      return {
        label: "Area B",
        desc: "Jawa & Bali",
        variant: "purple",
      };
    }

    if (kategori === "3") {
      return {
        label: "Area C",
        desc: "Luar Jawa",
        variant: "warning",
      };
    }

    return {
      label: "Tidak diketahui",
      desc: "-",
      variant: "neutral",
    };
  };

  const getStatusDinasMeta = (status) => {
    if (status === 1) {
      return {
        label: "Disetujui",
        variant: "success",
      };
    }

    if (status === 2) {
      return {
        label: "Ditolak",
        variant: "danger",
      };
    }

    return {
      label: "Menunggu",
      variant: "warning",
    };
  };

  const isJabodetabek = (kategori) => kategori === "1";

  const getTanggalDinasLabel = (row) => {
    return isJabodetabek(row.kategori)
      ? "Tanggal Dinas"
      : "Rentang Tanggal Dinas";
  };

  const getTanggalDinasValue = (row) => {
    if (isJabodetabek(row.kategori)) {
      return row.tgl_berangkat ? formatFullDate(row.tgl_berangkat) : "-";
    }

    return `${row.tgl_berangkat ? formatFullDate(row.tgl_berangkat) : "-"} s/d ${
      row.tgl_pulang ? formatFullDate(row.tgl_pulang) : "-"
    }`;
  };

  const columns = useMemo(
    () => [
      {
        label: "Nama Karyawan",
        render: (row) => (
          <div>
            <div className="text-sm font-semibold uppercase text-gray-900">
              {row.nama_user}
            </div>
            <div className="text-xs text-gray-500">{row.role || "-"}</div>
          </div>
        ),
      },
      {
        label: "Kategori",
        align: "text-center",
        render: (row) => {
          const s = getRiwayatSummary(row.riwayat);

          return (
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="info" tone="soft" size="sm" rounded="lg">
                A: {s.areaA}
              </Badge>
              <Badge variant="purple" tone="soft" size="sm" rounded="lg">
                B: {s.areaB}
              </Badge>
              <Badge variant="warning" tone="soft" size="sm" rounded="lg">
                C: {s.areaC}
              </Badge>
            </div>
          );
        },
      },
      {
        label: "Status",
        align: "text-center",
        render: (row) => {
          const s = getRiwayatSummary(row.riwayat);

          return (
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="success" tone="soft" size="sm" rounded="lg">
                {s.approved} Disetujui
              </Badge>
              <Badge variant="danger" tone="soft" size="sm" rounded="lg">
                {s.rejected} Ditolak
              </Badge>
            </div>
          );
        },
      },
      {
        label: "Total",
        align: "text-center",
        render: (row) => (
          <Badge variant="info" tone="soft" size="sm" rounded="lg">
            {row.riwayat?.length || 0} Dinas
          </Badge>
        ),
      },
      {
        label: "Menu",
        align: "text-center",
        isAction: true,
        render: (row) => (
          <Button
            variant="detail"
            size="sm"
            icon={faEye}
            onClick={() => {
              setSelectedUser(row);
              setModalSearchQuery("");
              setIsModalOpen(true);
            }}
          >
            Detail
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="w-full">
      <SectionHeader
        title="Riwayat Surat Dinas"
        subtitle="Riwayat pengajuan surat dinas yang telah diproses"
        onBack={() => navigate(-1)}
        actions={
          <Button
            variant="info"
            icon={faInfo}
            onClick={() => setIsInfoModalOpen(true)}
          >
            Informasi
          </Button>
        }
      />

      <DataView
        data={data}
        columns={columns}
        searchable
        searchKeys={["nama_user", "role"]}
        searchPlaceholder="Cari nama karyawan..."
        itemsPerPage={10}
        isLoading={loading}
        error={error}
        onRetry={fetchData}
        emptyTitle="Belum ada data"
        emptyMessage="Data riwayat surat dinas akan muncul setelah ada pengajuan yang diproses"
        header={
          <DateRangeField
            label="Periode Pengajuan"
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
          />
        }
      />

      {/* MODAL DETAIL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
          setModalSearchQuery("");
        }}
        title="Detail Riwayat Surat Dinas"
        size="xl"
      >
        {selectedUser &&
          (() => {
            const summary = getRiwayatSummary(selectedUser.riwayat);

            const filteredRiwayat =
              selectedUser.riwayat?.filter((r) => {
                const query = modalSearchQuery.toLowerCase();

                const kategori = getKategoriMeta(r.kategori);
                const status = getStatusDinasMeta(r.status_dinas);

                return (
                  kategori.label.toLowerCase().includes(query) ||
                  kategori.desc.toLowerCase().includes(query) ||
                  status.label.toLowerCase().includes(query) ||
                  r.keterangan?.toLowerCase().includes(query) ||
                  r.approved_by?.toLowerCase().includes(query) ||
                  r.waktu?.toLowerCase().includes(query) ||
                  formatFullDate(r.tgl_berangkat)
                    .toLowerCase()
                    .includes(query) ||
                  (r.tgl_pulang
                    ? formatFullDate(r.tgl_pulang).toLowerCase()
                    : ""
                  ).includes(query) ||
                  (r.created_at
                    ? formatCustomDateTime(r.created_at).toLowerCase()
                    : ""
                  ).includes(query) ||
                  (r.approved_at
                    ? formatCustomDateTime(r.approved_at).toLowerCase()
                    : ""
                  ).includes(query)
                );
              }) || [];

            return (
              <div className="space-y-3">
                {/* USER SUMMARY */}
                <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="space-y-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-bold uppercase text-gray-900">
                        {selectedUser.nama_user}
                      </h3>

                      <div className="mt-1 space-y-1 text-xs text-gray-700">
                        <p className="break-words">
                          {selectedUser.role || "-"}
                        </p>

                        <p className="text-[11px] leading-relaxed text-gray-500">
                          Rentang data pengajuan:{" "}
                          <span className="font-semibold text-gray-800">
                            {startDate ? formatFullDate(startDate) : "-"}
                          </span>{" "}
                          s/d{" "}
                          <span className="font-semibold text-gray-800">
                            {endDate ? formatFullDate(endDate) : "-"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <Badge
                        variant="neutral"
                        tone="soft"
                        rounded="lg"
                        className="w-full px-3 py-2"
                      >
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="truncate text-[11px] font-medium">
                            Total Dinas
                          </span>
                          <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-sm font-bold">
                            {summary.total}
                          </span>
                        </span>
                      </Badge>

                      <Badge
                        variant="success"
                        tone="soft"
                        rounded="lg"
                        className="w-full px-3 py-2"
                      >
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="truncate text-[11px] font-medium">
                            Disetujui
                          </span>
                          <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-sm font-bold">
                            {summary.approved}
                          </span>
                        </span>
                      </Badge>

                      <Badge
                        variant="danger"
                        tone="soft"
                        rounded="lg"
                        className="w-full px-3 py-2"
                      >
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="truncate text-[11px] font-medium">
                            Ditolak
                          </span>
                          <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-sm font-bold">
                            {summary.rejected}
                          </span>
                        </span>
                      </Badge>

                      <Badge
                        variant="info"
                        tone="soft"
                        rounded="lg"
                        className="w-full px-3 py-2"
                      >
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="truncate text-[11px] font-medium">
                            Area A - Jabodetabek
                          </span>
                          <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-sm font-bold">
                            {summary.areaA}
                          </span>
                        </span>
                      </Badge>

                      <Badge
                        variant="purple"
                        tone="soft"
                        rounded="lg"
                        className="w-full px-3 py-2"
                      >
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="truncate text-[11px] font-medium">
                            Area B - Jawa/Bali Non-Jabodetabek
                          </span>
                          <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-sm font-bold">
                            {summary.areaB}
                          </span>
                        </span>
                      </Badge>

                      <Badge
                        variant="warning"
                        tone="soft"
                        rounded="lg"
                        className="w-full px-3 py-2"
                      >
                        <span className="flex w-full items-center justify-between gap-3">
                          <span className="truncate text-[11px] font-medium">
                            Area C - Luar Jawa/Bali
                          </span>
                          <span className="shrink-0 rounded-md bg-white/70 px-2 py-0.5 text-sm font-bold">
                            {summary.areaC}
                          </span>
                        </span>
                      </Badge>
                    </div>
                  </div>
                </div>
                {/* SEARCH */}
                <SearchBar
                  placeholder="Cari tanggal, area, status, keterangan, approver..."
                  onSearch={setModalSearchQuery}
                  className="w-full sm:w-full sm:max-w-none"
                  inputClassName="rounded-md border-gray-300 text-xs focus:border-green-500 focus:ring-green-200"
                />

                {/* LIST */}
                <div className="max-h-[56vh] space-y-2 overflow-y-auto pr-1">
                  {filteredRiwayat.length > 0 ? (
                    filteredRiwayat.map((r) => {
                      const kategori = getKategoriMeta(r.kategori);
                      const status = getStatusDinasMeta(r.status_dinas);

                      return (
                        <div
                          key={r.id}
                          className="rounded-xl border border-gray-300 bg-white p-3 shadow-sm transition hover:border-green-300"
                        >
                          {/* HEADER CARD */}
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={kategori.variant}
                                tone="soft"
                                size="sm"
                                rounded="lg"
                              >
                                {kategori.label} - {kategori.desc}
                              </Badge>

                              <Badge
                                variant={status.variant}
                                tone="soft"
                                size="sm"
                                rounded="lg"
                              >
                                {status.label}
                              </Badge>
                            </div>

                            <div className="rounded-lg border border-green-200 bg-green-50 p-2">
                              <p className="text-[10px] font-medium text-green-700">
                                Diajukan Pada
                              </p>
                              <p className="text-xs font-bold text-green-800">
                                {r.created_at
                                  ? formatCustomDateTime(r.created_at)
                                  : "-"}
                              </p>
                            </div>
                          </div>

                          {/* MAIN DATE */}
                          <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                            <div className="rounded-lg bg-gray-50 p-2 sm:col-span-2">
                              <p className="text-[10px] text-gray-600">
                                {getTanggalDinasLabel(r)}
                              </p>
                              <p className="font-semibold text-gray-900">
                                {getTanggalDinasValue(r)}
                              </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-2">
                              <p className="text-[10px] text-gray-600">Waktu</p>
                              <p className="font-semibold text-gray-900">
                                {r.waktu || "-"}
                              </p>
                            </div>
                          </div>

                          {/* KETERANGAN */}
                          <div className="mt-2 rounded-lg border border-gray-100 bg-white p-2">
                            <p className="text-[10px] font-medium text-gray-600">
                              Keterangan
                            </p>
                            <p className="mt-0.5 whitespace-pre-line text-xs leading-relaxed text-gray-800">
                              {r.keterangan || "-"}
                            </p>
                          </div>

                          {/* APPROVAL */}
                          <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                            <div className="rounded-lg bg-gray-50 p-2">
                              <p className="text-[10px] text-gray-600">
                                Disetujui Oleh
                              </p>
                              <p className="font-semibold text-gray-900">
                                {r.approved_by || "-"}
                              </p>
                            </div>

                            <div className="rounded-lg bg-gray-50 p-2">
                              <p className="text-[10px] text-gray-600">
                                Disetujui Pada
                              </p>
                              <p className="font-semibold text-gray-900">
                                {r.approved_at
                                  ? formatCustomDateTime(r.approved_at)
                                  : "-"}
                              </p>
                            </div>
                          </div>

                          {/* ACTION */}
                          <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
                            <Button
                              variant="detail"
                              size="sm"
                              icon={faEye}
                              onClick={() =>
                                window.open(
                                  `/permohonan-dinas/${r.id}`,
                                  "_blank",
                                )
                              }
                            >
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
                      <p className="text-sm font-semibold text-gray-800">
                        Data dinas tidak ditemukan
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Coba gunakan kata kunci pencarian yang berbeda.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
      </Modal>

      {/* MODAL INFO */}
      <Modal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Informasi Area Dinas"
      >
        <div className="space-y-3 text-sm text-gray-700">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="font-semibold text-blue-700">Area A - Jabodetabek</p>
            <p className="mt-1 text-xs text-blue-700">
              Dinas dalam area Jabodetabek. Umumnya hanya memakai tanggal
              berangkat karena dinas berlaku satu hari.
            </p>
          </div>

          <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
            <p className="font-semibold text-violet-700">
              Area B - Jawa & Bali
            </p>
            <p className="mt-1 text-xs text-violet-700">
              Dinas luar Jabodetabek dalam area Jawa dan Bali, dapat memiliki
              tanggal berangkat dan tanggal pulang.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="font-semibold text-amber-700">Area C - Luar Jawa</p>
            <p className="mt-1 text-xs text-amber-700">
              Dinas ke area luar Jawa, biasanya memakai rentang tanggal
              berangkat sampai pulang.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RiwayatSuratDinas;

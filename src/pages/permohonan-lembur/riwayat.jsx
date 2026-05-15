import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { formatCustomDateTime, formatFullDate } from "../../utils/dateUtils";

import {
  SectionHeader,
  Modal,
  DataView,
  Button,
  Badge,
  DateRangeField,
  SearchBar,
} from "../../components";

import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

const RiwayatLembur = () => {
  const Navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [summaryFilter, setSummaryFilter] = useState(null);

  // ================= FETCH =================
  const fetchData = async () => {
    if (!startDate || !endDate) return;

    setIsLoading(true);
    try {
      const res = await fetchWithJwt(
        `${apiUrl}/lembur/riwayat?startDate=${startDate}&endDate=${endDate}`,
      );

      const json = await res.json();
      setData(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const { start, end } = getDefaultPeriod();
    setStartDate(start);
    setEndDate(end);
  }, []);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate]);

  // ================= COLUMN =================
  const columns = [
    {
      label: "Nama Karyawan",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold uppercase text-sm">
            {row.nama_user}
          </span>
          <span className="text-xs text-gray-500">{row.role}</span>
        </div>
      ),
    },
    {
      label: "Total",
      align: "text-center",
      render: (row) => (
        <Badge variant="neutral" tone="soft" size="sm" rounded="lg">
          {row.riwayat.length}x Lembur
        </Badge>
      ),
    },
    {
      label: "Disetujui",
      align: "text-center",
      render: (row) => (
        <Badge variant="success" tone="soft" size="sm" rounded="lg">
          {row.total_approved} Disetujui
        </Badge>
      ),
    },
    {
      label: "Ditolak",
      align: "text-center",
      render: (row) => (
        <Badge variant="danger" tone="soft" size="sm" rounded="lg">
          {row.total_rejected} Ditolak
        </Badge>
      ),
    },
    {
      label: "Total Jam",
      align: "text-center",
      render: (row) => (
        <Badge variant="info" tone="soft" size="sm" rounded="lg">
          {row.total_jam_approved} Jam
        </Badge>
      ),
    },
    {
      label: "Menu",
      isAction: true,
      align: "text-center",
      render: (row) => (
        <Button
          size="sm"
          variant="detail"
          icon={faInfoCircle}
          onClick={() => openDetailModal(row)}
        >
          Detail
        </Button>
      ),
    },
  ];

  // ================= MOBILE =================
  const renderMobile = (row) => (
    <div className="bg-white rounded-xl border p-4 shadow-sm">
      <div className="flex justify-between mb-3">
        <div>
          <p className="font-semibold">{row.nama_user}</p>
          <p className="text-xs text-gray-400">{row.role}</p>
        </div>

        <Button
          size="sm"
          variant="detail"
          icon={faInfoCircle}
          onClick={() => openDetailModal(row)}
        >
          Detail
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div>
          <p className="text-gray-400">Total</p>
          <p className="font-semibold">{row.riwayat.length}</p>
        </div>

        <div>
          <p className="text-green-600">Disetujui</p>
          <p className="font-semibold">{row.total_approved}</p>
        </div>

        <div>
          <p className="text-red-600">Ditolak</p>
          <p className="font-semibold">{row.total_rejected}</p>
        </div>

        <div>
          <p className="text-gray-400">Total Jam</p>
          <p className="font-semibold">{row.total_jam_approved}</p>
        </div>
      </div>
    </div>
  );

  // ================= HEADER FILTER =================
  const header = (
    <DateRangeField
      label="Periode Lembur"
      startDate={startDate}
      endDate={endDate}
      onChangeStart={setStartDate}
      onChangeEnd={setEndDate}
    />
  );

  // ================= MODAL =================
  const openDetailModal = (user) => {
    setSelectedUser(user);
    setSummaryFilter(null);
    setModalSearchQuery("");
    setIsDetailModalOpen(true);
  };

  const summary =
    selectedUser?.riwayat.reduce(
      (acc, r) => {
        if (r.status_lembur === 1) {
          acc.approved++;
          acc.approvedHours += r.total_hour || 0;
        }
        if (r.status_lembur === 2) {
          acc.rejected++;
        }
        return acc;
      },
      { approved: 0, rejected: 0, approvedHours: 0 },
    ) || {};

  const filteredRiwayat =
    selectedUser?.riwayat?.filter((item) => {
      const query = modalSearchQuery.toLowerCase();

      return (
        formatFullDate(item.tanggal).toLowerCase().includes(query) ||
        item.lokasi?.toLowerCase().includes(query) ||
        item.deskripsi?.toLowerCase().includes(query) ||
        item.approved_by?.toLowerCase().includes(query) ||
        item.jam_mulai?.toLowerCase().includes(query) ||
        item.jam_selesai?.toLowerCase().includes(query) ||
        String(item.total_hour || "").includes(query) ||
        (item.status_lembur === 1
          ? "disetujui"
          : item.status_lembur === 2
            ? "ditolak"
            : "menunggu"
        ).includes(query)
      );
    }) || [];

  const getStatusMeta = (status) => {
    if (status === 1) {
      return {
        label: "Disetujui",
        className: "bg-green-50 text-green-700 border-green-200",
      };
    }

    if (status === 2) {
      return {
        label: "Ditolak",
        className: "bg-red-50 text-red-700 border-red-200",
      };
    }

    return {
      label: "Menunggu",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    };
  };

  return (
    <div>
      <SectionHeader
        title="Riwayat Lembur"
        subtitle="Riwayat lembur karyawan"
        onBack={() => Navigate("/")}
      />

      <DataView
        data={data}
        columns={columns}
        searchable
        searchKeys={["nama_user"]}
        searchPlaceholder="Cari nama karyawan..."
        header={header}
        isLoading={isLoading}
        emptyMessage="Tidak ada data lembur"
        renderMobile={renderMobile}
      />

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Detail Lembur"
        size="xl"
      >
        {selectedUser && (
          <div className="space-y-3">
            {/* PROFILE SUMMARY */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-bold uppercase text-gray-900">
                    {selectedUser.nama_user}
                  </h3>

                  <div className="mt-1 space-y-1 text-xs text-gray-700">
                    <p>{selectedUser.role || "-"}</p>

                    <p className="text-[11px] text-gray-500">
                      Periode lembur:{" "}
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

                <div className="grid grid-cols-3 gap-2 text-center">
                  {/* APPROVED */}
                  <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                    <p className="text-[10px] font-medium text-green-600">
                      Approved
                    </p>

                    <p className="text-sm font-bold text-green-700">
                      {summary.approved}
                    </p>
                  </div>

                  {/* REJECTED */}
                  <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-[10px] font-medium text-red-600">
                      Ditolak
                    </p>

                    <p className="text-sm font-bold text-red-700">
                      {summary.rejected}
                    </p>
                  </div>

                  {/* TOTAL JAM */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                    <p className="text-[10px] font-medium text-blue-600">
                      Total Jam
                    </p>

                    <p className="text-sm font-bold text-blue-700">
                      {summary.approvedHours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEARCH */}
            <SearchBar
              placeholder="Cari data lembur..."
              onSearch={setModalSearchQuery}
              className="w-full sm:w-full sm:max-w-none"
              inputClassName="rounded-md border-gray-300 text-xs focus:border-green-500 focus:ring-green-200"
            />

            {/* LIST */}
            <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
              {filteredRiwayat.length > 0 ? (
                filteredRiwayat.map((item, i) => {
                  const status = getStatusMeta(item.status_lembur);

                  return (
                    <div
                      key={item.id_lembur || i}
                      className="rounded-xl border border-zinc-300 bg-white p-3 shadow-sm transition hover:border-green-300"
                    >
                      {/* TOP */}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold text-zinc-900">
                              {formatFullDate(item.tanggal)}
                            </p>

                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>

                          <p className="mt-1 text-[11px] text-zinc-700">
                            Diajukan pada:{" "}
                            {item.created_at
                              ? formatCustomDateTime(item.created_at)
                              : "-"}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-green-800">
                          <span className="text-[10px] font-medium">Total</span>
                          <span className="text-xs font-bold">
                            {item.total_hour || 0} Jam
                          </span>
                        </div>
                      </div>

                      {/* MAIN INFO */}
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                        <div className="rounded-lg border border-zinc-100 bg-white p-2">
                          <p className="text-[10px] text-zinc-700">Mulai</p>
                          <p className="font-semibold text-zinc-900">
                            {item.jam_mulai || "-"}
                          </p>
                        </div>

                        <div className="rounded-lg border border-zinc-100 bg-white p-2">
                          <p className="text-[10px] text-zinc-700">Selesai</p>
                          <p className="font-semibold text-zinc-900">
                            {item.jam_selesai || "-"}
                          </p>
                        </div>

                        <div className="rounded-lg border border-zinc-100 bg-white p-2 sm:col-span-2">
                          <p className="text-[10px] text-zinc-700">Lokasi</p>
                          <p className="truncate font-semibold text-zinc-900">
                            {item.lokasi || "-"}
                          </p>
                        </div>
                      </div>

                      {/* DESCRIPTION */}
                      <div className="mt-2 rounded-lg border border-zinc-100 bg-white p-2">
                        <p className="text-[10px] font-medium text-zinc-700">
                          Deskripsi
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-zinc-800">
                          {item.deskripsi || "-"}
                        </p>
                      </div>

                      {/* APPROVAL */}
                      <div className="mt-2 grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
                        <div className="rounded-lg border border-zinc-100 bg-white p-2">
                          <p className="text-[10px] text-zinc-700">
                            Approved By
                          </p>
                          <p className="font-semibold text-zinc-900">
                            {item.approved_by || "-"}
                          </p>
                        </div>

                        <div className="rounded-lg border border-zinc-100 bg-white p-2">
                          <p className="text-[10px] text-zinc-700">
                            Approved At
                          </p>
                          <p className="font-semibold text-zinc-900">
                            {item.approved_at
                              ? formatFullDate(item.approved_at)
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-300 border border-zinc-100 bg-white p-5 text-center">
                  <p className="text-sm font-semibold text-zinc-800">
                    Data lembur tidak ditemukan
                  </p>
                  <p className="mt-1 text-xs text-zinc-700">
                    Coba gunakan kata kunci pencarian yang berbeda.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RiwayatLembur;

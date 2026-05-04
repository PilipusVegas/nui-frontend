import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { getDefaultPeriod } from "../../utils/getDefaultPeriod";
import { formatFullDate } from "../../utils/dateUtils";

import {
  SectionHeader,
  Modal,
  DataView,
  Button,
  Badge,
  DateRangeField,
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
      render: (row) => `${row.riwayat.length}x`,
    },
    {
      label: "Disetujui",
      align: "text-center",
      render: (row) => (
        <span className="text-green-600 font-semibold">
          {row.total_approved}
        </span>
      ),
    },
    {
      label: "Ditolak",
      align: "text-center",
      render: (row) => (
        <span className="text-red-600 font-semibold">{row.total_rejected}</span>
      ),
    },
    {
      label: "Jam",
      align: "text-center",
      render: (row) => `${row.total_jam_approved} Jam`,
    },
    {
      label: "Aksi",
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
          <p className="text-green-600">OK</p>
          <p className="font-semibold">{row.total_approved}</p>
        </div>

        <div>
          <p className="text-red-600">NO</p>
          <p className="font-semibold">{row.total_rejected}</p>
        </div>

        <div>
          <p className="text-gray-400">Jam</p>
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
    selectedUser?.riwayat.filter((item) => {
      const q = modalSearchQuery.toLowerCase();
      const match =
        formatFullDate(item.tanggal).toLowerCase().includes(q) ||
        (item.lokasi ?? "").toLowerCase().includes(q);

      if (!summaryFilter) return match;
      if (summaryFilter === "approved")
        return match && item.status_lembur === 1;
      if (summaryFilter === "rejected")
        return match && item.status_lembur === 2;

      return match;
    }) || [];

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
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Badge variant="success">Approved: {summary.approved}</Badge>
              <Badge variant="danger">Rejected: {summary.rejected}</Badge>
              <Badge variant="info">Jam: {summary.approvedHours}</Badge>
            </div>

            <input
              type="text"
              placeholder="Cari tanggal/lokasi..."
              className="border rounded px-3 py-2 w-full"
              onChange={(e) => setModalSearchQuery(e.target.value)}
            />

            <div className="space-y-2 max-h-[400px] overflow-auto">
              {filteredRiwayat.map((item, i) => (
                <div key={i} className="border rounded p-3 text-sm">
                  <p>{formatFullDate(item.tanggal)}</p>
                  <p>{item.lokasi || "-"}</p>
                  <p>{item.total_hour} Jam</p>

                  <Badge
                    variant={
                      item.status_lembur === 1
                        ? "success"
                        : item.status_lembur === 2
                          ? "danger"
                          : "warning"
                    }
                  >
                    {item.status_lembur === 1
                      ? "Disetujui"
                      : item.status_lembur === 2
                        ? "Ditolak"
                        : "Menunggu"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RiwayatLembur;

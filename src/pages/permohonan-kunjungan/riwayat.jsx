import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { faEye, faArrowRight } from "@fortawesome/free-solid-svg-icons";

import {
  SectionHeader,
  Modal,
  Button,
  Badge,
  DataView,
  DateRangeField,
} from "../../components";

import { fetchWithJwt } from "../../utils/jwtHelper";
import { formatFullDate } from "../../utils/dateUtils";
import { getDefaultPeriodWeek } from "../../utils/getDefaultPeriod";

import toast from "react-hot-toast";

const RiwayatKunjungan = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const navigate = useNavigate();
  const defaultPeriod = getDefaultPeriodWeek();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [startDate, setStartDate] = useState(defaultPeriod.start);
  const [endDate, setEndDate] = useState(defaultPeriod.end);

  const [selectedUser, setSelectedUser] = useState(null);

  /* ================= FETCH ================= */
  const fetchRiwayat = async () => {
    try {
      setLoading(true);

      const res = await fetchWithJwt(
        `${apiUrl}/trip/riwayat?startDate=${startDate}&endDate=${endDate}`,
      );

      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat riwayat kunjungan");
      toast.error("Gagal memuat riwayat kunjungan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, [startDate, endDate]);

  /* ================= COLUMNS ================= */
  const columns = [
    {
      label: "NIP",
      key: "nip_user",
      align: "text-center",
    },
    {
      label: "Nama Karyawan",
      key: "nama_user",
      cellClassName: "font-semibold uppercase",
    },
    {
      label: "Total Riwayat",
      render: (row) => row.riwayat?.length || 0,
      align: "text-center",
    },
    {
      label: "Disetujui",
      render: (row) => (
        <span className="text-green-600 font-semibold">
          {row.total_approved ?? 0}
        </span>
      ),
      align: "text-center",
    },
    {
      label: "Ditolak",
      render: (row) => (
        <span className="text-red-600 font-semibold">
          {row.total_rejected ?? 0}
        </span>
      ),
      align: "text-center",
    },
    {
      label: "Total Jarak",
      render: (row) => `${((row.sum_distance ?? 0) / 1000).toFixed(2)} km`,
      align: "text-center",
    },
    {
      label: "Total Nominal",
      render: (row) => `Rp ${(row.sum_nominal ?? 0).toLocaleString("id-ID")}`,
      align: "text-center",
      cellClassName: "font-semibold",
    },
    {
      label: "Menu",
      isAction: true,
      align: "text-center",
      render: (row) => (
        <Button
          size="sm"
          variant="detail"
          icon={faEye}
          onClick={() => setSelectedUser(row)}
        >
          Lihat
        </Button>
      ),
    },
  ];

  /* ================= MOBILE CUSTOM ================= */
  const renderMobile = (user) => {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div>
          <div className="font-semibold text-sm uppercase">
            {user.nama_user}
          </div>
          <div className="text-xs text-gray-500">{user.nip_user}</div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-y-2 text-xs text-gray-600">
          <div>
            Riwayat: <b>{user.riwayat?.length || 0}</b>
          </div>
          <div className="text-green-600">
            Disetujui: <b>{user.total_approved ?? 0}</b>
          </div>
          <div className="text-red-600">
            Ditolak: <b>{user.total_rejected ?? 0}</b>
          </div>
          <div>
            Jarak: <b>{((user.sum_distance ?? 0) / 1000).toFixed(2)} km</b>
          </div>
          <div className="col-span-2">
            Nominal: <b>Rp {(user.sum_nominal ?? 0).toLocaleString("id-ID")}</b>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            variant="detail"
            icon={faEye}
            onClick={() => setSelectedUser(user)}
          >
            Lihat
          </Button>
        </div>
      </div>
    );
  };

  /* ================= STATUS ================= */
  const statusMap = {
    1: { label: "Disetujui", variant: "success" },
    2: { label: "Ditolak", variant: "danger" },
  };

  return (
    <div className="bg-white flex flex-col">
      <SectionHeader
        title="Riwayat Kunjungan"
        subtitle="Data historis kunjungan karyawan"
        onBack={() => navigate(-1)}
      />

      <DataView
        data={data}
        columns={columns}
        searchable
        searchKeys={["nama_user", "nip_user"]}
        searchPlaceholder="Cari nama atau NIP..."
        isLoading={loading}
        error={error}
        header={
          <DateRangeField
            startDate={startDate}
            endDate={endDate}
            onChangeStart={setStartDate}
            onChangeEnd={setEndDate}
          />
        }
        emptyMessage="Belum ada data riwayat"
        renderMobile={renderMobile}
      />

      {/* ================= MODAL ================= */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Riwayat Kunjungan"
        note={
          selectedUser && `${selectedUser.nama_user} (${selectedUser.nip_user})`
        }
        size="lg"
      >
        {selectedUser?.riwayat?.length === 0 ? (
          <div className="text-center text-sm text-gray-500">
            Riwayat kosong
          </div>
        ) : (
          <div className="space-y-3 max-h-[420px] overflow-y-auto">
            {selectedUser?.riwayat?.map((r) => {
              const status = statusMap[r.status];

              return (
                <div key={r.id_trip} className="border rounded-xl p-4">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        {formatFullDate(r.tanggal)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.approved_by || "-"}
                      </div>
                    </div>

                    {status && (
                      <Badge variant={status.variant}>{status.label}</Badge>
                    )}
                  </div>

                  <div className="mt-3 text-sm">
                    {(r.total_jarak / 1000).toFixed(2)} km • Rp{" "}
                    {r.nominal?.toLocaleString("id-ID")}
                  </div>

                  <div className="mt-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={faArrowRight}
                      iconPosition="right"
                      onClick={() => {
                        setSelectedUser(null);
                        navigate(`/permohonan-kunjungan/detail/${r.id_trip}`);
                      }}
                    >
                      Detail
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RiwayatKunjungan;

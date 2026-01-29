import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { SectionHeader, LoadingSpinner, ErrorState, EmptyState, MobileDataCard, DataView } from "../../components";

const KelolaShiftPerusahaan = () => {
    const [perusahaan, setPerusahaan] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const navigate = useNavigate();

    useEffect(() => {
        fetchPerusahaan();
    }, []);

    const fetchPerusahaan = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const res = await fetchWithJwt(`${apiUrl}/perusahaan`);
            const data = await res.json();
            setPerusahaan(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Gagal memuat data perusahaan:", err);
            setError("Gagal memuat data perusahaan. Silakan coba lagi.");
        } finally {
            setIsLoading(false);
        }
    };

    const columns = ({ currentPage, itemsPerPage }) => [
        {
            label: "No.",
            align: "text-center",
            render: (_, i) => (currentPage - 1) * itemsPerPage + i + 1,
        },
        {
            label: "Perusahaan",
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold uppercase">{row.nama}</span>
                </div>
            ),
        },
        {
            label: "Menu",
            align: "text-center",
            render: (row) => (
                <div className="flex justify-center">
                    <button onClick={() => navigate(`/shift-perusahaan/edit/${row.id}`)} className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 text-xs font-medium rounded-md transition">
                        <FontAwesomeIcon icon={faGear} className="mr-2" />
                        Atur Shift
                    </button>
                </div>
            ),
        },
    ];


    const renderMobile = (item) => (
        <MobileDataCard title={item.nama.toUpperCase()} subtitle={item.alamat}
            actions={
                <button onClick={() => navigate(`/shift-perusahaan/edit/${item.id}`)} className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-xs">
                    <FontAwesomeIcon icon={faGear} />
                    <span>Atur</span>
                </button>
            }
        />
    );

    return (
        <div className="w-full mx-auto">
            <SectionHeader title="Kelola Shift Perusahaan" subtitle="Atur Shift pada masing-masing Perusahaan" onBack={() => navigate("/home")} />
            {isLoading && <LoadingSpinner />}
            {error && (
                <ErrorState message="Gagal Memuat Data" detail={error} onRetry={fetchPerusahaan} />
            )}
            {!isLoading && !error && perusahaan.length === 0 && (
                <EmptyState title="Belum Ada Data Perusahaan" description="Silakan tambahkan perusahaan terlebih dahulu." actionLabel="Tambah Perusahaan" onAction={() => navigate("/shift-perusahaan/tambah")} />
            )}
            {!isLoading && !error && perusahaan.length > 0 && (
                <DataView data={perusahaan} columns={columns} renderMobile={renderMobile} searchable searchKeys={["nama", "alamat"]} itemsPerPage={10} />
            )}
        </div>
    );
};

export default KelolaShiftPerusahaan;

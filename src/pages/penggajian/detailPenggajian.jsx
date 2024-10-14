import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DetailPenggajian = () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL;
    const { id_user } = useParams();
    const [data, setData] = useState({ absen: [], lembur: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("absen"); // State untuk tab aktif

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${apiUrl}/payroll/detail/${id_user}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();

                // Filter data berdasarkan status
                const absenData = result.data.filter(item => item.id_absen !== undefined && item.absen_status === 1);
                const lemburData = result.data.filter(item => item.id_lembur !== undefined && item.lembur_status === 3);
                
                setData({ absen: absenData, lembur: lemburData });
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id_user]);

    if (loading) return <p className="text-center text-lg">Loading...</p>;
    if (error) return <p className="text-center text-red-500">Error fetching data: {error.message}</p>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Detail Penggajian</h2>
            
            {/* Tab Navigation */}
            <div className="flex space-x-4 mb-4">
                <button 
                    className={`px-4 py-2 rounded-md ${activeTab === "absen" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`} 
                    onClick={() => setActiveTab("absen")}
                >
                    Absen
                </button>
                <button 
                    className={`px-4 py-2 rounded-md ${activeTab === "lembur" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"}`} 
                    onClick={() => setActiveTab("lembur")}
                >
                    Lembur
                </button>
            </div>

            {/* Tampilkan data berdasarkan tab yang dipilih */}
            {activeTab === "absen" ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-200">Nomor</th>
                                <th className="py-3 px-4 border-b border-gray-200">Nama User</th>
                                <th className="py-3 px-4 border-b border-gray-200">Status Absen</th>
                                <th className="py-3 px-4 border-b border-gray-200">Absen Mulai</th>
                                <th className="py-3 px-4 border-b border-gray-200">Absen Selesai</th>
                                <th className="py-3 px-4 border-b border-gray-200">Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {data.absen.length > 0 ? (
                                data.absen.map((item, index) => (
                                    <tr key={item.id_absen} className="hover:bg-gray-100 transition duration-200">
                                        <td className="py-2 px-4 border-b border-gray-200">{index + 1}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.nama_user}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.absen_status === 1 ? "Hadir" : "Tidak Hadir"}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{new Date(item.absen_mulai).toLocaleString()}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.absen_selesai ? new Date(item.absen_selesai).toLocaleString() : "Belum Selesai"}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.deskripsi}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="text-center py-2">Tidak ada data absen untuk pengguna ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="py-3 px-4 border-b border-gray-200">Nomor</th>
                                <th className="py-3 px-4 border-b border-gray-200">Nama User</th>
                                <th className="py-3 px-4 border-b border-gray-200">Tanggal Lembur</th>
                                <th className="py-3 px-4 border-b border-gray-200">Mulai</th>
                                <th className="py-3 px-4 border-b border-gray-200">Selesai</th>
                                <th className="py-3 px-4 border-b border-gray-200">Tugas Lembur</th>
                                <th className="py-3 px-4 border-b border-gray-200">Total Jam Lembur</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {data.lembur.length > 0 ? (
                                data.lembur.map((item, index) => (
                                    <tr key={item.id_lembur} className="hover:bg-gray-100 transition duration-200">
                                        <td className="py-2 px-4 border-b border-gray-200">{index + 1}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.nama_user}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{new Date(item.lembur_tanggal).toLocaleDateString()}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.lembur_mulai}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.lembur_selesai}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.tugas_lembur}</td>
                                        <td className="py-2 px-4 border-b border-gray-200">{item.total_jam_lembur}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-2">Tidak ada data lembur untuk pengguna ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DetailPenggajian;

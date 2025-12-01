// components/DetailKadiv.jsx
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserTie, faIdBadge, faBuilding, faUsers } from "@fortawesome/free-solid-svg-icons";

const DetailKadiv = ({ data }) => {
    if (!data) {
        return (
            <p className="text-gray-500 text-center py-10">
                Data tidak tersedia.
            </p>
        );
    }

    return (
        <div className="space-y-6">

            {/* INFORMASI KADIV */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUserTie} className="text-green-600" />
                    Informasi Kepala Divisi
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">

                    <div>
                        <p className="text-gray-500">Nama</p>
                        <p className="font-semibold text-gray-900">{data.nama}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">NIP</p>
                        <p className="font-semibold text-gray-900">{data.nip}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">ID Kadiv</p>
                        <p className="font-semibold text-gray-900">{data.id_kadiv}</p>
                    </div>

                    <div>
                        <p className="text-gray-500">Perusahaan</p>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <FontAwesomeIcon icon={faBuilding} className="text-gray-600" />
                            {data.perusahaan}
                        </p>
                    </div>

                </div>
            </div>

            {/* DAFTAR MEMBER */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FontAwesomeIcon icon={faUsers} className="text-green-600" />
                    Daftar Member
                </h3>

                {data.member?.length === 0 ? (
                    <p className="text-gray-500 italic">Belum ada member.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-gray-700 border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-green-600 text-white text-left">
                                <tr>
                                    <th className="py-2 px-3">Nama</th>
                                    <th className="py-2 px-3">NIP</th>
                                    <th className="py-2 px-3">Role</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {data.member.map((m) => (
                                    <tr key={m.id} className="hover:bg-green-50 transition">
                                        <td className="py-2 px-3 font-semibold">{m.nama}</td>
                                        <td className="py-2 px-3">{m.nip}</td>
                                        <td className="py-2 px-3">{m.role}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default DetailKadiv;

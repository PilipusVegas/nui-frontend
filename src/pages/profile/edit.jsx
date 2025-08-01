import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MobileLayout from "../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";

const EditProfile = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({ nama: "", username: "", password: "", nip: "", perusahaan: "", telp: "",});

  useEffect(() => {
    fetchWithJwt(`${apiUrl}/profil/${id}`)
      .then(res => res.json())
      .then(({ data }) => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            nama: data.nama || "",
            username: data.username || "",
            nip: data.nip || "",
            perusahaan: data.perusahaan || "",
            telp: data.telp || "",
          }));
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [apiUrl, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchWithJwt(`${apiUrl}/profil/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          Swal.fire("Berhasil", "Profil berhasil diperbarui", "success");
          navigate("/profile");
        } else {
          throw new Error(res.message || "Gagal memperbarui");
        }
      })
      .catch(err => {
        console.error(err);
        Swal.fire("Gagal", "Terjadi kesalahan saat menyimpan", "error");
      });
  };

  if (isLoading) {
    return <div className="text-center py-20">Memuat data...</div>;
  }

  return (
    <MobileLayout title="Edit Profil">
      <div className="px-3 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center mb-4 gap-4">
            <hr className="flex-grow border-gray-300" />
            <h2 className="text-sm font-semibold text-gray-600 whitespace-nowrap">Data Diri</h2>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <p className="text-xs text-gray-500 mb-1">Tidak dapat diubah</p>
            <input type="text" name="nama" value={formData.nama} disabled className="w-full bg-gray-200 border text-gray-400 border-gray-300 rounded-lg px-4 py-2 focus:outline-none"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">NIP</label>
            <p className="text-xs text-gray-500 mb-1">Tidak dapat diubah</p>
            <input type="text" name="nip" value={formData.nip || "N/A"} disabled className="w-full bg-gray-200 text-gray-400 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Perusahaan</label>
            <p className="text-xs text-gray-500 mb-1">Tidak dapat diubah</p>
            <input type="text" name="perusahaan" value={formData.perusahaan || "N/A"} disabled className="w-full bg-gray-200 text-gray-400 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none"/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
            <p className="text-xs text-gray-500 mb-1">Gunakan nomor aktif untuk kebutuhan verifikasi</p>
            <input type="tel" name="telp" value={formData.telp || "N/A"} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:outline-none"/>
          </div>

          <div className="flex items-center my-4 gap-4">
            <hr className="flex-grow border-gray-300" />
            <h2 className="text-sm font-semibold text-gray-600 whitespace-nowrap">Akun</h2>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <p className="text-xs text-gray-500 mb-1">Nama pengguna untuk login aplikasi</p>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:outline-none" required/>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password Baru</label>
            <p className="text-xs text-gray-500 mb-1">Kosongkan jika tidak ingin mengubah password</p>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:outline-none"/>
          </div>

          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl shadow-md flex items-center justify-center gap-2">
            <FontAwesomeIcon icon={faSave} /> Simpan Perubahan
          </button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default EditProfile;

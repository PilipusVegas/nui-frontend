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
  const [formData, setFormData] = useState({ nama: "", username: "", password: "", nip: "", perusahaan: "", telp: "", });

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

    const payload = {
      telp: formData.telp,
      username: formData.username,
      password: formData.password || undefined,
    };

    fetchWithJwt(`${apiUrl}/profil/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          const usernameChanged = false;
          const passwordChanged = Boolean(formData.password);

          if (usernameChanged || passwordChanged) {
            Swal.fire({
              title: "Profil diperbarui",
              text: "Username atau password telah berubah. Apakah Anda ingin login ulang?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Ya, logout",
              cancelButtonText: "Tidak, tetap masuk",
            }).then((result) => {
              if (result.isConfirmed) {
                localStorage.removeItem("token");
                navigate("/login");
              } else {
                navigate("/home");
              }
            });
          } else {
            Swal.fire("Berhasil", res.message || "Profil berhasil diperbarui", "success");
            navigate("/home");
          }
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
      <div className="px-2 py-3">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          {/* ====== DATA DIRI ====== */}
          <section className="space-y-2">
            {[
              { label: "Nama Lengkap", name: "nama", value: formData.nama },
              { label: "NIP", name: "nip", value: formData.nip || "N/A" },
              { label: "Perusahaan", name: "perusahaan", value: formData.perusahaan || "N/A" },
            ].map((item) => (
              <div key={item.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {item.label}
                </label>
                <input type="text" name={item.name} value={item.value} disabled className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-gray-500 focus:outline-none cursor-not-allowed" />
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nomor Telepon
              </label>
              <p className="text-[10px] text-gray-700 mb-1 tracking-wide">
                Masukkan nomor telepon aktif tanpa spasi atau tanda baca. Hanya angka yang diperbolehkan, maksimal 13 digit.
              </p>

              <input type="tel" name="telp" value={formData.telp || ""}
                onChange={(e) => {
                  const onlyNumber = e.target.value.replace(/\D/g, "");
                  if (onlyNumber.length <= 13) {
                    setFormData((prev) => ({ ...prev, telp: onlyNumber }));
                  }
                }}
                maxLength={13}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500"
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </section>

          {/* ====== AKUN ====== */}
          <section className="pt-6 border-t border-gray-200 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500" required placeholder="Nama pengguna" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Baru
              </label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500" placeholder="Kosongkan bila tidak diubah" />
            </div>
          </section>

          {/* ====== ACTION BUTTON ====== */}
          <button type="submit" className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 font-medium text-white shadow hover:bg-green-700 transition">
            <FontAwesomeIcon icon={faSave} />
            Simpan Perubahan
          </button>
        </form>
      </div>
    </MobileLayout>

  );
};

export default EditProfile;

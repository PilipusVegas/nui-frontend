import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faUser,
  faIdCard,
  faBuilding,
  faPhone,
  faUserTag,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { fetchWithJwt } from "../../utils/jwtHelper";
import { LoadingSpinner } from "../../components";

const EditProfile = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState({
    nama: "",
    username: "",
    nip: "",
    perusahaan: "",
    telp: "",
  });

  const [formData, setFormData] = useState({
    nama: "",
    username: "",
    password: "",
    nip: "",
    perusahaan: "",
    telp: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetchWithJwt(`${apiUrl}/profil/${id}`);
        const result = await res.json();

        if (result?.data) {
          const data = result.data;

          const mappedData = {
            nama: data.nama || "",
            username: data.username || "",
            nip: data.nip || "",
            perusahaan: data.perusahaan || "",
            telp: data.telp || "",
          };

          setOriginalData(mappedData);
          setFormData({
            ...mappedData,
            password: "",
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Gagal", "Gagal memuat data profil", "error");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [apiUrl, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telp") {
      const onlyNumber = value.replace(/\D/g, "");
      if (onlyNumber.length <= 13) {
        setFormData((prev) => ({ ...prev, telp: onlyNumber }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        telp: formData.telp,
        username: formData.username,
        ...(formData.password ? { password: formData.password } : {}),
      };

      const res = await fetchWithJwt(`${apiUrl}/profil/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Gagal memperbarui profil");
      }

      const usernameChanged = formData.username !== originalData.username;
      const passwordChanged = Boolean(formData.password);

      if (usernameChanged || passwordChanged) {
        const confirm = await Swal.fire({
          title: "Profil diperbarui",
          text: "Username atau password berubah. Login ulang diperlukan.",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Ya, logout",
          cancelButtonText: "Tetap masuk",
          reverseButtons: true,
        });

        if (confirm.isConfirmed) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
      }

      await Swal.fire({
        title: "Berhasil",
        text: result.message || "Profil berhasil diperbarui",
        icon: "success",
        timer: 1600,
        showConfirmButton: false,
      });

      navigate("/home");
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Gagal",
        err.message || "Terjadi kesalahan saat menyimpan",
        "error",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed";

  return (
    <div className="relative w-full">
      {isLoading ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" color="green" />
        </div>
      ) : (
        <div className="mx-auto w-full">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-4 py-4 sm:px-6">
              <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
                Edit Profil
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Perbarui informasi akun untuk menjaga data tetap aman.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 px-4 py-5 sm:px-6"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="mr-2 text-green-600"
                    />
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    disabled
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="mr-2 text-green-600"
                    />
                    NIP
                  </label>
                  <input
                    type="text"
                    name="nip"
                    value={formData.nip || "N/A"}
                    disabled
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="mr-2 text-green-600"
                    />
                    Perusahaan
                  </label>
                  <input
                    type="text"
                    name="perusahaan"
                    value={formData.perusahaan || "N/A"}
                    disabled
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 border-t border-gray-100 pt-6">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="mr-2 text-green-600"
                    />
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="telp"
                    value={formData.telp}
                    onChange={handleChange}
                    maxLength={13}
                    placeholder="08xxxxxxxxxx"
                    className={fieldClass}
                  />
                  <p className="mt-1.5 text-xs text-gray-500">
                    Gunakan angka saja, tanpa spasi atau tanda baca. Maksimal 13
                    digit.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon
                      icon={faUserTag}
                      className="mr-2 text-green-600"
                    />
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Nama pengguna"
                    className={fieldClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <FontAwesomeIcon
                      icon={faLock}
                      className="mr-2 text-green-600"
                    />
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Kosongkan jika tidak diubah"
                    className={fieldClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <FontAwesomeIcon icon={faSave} />
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;

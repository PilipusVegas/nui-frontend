import { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import StepOne from "./StepOne";
import Swal from "sweetalert2";
import StepTwoMulai from "./StepTwoMulai";
import StepTwoSelesai from "./StepTwoSelesai";
import StepThree from "./StepThree";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faCalendarPlus, faAngleDown, faSignInAlt, faSignOutAlt, faClock, faArrowRight, faAngleUp} from "@fortawesome/free-solid-svg-icons";

const Absensi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;
  const [currentStep, setCurrentStep] = useState(null);
  const [isSelesaiFlow, setIsSelesaiFlow] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ userId: "", username: "", id_absen: "" });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [faqOpen, setFaqOpen] = useState(null);
  const [allFaqOpen, setAllFaqOpen] = useState(true);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const handleNextStepData = (data) => {
    setAttendanceData((prev) => ({ ...prev, ...data }));
    handleNextStep();
  };

  const handleNextStep = () => {
    const steps = isSelesaiFlow
      ? ["stepTwoSelesai", "stepThree"]
      : ["stepOne", "stepTwoMulai", "stepThree"];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex >= 0 && currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      const response = await fetch(`${apiUrl}/absen/riwayat/${attendanceData.userId}`);
      const data = await response.json();
      if (response.ok) {
        const last24Hours = data.filter((item) => {
          const now = new Date();
          const recordTime = new Date(item.jam_mulai);
          return now - recordTime <= 24 * 60 * 60 * 1000;
        });
        setAttendanceHistory(last24Hours.slice(0, 1) || []);
      }
    } catch (error) {
      console.error("Error fetching attendance history:", error);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("userName");
    if (storedUserId) {
      setAttendanceData({ userId: storedUserId, username: storedUsername || "" });
      fetchAttendanceHistory();
    }
  }, [apiUrl, attendanceData.userId]);

  useEffect(() => {
    const checkAttendance = async () => {
      try {
        const response = await fetch(`${apiUrl}/absen/cek/${attendanceData.userId}`);
        const data = await response.json();
        if (response.ok && Array.isArray(data) && data.length > 0) {
          const { id_absen, id_user, username, id_lokasi, nama, deskripsi, jam_mulai } = data[0];
          setAttendanceData({
            userId: String(id_user),
            username: username || "",
            id_absen: String(id_absen),
            id_lokasi: id_lokasi || "",
            nama: nama || "",
            deskripsi: deskripsi || "",
            jam_mulai: String(jam_mulai),
          });
          setIsSelesaiFlow(true);
          setCurrentStep("stepTwoSelesai");
        } else {
          setIsSelesaiFlow(false);
          setCurrentStep(null);
        }
      } catch (error) {
        console.error("Error checking attendance:", error);
        setIsSelesaiFlow(false);
        setCurrentStep(null);
      }
    };
    if (attendanceData.userId) checkAttendance();
  }, [apiUrl, attendanceData.userId]);

  const checkPermissions = async () => {
    try {
      const locationPermission = await navigator.permissions.query({ name: "geolocation" });
      const cameraPermission = await navigator.permissions.query({ name: "camera" });

      if (locationPermission.state !== "granted" || cameraPermission.state !== "granted") {
        Swal.fire({
          icon: "warning",
          title: "Perizinan Dibutuhkan",
          text: "Mohon untuk menyalakan GPS dan perizinan kamera pada perangkat Anda.",
          confirmButtonText: "OK",
        });
        return false;
      }

      if (locationPermission.state === "prompt" || cameraPermission.state === "prompt") {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // console.log("Location permission granted", position);
          },
          (error) => {
            // console.error("Geolocation error:", error);
          }
        );

        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            // console.log("Camera permission granted");
          })
          .catch((error) => {
            console.error("Camera permission error:", error);
          });
      }

      return true;
    } catch (error) {
      console.error("Error checking permissions:", error);
      return false;
    }
  };

  navigator.geolocation.getCurrentPosition(
    (position) => {
      // console.log("Lokasi diperoleh:", position);
    },
    (error) => {
      // console.error("Lokasi tidak dapat diakses:", error);
    }
  );

  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      // console.log("Kamera berhasil diakses.");
    })
    .catch((error) => {
      // console.error("Akses kamera ditolak:", error);
    });

  const handleMulaiClick = async () => {
    const permissionsGranted = await checkPermissions();
    if (permissionsGranted) {
      setCurrentStep("stepOne");
    }
  };

  const handleSelesaiClick = async () => {
    const permissionsGranted = await checkPermissions();
    if (permissionsGranted) {
      setCurrentStep("stepTwoSelesai");
    }
  };

  useEffect(() => {
    const permissionCheck = async () => {
      const permissionsGranted = await checkPermissions();
      if (!permissionsGranted) {
        setCurrentStep(null);
      }
    };

    permissionCheck();
  }, []);

  const renderStep = () => {
    switch (currentStep) {
      case "stepOne":
        return <StepOne attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "stepTwoMulai":
        return (
          <StepTwoMulai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />
        );
      case "stepTwoSelesai":
        return (
          <StepTwoSelesai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />
        );
      case "stepThree":
        return <StepThree formData={attendanceData} />
      default:
        return (
          <MobileLayout title="Absensi">
            <div className="w-full bg-white rounded-lg shadow-md py-5 px-4">
              {/* Riwayat Absensi */}
              <div className="p-3 bg-green-600 rounded-lg shadow-sm mb-4">
                {/* Header Tanggal dan Jam */}
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white font-medium">
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    Riwayat Absensi
                  </p>
                  <a href="/riwayat-absensi" className="text-sm text-white font-medium hover:text-gray-300 underline">
                    View All
                    <FontAwesomeIcon icon={faArrowRight} className="ml-1" />
                  </a>
                </div>
                {attendanceHistory.length > 0 ? (
                  <div className="flex flex-wrap justify-between py-2">
                    {attendanceHistory.map((item, index) => (
                      <div key={index} className="flex w-full sm:w-1/2 lg:w-1/2 xl:w-1/2 gap-3">
                        {/* Card Absen Masuk */}
                        <div className="flex-1 py-2 px-3 bg-white rounded-lg shadow border">
                          {/* Tanggal Masuk */}
                          <p className="text-[10px] text-gray-500 mb-1">
                            {new Date(item.jam_mulai).toLocaleDateString("id-ID", {
                              // weekday: 'long',
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          {/* Absen Masuk */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="pb-1 px-2 bg-blue-500 text-white rounded-full">
                                <FontAwesomeIcon icon={faSignInAlt} className="text-xs" />
                              </div>
                              <div>
                                <p className="text-[10px] text-gray-500 font-bold">Absen Masuk</p>
                                <p className="text-[14px] font-medium text-green-500">
                                  {new Date(item.jam_mulai).toLocaleTimeString("id-ID", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}{" "}
                                  <span className="text-[10px] text-gray-500">WIB</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Card Absen Pulang */}
                        {item.jam_selesai && (
                          <div className="flex-1 py-2 px-3 bg-white rounded-lg shadow border">
                            {/* Tanggal Pulang */}
                            <p className="text-[10px] text-gray-500 mb-1">
                              {new Date(item.jam_selesai).toLocaleDateString("id-ID", {
                                // weekday: 'long',
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>

                            {/* Absen Pulang */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="pb-1 px-2 bg-orange-500 text-white rounded-full">
                                  <FontAwesomeIcon icon={faSignOutAlt} className="text-xs transform rotate-180"/>
                                </div>
                                <div>
                                  <p className="text-[10px] text-gray-500 font-bold">
                                    Absen Pulang
                                  </p>
                                  <p className="text-[14px] font-medium text-green-500">
                                    {new Date(item.jam_selesai).toLocaleTimeString("id-ID", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      second: "2-digit",
                                    })}{" "}
                                    <span className="text-[10px] text-gray-500">WIB</span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-3 text-center">
                    <FontAwesomeIcon icon={faClock} className="text-3xl text-gray-200 mb-2" />
                    <p className="text-sm text-white">
                      Belum ada riwayat absensi <br /> dalam 24 jam terakhir.
                    </p>
                  </div>
                )}
              </div>
              {/* Riwayat Absensi */}

              {/* Absen Mulai / Absen Selesai */}
              {isSelesaiFlow ? (
                <button className="w-full bg-teal-600 text-white py-3 rounded-md shadow-lg hover:bg-teal-700 flex items-center justify-center gap-2 transition" onClick={handleSelesaiClick}>
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl" />
                  <span className="text-lg font-medium">Absen Selesai</span>
                </button>
              ) : (
                <button className="w-full border border-green-600 text-green-600 py-3 rounded-md shadow-lg hover:bg-green-200 flex items-center justify-center gap-2 transition" onClick={handleMulaiClick}>
                  <FontAwesomeIcon icon={faCalendarPlus} className="text-2xl" />
                  <span className="text-lg font-medium">Absen Mulai</span>
                </button>
              )}

              {/* Absen Mulai / Absen Selesai */}

              {/* FAQ */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center justify-between cursor-pointer" onClick={() => setAllFaqOpen(!allFaqOpen)}>
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      className={`text-green-500 transform ${allFaqOpen ? "rotate-180" : ""}`}
                    />
                    Pertanyaan yang Sering Diajukan
                  </span>
                </h3>

                {allFaqOpen && (
                  <div>
                    {/* FAQ 1 */}
                    <div>
                      <button
                        className="text-xs w-full text-left px-4 py-2 font-semibold hover:bg-gray-50 rounded-md"
                        onClick={() => toggleFaq(0)}
                      >
                        Kenapa saya tidak bisa absen masuk?
                        <FontAwesomeIcon
                          icon={faqOpen === 0 ? faAngleUp : faAngleDown}
                          className="float-right"
                        />
                      </button>
                      {faqOpen === 0 && (
                        <p className="text-[12px] text-white rounded-lg bg-green-600 mx-2 p-3 leading-6">
                          Hal ini dapat terjadi karena beberapa alasan:
                          <ul className="list-disc ml-4">
                            <li>
                              Aplikasi Anda belum memiliki izin lokasi yang aktif. Pastikan fitur
                              GPS diaktifkan di perangkat Anda.
                            </li>
                            <li>
                              Koneksi internet Anda tidak stabil atau terputus. Coba ganti ke
                              jaringan Wi-Fi yang lebih stabil atau pastikan data seluler Anda
                              aktif.
                            </li>
                            <li>
                              Akun Anda belum diatur oleh admin untuk absensi. Jika Anda baru
                              bergabung, pastikan admin telah mengonfigurasi akun Anda dengan benar.
                            </li>
                          </ul>
                          <b>Solusi:</b> Pastikan GPS diaktifkan, periksa koneksi internet Anda, dan
                          jika masalah berlanjut, hubungi admin atau Tim HR/IT.
                        </p>
                      )}
                    </div>

                    {/* FAQ 2 */}
                    <div>
                      <button
                        className="text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                        onClick={() => toggleFaq(1)}
                      >
                        Kenapa gambar absen tidak muncul?
                        <FontAwesomeIcon
                          icon={faqOpen === 1 ? faAngleUp : faAngleDown}
                          className="float-right"
                        />
                      </button>
                      {faqOpen === 1 && (
                        <p className="text-[12px] text-white rounded-lg bg-green-600 mx-2 p-3 leading-6">
                          Gambar absen mungkin tidak muncul karena:
                          <ul className="list-disc ml-4">
                            <li>Anda belum memberikan izin akses kamera pada aplikasi.</li>
                            <li>
                              Aplikasi sedang mengalami kendala teknis atau bug yang menghambat
                              pengambilan gambar.
                            </li>
                          </ul>
                          <b>Solusi:</b> Buka pengaturan perangkat Anda dan izinkan aplikasi
                          mengakses kamera. Jika tetap tidak berhasil, coba muat ulang(Refresh)
                          aplikasi atau laporkan masalah ke Tim IT.
                        </p>
                      )}
                    </div>

                    {/* FAQ 3 */}
                    <div>
                      <button
                        className="text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                        onClick={() => toggleFaq(2)}
                      >
                        Kenapa lokasi bekerja saya tidak ada di list lokasi?
                        <FontAwesomeIcon
                          icon={faqOpen === 2 ? faAngleUp : faAngleDown}
                          className="float-right"
                        />
                      </button>
                      {faqOpen === 2 && (
                        <p className="text-[12px] text-white rounded-lg bg-green-600 mx-2 p-3 leading-6">
                          Lokasi bekerja Anda tidak muncul karena:
                          <ul className="list-disc ml-4">
                            <li>Lokasi tersebut belum terdaftar dalam sistem oleh admin.</li>
                            <li>
                              Terjadi masalah teknis dalam aplikasi yang menghalangi pembaruan
                              lokasi.
                            </li>
                          </ul>
                          <b>Solusi:</b> Hubungi Tim IT atau Admin untuk memastikan lokasi Anda
                          ditambahkan ke sistem absensi.
                        </p>
                      )}
                    </div>

                    {/* FAQ 4 */}
                    <div>
                      <button
                        className="text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                        onClick={() => toggleFaq(4)}
                      >
                        Bagaimana jika saya ingin lembur?
                        <FontAwesomeIcon
                          icon={faqOpen === 4 ? faAngleUp : faAngleDown}
                          className="float-right"
                        />
                      </button>
                      {faqOpen === 4 && (
                        <p className="text-[12px] text-white rounded-lg bg-green-600 mx-2 p-3  leading-6">
                          Jika Anda ingin lembur, silakan menuju halaman{" "}
                          <Link
                            to="/lembur"
                            className="text-white font-bold border-2 border-white rounded-lg px-2 pb-1 mr-2 hover:underline"
                          >
                            Form Lembur
                          </Link>
                          untuk mengajukan permintaan lembur sesuai prosedur yang berlaku.
                        </p>
                      )}
                    </div>

                    {/* FAQ 5 */}
                    <div>
                      <button
                        className="text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                        onClick={() => toggleFaq(5)}
                      >
                        Bagaimana jika saya ingin pergi dinas keluar kantor?
                        <FontAwesomeIcon
                          icon={faqOpen === 5 ? faAngleUp : faAngleDown}
                          className="float-right"
                        />
                      </button>
                      {faqOpen === 5 && (
                        <p className="text-[12px] text-white rounded-lg bg-green-600 mx-2 p-3  leading-6">
                          Jika Anda ingin lembur, silakan menuju halaman{" "}
                          <Link
                            to="/form"
                            className="text-white font-bold border-2 border-white rounded-lg px-2 pb-1 mr-2 hover:underline"
                          >
                            Form Dinas
                          </Link>
                          untuk mengajukan permintaan lembur sesuai prosedur yang berlaku.
                        </p>
                      )}
                    </div>

                    {/* FAQ 6 */}
                    <div>
                      <button
                        className="text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                        onClick={() => toggleFaq(8)}
                      >
                        Bagaimana memastikan aplikasi ini berjalan lancar di perangkat saya?
                        <FontAwesomeIcon
                          icon={faqOpen === 8 ? faAngleUp : faAngleDown}
                          className="float-right"
                        />
                      </button>
                      {faqOpen === 8 && (
                        <p className="text-[12px] text-white rounded-lg bg-green-600 mx-2 p-3 leading-6">
                          Pastikan perangkat Anda memenuhi persyaratan berikut agar aplikasi
                          berjalan lancar:
                          <ul className="list-disc ml-4">
                            <li>Perangkat Anda menggunakan versi terbaru dari aplikasi.</li>
                            <li>
                              Koneksi internet yang stabil (Wi-Fi atau data seluler yang cukup
                              kuat).
                            </li>
                            <li>Memberikan izin yang diperlukan seperti akses GPS dan kamera.</li>
                          </ul>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {/* FAQ */}
            </div>
          </MobileLayout>
        );
    }
  };

  return <div>{renderStep()}</div>;
};

export default Absensi;

import { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import StepOne from "./StepOne";
import StepTwoMulai from "./StepTwoMulai";
import StepTwoSelesai from "./StepTwoSelesai";
import StepThree from "./StepThree";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faCalendarPlus, faHistory, faAngleDown, faSignInAlt, faSignOutAlt, faClock, faArrowRight, faAngleUp } from "@fortawesome/free-solid-svg-icons";

const Absensi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [currentStep, setCurrentStep] = useState(null);
  const [isSelesaiFlow, setIsSelesaiFlow] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ userId: "", username: "", id_absen: "" });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [faqOpen, setFaqOpen] = useState(null);
  const [allFaqOpen, setAllFaqOpen] = useState(false);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const handleNextStepData = (data) => {
    setAttendanceData((prev) => ({ ...prev, ...data }));
    handleNextStep();
  };

  const handleNextStep = () => {
    const steps = isSelesaiFlow ? ["stepTwoSelesai", "stepThree"] : ["stepOne", "stepTwoMulai", "stepThree"];
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
        setAttendanceHistory(last24Hours.slice(0, 1) || []); // Limit to 3 items
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
          const { id_absen, id_user, username, id_lokasi, deskripsi, jam_mulai } = data[0];
          setAttendanceData({
            userId: String(id_user),
            username: username || "",
            id_absen: String(id_absen),
            id_lokasi: id_lokasi || "",
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

  const renderStep = () => {
    switch (currentStep) {
      case "stepOne":
        return <StepOne attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "stepTwoMulai":
        return <StepTwoMulai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "stepTwoSelesai":
        return <StepTwoSelesai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "stepThree":
        return <StepThree formData={attendanceData} />;
      default:
        return (
          <MobileLayout title="Absensi">
            <div className="w-full bg-white rounded-lg shadow-md py-5 px-4">

              {/* Riwayat Absensi */}
                <div className="p-3 bg-green-600 rounded-lg shadow-sm mb-4">
                  {/* Header Tanggal dan Jam */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-white font-medium">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      Riwayat Absensi
                    </p>
                    <a href="/riwayat-absensi" className="text-xs text-white font-medium hover:text-gray-300 underline">
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
                            {new Date(item.jam_mulai).toLocaleDateString('id-ID', {
                              // weekday: 'long',
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
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
                                  {new Date(item.jam_mulai).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
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
                              {new Date(item.jam_selesai).toLocaleDateString('id-ID', {
                                // weekday: 'long',
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>

                            {/* Absen Pulang */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className="pb-1 px-2 bg-orange-500 text-white rounded-full">
                                  <FontAwesomeIcon icon={faSignOutAlt} className="text-xs transform rotate-180" />
                                </div>
                                <div>
                                <p className="text-[10px] text-gray-500 font-bold">Absen Pulang</p>
                                <p className="text-[14px] font-medium text-green-500">
                                  {new Date(item.jam_selesai).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
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
                        <p className="text-sm text-white">Belum ada riwayat absensi <br/> dalam 24 jam terakhir.</p>
                      </div>
                      
                      
                      )}
                </div>
              {/* Riwayat Absensi */}

              {/* Absen Mulai / Absen Selesai */}
              {isSelesaiFlow ? (
                <button
                  className="w-full bg-teal-600 text-white py-3 rounded-md shadow-lg hover:bg-teal-700 flex items-center justify-center gap-2 transition"
                  onClick={() => setCurrentStep("stepTwoSelesai")}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl" />
                  <span className="text-lg font-medium">Absen Selesai</span>
                </button>
              ) : (
                <button
                  className="w-full border border-green-600 text-green-600 py-3 rounded-md shadow-lg hover:bg-green-200 flex items-center justify-center gap-2 transition"
                  onClick={() => setCurrentStep("stepOne")}
                >
                  <FontAwesomeIcon icon={faCalendarPlus} className="text-2xl" />
                  <span className="text-lg font-medium">Absen Mulai</span>
                </button>
              )}
              {/* Absen Mulai / Absen Selesai */}

            {/* FAQ */}
              <div className="mt-6">
                <h3
                  className="text-sm font-semibold text-gray-800 mb-2 flex items-center justify-between cursor-pointer"
                  onClick={() => setAllFaqOpen(!allFaqOpen)}
                >
                  <span className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faAngleDown} className={`text-green-500 transform ${allFaqOpen ? "rotate-180" : ""}`} />
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
                Apa itu absensi masuk?
                <FontAwesomeIcon icon={faqOpen === 0 ? faAngleUp : faAngleDown} className="float-right" />
              </button>
              {faqOpen === 0 && (
                <p className="text-[11px] text-white rounded-lg bg-gray-700 mx-2 p-3">
                  Absensi masuk dilakukan ketika kamu memulai pekerjaan atau kegiatan.
                </p>
              )}
            </div>

            {/* FAQ 2 */}
            <div>
              <button
                className=" text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                onClick={() => toggleFaq(1)}
              >
                Apa itu absensi selesai?
                <FontAwesomeIcon icon={faqOpen === 1 ? faAngleUp : faAngleDown} className="float-right" />
              </button>
              {faqOpen === 1 && (
                <p className="text-[11px] text-white rounded-lg bg-gray-700 mx-2 p-3">
                  Absensi selesai dilakukan ketika kamu mengakhiri pekerjaan atau kegiatan.
                </p>
              )}
            </div>

            {/* FAQ 3 */}
            <div>
              <button
                className=" text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                onClick={() => toggleFaq(2)}
              >
                Kenapa tidak bisa absen selesai?
                <FontAwesomeIcon icon={faqOpen === 2 ? faAngleUp : faAngleDown} className="float-right" />
              </button>
              {faqOpen === 2 && (
                <p className="text-[11px] text-white rounded-lg bg-gray-700 mx-2 p-3">
                  Anda harus absen mulai terlebih dahulu dan absen selesai lewat aplikasi sesuai dengan prosedur absensi.
                </p>
              )}
            </div>

            {/* FAQ 4 */}
            <div>
              <button
                className=" text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                onClick={() => toggleFaq(3)}
              >
                Kenapa kamera tidak bisa terbuka?
                <FontAwesomeIcon icon={faqOpen === 3 ? faAngleUp : faAngleDown} className="float-right" />
              </button>
              {faqOpen === 3 && (
                <p className="text-[11px] text-white rounded-lg bg-gray-700 mx-2 p-3">
                  Izinkan aplikasi untuk mengakses kamera atau refresh browser Anda (Chrome).
                </p>
              )}
            </div>

             {/* FAQ 5 */}
              <div>
                <button
                  className=" text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                  onClick={() => toggleFaq(4)}
                >
                  Bagaimana jika saya ingin lembur?
                  <FontAwesomeIcon icon={faqOpen === 4 ? faAngleUp : faAngleDown} className="float-right" />
                </button>
                {faqOpen === 4 && (
                  <p className="text-[11px] text-white rounded-lg bg-gray-700 mx-2 p-3">
                    Jika Anda ingin lembur, silakan menuju halaman{" "}
                    <Link to="/lembur" className="text-green-600 font-bold   hover:underline">
                      Lembur
                    </Link>.
                  </p>
                )}
              </div>

            {/* FAQ 6 */}
            <div>
              <button
                className=" text-xs w-full text-left px-4 py-2 font-semibold mt-2 hover:bg-gray-50 rounded-md"
                onClick={() => toggleFaq(5)}
              >
                Bagaimana jika lokasi tidak tersedia?
                <FontAwesomeIcon icon={faqOpen === 5 ? faAngleUp : faAngleDown} className="float-right" />
              </button>
              {faqOpen === 5 && (
                <p className="text-[11px] text-white rounded-lg bg-gray-700 mx-2 p-3">
                  Jika lokasi tidak ada di menu absensi maka mohon untuk menghubungi Tim IT agar segera di tambahkan lokasi nya
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

import { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import StepOne from "./StepOne";
import StepTwoMulai from "./StepTwoMulai";
import StepTwoSelesai from "./StepTwoSelesai";
import StepThree from "./StepThree";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faCalendarPlus, faHistory, faAngleDown } from "@fortawesome/free-solid-svg-icons";

const Absensi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [currentStep, setCurrentStep] = useState(null);
  const [isSelesaiFlow, setIsSelesaiFlow] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ userId: "", username: "", id_absen: "" });
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [faqOpen, setFaqOpen] = useState(null);

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
        setAttendanceHistory(last24Hours.slice(0, 3) || []); // Limit to 3 items
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
            <div className="w-full bg-white rounded-lg shadow-md p-4">
              {/* Riwayat Absensi */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FontAwesomeIcon icon={faHistory} className="text-teal-500" /> Riwayat Absensi
                </h3>
                <a href="/riwayat-absensi" className="text-teal-600 text-sm">View All</a>
              </div>
              {attendanceHistory.length > 0 ? (
                <ul className="space-y-2">
                  {attendanceHistory.map((item, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm text-gray-600">
                        <strong>Mulai:</strong> {item.jam_mulai} | <strong>Selesai:</strong> {item.jam_selesai || "-"}
                      </p>
                      <p className="text-xs text-gray-500">{item.deskripsi}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">Belum ada riwayat absensi dalam 24 jam terakhir.</p>
              )}

              {/* FAQ */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faAngleDown} className="text-teal-500" /> FAQ
                </h3>
                <div>
                  <button className="text-teal-600 w-full text-left" onClick={() => toggleFaq(0)}>
                    Apa itu absensi masuk?
                  </button>
                  {faqOpen === 0 && (
                    <p className="text-sm text-gray-600 mt-2">Absensi masuk dilakukan ketika kamu memulai pekerjaan atau kegiatan.</p>
                  )}
                </div>
                <div>
                  <button className="text-teal-600 w-full text-left mt-2" onClick={() => toggleFaq(1)}>
                    Apa itu absensi selesai?
                  </button>
                  {faqOpen === 1 && (
                    <p className="text-sm text-gray-600 mt-2">Absensi selesai dilakukan ketika kamu mengakhiri pekerjaan atau kegiatan.</p>
                  )}
                </div>
              </div>

              {/* Absen Mulai / Absen Selesai */}
              {isSelesaiFlow ? (
                <button
                  className="w-full bg-teal-600 text-white px-6 py-4 rounded-md shadow-lg hover:bg-teal-700 flex items-center justify-center gap-2 transition"
                  onClick={() => setCurrentStep("stepTwoSelesai")}
                >
                  <FontAwesomeIcon icon={faCalendarCheck} className="text-2xl" />
                  <span className="text-lg font-medium">Absen Selesai</span>
                </button>
              ) : (
                <button
                  className="w-full bg-green-700 text-white px-6 py-4 rounded-md shadow-lg hover:bg-green-800 flex items-center justify-center gap-2 transition"
                  onClick={() => setCurrentStep("stepOne")}
                >
                  <FontAwesomeIcon icon={faCalendarPlus} className="text-2xl" />
                  <span className="text-lg font-medium">Absen Mulai</span>
                </button>
              )}
            </div>
          </MobileLayout>
        );
    }
  };

  return <div>{renderStep()}</div>;
};

export default Absensi;

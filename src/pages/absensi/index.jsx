import { useState, useEffect } from "react";
import MobileLayout from "../../layouts/mobileLayout";
import StepOne from "./StepOne";
import StepTwoMulai from "./StepTwoMulai";
import StepTwoSelesai from "./StepTwoSelesai";
import StepThree from "./StepThree";

const Absensi = () => {
  const apiUrl = process.env.REACT_APP_API_BASE_URL;

  const [currentStep, setCurrentStep] = useState(null); // Default `null` sebelum user memilih mulai/selesai
  const [isSelesaiFlow, setIsSelesaiFlow] = useState(false);
  const [attendanceData, setAttendanceData] = useState({ userId: "", username: "", id_absen: "" });

  const handleNextStepData = (data) => {
    setAttendanceData((prev) => ({ ...prev, ...data }));
    handleNextStep();
  };

  const handleNextStep = () => {
    if (isSelesaiFlow) {
      const stepsSelesaiFlow = ["stepTwoSelesai", "stepThree"];
      const currentIndex = stepsSelesaiFlow.indexOf(currentStep);
      if (currentIndex >= 0 && currentIndex < stepsSelesaiFlow.length - 1) {
        setCurrentStep(stepsSelesaiFlow[currentIndex + 1]);
      }
    } else {
      const stepsNormalFlow = ["stepOne", "stepTwoMulai", "stepThree"];
      const currentIndex = stepsNormalFlow.indexOf(currentStep);
      if (currentIndex >= 0 && currentIndex < stepsNormalFlow.length - 1) {
        setCurrentStep(stepsNormalFlow[currentIndex + 1]);
      }
    }
  };

  // Fungsi untuk menampilkan langkah berdasarkan `currentStep`
  const renderStep = () => {
    switch (currentStep) {
      case "stepOne":
        return <StepOne userId={attendanceData.userId} username={attendanceData.username} attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "stepTwoMulai":
        return <StepTwoMulai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      case "stepThree":
        return <StepThree formData={attendanceData} />;
      case "stepTwoSelesai":
        return <StepTwoSelesai attendanceData={attendanceData} handleNextStepData={handleNextStepData} />;
      default:
        return (
          <MobileLayout title="Absensi">
            <div className="flex flex-col items-center justify-center h-screen w-full overflow-hidden p-4">
              <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 p-4 mb-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <button
                  className="bg-green-700 text-white px-6 py-3 rounded-md w-full hover:bg-green-800 transition duration-300"
                  onClick={() => {
                    setIsSelesaiFlow(false);
                    setCurrentStep("stepOne");
                  }}
                >
                  Absen Mulai
                </button>
              </div>

              <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 p-4 mb-4 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                <button
                  className="bg-teal-600 text-white px-6 py-3 rounded-md w-full hover:bg-green-600 transition duration-300"
                  onClick={() => {
                    setIsSelesaiFlow(true);
                    setCurrentStep("stepTwoSelesai");
                  }}
                >
                  Absen Selesai
                </button>
              </div>
            </div>
          </MobileLayout>
        );
    }
  };

  // Cek kehadiran saat pertama kali load
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("userName");
    if (storedUserId) {
      setAttendanceData({ userId: storedUserId, username: storedUsername || "" });
      const checkAttendance = async () => {
        try {
          const response = await fetch(`${apiUrl}/absen/cek/${storedUserId}`);
          const data = await response.json();
          if (response.ok) {
            const currentTime = new Date();
            const currentHour = currentTime.getHours();
            console.log("Current hour:", currentHour);
            if (Array.isArray(data) && data.length > 0) {
              const { id_absen, id_user, username, id_lokasi, deskripsi, jam_mulai } = data[0];
              setAttendanceData((prev) => {
                const updatedData = {
                  ...prev,
                  id_absen: String(id_absen),
                  userId: String(id_user),
                  username: username || "",
                  id_lokasi: id_lokasi || "",
                  deskripsi: deskripsi || "",
                  jam_mulai: String(jam_mulai),
                };
                return updatedData;
              });
              setIsSelesaiFlow(true); // Jika user sudah absen mulai sebelumnya
              setCurrentStep("stepTwoSelesai");
            } else {
              setIsSelesaiFlow(false); // Jika user belum absen
              setCurrentStep(null); // Tampilkan tombol pilihan
            }
          } else {
            setIsSelesaiFlow(false);
            setCurrentStep(null); // Tampilkan tombol pilihan
          }
        } catch (error) {
          setIsSelesaiFlow(false);
          setCurrentStep(null); // Tampilkan tombol pilihan
        }
      };
      checkAttendance();
    } else {
      setIsSelesaiFlow(false);
      setCurrentStep(null); // Tampilkan tombol pilihan
    }
  }, [apiUrl]);

  return <div>{renderStep()}</div>;
};

export default Absensi;

import React, { useState } from "react";
import MobileLayout from "../../../layouts/mobileLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faClock, faClipboardList, faBriefcase} from "@fortawesome/free-solid-svg-icons";
import Absensi from "./Absensi";
import Lembur from "./Lembur";
// import Cuti from "./Cuti";
import Dinas from "./Dinas";

// ✅ import komponen footer
import FooterMainBar from "../../../components/mobile/FooterMainBar";

export default function RiwayatIndex() {
  const [activeTab, setActiveTab] = useState("absensi");

  const TABS = [
    { key: "absensi", label: "Absensi", icon: faCalendarCheck },
    { key: "lembur", label: "Lembur", icon: faClock },
    // { key: "cuti", label: "Cuti", icon: faClipboardList },
    { key: "dinas", label: "Dinas", icon: faBriefcase },
  ];

  return (
    <MobileLayout title="Riwayat">
      {/* ---- Konten Tab ---- */}
      <div className="relative flex w-full overflow-x-auto no-scrollbar my-2 pb-3">
        <div className="flex flex-1 bg-gray-100 rounded-full p-1 shadow-inner gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isActive
                    ? "bg-green-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-white hover:text-green-600"
                  }`}
              >
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`text-xs mb-1 ${isActive ? "text-white" : ""}`}
                />
                <span className="leading-tight text-[9px]">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Isi Tab ---- */}
      <div className="mt-2 pb-24"> {/* pb-24 agar konten tidak ketutupan footer */}
        {activeTab === "absensi" && <Absensi />}
        {activeTab === "lembur" && <Lembur />}
        {/* {activeTab === "cuti"   && <Cuti />} */}
        {activeTab === "dinas"  && <Dinas />}
      </div>

      {/* ---- Footer Tetap ---- */}
      <FooterMainBar />
    </MobileLayout>
  );
}

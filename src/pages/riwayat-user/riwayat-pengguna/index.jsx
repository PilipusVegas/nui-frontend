import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faClock,
  faClipboardList,
  faBriefcase,
  faMotorcycle,
} from "@fortawesome/free-solid-svg-icons";

import Absensi from "./Absensi";
import Lembur from "./Lembur";
import KunjunganTeknisi from "./KunjunganTeknisi";
import Dinas from "./Dinas";

export default function RiwayatIndex() {
  const [activeTab, setActiveTab] = useState("absensi");
  const scrollRef = useRef(null);

  const TABS = [
    { key: "absensi", label: "Absensi", icon: faCalendarCheck },
    { key: "lembur", label: "Lembur", icon: faClock },
    { key: "kunjungan", label: "Kunjungan", icon: faMotorcycle },
    { key: "dinas", label: "Dinas", icon: faBriefcase },
  ];

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* ===== Tabs ===== */}
      <div className="relative flex-shrink-0 pb-1">
        {/* Gradient kiri */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white/70 via-white/30 to-transparent z-10" />

        {/* Gradient kanan */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white/70 via-white/30 to-transparent z-10" />

        <div ref={scrollRef} className="flex overflow-x-auto no-scrollbar px-2 py-2 gap-2 scroll-smooth snap-x snap-mandatory">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  snap-start flex items-center gap-2 px-4 py-2 rounded-full
                  whitespace-nowrap text-sm font-medium transition-all duration-300
                  border
                  ${
                    isActive
                      ? "bg-green-500 text-white border-green-500 shadow-md scale-[1.02]"
                      : "bg-white text-green-600 border-gray-200 hover:bg-gray-100"
                  }
                `}
              >
                <FontAwesomeIcon
                  icon={tab.icon}
                  className={`text-xs ${isActive ? "text-white" : ""}`}
                />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== Content ===== */}
      <div className="flex-1 overflow-y-auto pb-24 px-2">
        {activeTab === "absensi" && <Absensi />}
        {activeTab === "lembur" && <Lembur />}
        {activeTab === "kunjungan" && <KunjunganTeknisi />}
        {activeTab === "dinas" && <Dinas />}
      </div>
    </div>
  );
}

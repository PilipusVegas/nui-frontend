import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faClock,
  faClipboardList,
  faBriefcase,
  faMotorcycle,
} from "@fortawesome/free-solid-svg-icons";
import { getUserFromToken } from "../../../utils/jwtHelper";

import Absensi from "./Absensi";
import Lembur from "./Lembur";
import KunjunganTeknisi from "./KunjunganTeknisi";
import Dinas from "./Dinas";

export default function RiwayatIndex() {
  const [activeTab, setActiveTab] = useState("absensi");
  const scrollRef = useRef(null);

  const user = getUserFromToken();

  const TABS = [
    { key: "absensi", label: "Absensi", icon: faCalendarCheck },
    { key: "lembur", label: "Lembur", icon: faClock },
    { key: "kunjungan", label: "Kunjungan", icon: faMotorcycle },
    { key: "dinas", label: "Dinas", icon: faBriefcase },
  ];

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-white">
      {/* ===== User Info ===== */}
      <div className="shrink-0 px-4 pt-14 pb-2 border-b border-gray-100">
        <p className="text-[11px] font-medium text-gray-400">
          Riwayat Aktivitas
        </p>

        <div className="mt-1 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-800">
              {user?.nama_user || "-"}
            </h2>

            <p className="text-xs text-gray-500">{user?.role || "-"}</p>
          </div>
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="relative shrink-0 pb-1">
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-white/20 via-white/10 to-transparent" />

        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-white/70 via-white/30 to-transparent" />

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto no-scrollbar px-2 py-2"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                flex items-center gap-2 rounded-full border px-4 py-2
                whitespace-nowrap text-sm font-medium transition-all duration-300
                ${
                  isActive
                    ? "bg-green-500 text-white border-green-500 shadow-md"
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

      {/* ===== Content Scroll Only ===== */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-2 pb-24">
        {activeTab === "absensi" && <Absensi />}
        {activeTab === "lembur" && <Lembur />}
        {activeTab === "kunjungan" && <KunjunganTeknisi />}
        {activeTab === "dinas" && <Dinas />}
      </div>
    </div>
  );
}

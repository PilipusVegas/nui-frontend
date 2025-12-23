const LogTabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-2 overflow-x-auto">
    {tabs.map((tab) => (
      <button
        key={tab}
        onClick={() => onChange(tab)}
        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap
          ${
            active === tab
              ? "bg-green-600 text-white"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default LogTabs;

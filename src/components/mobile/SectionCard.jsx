const SectionCard = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white mx-4 px-5 py-4 mt-3 rounded-[24px] border border-gray-100 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
};

export default SectionCard;
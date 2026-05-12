const SectionCard = ({ children, className = "" }) => {
  return (
    <div className={`bg-white px-5 py-4 pt-3 mt-2 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default SectionCard;
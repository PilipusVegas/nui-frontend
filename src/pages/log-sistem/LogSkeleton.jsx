const LogSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div
        key={i}
        className="h-20 rounded-xl bg-gray-100 animate-pulse"
      />
    ))}
  </div>
);

export default LogSkeleton;

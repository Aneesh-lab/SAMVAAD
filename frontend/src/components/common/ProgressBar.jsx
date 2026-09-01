function ProgressBar({ value = 0, max = 100, showLabel = false }) {
  const percentage = Math.min(
    Math.max((value / max) * 100, 0),
    100
  );

  return (
    <div className="w-full">
      {showLabel && (
        <div className="mb-2 flex justify-between text-sm font-medium text-slate-600">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}

      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin="0"
        aria-valuemax={max}
      >
        <div
          className="h-full rounded-full bg-indigo-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
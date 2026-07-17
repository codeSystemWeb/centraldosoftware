export default function StarRating({ rating = 0, reviewCount = 0, size = "text-sm" }) {
  const full = Math.round(rating);

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      <div className="flex text-amber-400">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n}>{n <= full ? "★" : "☆"}</span>
        ))}
      </div>
      <span className="font-mono text-[11px] text-slate-500">
        {rating > 0 ? rating.toFixed(1) : "Novo"}
        {reviewCount > 0 && ` (${reviewCount})`}
      </span>
    </div>
  );
}
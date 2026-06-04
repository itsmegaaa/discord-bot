export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#2b2d31] p-6">
      <div className="mx-auto grid max-w-5xl gap-4">
        <div className="h-10 animate-pulse rounded bg-white/10" />
        <div className="h-40 animate-pulse rounded bg-white/10" />
        <div className="h-40 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  );
}

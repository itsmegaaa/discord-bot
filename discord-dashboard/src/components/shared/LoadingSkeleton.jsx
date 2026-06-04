export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0b0d13] p-6">
      <div className="mx-auto grid max-w-6xl gap-4">
        <div className="h-14 animate-pulse rounded-2xl bg-white/[0.06]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="h-32 animate-pulse rounded-2xl bg-white/[0.06]" />
          <div className="h-32 animate-pulse rounded-2xl bg-white/[0.06]" />
        </div>
        <div className="h-56 animate-pulse rounded-2xl bg-white/[0.06]" />
      </div>
    </div>
  );
}

export default function SaveButton({ loading, children = 'Save', ...props }) {
  return (
    <button
      type="button"
      disabled={loading}
      className="rounded bg-[#5865f2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4752c4] disabled:cursor-not-allowed disabled:opacity-60"
      {...props}
    >
      {loading ? 'Saving...' : children}
    </button>
  );
}

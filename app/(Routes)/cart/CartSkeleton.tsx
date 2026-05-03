export const CartSkeleton = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 text-white pb-20 animate-pulse">

      <div className="h-10 w-72 bg-zinc-800 rounded my-6" />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        <div className="md:col-span-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[#1a1a1a] border border-zinc-800" />
          ))}
        </div>

        <div className="md:col-span-6 h-96 bg-[#1a1a1a] border border-zinc-800" />

      </div>
    </div>
  );
};
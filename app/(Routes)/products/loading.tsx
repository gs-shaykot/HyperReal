export default function Loading() {
    return (
        <div className="grid grid-cols-4 gap-6 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="h-64 rounded-lg bg-zinc-200 animate-pulse"
                />
            ))}
        </div>
    );
}
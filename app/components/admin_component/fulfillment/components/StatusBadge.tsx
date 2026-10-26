import { badgeClasses } from "../fulfillment.utils";
export default function StatusBadge({ value }: { value: string }) { return <span className={`inline-flex whitespace-nowrap border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeClasses(value)}`}>{value.replaceAll("_", " ")}</span>; }

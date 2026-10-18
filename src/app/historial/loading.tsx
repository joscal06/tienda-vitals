import { OrdersSkeleton } from "@/components/skeletons";

export default function HistoryLoading() {
  return (
    <>
      <div className="skeleton h-8 w-48" />
      <div className="skeleton mt-2 mb-6 h-4 w-80" />
      <OrdersSkeleton />
    </>
  );
}

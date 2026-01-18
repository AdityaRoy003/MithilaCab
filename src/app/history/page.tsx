import AppLayout from "@/components/app-layout";
import { RideHistoryCard } from "@/components/ride/ride-history-card";
import { mockRideHistory } from "@/lib/data";

export default function HistoryPage() {
  return (
    <AppLayout>
      <main className="flex-1 flex flex-col">
        <div className="p-4 md:p-6 lg:p-8">
            <h1 className="font-headline text-3xl font-bold mb-6">Ride History</h1>
            <div className="space-y-4">
            {mockRideHistory.map((ride) => (
                <RideHistoryCard key={ride.id} ride={ride} />
            ))}
            </div>
        </div>
      </main>
    </AppLayout>
  );
}

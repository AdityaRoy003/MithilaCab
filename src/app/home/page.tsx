import AppLayout from "@/components/app-layout";
import { BookingFlow } from "@/components/ride/booking-flow";

export default function HomePage() {
  return (
    <AppLayout>
      <main className="flex-1 flex flex-col p-4 md:p-6 lg:p-8 bg-background">
        <BookingFlow />
      </main>
    </AppLayout>
  );
}

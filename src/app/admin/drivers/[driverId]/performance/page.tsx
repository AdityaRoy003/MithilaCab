import { DriverPerformance } from './performance-details';

export default function DriverPerformancePage({ params }: { params: { driverId: string } }) {
  return <DriverPerformance driverId={params.driverId} />;
}

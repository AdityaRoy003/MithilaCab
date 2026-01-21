import { DriverProfile } from './driver-profile';

export default function DriverProfilePage({ params }: { params: { driverId: string } }) {
  return <DriverProfile driverId={params.driverId} />;
}

import { UserList } from './user-list';
import { DriverList } from './driver-list';

export default function AdminDashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8">
            <UserList />
            <DriverList />
        </div>
    </main>
  );
}

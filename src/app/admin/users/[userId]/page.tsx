import { UserProfile } from './user-profile';

export default function UserProfilePage({ params }: { params: { userId: string } }) {
  return <UserProfile userId={params.userId} />;
}

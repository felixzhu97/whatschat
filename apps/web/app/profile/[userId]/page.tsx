import { AuthenticatedInstagramApp } from "@/src/presentation/components/containers/authenticated-instagram-app";

export default function ProfileUserPage({
  params,
}: {
  params: { userId: string };
}) {
  return <AuthenticatedInstagramApp routePage="profile" profileUserId={params.userId} />;
}


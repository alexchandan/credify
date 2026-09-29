import { cookies } from "next/headers";
import {
  AUTH_USER_SNAPSHOT_COOKIE,
  decodeAuthUserSnapshot,
} from "@/lib/authUserSnapshot";
import { LandingView } from "@/components/landing";

export default async function Home() {
  const cookieStore = await cookies();
  const user = decodeAuthUserSnapshot(
    cookieStore.get(AUTH_USER_SNAPSHOT_COOKIE)?.value,
  );

  return <LandingView initialUser={user} />;
}

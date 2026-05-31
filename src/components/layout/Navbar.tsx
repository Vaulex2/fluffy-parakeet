import { getUser, getProfile } from "@/lib/actions/auth";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return <NavbarClient user={user} profile={profile} />;
}

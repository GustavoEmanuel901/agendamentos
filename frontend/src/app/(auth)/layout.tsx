import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import api from "@/services/api";
import UserDataProvider from "@/components/UserDataProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookiesList = await cookies();

  const hasToken = cookiesList.has("token");

  if (!hasToken) return redirect("/");

  const token = cookiesList.get("token")?.value;

  const admin = cookiesList.get("admin")?.value;

  const requestUser = await api.get("/profile", {
    headers: {
      Authorization: token,
    },
  });

  if (requestUser.status !== 200) {
    if (admin === "true") {
      return redirect("/admin");
    } else {
      return redirect("/");
    }
  }

  return (
    <UserDataProvider userData={requestUser.data}>{children}</UserDataProvider>
  );
}

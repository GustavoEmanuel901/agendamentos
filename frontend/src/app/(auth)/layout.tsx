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

  console.log("Has token:", hasToken);

  if (!hasToken) return redirect("/");

  const token = cookiesList.get("token")?.value;

  const admin = cookiesList.get("admin")?.value;

  const requestUser = await api
    .get("/profile", {
      headers: {
        Authorization: token,
      },
    })
    .then((res) => res)
    .catch((err) => {
      if (err.status === 401) {
        cookiesList.delete("token");
      }

      return { status: err.response?.status || 500, data: null };
    });

  if (requestUser.status !== 200) {
    if (admin) {
      return redirect("/admin");
    } else {
      return redirect("/");
    }
  }

  return (
    <UserDataProvider userData={requestUser.data}>{children}</UserDataProvider>
  );
}

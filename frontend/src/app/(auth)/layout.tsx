import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import api from "@/services/api";

export default async function Layout({
  children,
}: { children: React.ReactNode }) {
    const cookiesList = await cookies();

    const hasToken = cookiesList.has("token");

    if (!hasToken) 
        return redirect("/");

    const requestUser = await api.get("/profile", {
        headers: {
            Authorization: cookiesList.toString(),
        },
        
    });

    requestUser.status !== 200 && redirect("/");

    return <>{children}</>;
}
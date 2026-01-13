import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  const pathname = req.nextUrl.pathname;

  // Rotas privadas que exigem autenticação
  const isPrivateRoute = pathname.startsWith("/agendamentos");

  // Se for rota privada e não tiver token, redireciona para login
  if (isPrivateRoute && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Se for rota pública (login/cadastro) e tiver token, redireciona para agendamentos
  if (!isPrivateRoute && token)
    return NextResponse.redirect(new URL("/agendamentos", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};

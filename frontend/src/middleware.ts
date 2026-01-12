import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token");
  const { pathname } = req.nextUrl;

  // Rotas públicas (login e cadastro)
  const isPublicRoute = pathname === "/" || pathname === "/cadastro";

  // Se tem token e está tentando acessar página de login/cadastro, redireciona para agendamentos
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL("/agendamentos", req.url));
  }

  // Se não tem token e está tentando acessar rota protegida, redireciona para login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Se tem token e está em rota protegida, permite acesso
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/cadastro", "/agendamentos/:path*", "/admin/:path*"],
};
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import { api } from "@/utils/api";
import { Analytics } from "@vercel/analytics/react";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { type AppType } from "next/app";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SessionProvider session={session}>
          <Component {...pageProps} />
          <Toaster />
        </SessionProvider>
      </ThemeProvider>
      <Analytics />
    </>
  );
};

export default api.withTRPC(MyApp);

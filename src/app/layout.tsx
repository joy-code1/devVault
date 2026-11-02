import type { Metadata } from "next";
import { Workspace } from "@/components/workspace";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "DevVault — Your developer workspace",
    template: "%s | DevVault",
  },
  description:
    "Your code, resources, and projects. One thoughtfully organized developer workspace.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Workspace>{children}</Workspace>
      </body>
    </html>
  );
}

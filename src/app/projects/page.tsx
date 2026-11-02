import { Library } from "@/components/library";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Projects" };
export default function Page() {
  return <Library kind="project" />;
}

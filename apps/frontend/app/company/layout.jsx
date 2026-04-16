/* eslint-disable react/prop-types */

"use client";

import { usePathname } from "next/navigation";
import LayoutNuha from "../../components/LayoutNuha";

export default function CompanyLayout({ children }) {
  const pathname = usePathname();

  return <LayoutNuha pathname={pathname}>{children}</LayoutNuha>;
}

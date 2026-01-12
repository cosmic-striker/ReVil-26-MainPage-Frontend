"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export function FooterWrapper() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    if (isHomePage) {
        return null;
    }

    return <Footer />;
}

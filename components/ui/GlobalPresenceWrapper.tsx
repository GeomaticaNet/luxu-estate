"use client";

import dynamic from "next/dynamic";

const GlobalPresence = dynamic(() => import("./GlobalPresence"), { ssr: false });

export default function GlobalPresenceWrapper() {
  return <GlobalPresence />;
}

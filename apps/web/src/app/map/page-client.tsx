"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MapPageClient({ gameId }: { gameId: string }) {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        ssr: false
      }),
    []
  );

  return (
    <div className="mx-auto w-full h-full">
      <Map gameId={gameId} />
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MapPageClient({ gameId }: { gameId: string }) {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false
      }),
    []
  );

  return (
    <div className="max-w-4xl mx-auto w-full h-full">
      <Map gameId={gameId} />
    </div>
  );
}

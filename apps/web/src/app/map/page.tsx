"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

export default function MapPage() {
  const Map = useMemo(
    () =>
      dynamic(() => import("@/components/Map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false
      }),
    []
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="">test</div>
      <Map position={[-31.957139, 115.807917]} zoom={13} />
    </div>
  );
}

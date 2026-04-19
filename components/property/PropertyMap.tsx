"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] rounded-lg bg-slate-100 flex items-center justify-center animate-pulse" />
  ),
});

interface Props {
  address: string;
  lat: number;
  lng: number;
}

const PropertyMap = (props: Props) => {
  return <MapComponent {...props} />;
};

export default PropertyMap;

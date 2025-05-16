import { Icon } from "leaflet";

export const customIcons = {
  markerRed: new Icon({
    iconUrl: "/marker-red.png",
    iconSize: [20, 32],
    iconAnchor: [10, 28],
    popupAnchor: [0, -32]
  }),
  markerGreen: new Icon({
    iconUrl: "/marker-green.png",
    iconSize: [20, 32],
    iconAnchor: [10, 28],
    popupAnchor: [0, -32]
  }),
  markerBlue: new Icon({
    iconUrl: "/marker-blue.png",
    iconSize: [20, 32],
    iconAnchor: [10, 28],
    popupAnchor: [0, -32]
  })
};

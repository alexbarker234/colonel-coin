export * from "./types";
export { pointsOfInterestTyped as pointsOfInterest };

// Correctly type points of interest
import pointsOfInterest from "./points-of-interest.json";
import { PointOfInterest } from "./types";
const pointsOfInterestTyped = pointsOfInterest as PointOfInterest[];

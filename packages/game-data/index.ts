export * from "./types";

// Correctly type points of interest
import pointsOfInterest from "./points-of-interest.json";
import { PointOfInterest } from "./types";
const pointsOfInterestTyped = pointsOfInterest as PointOfInterest[];

export { pointsOfInterestTyped as pointsOfInterest };

// Correctly type bounties
import bountyData from "./bounties.json";
import { BountyData } from "./types";
const bountiesTyped = bountyData as BountyData[];

export { bountiesTyped as bountyData };

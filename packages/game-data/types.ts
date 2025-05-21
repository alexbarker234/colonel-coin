export interface PointOfInterest {
    id: string;
    name: string;
    position: [number, number];
}

export interface BountyData {
    id: number;
    description: string;
    reward: string;
    negative?: boolean;
    penalty?: string;
}

export class CircleGeometry {
  public features: Feature[] = [];
  public type: string = "";
}

export interface Feature {
  geometry: Geometry;
  properties: Properties;
  type: string;
}

export interface Geometry {
  coordinates: number[][][];
  type: string;
}

export interface Properties {
  color: string;
  media: number;
  sezione: number;
  somma: number;
}

export type Reading = {
  temperature: number;
  humidity: number;
  sound: number;
  filterLevel?: number;
  timestamp: string;
  peakToPeak?: number | null;
};

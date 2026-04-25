import type { TimeRange } from "./spotify";
import type { EmotionResult } from "./api";

export interface SharePayload {
  v: 1;
  e: EmotionResult[];
  n: number;
  r: TimeRange;
}

/**
 * Canonical emotions returned by the API and their emoji mapping.
 */

export type Emotion =
  | "joy"
  | "sadness"
  | "anger"
  | "love"
  | "fear"
  | "surprise"
  | "neutral"
  | "excitement"
  | "disappointment"
  | "optimism";

export const EMOTION_EMOJI: Record<Emotion, string> = {
  joy: "😄",
  sadness: "😢",
  anger: "😡",
  love: "❤️",
  fear: "😨",
  surprise: "😲",
  neutral: "😐",
  excitement: "🤩",
  disappointment: "😞",
  optimism: "🙂",
};

import type { TimeRange } from "./spotify";

export interface TimeRangeOption {
  value: TimeRange;
  label: string;
}

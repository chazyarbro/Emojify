import { Fragment } from "react";
import type { TimeRange } from "../types/spotify";
import type { TimeRangeOption } from "../types/emotions";
import { COPY } from "../copy";

interface TimeRangePickerProps {
  value: TimeRange;
  options: TimeRangeOption[];
  onChange: (value: TimeRange) => void;
}

export function TimeRangePicker({ value, options, onChange }: TimeRangePickerProps) {
  return (
    <fieldset className="time-range" aria-label="Time range">
      <legend className="visually-hidden">Time range</legend>
      {options.map((opt, i) => (
        <Fragment key={opt.value}>
          {i > 0 && <span className="time-range-divider" aria-hidden>·</span>}
          <label className="time-range-option">
            <input
              type="radio"
              name="timeRange"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {COPY.results.timeRangeLabels[opt.value]}
          </label>
        </Fragment>
      ))}
    </fieldset>
  );
}

import type { TimeRange } from "../types/spotify";
import type { TimeRangeOption } from "../types/emotions";

interface TimeRangePickerProps {
  value: TimeRange;
  options: TimeRangeOption[];
  onChange: (value: TimeRange) => void;
}

export function TimeRangePicker({ value, options, onChange }: TimeRangePickerProps) {
  return (
    <fieldset className="time-range">
      <legend>Time range</legend>
      <div className="time-range-options">
        {options.map((opt) => (
          <label key={opt.value} className="radio">
            <input
              type="radio"
              name="timeRange"
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

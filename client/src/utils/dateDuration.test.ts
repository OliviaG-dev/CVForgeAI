import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  computeDurationLabel,
  countInclusiveMonths,
  formatDurationFr,
} from "./dateDuration";

describe("formatDurationFr", () => {
  it("formats years and months in French", () => {
    expect(formatDurationFr(12)).toBe("1 an");
    expect(formatDurationFr(24)).toBe("2 ans");
    expect(formatDurationFr(6)).toBe("6 mois");
    expect(formatDurationFr(27)).toBe("2 ans et 3 mois");
  });

  it("returns empty string for invalid input", () => {
    expect(formatDurationFr(0)).toBe("");
  });
});

describe("countInclusiveMonths", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts inclusive months between two dates", () => {
    expect(countInclusiveMonths("2022-01", "2024-03")).toBe(27);
  });

  it("uses current month when current is true", () => {
    expect(countInclusiveMonths("2024-01", "", { current: true })).toBe(30);
  });

  it("uses current month for ongoing education without end date", () => {
    expect(
      countInclusiveMonths("2021-09", "", { ongoingIfNoEnd: true }),
    ).toBeGreaterThan(40);
  });

  it("returns null when start date is missing", () => {
    expect(countInclusiveMonths("", "2024-01")).toBeNull();
  });
});

describe("computeDurationLabel", () => {
  it("returns null when duration cannot be computed", () => {
    expect(computeDurationLabel("", "2024-06")).toBeNull();
  });

  it("returns formatted French label", () => {
    expect(computeDurationLabel("2020-01", "2022-01")).toBe("2 ans et 1 mois");
  });
});

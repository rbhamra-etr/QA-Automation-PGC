// ============================================================
// ETR Toll Validation Utilities
// Zone definitions, rate chart, day type, time band resolvers
// ============================================================

import type { ExpectedZone } from '../models/toll-rate.model';
import { ZONE_DEFINITIONS, STATUTORY_HOLIDAYS } from '../consts/toll-rate.const';

export type { ExpectedZone } from '../models/toll-rate.model';

export function getExpectedZones(entryPoint: string | number, exitPoint: string | number): ExpectedZone[] {
  const ep = parseInt(String(entryPoint), 10);
  const xp = parseInt(String(exitPoint), 10);
  const forward = ep <= xp;
  const result: ExpectedZone[] = [];

  if (forward) {
    for (const z of ZONE_DEFINITIONS) {
      if (ep < z.end && xp > z.start) {
        result.push({ zone: z.zone, entry: Math.max(ep, z.start), exit: Math.min(xp, z.end) });
      }
    }
  } else {
    for (let i = ZONE_DEFINITIONS.length - 1; i >= 0; i--) {
      const z = ZONE_DEFINITIONS[i];
      if (xp < z.end && ep > z.start) {
        result.push({ zone: z.zone, entry: Math.min(ep, z.end), exit: Math.max(xp, z.start) });
      }
    }
  }
  return result;
}

// ---------- DAY TYPE RESOLVER ----------
export function getDayType(timestamp: string): 'weekend' | 'weekday' {
  const d = new Date(timestamp);
  const dayOfWeek = d.getUTCDay();
  const dateStr = d.toISOString().slice(0, 10);
  if (dayOfWeek === 0 || dayOfWeek === 6 || STATUTORY_HOLIDAYS.includes(dateStr)) {
    return 'weekend';
  }
  return 'weekday';
}

// ---------- DIRECTION RESOLVER ----------
export function getDirection(entry: string | number, exit: string | number): 'eastbound' | 'westbound' {
  return parseInt(String(entry), 10) <= parseInt(String(exit), 10) ? 'eastbound' : 'westbound';
}

// ---------- TIME BAND RESOLVER ----------
export function getTimeBand(timestamp: string, dayType: string, direction: string): string {
  const d = new Date(timestamp);
  const totalMinutes = d.getUTCHours() * 60 + d.getUTCMinutes();

  if (dayType === 'weekend') {
    if (totalMinutes < 510)  return 'overnight';
    if (totalMinutes < 600)  return 'amPeak';
    if (totalMinutes < 1140) return 'midday';
    if (totalMinutes < 1260) return 'pmPeak';
    return 'evening';
  }

  // Weekday — same 9 bands for both eastbound and westbound
  if (totalMinutes < 300)  return 'overnight';
  if (totalMinutes < 420)  return 'earlyAM';
  if (totalMinutes < 570)  return 'amPeak';
  if (totalMinutes < 630)  return 'amShoulder';
  if (totalMinutes < 870)  return 'midday';
  if (totalMinutes < 930)  return 'pmShoulder1';
  if (totalMinutes < 1080) return 'pmPeak';
  if (totalMinutes < 1260) return 'pmShoulder2';
  return 'evening';
}

// ---------- FLOATING POINT HELPER ----------
export function approxEqual(a: number, b: number, tol = 0.01): boolean {
  return Math.abs(a - b) <= tol;
}

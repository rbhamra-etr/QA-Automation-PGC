import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from '../../core/fixtures/test.fixture';
import { BaseApi } from '../../core/shared/base.api';
import { getApiService, resolveApiBaseUrl } from '../../core/configs/app-registry.config';
import { apiContext, requireLastResult } from './context.api';
import { getExpectedZones, getDayType, getDirection, getTimeBand, approxEqual } from '../../core/helpers/toll-rate.helper';
import { rateChart } from '../../data/api/toll-rate-chart.data';

const { Given, When, Then } = createBdd(test);

// Toll-specific request inputs are stashed in apiContext.meta under this key so
// the assertion steps below can resolve direction / day-type / time-band.
interface TollInputs {
  entry: string;
  exit: string;
  ratedClass: string;
  timestamp: string;
}

function tollInputs(): TollInputs {
  const inputs = apiContext.meta.toll as TollInputs | undefined;
  if (!inputs) {
    throw new Error('No toll request has been made yet in this scenario.');
  }
  return inputs;
}

/** The parsed response body of the most recent (toll) request. */
function tollBody(): any {
  return requireLastResult().body;
}

// ---------- STEPS ----------

Given('the Toll Rate API is available', async ({}) => {
  const service = getApiService('Toll');
  const baseUrl = resolveApiBaseUrl(service);
  expect(baseUrl, 'TOLL_API_BASE_URL must be set in environment').toBeTruthy();
});

When(
  'I request toll rate for entry {string} exit {string} class {string} at {string}',
  async ({ request, $testInfo }, entry: string, exit: string, ratedClass: string, timestamp: string) => {
    const baseUrl = resolveApiBaseUrl(getApiService('Toll'));
    const inputs: TollInputs = { entry, exit, ratedClass, timestamp };
    apiContext.meta.toll = inputs;

    const api = new BaseApi(request, baseUrl, $testInfo);
    apiContext.last = await api.get('', {
      params: { entry, exit, rated_class: ratedClass, timestamp },
    });
  },
);

Then('the API response status should be {int}', async ({}, expectedStatus: number) => {
  expect(requireLastResult().status, `Expected status ${expectedStatus}`).toBe(expectedStatus);
});

Then(
  'the zone breakdown should match expected zones for entry {string} and exit {string}',
  async ({}, entry: string, exit: string) => {
    const res = tollBody();
    const expectedZones = getExpectedZones(entry, exit);

    expect(res.zone_info, 'zone_info should be defined').toBeDefined();
    expect(Array.isArray(res.zone_info), 'zone_info should be an array').toBe(true);
    expect(res.zone_info.length, 'zone_info count mismatch').toBe(expectedZones.length);

    for (let idx = 0; idx < expectedZones.length; idx++) {
      const ez = expectedZones[idx];
      const actual = res.zone_info[idx];
      expect(actual, `zone_info[${idx}] should exist`).toBeDefined();
      expect(actual.zone, `zone_info[${idx}] zone name`).toBe(ez.zone);
      expect(actual.entry, `zone_info[${idx}] entry`).toBe(ez.entry);
      expect(actual.exit, `zone_info[${idx}] exit`).toBe(ez.exit);
    }
  },
);

Then('each zone rate should match the rate chart for class {string}', async ({}, ratedClass: string) => {
  const res = tollBody();
  const { entry, exit, timestamp } = tollInputs();
  const direction = getDirection(entry, exit);
  const dayType = getDayType(timestamp);
  const timeBand = getTimeBand(timestamp, dayType, direction);
  const classRates = rateChart[ratedClass]?.[direction]?.[dayType];

  for (let idx = 0; idx < res.zone_info.length; idx++) {
    const zi = res.zone_info[idx];
    const zoneName = zi.zone;
    if (classRates?.[zoneName]) {
      const expectedRate = classRates[zoneName][timeBand];
      expect(
        approxEqual(zi.rate, expectedRate, 0.001),
        `zone_info[${idx}] ${zoneName}: rate expected=${expectedRate} actual=${zi.rate} [${direction}/${dayType}/${timeBand}]`,
      ).toBe(true);
    }
  }
});

Then('each zone toll should equal rate multiplied by distance', async ({}) => {
  const res = tollBody();
  for (let idx = 0; idx < res.zone_info.length; idx++) {
    const zi = res.zone_info[idx];
    const computedToll = zi.rate * zi.distance;
    expect(
      approxEqual(zi.toll, computedToll),
      `zone_info[${idx}] ${zi.zone}: toll (${zi.toll}) ≈ rate × distance (${computedToll.toFixed(6)})`,
    ).toBe(true);
  }
});

Then('etr_toll should equal the sum of all zone tolls', async ({}) => {
  const res = tollBody();
  const sumToll = res.zone_info.reduce((sum: number, zi: any) => sum + zi.toll, 0);
  expect(
    approxEqual(res.etr_toll, sumToll),
    `etr_toll (${res.etr_toll}) ≈ sum of zone tolls (${sumToll.toFixed(6)})`,
  ).toBe(true);
});

Then('etr_distance should equal the sum of all zone distances', async ({}) => {
  const res = tollBody();
  const sumDist = res.zone_info.reduce((sum: number, zi: any) => sum + zi.distance, 0);
  expect(
    approxEqual(res.etr_distance, sumDist),
    `etr_distance (${res.etr_distance}) ≈ sum of zone distances (${sumDist.toFixed(3)})`,
  ).toBe(true);
});

Then('etr_rate should equal etr_toll divided by etr_distance', async ({}) => {
  const res = tollBody();
  if (res.etr_distance > 0) {
    const computedEtrRate = res.etr_toll / res.etr_distance;
    expect(
      approxEqual(res.etr_rate, computedEtrRate, 0.0001),
      `etr_rate (${res.etr_rate}) ≈ etr_toll / etr_distance (${computedEtrRate.toFixed(8)})`,
    ).toBe(true);
  }
});

Then('total_transponder should equal etr_toll plus east_toll plus ttc', async ({}) => {
  const res = tollBody();
  const computed = res.etr_toll + res.east_toll + res.ttc;
  expect(
    approxEqual(res.total_transponder, computed),
    `total_transponder (${res.total_transponder}) ≈ etr_toll + east_toll + ttc (${computed.toFixed(6)})`,
  ).toBe(true);
});

Then('total_video should equal etr_toll plus east_toll plus ttc plus vtc', async ({}) => {
  const res = tollBody();
  const computed = res.etr_toll + res.east_toll + res.ttc + res.vtc;
  expect(
    approxEqual(res.total_video, computed),
    `total_video (${res.total_video}) ≈ etr_toll + east_toll + ttc + vtc (${computed.toFixed(6)})`,
  ).toBe(true);
});

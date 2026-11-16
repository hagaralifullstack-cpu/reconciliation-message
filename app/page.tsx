import React from 'react';
import { ApologyJourney } from '@/components/ApologyJourney';
import { DEFAULT_CONFIG, JourneyConfig } from '@/lib/apology-data';

type SearchParamValue = string | string[] | undefined;

function firstParam(value: SearchParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const params = await searchParams;

  const initialConfig: JourneyConfig = {
    senderName: firstParam(params.from) || DEFAULT_CONFIG.senderName,
    recipientName: firstParam(params.to) || DEFAULT_CONFIG.recipientName,
    mistake: firstParam(params.mistake) || DEFAULT_CONFIG.mistake,
    specialMemory: firstParam(params.memory) || DEFAULT_CONFIG.specialMemory,
  };

  const initialScene = firstParam(params.gift) === '1' ? 1 : 0;

  return <ApologyJourney initialConfig={initialConfig} initialScene={initialScene} />;
}

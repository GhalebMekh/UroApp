import { useState } from 'react';
import { CalcCard, NumberField } from './primitives';
import { CITATIONS } from '@/data/citations';
import { interpretSemenAnalysis, type SemenParameters } from '@/lib/semenAnalysis';

export function SemenAnalysisInterpreter() {
  const [params, setParams] = useState<SemenParameters>({
    volumeMl: null,
    concentrationMillionPerMl: null,
    totalMotilityPercent: null,
    progressiveMotilityPercent: null,
    morphologyNormalPercent: null,
    vitalityLivePercent: null,
    pH: null,
  });

  const result = interpretSemenAnalysis(params);

  return (
    <CalcCard
      title="Semen analysis interpreter"
      subtitle="WHO 2021 Lower Limits of Normal — flags parameters below reference"
      citation={CITATIONS.semenAnalysis}
    >
      <NumberField
        label="Volume (mL)"
        value={params.volumeMl !== null ? String(params.volumeMl) : ''}
        onChange={(v) => {
          const n = parseFloat(v);
          setParams((p) => ({ ...p, volumeMl: Number.isFinite(n) ? n : null }));
        }}
      />
      <NumberField
        label="Concentration (million/mL)"
        value={params.concentrationMillionPerMl !== null ? String(params.concentrationMillionPerMl) : ''}
        onChange={(v) => {
          const n = parseFloat(v);
          setParams((p) => ({ ...p, concentrationMillionPerMl: Number.isFinite(n) ? n : null }));
        }}
      />
      <NumberField
        label="Total motility (%)"
        value={params.totalMotilityPercent !== null ? String(params.totalMotilityPercent) : ''}
        onChange={(v) => {
          const n = parseFloat(v);
          setParams((p) => ({ ...p, totalMotilityPercent: Number.isFinite(n) ? n : null }));
        }}
      />
      <NumberField
        label="Progressive motility (%)"
        value={params.progressiveMotilityPercent !== null ? String(params.progressiveMotilityPercent) : ''}
        onChange={(v) => {
          const n = parseFloat(v);
          setParams((p) => ({ ...p, progressiveMotilityPercent: Number.isFinite(n) ? n : null }));
        }}
      />
      <NumberField
        label="Normal morphology (%)"
        value={params.morphologyNormalPercent !== null ? String(params.morphologyNormalPercent) : ''}
        onChange={(v) => {
          const n = parseFloat(v);
          setParams((p) => ({ ...p, morphologyNormalPercent: Number.isFinite(n) ? n : null }));
        }}
      />
      <NumberField
        label="Vitality — live sperm (%)"
        value={params.vitalityLivePercent !== null ? String(params.vitalityLivePercent) : ''}
        onChange={(v) => {
          const n = parseFloat(v);
          setParams((p) => ({ ...p, vitalityLivePercent: Number.isFinite(n) ? n : null }));
        }}
      />
      <NumberField
        label="pH"
        value={params.pH !== null ? String(params.pH) : ''}
        onChange={(v) => {
          const n = parseFloat(v);
          setParams((p) => ({ ...p, pH: Number.isFinite(n) ? n : null }));
        }}
      />

      {result.flags.length > 0 && (
        <div className="mt-4 space-y-2">
          <div className="text-sm font-semibold text-muted">{result.interpretation}:</div>
          {result.flags.map((flag, i) => (
            <div
              key={i}
              className={`rounded-[10px] border px-3 py-2 text-sm ${
                flag.status === 'low'
                  ? 'border-crimson bg-crimson/[0.08] text-crimson'
                  : 'border-teal bg-teal/[0.08] text-teal'
              }`}
            >
              <div className="font-semibold">{flag.parameter}</div>
              <div className="text-xs">
                {flag.value} {flag.status === 'low' ? `(LLN: ${flag.lln})` : '✓'}
              </div>
            </div>
          ))}
        </div>
      )}
    </CalcCard>
  );
}

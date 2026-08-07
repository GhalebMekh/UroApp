import React from 'react';

export default function PatientList({ patients, selectedId, onSelect }) {
  if (patients.length === 0) {
    return (
      <div className="p-6 text-center text-muted-2 text-sm">
        No patients yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {patients.map((patient) => (
        <button
          key={patient.id}
          onClick={() => onSelect(patient)}
          className={`w-full text-left p-3 rounded transition ${
            selectedId === patient.id
              ? 'bg-violet/20 border border-violet'
              : 'bg-steel hover:bg-steel/80 border border-line'
          }`}
        >
          <div className="font-medium text-ink">{patient.name}</div>
          <div className="text-xs text-muted mt-1">
            Age {patient.age} · {patient.sex} {patient.mrn && `· MRN: ${patient.mrn}`}
          </div>
          {patient.admission && (
            <div className="text-xs text-muted-2 mt-1">
              Admitted {new Date(patient.admission).toLocaleDateString()}
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

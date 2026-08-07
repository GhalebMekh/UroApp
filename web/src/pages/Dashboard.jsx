import React, { useState, useEffect } from 'react';
import PatientList from '../components/PatientList';
import PatientDetail from '../components/PatientDetail';
import { apiFetch } from '../lib/api';

export default function Dashboard({ token, user, onLogout }) {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, [token]);

  const fetchPatients = async () => {
    try {
      const data = await apiFetch('/api/patients', { token });
      setPatients(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPatient = async (patientData) => {
    try {
      await apiFetch('/api/patients', { method: 'POST', token, body: patientData });
      fetchPatients();
      setSelectedPatient(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeletePatient = async (patientId) => {
    if (!window.confirm('Delete this patient?')) return;
    try {
      await apiFetch(`/api/patients/${patientId}`, { method: 'DELETE', token });
      fetchPatients();
      setSelectedPatient(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-navy">
      {/* Sidebar */}
      <div className="w-80 bg-navy-2 border-r border-line flex flex-col">
        <div className="p-6 border-b border-line">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">UroApp</h1>
          <p className="text-sm text-muted">Hi, {user.name}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          <PatientList
            patients={patients}
            selectedId={selectedPatient?.id}
            onSelect={setSelectedPatient}
            token={token}
          />
        </div>

        <div className="p-4 border-t border-line space-y-2">
          <button
            onClick={() => setSelectedPatient({ new: true })}
            className="w-full py-2 rounded bg-violet text-navy font-semibold hover:bg-violet-soft transition"
          >
            + New Patient
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2 rounded bg-steel text-muted hover:bg-steel/80 transition text-sm"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted">
            Loading...
          </div>
        ) : selectedPatient ? (
          <PatientDetail
            patient={selectedPatient}
            token={token}
            onSave={handleAddPatient}
            onDelete={handleDeletePatient}
            onClose={() => setSelectedPatient(null)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted">
            Select or create a patient
          </div>
        )}
      </div>
    </div>
  );
}

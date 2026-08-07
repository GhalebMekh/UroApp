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
    // 100dvh, not h-screen: on iOS Safari 100vh is taller than the visible area,
    // so the bottom of the sidebar hides behind the URL bar.
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-navy md:flex-row">
      {/* Sidebar — full width on a phone, fixed rail from md up. A phone shows
          one pane at a time, so it steps aside once a patient is selected. */}
      <div
        className={`${
          selectedPatient ? 'hidden md:flex' : 'flex'
        } min-h-0 w-full flex-col border-line bg-navy-2 md:w-80 md:border-r`}
      >
        <div className="border-b border-line p-6">
          <h1 className="font-display text-2xl font-bold text-ink mb-1">UroApp</h1>
          <p className="text-sm text-muted">Hi, {user.name}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <PatientList
            patients={patients}
            selectedId={selectedPatient?.id}
            onSelect={setSelectedPatient}
            token={token}
          />
        </div>

        {/* pb-safe keeps the buttons clear of the iPhone home indicator. */}
        <div className="space-y-2 border-t border-line p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={() => setSelectedPatient({ new: true })}
            className="min-h-[44px] w-full rounded bg-violet py-2 font-semibold text-navy transition hover:bg-violet-soft"
          >
            + New Patient
          </button>
          <button
            onClick={onLogout}
            className="min-h-[44px] w-full rounded bg-steel py-2 text-sm text-muted transition hover:bg-steel/80"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Detail pane — hidden on a phone until something is selected. */}
      <div
        className={`${
          selectedPatient ? 'flex' : 'hidden md:flex'
        } min-h-0 flex-1 flex-col overflow-y-auto`}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center text-muted">
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
          <div className="flex h-full items-center justify-center text-muted">
            Select or create a patient
          </div>
        )}
      </div>
    </div>
  );
}

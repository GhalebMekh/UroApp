import React, { useState, useEffect } from 'react';

export default function PatientDetail({ patient, token, onSave, onDelete, onClose }) {
  const [formData, setFormData] = useState(
    patient.new
      ? { name: '', age: '', sex: '', mrn: '', location: '', admission: '', reason: '', pmh: '', psh: '', meds: '' }
      : patient
  );
  const [soapNote, setSoapNote] = useState({ s: '', o: '', a: '', p: '' });
  const [soapNotes, setSoapNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!patient.new);

  useEffect(() => {
    if (!patient.new && patient.id) {
      fetchPatientDetails();
    }
  }, [patient.id]);

  const fetchPatientDetails = async () => {
    try {
      const res = await fetch(`/api/patients/${patient.id}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      setFormData(data);
      setSoapNotes(data.soapNotes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSOAP = async (e) => {
    e.preventDefault();
    if (!soapNote.s && !soapNote.o && !soapNote.a && !soapNote.p) return;

    try {
      const res = await fetch(`/api/patients/${patient.id}/soap`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(soapNote),
      });
      const data = await res.json();
      if (data.success) {
        setSoapNote({ s: '', o: '', a: '', p: '' });
        fetchPatientDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full text-muted">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-3xl font-bold text-ink">
          {patient.new ? 'New Patient' : formData.name}
        </h2>
        {!patient.new && (
          <button
            onClick={() => onDelete(patient.id)}
            className="px-4 py-2 rounded bg-crimson/20 text-crimson hover:bg-crimson/30 transition text-sm"
          >
            Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSavePatient} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Sex</label>
            <select
              name="sex"
              value={formData.sex}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            >
              <option value="">Select</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">MRN</label>
            <input
              type="text"
              name="mrn"
              value={formData.mrn}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">Admission Date</label>
            <input
              type="datetime-local"
              name="admission"
              value={formData.admission}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Reason for Admission</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-2">PMH</label>
            <textarea
              name="pmh"
              value={formData.pmh}
              onChange={handleInputChange}
              rows="2"
              placeholder="Past Medical History"
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-2">PSH</label>
            <textarea
              name="psh"
              value={formData.psh}
              onChange={handleInputChange}
              rows="2"
              placeholder="Past Surgical History"
              className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-2">Medications</label>
          <textarea
            name="meds"
            value={formData.meds}
            onChange={handleInputChange}
            rows="2"
            className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded bg-violet text-navy font-semibold hover:bg-violet-soft transition disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Patient'}
        </button>
      </form>

      {!patient.new && (
        <div className="mt-12 border-t border-line pt-8">
          <h3 className="font-display text-2xl font-bold text-ink mb-6">Progress Notes (SOAP)</h3>

          <form onSubmit={handleAddSOAP} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Subjective</label>
              <textarea
                value={soapNote.s}
                onChange={(e) => setSoapNote({ ...soapNote, s: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Objective</label>
              <textarea
                value={soapNote.o}
                onChange={(e) => setSoapNote({ ...soapNote, o: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Assessment</label>
              <textarea
                value={soapNote.a}
                onChange={(e) => setSoapNote({ ...soapNote, a: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink mb-2">Plan</label>
              <textarea
                value={soapNote.p}
                onChange={(e) => setSoapNote({ ...soapNote, p: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 rounded bg-steel border border-line text-ink focus:outline-none focus:border-violet"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 rounded bg-teal text-navy font-semibold hover:bg-teal/80 transition"
            >
              Add SOAP Note
            </button>
          </form>

          <div className="space-y-4">
            {soapNotes.map((note, idx) => (
              <div key={idx} className="p-4 rounded bg-steel border border-line">
                <p className="text-xs text-muted-2 mb-2">
                  {note.timestamp && new Date(note.timestamp).toLocaleString()}
                </p>
                {note.s && <p><span className="font-semibold text-violet">S:</span> {note.s}</p>}
                {note.o && <p><span className="font-semibold text-teal">O:</span> {note.o}</p>}
                {note.a && <p><span className="font-semibold text-amber">A:</span> {note.a}</p>}
                {note.p && <p><span className="font-semibold text-crimson">P:</span> {note.p}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

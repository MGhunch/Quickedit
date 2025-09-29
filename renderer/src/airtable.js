// Browser-side helper that talks to our Vercel serverless API

export async function listClients() {
  const r = await fetch('/api/airtable?op=listClients');
  if (!r.ok) throw new Error('Failed to fetch clients');
  const { clients } = await r.json();
  return clients;
}

export async function listJobsByClient(_envIgnored, client) {
  const r = await fetch(`/api/airtable?op=listJobs&client=${encodeURIComponent(client.name)}`);
  if (!r.ok) throw new Error('Failed to fetch jobs');
  const { jobs } = await r.json();
  return jobs;
}

export async function updateJob(_envIgnored, recordId, { updateText, due }) {
  const r = await fetch('/api/airtable?op=updateJob', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recordId, updateText, due })
  });
  if (!r.ok) throw new Error('Failed to update job');
  return r.json();
}

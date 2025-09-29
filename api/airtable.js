// Vercel serverless function: /api/airtable
export default async function handler(req, res) {
  const {
    AIRTABLE_API_KEY,
    AIRTABLE_BASE_ID,
    AIRTABLE_CLIENTS_TABLE = 'Clients',
    AIRTABLE_JOBS_TABLE = 'Jobs',
    AIRTABLE_CLIENT_LINK_FIELD = 'Client',
    AIRTABLE_JOB_STATUS_FIELD = 'Status',
    AIRTABLE_JOB_DUE_FIELD = 'Due',
    AIRTABLE_JOB_UPDATE_FIELD = 'Latest Update',
  } = process.env;

  const API = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
  const at = (path, init = {}) =>
    fetch(`${API}/${encodeURIComponent(path)}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });

  try {
    // GET /api/airtable?op=listClients
    if (req.method === 'GET' && req.query.op === 'listClients') {
      const r = await at(AIRTABLE_CLIENTS_TABLE);
      if (!r.ok) return res.status(r.status).send(await r.text());
      const data = await r.json();
      return res.status(200).json({
        clients: data.records.map((rec) => ({
          id: rec.id,
          name: rec.fields.Name || rec.fields.Client || rec.id,
        })),
      });
    }

    // GET /api/airtable?op=listJobs&client=Acme
    if (req.method === 'GET' && req.query.op === 'listJobs') {
      const clientName = req.query.client || '';
      const filter = `AND({${AIRTABLE_CLIENT_LINK_FIELD}}='${clientName}', NOT({${AIRTABLE_JOB_STATUS_FIELD}}='Done'), NOT({${AIRTABLE_JOB_STATUS_FIELD}}='Closed'))`;
      const params = new URLSearchParams({ view: 'Grid view', filterByFormula: filter });
      const r = await at(`${AIRTABLE_JOBS_TABLE}?${params.toString()}`);
      if (!r.ok) return res.status(r.status).send(await r.text());
      const data = await r.json();
      return res.status(200).json({
        jobs: data.records.map((rec) => ({
          id: rec.id,
          name: rec.fields.Name || rec.fields.Title || rec.id,
          due: rec.fields[AIRTABLE_JOB_DUE_FIELD] || null,
        })),
      });
    }

    // POST /api/airtable?op=updateJob  { recordId, updateText, due }
    if (req.method === 'POST' && req.query.op === 'updateJob') {
      const { recordId, updateText, due } = req.body || {};
      if (!recordId) return res.status(400).json({ error: 'recordId required' });

      const fields = {};
      if (updateText) fields[AIRTABLE_JOB_UPDATE_FIELD] = updateText;
      if (due) fields[AIRTABLE_JOB_DUE_FIELD] = due;

      const r = await at(AIRTABLE_JOBS_TABLE, {
        method: 'PATCH',
        body: JSON.stringify({ records: [{ id: recordId, fields }] }),
      });
      if (!r.ok) return res.status(r.status).send(await r.text());
      const data = await r.json();
      return res.status(200).json({ ok: true, data });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

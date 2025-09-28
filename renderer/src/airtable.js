const API = 'https://api.airtable.com/v0'

async function request(env, path, init = {}) {
  const res = await fetch(`${API}/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(path)}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  })
  if (!res.ok) throw new Error(`Airtable ${res.status}`)
  return res.json()
}

export async function listClients(env) {
  const data = await request(env, env.AIRTABLE_CLIENTS_TABLE)
  return data.records.map(r => ({
    id: r.id,
    name: r.fields.Name || r.fields.Client || r.id
  }))
}

export async function listJobsByClient(env, client) {
  const filter = `AND({${env.AIRTABLE_CLIENT_LINK_FIELD}}='${client.name}', NOT({${env.AIRTABLE_JOB_STATUS_FIELD}}='Done'), NOT({${env.AIRTABLE_JOB_STATUS_FIELD}}='Closed'))`
  const params = new URLSearchParams({ view: 'Grid view', filterByFormula: filter })
  const data = await request(env, `${env.AIRTABLE_JOBS_TABLE}?${params.toString()}`)
  return data.records.map(r => ({
    id: r.id,
    name: r.fields.Name || r.fields.Title || r.id,
    due: r.fields[env.AIRTABLE_JOB_DUE_FIELD] || null
  }))
}

export async function updateJob(env, recordId, fields) {
  return request(env, env.AIRTABLE_JOBS_TABLE, {
    method: 'PATCH',
    body: JSON.stringify({
      records: [{ id: recordId, fields }]
    })
  })
}
const API = 'https://api.airtable.com/v0'

async function request(env, path, init = {}) {
  const res = await fetch(`${API}/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(path)}`, {
    ...init,
    headers: {
      'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  })
  if (!res.ok) throw new Error(`Airtable ${res.status}`)
  return res.json()
}

export async function listClients(env) {
  const data = await request(env, env.AIRTABLE_CLIENTS_TABLE)
  return data.records.map(r => ({
    id: r.id,
    name: r.fields.Name || r.fields.Client || r.id
  }))
}

export async function listJobsByClient(env, client) {
  const filter = `AND({${env.AIRTABLE_CLIENT_LINK_FIELD}}='${client.name}', NOT({${env.AIRTABLE_JOB_STATUS_FIELD}}='Done'), NOT({${env.AIRTABLE_JOB_STATUS_FIELD}}='Closed'))`
  const params = new URLSearchParams({ view: 'Grid view', filterByFormula: filter })
  const data = await request(env, `${env.AIRTABLE_JOBS_TABLE}?${params.toString()}`)
  return data.records.map(r => ({
    id: r.id,
    name: r.fields.Name || r.fields.Title || r.id,
    due: r.fields[env.AIRTABLE_JOB_DUE_FIELD] || null
  }))
}

export async function updateJob(env, recordId, fields) {
  return request(env, env.AIRTABLE_JOBS_TABLE, {
    method: 'PATCH',
    body: JSON.stringify({
      records: [{ id: recordId, fields }]
    })
  })
}

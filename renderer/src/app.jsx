import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Calendar, Check, ChevronsUpDown, Loader2, RefreshCcw, X } from 'lucide-react'
import { listClients, listJobsByClient, updateJob } from './airtable'
import { format } from 'date-fns'

export default function App(){
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState([])
  const [clientQuery, setClientQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState(null)

  const [jobs, setJobs] = useState([])
  const [jobQuery, setJobQuery] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)

  const [updateText, setUpdateText] = useState('')
  const [due, setDue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    (async () => {
      const cs = await listClients()
      setClients(cs)
      setLoading(false)
    })()

    // In-app keyboard shortcuts
    const handler = (ev) => {
      // Ctrl/Cmd + Enter to submit
      if ((ev.ctrlKey || ev.metaKey) && ev.key === 'Enter') {
        ev.preventDefault()
        submit()
      }
      // Esc clears job selection
      if (ev.key === 'Escape') {
        setSelectedJob(null); setJobQuery('')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    (async () => {
      if (!selectedClient) return setJobs([])
      const js = await listJobsByClient(null, selectedClient)
      setJobs(js)
    })()
  }, [selectedClient])

  const filteredClients = useMemo(() => {
    const q = clientQuery.toLowerCase()
    return clients.filter(c => c.name.toLowerCase().includes(q))
  }, [clients, clientQuery])

  const filteredJobs = useMemo(() => {
    const q = jobQuery.toLowerCase()
    return jobs.filter(j => j.name.toLowerCase().includes(q))
  }, [jobs, jobQuery])

  const submit = async () => {
    if (!selectedJob) { setToast('Pick a job first'); return }
    setSubmitting(true)
    try {
      await updateJob(null, selectedJob.id, { updateText, due })
      setToast('Saved ✓')
      setUpdateText('')
    } catch (e) {
      console.error(e)
      setToast('Save failed')
    } finally {
      setSubmitting(false)
      setTimeout(() => setToast(''), 2000)
    }
  }

  if (loading) return <Center>Loading <Loader2 className="spin"/></Center>

  return (
    <div className="window">
      <div className="titlebar">
        <div className="inline"><strong>Quick Edit</strong><span className="pill">Airtable</span></div>
        <div className="btns">
          <button className="btn ghost" onClick={()=>location.reload()} title="Reload"><RefreshCcw size={16}/></button>
          <button className="btn" onClick={()=>window.close()} title="Close"><X size={16}/></button>
        </div>
      </div>

      <div style={{ padding:16 }}>
        <div className="grid">
          {/* Client picker */}
          <div className="card">
            <label className="label">Client</label>
            <input className="input" placeholder="Type to search…" value={clientQuery} onChange={e=>setClientQuery(e.target.value)} />
            <div className="list" style={{marginTop:8}}>
              {filteredClients.map(c => (
                <div key={c.id} className="list-item" onClick={()=>{setSelectedClient(c); setSelectedJob(null)}}>
                  <span>{c.name}</span>
                  {selectedClient?.id===c.id ? <Check size={16}/> : <ChevronsUpDown size={16} className="muted"/>}
                </div>
              ))}
              {!filteredClients.length && <div className="list-item muted">No clients</div>}
            </div>
          </div>

          {/* Job picker */}
          <div className="card">
            <label className="label">Open jobs {selectedClient ? <span className="muted">for {selectedClient.name}</span> : null}</label>
            <input className="input" placeholder="Filter jobs…" value={jobQuery} onChange={e=>setJobQuery(e.target.value)} disabled={!selectedClient}/>
            <div className="list" style={{marginTop:8}}>
              {filteredJobs.map(j => (
                <div key={j.id} className="list-item" onClick={()=>setSelectedJob(j)}>
                  <div>
                    <div><strong>{j.name}</strong></div>
                    <div className="muted">Due {j.due ? format(new Date(j.due), 'PP') : '—'}</div>
                  </div>
                  {selectedJob?.id===j.id ? <Check size={16}/> : <ArrowRight size={16} className="muted"/>}
                </div>
              ))}
              {selectedClient && !filteredJobs.length && <div className="list-item muted">No open jobs</div>}
              {!selectedClient && <div className="list-item muted">Pick a client first</div>}
            </div>
          </div>
        </div>

        {/* Edit panel */}
        <div className="card" style={{marginTop:16}}>
          <div className="row" style={{justifyContent:'space-between'}}>
            <div className="inline"><span className="label" style={{margin:0}}>Edit</span> {selectedJob ? <span className="pill">{selectedJob.name}</span> : <span className="muted">Nothing selected</span>}</div>
            <div className="inline muted">Submit with <span className="kbd">Ctrl/⌘+Enter</span></div>
          </div>
          <div className="row" style={{marginTop:12}}>
            <div style={{flex:3}}>
              <label className="label">Update note</label>
              <textarea rows={4} value={updateText} onChange={e=>setUpdateText(e.target.value)} placeholder="What changed? New info from email…"></textarea>
            </div>
            <div style={{flex:1}}>
              <label className="label">Due date</label>
              <div className="row">
                <Calendar size={16}/>
                <input type="date" className="input" value={due} onChange={e=>setDue(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="footer">
            <div className="muted">Updates save directly to Airtable.</div>
            <div className="row">
              {toast && <div className="pill">{toast}</div>}
              <button className="btn primary" disabled={submitting || !selectedJob} onClick={submit}>
                {submitting ? <Loader2 className="spin" size={16}/> : 'Save changes'}
              </button>
            </div>
          </div>
        </div>

        <div className="muted" style={{marginTop:12}}>
          Tip: Use <span className="kbd">Ctrl/⌘+Enter</span> to save quickly.
        </div>
      </div>
    </div>
  )
}

function Center({children}){
  return <div style={{height:'100%', display:'grid', placeItems:'center'}}>{children}</div>
}

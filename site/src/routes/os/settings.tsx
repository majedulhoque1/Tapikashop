// /os/settings: owner name, AUD to NPR rate, lead days, delivery fee per city (updateSettings), and Reset demo data with an inline confirm (no browser dialogs).
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { PageHeader, Section, btnDanger, btnPrimary, btnSecondary, inputCls } from '../../os/components/ui'
import { businessToday } from '../../os/logic'
import { resetDemoData, updateSettings, useOS } from '../../os/store'
import type { Settings } from '../../types'

export const Route = createFileRoute('/os/settings')({ component: SettingsPage })

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

function SettingsForm({ settings, saved, setSaved }: { settings: Settings; saved: boolean; setSaved: (v: boolean) => void }) {
  const [ownerName, setOwnerName] = useState(settings.ownerName)
  const [fx, setFx] = useState(String(settings.fxAudToNpr))
  const [lead, setLead] = useState(String(settings.leadDays))
  const [fees, setFees] = useState<Record<string, string>>(() => Object.fromEntries(Object.entries(settings.deliveryFeesAud).map(([k, v]) => [k, String(v)])))
  const [error, setError] = useState('')

  function save(e: React.FormEvent) {
    e.preventDefault()
    const fxN = Number(fx)
    const leadN = Number(lead)
    const feeN = Object.fromEntries(Object.entries(fees).map(([k, v]) => [k, Number(v)]))
    if (!ownerName.trim()) return setError('Enter the name to greet on the dashboard.')
    if (!Number.isFinite(fxN) || fxN <= 0) return setError('The exchange rate must be a number above 0.')
    if (!Number.isInteger(leadN) || leadN < 0 || leadN > 30) return setError('Lead days must be a whole number from 0 to 30.')
    if (Object.values(feeN).some((v) => !Number.isFinite(v) || v < 0)) return setError('Delivery fees must be 0 or more.')
    setError('')
    updateSettings({
      ownerName: ownerName.trim(),
      fxAudToNpr: fxN,
      rateAsOf: fxN !== settings.fxAudToNpr ? businessToday() : settings.rateAsOf,
      leadDays: leadN,
      deliveryFeesAud: feeN,
    })
    setSaved(true)
  }

  const touch = () => setSaved(false)

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <Section title="Business">
        <div className="grid gap-4 px-4 py-4 sm:grid-cols-3">
          <Field label="Owner name" hint="Used in the dashboard greeting.">
            <input className={inputCls} value={ownerName} onChange={(e) => { setOwnerName(e.target.value); touch() }} />
          </Field>
          <Field label="Rs per A$1" hint={`Rate as of ${settings.rateAsOf}. Existing orders keep the rate they were placed at.`}>
            <input className={`${inputCls} tabular-nums`} inputMode="decimal" value={fx} onChange={(e) => { setFx(e.target.value); touch() }} />
          </Field>
          <Field label="Lead days" hint="Days needed between ordering and delivery.">
            <input className={`${inputCls} tabular-nums`} inputMode="numeric" value={lead} onChange={(e) => { setLead(e.target.value); touch() }} />
          </Field>
        </div>
      </Section>

      <Section title="Delivery fee per city (A$)">
        <div className="grid grid-cols-2 gap-4 px-4 py-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.keys(fees).map((city) => (
            <Field key={city} label={city}>
              <input className={`${inputCls} tabular-nums`} inputMode="decimal" value={fees[city]} onChange={(e) => { setFees({ ...fees, [city]: e.target.value }); touch() }} />
            </Field>
          ))}
        </div>
      </Section>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={btnPrimary}>Save settings</button>
        {saved && <span role="status" className="text-sm font-semibold text-success-text">Saved.</span>}
        {error && <span role="alert" className="text-sm font-semibold text-danger-text">{error}</span>}
      </div>
    </form>
  )
}

function ResetDemo() {
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState(false)
  return (
    <Section title="Demo data">
      <div className="px-4 py-4">
        <p className="text-sm text-muted">
          Everything here is demo data stored in this browser. Reset brings back the 10 starting orders, the full catalogue and the default settings. New orders and stock changes are lost.
        </p>
        {confirming ? (
          <div className="mt-4 flex flex-col gap-3 rounded-field border border-danger bg-danger-soft p-3 text-on-danger-soft sm:flex-row sm:items-center" role="alertdialog" aria-label="Confirm reset">
            <p className="flex-1 text-sm font-semibold">Replace all demo data with the starting set?</p>
            <div className="flex gap-2">
              <button type="button" className={btnDanger} onClick={() => { resetDemoData(); setConfirming(false); setDone(true) }}>Yes, reset</button>
              <button type="button" className={btnSecondary} onClick={() => setConfirming(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-3">
            <button type="button" className={btnSecondary} onClick={() => { setDone(false); setConfirming(true) }}>Reset demo data</button>
            {done && <span role="status" className="text-sm font-semibold text-success-text">Demo data restored.</span>}
          </div>
        )}
      </div>
    </Section>
  )
}

function SettingsPage() {
  const { settings } = useOS()
  const [saved, setSaved] = useState(false)
  return (
    <>
      <PageHeader title="Settings" sub="Changes apply to new orders straight away." />
      <div className="flex max-w-4xl flex-col gap-5 px-4 py-5 md:px-8">
        <SettingsForm key={JSON.stringify(settings)} settings={settings} saved={saved} setSaved={setSaved} />
        <ResetDemo />
      </div>
    </>
  )
}

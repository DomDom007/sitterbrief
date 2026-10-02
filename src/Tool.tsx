// Sitterbrief: one link with routines, allergies, bedtime rules, emergency contacts and the wifi password for the babysitter.
import { useState } from "react";
import { uid, useStored } from "./lib/store";
import { useShared } from "./lib/useShared";
import { Section, ShareBox } from "./ui/kit";

const T = "sitterbrief";
type Kid = { id: string; name: string; age: string; allergies: string; meds: string; comfort: string; bedtime: string };
type Step = { id: string; time: string; what: string };
type Contact = { id: string; who: string; phone: string };
type Brief = { family: string; address: string; tonight: string; back: string; kids: Kid[]; routine: Step[]; contacts: Contact[]; rules: string; food: string; wifi: string; wifiPass: string; house: string; emergency: string };
const SAMPLE: Brief = {
  family: "The Haddads", address: "14 Rue Ibn Khaldoun, El Menzah 6, 3rd floor, door on the left", tonight: "We're at a wedding in Gammarth, 25 minutes away.", back: "Around 23:30",
  kids: [{ id: "k1", name: "Adam", age: "6", allergies: "Peanuts: carries an EpiPen (red bag on the fridge)", meds: "", comfort: "Blue elephant, night light on", bedtime: "20:00" },
    { id: "k2", name: "Nour", age: "3", allergies: "None", meds: "", comfort: "Dummy only at bedtime, song: 'Frère Jacques'", bedtime: "19:30" }],
  routine: [{ id: "r1", time: "18:30", what: "Dinner: pasta in the fridge, 2 minutes in the microwave" }, { id: "r2", time: "19:00", what: "Bath for Nour, teeth for both" }, { id: "r3", time: "19:30", what: "Nour to bed, one story" }, { id: "r4", time: "20:00", what: "Adam to bed, 15 minutes of reading allowed" }],
  contacts: [{ id: "c1", who: "Leila (mum)", phone: "+216 22 000 111" }, { id: "c2", who: "Sami (dad)", phone: "+216 98 000 222" }, { id: "c3", who: "Grandma (lives 5 min away)", phone: "+216 71 000 333" }, { id: "c4", who: "Dr. Ben Salah (paediatrician)", phone: "+216 71 000 444" }],
  rules: "No screens after dinner. Adam may try to negotiate. He knows the rule.", food: "Help yourself to anything. Pizza money on the counter.", wifi: "Haddad-Home", wifiPass: "olive-tree-2026",
  house: "Spare keys in the blue bowl. Fuse box behind the kitchen door.", emergency: "Emergency: 190 (SAMU) or 197 (police). For the EpiPen: inject into the outer thigh, then call 190.",
};

function View({ b }: { b: Brief }) {
  return (
    <article className="sb-view">
      <header><p className="eyebrow">Babysitter brief</p><h2>{b.family}</h2><p>{b.tonight} Back {b.back.toLowerCase()}.</p></header>
      <div className="sb-emerg"><strong>In an emergency</strong><p>{b.emergency}</p><p>Address: {b.address}</p></div>
      <section><h3>Contacts</h3>{b.contacts.map(c => <p key={c.id} className="sb-contact"><span>{c.who}</span><a href={`tel:${c.phone.replace(/\s/g, "")}`}>{c.phone}</a></p>)}</section>
      <section><h3>The children</h3><div className="sb-kids">{b.kids.map(k => (
        <div key={k.id} className="sb-kid"><strong>{k.name}, {k.age}</strong>
          <p className={k.allergies && !/^none$/i.test(k.allergies.trim()) ? "sb-alert" : ""}>Allergies: {k.allergies || "None"}</p>
          {k.meds && <p>Medicines: {k.meds}</p>}<p>Bedtime {k.bedtime}. {k.comfort}</p></div>))}</div></section>
      <section><h3>Tonight's routine</h3><ol className="sb-routine">{b.routine.map(r => <li key={r.id}><b>{r.time}</b>{r.what}</li>)}</ol></section>
      <section><h3>House rules</h3><p>{b.rules}</p><p>{b.food}</p></section>
      <section><h3>The house</h3><p>Wifi: <strong>{b.wifi}</strong>, password <strong style={{ fontFamily: "var(--mono)" }}>{b.wifiPass}</strong></p><p>{b.house}</p></section>
    </article>
  );
}

export default function Sitterbrief() {
  const shared = useShared<Brief>();
  const [b, setB] = useStored<Brief>(T, "brief", SAMPLE);
  const [preview, setPreview] = useState(false);
  const css = <style>{`.sb-view{display:grid;gap:18px;background:var(--surface);border-radius:14px;padding:24px;box-shadow:var(--shadow)}.sb-view h2{font-size:clamp(32px,5vw,48px)}.sb-view h3{font-size:22px;margin-bottom:6px}
  .sb-emerg{background:color-mix(in srgb,var(--bad) 12%,transparent);border-left:5px solid var(--bad);padding:12px 14px;border-radius:0 10px 10px 0}.sb-contact{display:flex;justify-content:space-between;gap:10px;padding:6px 0;border-bottom:1px solid var(--line)}.sb-contact a{font-weight:700;font-variant-numeric:tabular-nums}
  .sb-kids{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.sb-kid{border:1px solid var(--line);border-radius:10px;padding:12px;display:grid;gap:4px}.sb-alert{color:var(--bad);font-weight:700}
  .sb-routine{list-style:none;padding:0;margin:0;display:grid;gap:6px}.sb-routine li{display:flex;gap:12px}.sb-routine b{font-family:var(--mono);min-width:50px}`}</style>;
  if (shared.loading) return <p className="empty-note">Opening brief…</p>;
  if (shared.data) return <>{css}<View b={shared.data} /></>;

  const set = (p: Partial<Brief>) => setB({ ...b, ...p });
  const list = <K extends "kids" | "routine" | "contacts">(k: K, id: string, patch: Partial<Brief[K][number]>) => set({ [k]: (b[k] as { id: string }[]).map(x => (x.id === id ? { ...x, ...patch } : x)) } as Partial<Brief>);
  return (
    <div className="stack">{css}
      <div className="grid2">
        <Section title="Tonight">
          <div className="stack" style={{ gap: 10 }}>
            <label className="field"><span>Family</span><input id="sb-f" className="input" value={b.family} onChange={e => set({ family: e.target.value })} /></label>
            <label className="field"><span>Where you'll be</span><input id="sb-t" className="input" value={b.tonight} onChange={e => set({ tonight: e.target.value })} /></label>
            <div className="row"><label className="field"><span>Back at</span><input id="sb-b" className="input" value={b.back} onChange={e => set({ back: e.target.value })} /></label></div>
            <label className="field"><span>Home address (for emergency services)</span><input id="sb-a" className="input" value={b.address} onChange={e => set({ address: e.target.value })} /></label>
            <label className="field"><span>Emergency instructions</span><textarea id="sb-e" className="input" rows={2} value={b.emergency} onChange={e => set({ emergency: e.target.value })} /></label>
          </div>
        </Section>
        <Section title="Contacts">
          {b.contacts.map(c => <div key={c.id} className="row" style={{ marginBottom: 6 }}><input className="input" style={{ flex: 1 }} aria-label="Who" value={c.who} onChange={e => list("contacts", c.id, { who: e.target.value })} /><input className="input" style={{ flex: 1 }} aria-label="Phone" value={c.phone} onChange={e => list("contacts", c.id, { phone: e.target.value })} /><button className="btn ghost small danger" onClick={() => set({ contacts: b.contacts.filter(x => x.id !== c.id) })}>×</button></div>)}
          <button className="btn small" onClick={() => set({ contacts: [...b.contacts, { id: uid(), who: "", phone: "" }] })}>Add a contact</button>
        </Section>
      </div>
      <Section title="Children">
        <div className="stack" style={{ gap: 12 }}>{b.kids.map(k => (
          <div key={k.id} className="row" style={{ paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
            <label className="field" style={{ flex: "0 0 110px" }}><span>Name</span><input className="input" value={k.name} onChange={e => list("kids", k.id, { name: e.target.value })} /></label>
            <label className="field" style={{ flex: "0 0 60px" }}><span>Age</span><input className="input" value={k.age} onChange={e => list("kids", k.id, { age: e.target.value })} /></label>
            <label className="field"><span>Allergies</span><input className="input" value={k.allergies} onChange={e => list("kids", k.id, { allergies: e.target.value })} /></label>
            <label className="field"><span>Medicines</span><input className="input" value={k.meds} onChange={e => list("kids", k.id, { meds: e.target.value })} /></label>
            <label className="field"><span>Comfort and sleep tips</span><input className="input" value={k.comfort} onChange={e => list("kids", k.id, { comfort: e.target.value })} /></label>
            <label className="field" style={{ flex: "0 0 90px" }}><span>Bedtime</span><input type="time" className="input" value={k.bedtime} onChange={e => list("kids", k.id, { bedtime: e.target.value })} /></label>
            <button className="btn ghost small danger" style={{ alignSelf: "flex-end" }} onClick={() => set({ kids: b.kids.filter(x => x.id !== k.id) })}>Remove</button>
          </div>))}
          <button className="btn small" style={{ alignSelf: "flex-start" }} onClick={() => set({ kids: [...b.kids, { id: uid(), name: "", age: "", allergies: "None", meds: "", comfort: "", bedtime: "20:00" }] })}>Add a child</button>
        </div>
      </Section>
      <div className="grid2">
        <Section title="Routine">
          {b.routine.map(r => <div key={r.id} className="row" style={{ marginBottom: 6 }}><input type="time" className="input" style={{ width: 110 }} aria-label="Time" value={r.time} onChange={e => list("routine", r.id, { time: e.target.value })} /><input className="input" style={{ flex: 1 }} aria-label="What" value={r.what} onChange={e => list("routine", r.id, { what: e.target.value })} /><button className="btn ghost small danger" onClick={() => set({ routine: b.routine.filter(x => x.id !== r.id) })}>×</button></div>)}
          <button className="btn small" onClick={() => set({ routine: [...b.routine, { id: uid(), time: "21:00", what: "" }] })}>Add a step</button>
        </Section>
        <Section title="House">
          <div className="stack" style={{ gap: 10 }}>
            <label className="field"><span>House rules</span><textarea className="input" rows={2} value={b.rules} onChange={e => set({ rules: e.target.value })} /></label>
            <label className="field"><span>Food</span><input className="input" value={b.food} onChange={e => set({ food: e.target.value })} /></label>
            <div className="row"><label className="field"><span>Wifi name</span><input className="input" value={b.wifi} onChange={e => set({ wifi: e.target.value })} /></label><label className="field"><span>Wifi password</span><input className="input" value={b.wifiPass} onChange={e => set({ wifiPass: e.target.value })} /></label></div>
            <label className="field"><span>Keys, fuse box, anything else</span><textarea className="input" rows={2} value={b.house} onChange={e => set({ house: e.target.value })} /></label>
          </div>
        </Section>
      </div>
      <Section title="Send to the sitter" aside={<button className="btn small" onClick={() => setPreview(!preview)}>{preview ? "Hide preview" : "Preview"}</button>}>
        <ShareBox slug={T} data={b} label="Copy brief link" message="Everything you need for tonight:" />
        <p className="note" style={{ marginTop: 8 }}>The link contains your address and wifi password. Send it only to your sitter.</p>
      </Section>
      {preview && <View b={b} />}
    </div>
  );
}


alert("JS connected");
document.addEventListener("DOMContentLoaded", function() {
// ─── STORE (in-memory database) ───────────────────────────────────
const DB = {
  patients: [
    {id:'p1',pid:'PAT-A3F2',name:'Priya Sharma',age:34,gender:'Female',phone:'9876543210',blood:'B+',email:'priya@email.com',address:'12 MG Road, Chennai',date:'2026-02-10'},
    {id:'p2',pid:'PAT-B7C1',name:'Raj Kumar',age:52,gender:'Male',phone:'9812345678',blood:'O+',email:'raj@email.com',address:'45 Anna Nagar, Chennai',date:'2026-02-18'},
    {id:'p3',pid:'PAT-D9E4',name:'Meera Nair',age:28,gender:'Female',phone:'9856123478',blood:'A-',email:'meera@email.com',address:'7 Adyar, Chennai',date:'2026-03-01'},
    {id:'p4',pid:'PAT-F2G8',name:'Arjun Patel',age:45,gender:'Male',phone:'9845678901',blood:'AB+',email:'arjun@email.com',address:'33 T Nagar, Chennai',date:'2026-03-08'},
  ],
  doctors: [
    {id:'d1',did:'DOC-X1Y2',name:'Sarah James',spec:'Cardiology',dept:'Cardiac Dept.',phone:'9900112233',exp:14,email:'sarah@hospital.com',qual:'MBBS, MD Cardiology'},
    {id:'d2',did:'DOC-X3Y5',name:'Vikram Rao',spec:'Neurology',dept:'Neuro Dept.',phone:'9900334455',exp:9,email:'vikram@hospital.com',qual:'MBBS, DM Neurology'},
    {id:'d3',did:'DOC-X7Y9',name:'Ananya Menon',spec:'Pediatrics',dept:'Pediatric Dept.',phone:'9900556677',exp:6,email:'ananya@hospital.com',qual:'MBBS, MD Pediatrics'},
  ],
  appointments: [
    {id:'a1',aid:'APT-001',patient:'Priya Sharma',doctor:'Sarah James',date:'2026-03-14',time:'10:00',type:'Consultation',status:'Scheduled'},
    {id:'a2',aid:'APT-002',patient:'Raj Kumar',doctor:'Vikram Rao',date:'2026-03-15',time:'11:30',type:'Follow-up',status:'Scheduled'},
    {id:'a3',aid:'APT-003',patient:'Meera Nair',doctor:'Ananya Menon',date:'2026-03-10',time:'09:00',type:'Routine Check',status:'Completed'},
  ],
  records: [
    {id:'r1',rid:'REC-A1B2',patient:'Priya Sharma',doctor:'Sarah James',visit:'2026-03-10',bp:'130/85',diagnosis:'Hypertension Stage 1',prescription:'Amlodipine 5mg OD, Lifestyle changes',notes:'Follow-up in 4 weeks'},
    {id:'r2',rid:'REC-C3D4',patient:'Raj Kumar',doctor:'Vikram Rao',visit:'2026-02-28',bp:'120/80',diagnosis:'Migraine with aura',prescription:'Sumatriptan 50mg PRN, Topiramate 25mg BD',notes:'MRI brain ordered'},
  ],
  billing: [
    {id:'b1',inv:'INV-001',patient:'Priya Sharma',service:'Consultation',amount:800,method:'UPI',status:'Paid',date:'2026-03-10'},
    {id:'b2',inv:'INV-002',patient:'Raj Kumar',service:'Lab Tests',amount:2400,method:'Cash',status:'Pending',date:'2026-03-08'},
    {id:'b3',inv:'INV-003',patient:'Meera Nair',service:'Routine Check',amount:600,method:'Card',status:'Paid',date:'2026-03-01'},
    {id:'b4',inv:'INV-004',patient:'Arjun Patel',service:'X-Ray / Scan',amount:1800,method:'Insurance',status:'Pending',date:'2026-03-08'},
  ]
};

// ─── UTILS ───────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2,7).toUpperCase();
const av   = (name,cls='') => `<span class="av ${cls}">${(name||'?')[0].toUpperCase()}</span>`;
const idChip = v => `<span class="id-chip">${v}</span>`;

const BLOOD_BADGES = {
  'A+':'bb','A-':'bb','B+':'bv','B-':'bv','O+':'bg','O-':'bg','AB+':'br','AB-':'br'
};
const STATUS_BADGE = {Scheduled:'bb',Completed:'bg',Cancelled:'br','No Show':'ba'};

function toast(msg, type='ok'){
  const t = document.getElementById('toast');
  t.innerHTML = `<span>${type==='ok'?'✓':'✗'}</span>${msg}`;
  t.className = `toast show ${type}`;
  setTimeout(()=>t.classList.remove('show'),3000);
}
function openModal(title,html){
  document.getElementById('m-title').textContent = title;
  document.getElementById('m-body').innerHTML = html;
  document.getElementById('modal').style.display = 'flex';
}
function closeModal(){document.getElementById('modal').style.display='none'}

function filterTable(tbodyId, q){
  document.querySelectorAll(`#${tbodyId} tr`).forEach(r=>{
    r.style.display = r.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function toggleSb(){
  document.getElementById('sb').classList.toggle('col');
  document.getElementById('main').style.marginLeft =
    document.getElementById('sb').classList.contains('col') ? '70px' : 'var(--sw)';
}

// ─── NAVIGATION ──────────────────────────────────────────────────
const TITLES = {dashboard:'Dashboard',patients:'Patient Management',doctors:'Doctor Management',appointments:'Appointment Booking',records:'Medical Records',billing:'Billing & Invoicing'};
function nav(page){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('ptitle').textContent = TITLES[page];
  const renders = {patients:renderPatients,doctors:renderDoctors,appointments:renderAppointments,records:renderRecords,billing:renderBilling,dashboard:renderDashboard};
  renders[page]&&renders[page]();
}

const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(function(el){
  el.addEventListener('click', function(){
    nav(el.dataset.page);
  });
});
// ─── DATE ────────────────────────────────────────────────────────
document.getElementById('today').textContent = new Date().toLocaleDateString('en-IN',{weekday:'short',month:'short',day:'numeric',year:'numeric'});

// ─── DASHBOARD ───────────────────────────────────────────────────
function renderDashboard(){
  document.getElementById('stat-pat').textContent = DB.patients.length;
  document.getElementById('stat-doc').textContent = DB.doctors.length;
  document.getElementById('stat-apt').textContent = DB.appointments.length;
  const pending = DB.billing.filter(b=>b.status==='Pending').reduce((s,b)=>s+b.amount,0);
  document.getElementById('stat-bill').textContent = '₹'+pending.toLocaleString('en-IN');
  const recent = DB.patients.slice(-4).reverse();
  document.getElementById('dash-recent').innerHTML = recent.map(p=>`
    <tr>
      <td>${idChip(p.pid)}</td>
      <td>${av(p.name)}${p.name}</td>
      <td>${p.age}</td>
      <td><span class="badge ${BLOOD_BADGES[p.blood]||'bb'}">${p.blood}</span></td>
      <td style="font-size:12px;color:var(--g400)">${p.date}</td>
    </tr>`).join('') || `<tr class="empty-row"><td colspan="5"><i class="fa-solid fa-user-slash"></i> No patients yet</td></tr>`;
}

// ─── PATIENTS ────────────────────────────────────────────────────
function renderPatients(){
  const tb = document.getElementById('pat-body');
  if(!DB.patients.length){tb.innerHTML='<tr class="empty-row"><td colspan="8"><i class="fa-solid fa-user-slash"></i> No patients registered.</td></tr>';return}
  tb.innerHTML = DB.patients.map(p=>`
    <tr>
      <td>${idChip(p.pid)}</td>
      <td class="row-flex">${av(p.name)}${p.name}</td>
      <td>${p.age}</td>
      <td>${p.gender}</td>
      <td>${p.phone}</td>
      <td><span class="badge ${BLOOD_BADGES[p.blood]||'bb'}">${p.blood}</span></td>
      <td style="font-size:12px;color:var(--g400)">${p.date}</td>
      <td>
        <button class="btn btn-sm btn-s btn-ic" title="Edit" onclick="editPat('${p.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-d btn-ic" title="Delete" onclick="delPat('${p.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function patForm(p={}){
  return `<div class="fgrid">
    <div class="fg"><label>Full Name</label><input id="pf-name" value="${p.name||''}" placeholder="e.g. Priya Sharma"/></div>
    <div class="fg"><label>Age</label><input id="pf-age" type="number" value="${p.age||''}" placeholder="35"/></div>
    <div class="fg"><label>Gender</label><select id="pf-gen">
      <option ${p.gender==='Male'?'selected':''}>Male</option>
      <option ${p.gender==='Female'?'selected':''}>Female</option>
      <option ${p.gender==='Other'?'selected':''}>Other</option>
    </select></div>
    <div class="fg"><label>Blood Group</label><select id="pf-blood">
      ${['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(b=>`<option ${p.blood===b?'selected':''}>${b}</option>`).join('')}
    </select></div>
    <div class="fg"><label>Phone</label><input id="pf-ph" value="${p.phone||''}" placeholder="+91 98XXXXXXXX"/></div>
    <div class="fg"><label>Email</label><input id="pf-em" value="${p.email||''}" placeholder="patient@email.com"/></div>
    <div class="fg full"><label>Address</label><textarea id="pf-addr">${p.address||''}</textarea></div>
  </div>
  <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Cancel</button><span id="pf-save"></span></div>`;
}

function openPatForm(id=null){
  const p = id ? DB.patients.find(x=>x.id===id) : {};
  openModal(id?'Edit Patient':'Register New Patient', patForm(p||{}));
  document.getElementById('pf-save').innerHTML =
    `<button class="btn btn-p" onclick="${id?`savePat('${id}')`:'addPat()'}"><i class="fa-solid fa-save"></i> ${id?'Update':'Register'}</button>`;
}

function collectPat(){
  return {
    name:document.getElementById('pf-name').value.trim(),
    age:+document.getElementById('pf-age').value,
    gender:document.getElementById('pf-gen').value,
    blood:document.getElementById('pf-blood').value,
    phone:document.getElementById('pf-ph').value.trim(),
    email:document.getElementById('pf-em').value.trim(),
    address:document.getElementById('pf-addr').value.trim()
  };
}

function addPat(){
  const d = collectPat();
  if(!d.name||!d.age) return toast('Name and age required','err');
  DB.patients.push({...d, id:'p'+uid(), pid:'PAT-'+uid(), date:new Date().toISOString().slice(0,10)});
  closeModal(); toast('Patient registered!'); renderPatients(); renderDashboard();
}
function savePat(id){
  const d = collectPat(); const i = DB.patients.findIndex(x=>x.id===id);
  if(i>-1) Object.assign(DB.patients[i],d);
  closeModal(); toast('Patient updated!'); renderPatients();
}
function editPat(id){openPatForm(id)}
function delPat(id){
  if(!confirm('Delete this patient?')) return;
  DB.patients = DB.patients.filter(p=>p.id!==id);
  toast('Patient deleted','err'); renderPatients(); renderDashboard();
}

// ─── DOCTORS ─────────────────────────────────────────────────────
const SPECS=['Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','Radiology','ENT','Oncology','Gynecology','General Surgery','Internal Medicine','Psychiatry'];

function renderDoctors(){
  const tb = document.getElementById('doc-body');
  if(!DB.doctors.length){tb.innerHTML='<tr class="empty-row"><td colspan="7"><i class="fa-solid fa-user-doctor"></i> No doctors added.</td></tr>';return}
  tb.innerHTML = DB.doctors.map(d=>`
    <tr>
      <td>${idChip(d.did)}</td>
      <td class="row-flex">${av(d.name,'doc')}Dr. ${d.name}</td>
      <td><span class="badge bb">${d.spec}</span></td>
      <td>${d.dept}</td>
      <td>${d.phone}</td>
      <td>${d.exp} yrs</td>
      <td>
        <button class="btn btn-sm btn-s btn-ic" onclick="editDoc('${d.id}')"><i class="fa-solid fa-pen"></i></button>
        <button class="btn btn-sm btn-d btn-ic" onclick="delDoc('${d.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function docForm(d={}){
  return `<div class="fgrid">
    <div class="fg"><label>Full Name</label><input id="df-name" value="${d.name||''}" placeholder="Dr. Sarah James"/></div>
    <div class="fg"><label>Specialization</label><select id="df-spec">
      ${SPECS.map(s=>`<option ${d.spec===s?'selected':''}>${s}</option>`).join('')}
    </select></div>
    <div class="fg"><label>Department</label><input id="df-dept" value="${d.dept||''}" placeholder="Cardiac Dept."/></div>
    <div class="fg"><label>Experience (yrs)</label><input id="df-exp" type="number" value="${d.exp||''}" placeholder="10"/></div>
    <div class="fg"><label>Phone</label><input id="df-ph" value="${d.phone||''}" placeholder="+91 99XXXXXXXX"/></div>
    <div class="fg"><label>Email</label><input id="df-em" value="${d.email||''}" placeholder="doctor@hospital.com"/></div>
    <div class="fg full"><label>Qualifications</label><textarea id="df-qual">${d.qual||''}</textarea></div>
  </div>
  <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Cancel</button><span id="df-save"></span></div>`;
}

function openDocForm(id=null){
  const d = id ? DB.doctors.find(x=>x.id===id) : {};
  openModal(id?'Edit Doctor':'Add New Doctor', docForm(d||{}));
  document.getElementById('df-save').innerHTML =
    `<button class="btn btn-p" onclick="${id?`saveDoc('${id}')`:'addDoc()'}"><i class="fa-solid fa-save"></i> ${id?'Update':'Add Doctor'}</button>`;
}

function collectDoc(){
  return {
    name:document.getElementById('df-name').value.trim(),
    spec:document.getElementById('df-spec').value,
    dept:document.getElementById('df-dept').value.trim(),
    exp:+document.getElementById('df-exp').value,
    phone:document.getElementById('df-ph').value.trim(),
    email:document.getElementById('df-em').value.trim(),
    qual:document.getElementById('df-qual').value.trim()
  };
}
function addDoc(){
  const d = collectDoc();
  if(!d.name) return toast('Doctor name required','err');
  DB.doctors.push({...d, id:'d'+uid(), did:'DOC-'+uid()});
  closeModal(); toast('Doctor added!'); renderDoctors(); renderDashboard();
}
function saveDoc(id){
  const d = collectDoc(); const i = DB.doctors.findIndex(x=>x.id===id);
  if(i>-1) Object.assign(DB.doctors[i],d);
  closeModal(); toast('Doctor updated!'); renderDoctors();
}
function editDoc(id){openDocForm(id)}
function delDoc(id){
  if(!confirm('Remove this doctor?')) return;
  DB.doctors = DB.doctors.filter(d=>d.id!==id);
  toast('Doctor removed','err'); renderDoctors(); renderDashboard();
}

// ─── APPOINTMENTS ────────────────────────────────────────────────
function renderAppointments(){
  const tb = document.getElementById('apt-body');
  if(!DB.appointments.length){tb.innerHTML='<tr class="empty-row"><td colspan="8"><i class="fa-solid fa-calendar-xmark"></i> No appointments yet.</td></tr>';return}
  tb.innerHTML = DB.appointments.map(a=>`
    <tr>
      <td>${idChip(a.aid)}</td>
      <td>${av(a.patient)}${a.patient}</td>
      <td>${av(a.doctor,'doc')}Dr. ${a.doctor}</td>
      <td>${a.date}</td>
      <td>${a.time}</td>
      <td><span class="badge bn">${a.type}</span></td>
      <td><span class="badge ${STATUS_BADGE[a.status]||'bb'}">${a.status}</span></td>
      <td>
        <button class="btn btn-sm btn-s" onclick="cycleStatus('${a.id}')"><i class="fa-solid fa-rotate"></i></button>
        <button class="btn btn-sm btn-d btn-ic" onclick="delApt('${a.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function aptForm(){
  const patOpts = DB.patients.map(p=>`<option>${p.name}</option>`).join('');
  const docOpts = DB.doctors.map(d=>`<option data-dept="${d.dept}">${d.name}</option>`).join('');
  const today = new Date().toISOString().slice(0,10);
  return `<div class="fgrid">
    <div class="fg"><label>Patient</label><select id="af-pat">${patOpts||'<option>No patients added</option>'}</select></div>
    <div class="fg"><label>Doctor</label><select id="af-doc" onchange="document.getElementById('af-dept').value=this.options[this.selectedIndex].dataset.dept||''">${docOpts||'<option>No doctors added</option>'}</select></div>
    <div class="fg"><label>Department</label><input id="af-dept" placeholder="Auto-filled"/></div>
    <div class="fg"><label>Date</label><input type="date" id="af-date" value="${today}" min="${today}"/></div>
    <div class="fg"><label>Time</label><input type="time" id="af-time" value="10:00"/></div>
    <div class="fg"><label>Type</label><select id="af-type">
      ${['Consultation','Follow-up','Emergency','Routine Check'].map(t=>`<option>${t}</option>`).join('')}
    </select></div>
    <div class="fg full"><label>Notes</label><textarea id="af-notes" placeholder="Optional notes…"></textarea></div>
  </div>
  <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Cancel</button>
  <button class="btn btn-p" onclick="addApt()"><i class="fa-solid fa-save"></i> Book</button></div>`;
}

function openAptForm(){
  openModal('Book New Appointment', aptForm());
  // auto-fill dept on load
  const sel = document.getElementById('af-doc');
  if(sel) document.getElementById('af-dept').value = sel.options[sel.selectedIndex]?.dataset.dept||'';
}

function addApt(){
  const body = {
    patient:document.getElementById('af-pat').value,
    doctor:document.getElementById('af-doc').value,
    date:document.getElementById('af-date').value,
    time:document.getElementById('af-time').value,
    type:document.getElementById('af-type').value,
    notes:document.getElementById('af-notes').value
  };
  if(!body.date||!body.time) return toast('Date and time required','err');
  DB.appointments.push({...body, id:'a'+uid(), aid:'APT-'+uid(), status:'Scheduled'});
  closeModal(); toast('Appointment booked!'); renderAppointments(); renderDashboard();
}

const STATUS_CYCLE=['Scheduled','Completed','Cancelled','No Show'];
function cycleStatus(id){
  const a = DB.appointments.find(x=>x.id===id); if(!a) return;
  a.status = STATUS_CYCLE[(STATUS_CYCLE.indexOf(a.status)+1)%STATUS_CYCLE.length];
  toast(`Status → ${a.status}`); renderAppointments();
}
function delApt(id){
  if(!confirm('Delete this appointment?')) return;
  DB.appointments = DB.appointments.filter(a=>a.id!==id);
  toast('Appointment deleted','err'); renderAppointments(); renderDashboard();
}

// ─── RECORDS ─────────────────────────────────────────────────────
function renderRecords(){
  const tb = document.getElementById('rec-body');
  if(!DB.records.length){tb.innerHTML='<tr class="empty-row"><td colspan="7"><i class="fa-solid fa-file-circle-xmark"></i> No records found.</td></tr>';return}
  tb.innerHTML = DB.records.map(r=>`
    <tr>
      <td>${idChip(r.rid)}</td>
      <td class="row-flex">${av(r.patient)}${r.patient}</td>
      <td>${av(r.doctor,'doc')}Dr. ${r.doctor}</td>
      <td>${r.visit}</td>
      <td>${r.diagnosis}</td>
      <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--g600)">${r.prescription}</td>
      <td>
        <button class="btn btn-sm btn-s btn-ic" onclick="viewRec('${r.id}')"><i class="fa-solid fa-eye"></i></button>
        <button class="btn btn-sm btn-d btn-ic" onclick="delRec('${r.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function recForm(){
  const patOpts = DB.patients.map(p=>`<option>${p.name}</option>`).join('');
  const docOpts = DB.doctors.map(d=>`<option>${d.name}</option>`).join('');
  const today = new Date().toISOString().slice(0,10);
  return `<div class="fgrid">
    <div class="fg"><label>Patient</label><select id="rf-pat">${patOpts||'<option>No patients</option>'}</select></div>
    <div class="fg"><label>Doctor</label><select id="rf-doc">${docOpts||'<option>No doctors</option>'}</select></div>
    <div class="fg"><label>Visit Date</label><input type="date" id="rf-date" value="${today}"/></div>
    <div class="fg"><label>Blood Pressure</label><input id="rf-bp" placeholder="120/80 mmHg"/></div>
    <div class="fg full"><label>Diagnosis</label><textarea id="rf-diag" placeholder="Primary diagnosis…"></textarea></div>
    <div class="fg full"><label>Prescription / Medications</label><textarea id="rf-pres" placeholder="Medications, dosage, duration…"></textarea></div>
    <div class="fg full"><label>Lab Results / Notes</label><textarea id="rf-notes" placeholder="Additional notes, lab findings…"></textarea></div>
  </div>
  <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Cancel</button>
  <button class="btn btn-p" onclick="addRec()"><i class="fa-solid fa-save"></i> Save Record</button></div>`;
}

function openRecForm(){ openModal('Add Medical Record', recForm()) }

function addRec(){
  const body = {
    patient:document.getElementById('rf-pat').value,
    doctor:document.getElementById('rf-doc').value,
    visit:document.getElementById('rf-date').value,
    bp:document.getElementById('rf-bp').value,
    diagnosis:document.getElementById('rf-diag').value,
    prescription:document.getElementById('rf-pres').value,
    notes:document.getElementById('rf-notes').value
  };
  if(!body.visit) return toast('Visit date required','err');
  DB.records.push({...body, id:'r'+uid(), rid:'REC-'+uid()});
  closeModal(); toast('Record saved!'); renderRecords();
}

function viewRec(id){
  const r = DB.records.find(x=>x.id===id); if(!r) return;
  openModal(`Record — ${r.rid}`,`
    <div style="display:grid;gap:16px;font-size:14px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        ${[['Patient',r.patient],['Doctor','Dr. '+r.doctor],['Visit Date',r.visit],['Blood Pressure',r.bp||'—']].map(([l,v])=>`
        <div><div style="font-size:11px;font-weight:600;color:var(--g400);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px">${l}</div><div>${v}</div></div>`).join('')}
      </div>
      <div><div style="font-size:11px;font-weight:600;color:var(--g400);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px">Diagnosis</div><p>${r.diagnosis||'—'}</p></div>
      <div><div style="font-size:11px;font-weight:600;color:var(--g400);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px">Prescription</div><p style="white-space:pre-wrap">${r.prescription||'—'}</p></div>
      <div><div style="font-size:11px;font-weight:600;color:var(--g400);text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px">Notes</div><p>${r.notes||'—'}</p></div>
    </div>
    <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Close</button></div>`);
}
function delRec(id){
  if(!confirm('Delete this record?')) return;
  DB.records = DB.records.filter(r=>r.id!==id);
  toast('Record deleted','err'); renderRecords();
}

// ─── BILLING ─────────────────────────────────────────────────────
const SERVICES=['Consultation','Emergency Care','Surgery','Lab Tests','X-Ray / Scan','Physiotherapy','Vaccination','ICU Charges','Room Charges','Pharmacy','Other'];

function renderBilling(){
  const tb = document.getElementById('bill-body');
  if(!DB.billing.length){tb.innerHTML='<tr class="empty-row"><td colspan="8"><i class="fa-solid fa-file-invoice"></i> No invoices yet.</td></tr>';return}
  tb.innerHTML = DB.billing.map(b=>`
    <tr>
      <td>${idChip(b.inv)}</td>
      <td class="row-flex">${av(b.patient)}${b.patient}</td>
      <td>${b.service}</td>
      <td style="font-family:'Syne',sans-serif;font-weight:700">₹${Number(b.amount).toLocaleString('en-IN')}</td>
      <td><span class="badge bn">${b.method}</span></td>
      <td style="font-size:12px;color:var(--g400)">${b.date}</td>
      <td><span class="badge ${b.status==='Paid'?'bg':'ba'}">${b.status}</span></td>
      <td>
        ${b.status==='Pending'?`<button class="btn btn-sm btn-s" onclick="markPaid('${b.id}')"><i class="fa-solid fa-check"></i> Paid</button>`:''}
        <button class="btn btn-sm btn-d btn-ic" onclick="delBill('${b.id}')"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function billForm(){
  const patOpts = DB.patients.map(p=>`<option>${p.name}</option>`).join('');
  return `<div class="fgrid">
    <div class="fg"><label>Patient</label><select id="bf-pat">${patOpts||'<option>No patients</option>'}</select></div>
    <div class="fg"><label>Service</label><select id="bf-svc">${SERVICES.map(s=>`<option>${s}</option>`).join('')}</select></div>
    <div class="fg"><label>Amount (₹)</label><input type="number" id="bf-amt" placeholder="e.g. 2500"/></div>
    <div class="fg"><label>Payment Method</label><select id="bf-pay">
      ${['Cash','Card','UPI','Insurance','Net Banking'].map(m=>`<option>${m}</option>`).join('')}
    </select></div>
    <div class="fg full"><label>Notes / Description</label><textarea id="bf-notes" placeholder="Optional notes…"></textarea></div>
  </div>
  <div class="mfoot"><button class="btn btn-s" onclick="closeModal()">Cancel</button>
  <button class="btn btn-p" onclick="addBill()"><i class="fa-solid fa-save"></i> Generate Invoice</button></div>`;
}

function openBillForm(){ openModal('Create New Invoice', billForm()) }

function addBill(){
  const body = {
    patient:document.getElementById('bf-pat').value,
    service:document.getElementById('bf-svc').value,
    amount:+document.getElementById('bf-amt').value,
    method:document.getElementById('bf-pay').value,
    notes:document.getElementById('bf-notes').value
  };
  if(!body.amount) return toast('Amount is required','err');
  DB.billing.push({...body, id:'b'+uid(), inv:'INV-'+uid(), status:'Pending', date:new Date().toISOString().slice(0,10)});
  closeModal(); toast('Invoice created!'); renderBilling(); renderDashboard();
}
function markPaid(id){
  const b = DB.billing.find(x=>x.id===id); if(b) b.status='Paid';
  toast('Invoice marked as Paid!'); renderBilling(); renderDashboard();
}
function delBill(id){
  if(!confirm('Delete this invoice?')) return;
  DB.billing = DB.billing.filter(b=>b.id!==id);
  toast('Invoice deleted','err'); renderBilling(); renderDashboard();
}
// ─── INIT ────────────────────────────────────────────────────────
renderDashboard();

// make functions global
window.openPatForm = openPatForm;
window.savePat = savePat;
window.addPat = addPat;
window.editPat = editPat;
window.delPat = delPat;

window.openDocForm = openDocForm;
window.addDoc = addDoc;
window.saveDoc = saveDoc;
window.editDoc = editDoc;
window.delDoc = delDoc;

window.openAptForm = openAptForm;
window.addApt = addApt;
window.delApt = delApt;

window.openRecForm = openRecForm;
window.addRec = addRec;
window.delRec = delRec;

window.openBillForm = openBillForm;
window.addBill = addBill;
window.delBill = delBill;

});
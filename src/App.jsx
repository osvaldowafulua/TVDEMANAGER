import { useEffect, useState, useRef, useId, useCallback, cloneElement } from "react";
import { House as LayoutDashboard, Users, Car, User as UserRound, FileText, Pulse as Activity, CreditCard, FolderOpen, UserPlus, ArrowsClockwise as RefreshCcw, ChartBar as BarChart3, Gear as Settings, MagnifyingGlass as Search, Bell, Plus, X, Check, Warning as AlertTriangle, Eye, Pencil, Trash as Trash2, DownloadSimple as Download, CalendarBlank as CalendarDays, Buildings as Building2, Wallet, CheckCircle as CircleCheck, Clock as Clock3, Receipt, Printer, ArrowRight, UploadSimple as Upload, Images, UsersThree, EnvelopeSimple, List } from "@phosphor-icons/react";
import { vehicleModelCatalog, VehicleAssetImage, VehicleImagePicker, VehicleLibraryPage, AddVehicleImageModal } from "./VehicleLibrary.jsx";
import { ProfileMenu, ProfileForm, TeamPage, TeamForm, EmailTemplatesPage, TemplateForm, starterTemplates } from "./WorkspaceExtras.jsx";
import { EmailSettings } from "./EmailSettings.jsx";

import "./style.css";
import "./mono.css";
import { money, round, today, formatDate } from "./lib/format.js";
import { StatusBadge } from "./components/StatusBadge.jsx";
import { owners, vehicles, payments, initialDrivers, initialContracts, initialDocuments, initialLeads, initialRetakes, initialInvoices } from "./data/demo.js";

/* =========================================================
   NAVEGAÇÃO E METADADOS
========================================================= */

const menu = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'owners', label: 'Proprietários', icon: UserRound },
  { id: 'vehicles', label: 'Viaturas', icon: Car },
  { id: 'vehicle-library', label: 'Biblioteca de imagens', icon: Images },
  { id: 'drivers', label: 'Motoristas', icon: Users },
  { id: 'contracts', label: 'Contratos', icon: FileText },
  { id: 'operation', label: 'Operação', icon: Activity },
  { id: 'payments', label: 'Pagamentos', icon: CreditCard },
  { id: 'documents', label: 'Documentos', icon: FolderOpen },
  { id: 'crm', label: 'CRM', icon: UserPlus },
  { id: 'retakes', label: 'Retomas', icon: RefreshCcw },
  { id: 'billing', label: 'Facturação', icon: Receipt },
  { id: 'team', label: 'Equipa', icon: UsersThree },
  { id: 'email-templates', label: 'Modelos de email', icon: EnvelopeSimple },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  { id: 'settings', label: 'Definições', icon: Settings },
];

// [chave em db, título, acção de criar, acção de guardar]
const entityMeta = {
  owner: ['owners', 'Proprietários', 'Novo proprietário', 'Guardar proprietário'],
  vehicle: ['vehicles', 'Viaturas', 'Nova viatura', 'Guardar viatura'],
  driver: ['drivers', 'Motoristas', 'Novo motorista', 'Guardar motorista'],
  contract: ['contracts', 'Contratos', 'Novo contrato', 'Gerar contrato'],
  payment: ['payments', 'Pagamentos', 'Novo pagamento', 'Guardar pagamento'],
  document: ['documents', 'Documentos', 'Carregar documento', 'Guardar documento'],
  crm: ['crmLeads', 'CRM', 'Nova lead', 'Guardar lead'],
  retake: ['retakes', 'Retomas', 'Nova retoma', 'Guardar retoma'],
  invoice: ['invoices', 'Facturas', 'Nova factura', 'Guardar factura'],
};

/* =========================================================
   UTILITÁRIOS
========================================================= */

const invoiceTotals = (items = []) => {
  const subtotal = items.reduce((s, item) => s + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const vat = items.reduce((s, item) => s + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0) * (Number(item.vatRate) || 0) / 100, 0);
  return { subtotal: round(subtotal), vat: round(vat), total: round(subtotal + vat) };
};
const nextSequence = (values, prefix) => values.reduce((max, value) => String(value || '').startsWith(prefix) ? Math.max(max, parseInt(String(value).slice(prefix.length), 10) || 0) : max, 0) + 1;
const generateInvoiceNumber = (invoices = []) => { const prefix = `FT ${today().slice(0, 4)}/`; return prefix + String(nextSequence(invoices.map(i => i.number), prefix)).padStart(6, '0'); };
const generateContractNumber = (contracts = []) => { const prefix = `CTR-${today().slice(0, 4)}-`; return prefix + String(nextSequence(contracts.map(c => c.id), prefix)).padStart(3, '0'); };
const validDocumentFile = file => ['application/pdf', 'image/jpeg', 'image/png'].includes(file?.type) && file.size <= 10 * 1024 * 1024;
const printGeneratedDocument = () => {
  const clear = () => { delete document.body.dataset.printTarget; window.removeEventListener('afterprint', clear); };
  document.body.dataset.printTarget = 'document';
  window.addEventListener('afterprint', clear);
  window.print();
};

const f = (key,label,type='text',required=false,options=null) => ({key,label,type,required,options});
function fieldsFor(kind, db) {
 const owner = f('owner','Proprietário','select',true,db.owners.map(o=>o.name));
 const vehicle = f('vehicle','Viatura','select',false,db.vehicles.map(v=>v.plate));
 const status = options => f('status','Estado','select',false,options);
 const platform = f('platform','Plataforma','select',false,['Uber','Bolt','TVDE Fleet','Uber + Bolt']);
 const notes = f('notes','Observações','textarea');
 return {
 owner:[['Dados pessoais',f('name','Nome completo','text',true),f('nif','NIF','text',true),f('birthDate','Data de nascimento','date'),f('phone','Telefone','tel',true),f('email','Email','email')],['Morada',f('address','Morada'),f('postalCode','Código postal'),f('city','Cidade'),f('country','País')],['Dados bancários',f('iban','IBAN'),f('accountHolder','Titular da conta'),status(['Activo','Inactivo','Em análise'])],['Documentação',...['Cartão de cidadão','NIF','Comprovativo de morada','IBAN','Contrato'].map((s,i)=>f(`check${i}`,s,'checkbox'))]],
 vehicle:[['Identificação',f('plate','Matrícula','text',true),f('brand','Marca','text',true),f('model','Modelo','text',true),f('year','Ano','number'),f('color','Cor'),f('vin','VIN'),f('km','Quilometragem'),f('fuel','Combustível','select',false,['Híbrido','Gasolina','Diesel','Elétrico'])],['Operação',owner,f('driver','Motorista','select',false,db.drivers.map(d=>d.name)),platform,status(['Activa','Em manutenção','Parada','Em documentação','Inactiva'])],['Documentação',...['Documento único','Seguro','Inspecção','Licença TVDE','Dístico'].map((s,i)=>f(`check${i}`,s,'checkbox'))]],
 driver:[['Dados do motorista',f('name','Nome completo','text',true),f('nif','NIF'),f('phone','Telefone','tel',true),f('email','Email','email'),f('license','Carta de condução','text',true),f('licenseExpiry','Validade da carta','date'),vehicle,platform,status(['Activo','Inactivo','Em documentação','Suspenso'])]],
 contract:[['Contrato',owner,f('vehicle','Viatura','select',true,db.vehicles.map(v=>v.plate)),f('start','Data início','date',true),f('end','Data fim','date'),f('contractType','Tipo de contrato','select',true,['Cessão de exploração','Aluguer','Gestão de viatura','Outro']),f('commission','Comissão','number'),f('fixedValue','Valor fixo','number'),f('frequency','Periodicidade','select',true,['Semanal','Quinzenal','Mensal']),notes]],
 payment:[['Apuramento',owner,vehicle,f('start','Início','date',true),f('end','Fim','date',true),f('gross','Receita bruta','number',true),f('commission','Comissão','number',true),f('adjustments','Ajustes','number'),status(['Pendente','Em validação','Aprovado','Enviado','Pago','Auditado'])]],
 document:[['Documento',f('type','Tipo de documento','select',true,['Cartão de cidadão','NIF','Seguro','Inspecção','Licença TVDE','Contrato','IBAN','Carta de condução','Documento único','Outro']),f('entityKey','Entidade','select',true,[...db.owners.map(o=>({value:`owner:${o.id}`,label:`Proprietário · ${o.name}`})),...db.vehicles.map(v=>({value:`vehicle:${v.id}`,label:`Viatura · ${v.plate}`})),...db.drivers.map(d=>({value:`driver:${d.id}`,label:`Motorista · ${d.name}`}))]),f('issued','Data de emissão','date'),f('expiry','Data de validade','date'),notes]],
 crm:[['Contacto',f('name','Nome','text',true),f('phone','Telefone','tel',true),f('email','Email','email'),f('source','Origem','select',false,['Website','Facebook','Instagram','WhatsApp','Referência','Outro']),f('contactType','Tipo de contacto','select',false,['Proprietário','Motorista','Empresa','Outro']),vehicle,f('plate','Matrícula'),notes,status(['Novo','Contactado','Qualificado','Proposta','Convertido','Perdido'])]],
 retake:[['Retoma',owner,f('phone','Telefone','tel'),f('plate','Matrícula','text',true),f('brand','Marca'),f('model','Modelo'),f('date','Data','date',true),f('reason','Motivo','select',true,['Fim de contrato','Venda da viatura','Troca','Problemas operacionais','Pedido do proprietário','Outro']),f('km','Quilometragem','number'),notes,f('responsible','Responsável')],['Checklist',...['Documentos entregues','Chaves entregues','Equipamentos entregues','Estado verificado','Quilometragem registada','Fotografias registadas'].map((s,i)=>f(`check${i}`,s,'checkbox'))]],
 invoice:[['Documento',f('number','Número','text',true),f('date','Data','date',true),f('customer','Cliente','text',true),f('customerNif','NIF','text',true),f('customerAddress','Morada'),status(['Paga','Pendente','Cancelada','Rascunho'])]]
 }[kind];
}
function Modal({open,onClose,title,subtitle,icon:Icon,children,footer,size='md'}) {
 const ref=useRef(null); const titleId=useId(); const closeRef=useRef(onClose); useEffect(()=>{closeRef.current=onClose;},[onClose]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.activeElement; const overflow=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const background=document.querySelectorAll('.sidebar,.main,.mobile-overlay'); background.forEach(n=>n.inert=true);
  ref.current?.focus();
  const key=e=>{
   if(e.key==='Escape'){e.preventDefault();closeRef.current();}
   if(e.key==='Tab'){
    const nodes=[...ref.current.querySelectorAll('button:not(:disabled),input:not(:disabled),select,textarea,a[href],[tabindex="0"]')].filter(n=>n.getClientRects().length);
    const first=nodes[0],last=nodes.at(-1);
    if(!first){e.preventDefault();return;}
    if(e.shiftKey&&(document.activeElement===first||document.activeElement===ref.current)){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===ref.current)){e.preventDefault();first.focus();}
   }
  };document.addEventListener('keydown',key);
  return()=>{document.body.style.overflow=overflow;background.forEach(n=>n.inert=false);document.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus();};
 },[open]);
 if(!open)return null;
 return <div className="modal-overlay" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className={`modal modal-${size}`} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} ref={ref}><header className="modal-header"><div><h2 id={titleId} className="modal-title">{Icon&&<Icon size={20}/>} {title}</h2>{subtitle&&<p className="modal-subtitle">{subtitle}</p>}</div><button type="button" className="modal-close" aria-label="Fechar" onClick={onClose}><X size={20}/></button></header><div className="modal-body">{children}</div>{footer&&<footer className="modal-footer">{footer}</footer>}</div></div>;
}
function FormField({label,required,error,children}) {
 const id=useId();return <div className="form-group"><label className="form-label" htmlFor={id}>{label}{required&&<span className="form-required"> *</span>}</label>{cloneElement(children,{id,'aria-invalid':!!error,'aria-describedby':error?`${id}-error`:undefined})}{error&&<span id={`${id}-error`} className="form-error" role="alert">{error}</span>}</div>;
}
function FormRow({children}){return <div className="form-grid">{children}</div>;}
function FormSection({title,children}){return <section className="form-section"><h3 className="form-section-title">{title}</h3>{children}</section>;}
function FormInput(props){return <input className="form-input" {...props}/>;}
function FormSelect({options,...props}){return <select className="form-select" {...props}><option value="">Seleccionar…</option>{[...new Map(options.map(o=>[typeof o==='object'?o.value:o,o])).values()].map(o=><option key={typeof o==='object'?o.value:o} value={typeof o==='object'?o.value:o}>{typeof o==='object'?o.label:o}</option>)}</select>;}
function FormTextarea(props){return <textarea className="form-textarea form-input" {...props}/>;}
function FormCheckbox(props){return <input type="checkbox" {...props}/>;}
function FormDate(props){return <FormInput type="date" {...props} onInput={props.onChange}/>;}
function Toast({toast,onClose}){if(!toast)return null;return <div className={`toast toast-${toast.type}`} role={toast.type==='error'?'alert':'status'}><CircleCheck size={22}/><div><strong>{toast.message}</strong></div><button aria-label="Fechar notificação" onClick={onClose}><X size={18}/></button></div>;}
function ConfirmModal({title,message,confirmLabel='Confirmar',cancelLabel='Cancelar',variant='default',onConfirm,onCancel}){return <Modal open title={title} onClose={onCancel} size="sm" footer={<><button className="btn btn-secondary" onClick={onCancel}>{cancelLabel}</button><button className={`btn ${variant==='danger'?'btn-danger':'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button></>}><div className={`confirmation-content ${variant}`}><AlertTriangle size={30}/><p>{message}</p></div></Modal>;}
function SuccessModal({title='Operação concluída',message,onClose}){return <Modal open title={title} onClose={onClose} size="sm" footer={<button className="btn btn-primary" onClick={onClose}>Continuar</button>}><CircleCheck size={36}/><p>{message}</p></Modal>;}
function WarningModal({title='Atenção',message,onClose,onAction}){return <Modal open title={title} onClose={onClose} size="sm" footer={<><button className="btn btn-secondary" onClick={onClose}>Fechar</button>{onAction&&<button className="btn btn-primary" onClick={onAction}>Ver documentos</button>}</>}><AlertTriangle size={36}/><p>{message}</p></Modal>;}
function EntityForm({kind,data,db,onSave,onClose,onAddVehicleAsset}) {
 const fields=fieldsFor(kind,db);
 const [form,setForm]=useState(()=>({status:({owner:'Activo',vehicle:'Activa',driver:'Activo',contract:'Activo',payment:'Pendente',crm:'Novo',retake:'Nova'})[kind],...(kind==='owner'?{country:'Portugal',city:'Lisboa'}:{}),...(kind==='crm'?{city:'Lisboa'}:{}),...(kind==='retake'||kind==='invoice'?{date:today()}:{}),...(kind==='payment'?{gross:620,commission:25,adjustments:0}:{}),...(kind==='invoice'?{number:generateInvoiceNumber(db.invoices),status:'Rascunho',items:[{description:'',quantity:1,unitPrice:25,vatRate:23}]}:{}),...data}));
 const [errors,setErrors]=useState({}); const [drag,setDrag]=useState(false); const formId=useId();
 const update=(key,value)=>setForm(v=>({...v,[key]:value}));
 const chooseFile=file=>{if(!file)return;if(!validDocumentFile(file)){update('file',null);setErrors(e=>({...e,file:'Seleccione PDF, JPG ou PNG até 10 MB.'}));return;}update('file',file);setErrors(e=>({...e,file:null}));};
 const submit=e=>{e.preventDefault();const next={};fields.flatMap(s=>s.slice(1)).forEach(field=>{const val=form[field.key];if(field.required&&!String(val??'').trim())next[field.key]='Este campo é obrigatório.';if(field.type==='email'&&val&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))next[field.key]='Email inválido.';if(field.type==='number'&&val!==undefined&&val!==''&&(!Number.isFinite(Number(val))||(field.key!=='adjustments'&&Number(val)<0)))next[field.key]='Introduza um valor válido.';});
  if((kind==='owner'||kind==='invoice')&&!/^\d{9}$/.test(form[kind==='owner'?'nif':'customerNif']||''))next[kind==='owner'?'nif':'customerNif']='NIF inválido. Utilize 9 dígitos.';
  if(form.end&&form.start&&form.end<form.start)next.end='A data de fim deve ser posterior ao início.';
  if(form.expiry&&form.issued&&form.expiry<form.issued)next.expiry='A validade deve ser posterior à emissão.';
  if((kind==='document'&&!data&&!form.file)||errors.file)next.file=errors.file||'Seleccione um ficheiro.';
  if(kind==='invoice'){
   form.items.forEach((item,i)=>{if(!['0','6','13','23'].includes(String(item.vatRate)))next[`vatRate${i}`]='Seleccione uma taxa de IVA.';});
   if(db.invoices.some(i=>i.number===form.number&&i.id!==data?.id))next.number='Este número já existe.';
   if(!form.items.length)next.items='Adicione pelo menos uma linha à factura.';
   form.items.forEach((item,i)=>{if(!item.description.trim())next[`description${i}`]='Descrição obrigatória.';if(!Number.isFinite(+item.quantity)||+item.quantity<=0)next[`quantity${i}`]='Quantidade deve ser superior a zero.';if(item.unitPrice===''||!Number.isFinite(+item.unitPrice)||+item.unitPrice<0)next[`unitPrice${i}`]='Preço deve ser igual ou superior a zero.';});
  }
  setErrors(next);if(Object.keys(next).length)return;
  const record={...form,createdAt:data?.createdAt||today()};
  if(kind==='invoice')Object.assign(record,invoiceTotals(form.items));
  if(kind==='payment')Object.assign(record,{net:round(+form.gross-+form.commission+Number(form.adjustments||0)),period:`${form.start} — ${form.end}`});
  if(kind==='document'){const [entityType,entityId]=(form.entityKey||'').split(':');const entity=db[entityMeta[entityType][0]].find(r=>String(r.id)===entityId);Object.assign(record,{name:form.file?.name||form.name||form.type,status:form.file?'Local':form.status,entity:entity?.name||entity?.plate||form.entity});}
  onSave(record);
 };
 const totals=kind==='invoice'?invoiceTotals(form.items):null;
 return <Modal open onClose={onClose} title={data?.id?`Editar ${{owner:'proprietário',vehicle:'viatura',driver:'motorista',invoice:'factura'}[kind]||entityMeta[kind][1].toLowerCase()}`:entityMeta[kind][2]} subtitle="Demonstração · dados guardados apenas nesta sessão" size={['invoice','vehicle'].includes(kind)?'xl':'lg'} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit" form={formId}><Check size={17}/>{data?.id?'Guardar alterações':entityMeta[kind][3]}</button></>}><form id={formId} noValidate onSubmit={submit}>{fields.map(([title,...entries])=><FormSection key={title} title={title}><FormRow>{entries.map(field=>{const props={value:form[field.key]??'',onChange:e=>update(field.key,e.target.value)};return <FormField key={field.key} label={field.label} required={field.required} error={errors[field.key]}>{field.type==='select'?<FormSelect {...props} options={[...(field.options||[]),...(form[field.key]&&!field.options?.some(o=>(typeof o==='object'?o.value:o)===form[field.key])?[form[field.key]]:[])]}/>:field.type==='textarea'?<FormTextarea {...props}/>:field.type==='checkbox'?<FormCheckbox checked={!!form[field.key]} onChange={e=>update(field.key,e.target.checked)}/>:field.type==='date'?<FormDate {...props}/>:<FormInput {...props} type={field.type} step={field.type==='number'?'any':undefined}/>}</FormField>;})}</FormRow></FormSection>)}
 {kind==='vehicle'&&<VehicleImagePicker assets={db.vehicleAssets} selected={form.imageId} onSelect={asset=>setForm(value=>({...value,imageId:asset.id,brand:asset.brand||value.brand,model:asset.model||value.model}))} onAdd={file=>onAddVehicleAsset(file,form.brand,form.model)}/>}
 {kind==='contract'&&<><p className="legal-note">A configuração contratual deve corresponder à relação jurídica e fiscal efectivamente existente. O software não deve ser utilizado para alterar artificialmente a natureza da relação.</p><label className={`upload-zone ${drag?'active':''}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);chooseFile(e.dataTransfer.files[0]);}}><Upload size={27}/><strong>Importar contrato assinado ou documento de suporte</strong><span>Opcional · PDF, JPG ou PNG · até 10 MB</span><input type="file" aria-label="Importar ficheiro do contrato" accept="application/pdf,image/jpeg,image/png" onChange={e=>chooseFile(e.target.files[0])}/>{form.file&&<strong>{form.file.name}</strong>}</label>{errors.file&&<p className="form-error" role="alert">{errors.file}</p>}<div className="document-preview form-live-preview"><div className="document-preview-toolbar"><div><h3>Pré-visualização do contrato</h3><div className="document-preview-meta">Actualiza-se à medida que preenche o formulário.</div></div></div><div className="document-preview-stage"><ContractPaper record={form}/></div></div></>}
 {kind==='payment'&&<div className="settlement-preview"><div className="settlement-total"><span>Valor líquido</span><strong>{money(+form.gross-+form.commission+Number(form.adjustments||0))}</strong></div><p>Registo local. Não é executada qualquer transferência bancária.</p></div>}
 {kind==='document'&&<><label className={`upload-zone ${drag?'active':''}`} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);chooseFile(e.dataTransfer.files[0]);}}><Upload size={32}/><strong>Arraste o ficheiro ou seleccione um ficheiro</strong><span>PDF, JPG ou PNG · até 10 MB · apenas nesta sessão</span><input type="file" aria-label="Seleccionar ficheiro" accept="application/pdf,image/jpeg,image/png" onChange={e=>chooseFile(e.target.files[0])}/>{form.file&&<strong>{form.file.name}</strong>}</label>{errors.file&&<p className="form-error" role="alert">{errors.file}</p>}{form.file&&<div className="document-preview form-live-preview"><div className="document-preview-toolbar"><div><h3>Pré-visualização do documento</h3><div className="document-preview-meta">{form.file.name}</div></div></div><div className="document-preview-stage"><FilePreview file={form.file} name={form.file.name}/></div></div>}</>}
 {kind==='invoice'&&<FormSection title="Linhas da factura">{form.items.map((item,i)=><div className="invoice-editor-row" key={i}>{[['description','Descrição','text'],['quantity','Quantidade','number'],['unitPrice','Preço unitário','number'],['vatRate','IVA','select']].map(([key,label,type])=><FormField key={key} label={label} error={errors[`${key}${i}`]}>{type==='select'?<FormSelect options={['0','6','13','23']} value={item[key]} onChange={e=>update('items',form.items.map((x,j)=>j===i?{...x,[key]:e.target.value}:x))}/>:<FormInput type={type} step="any" value={item[key]} onChange={e=>update('items',form.items.map((x,j)=>j===i?{...x,[key]:e.target.value}:x))}/>}</FormField>)}<button type="button" className="btn btn-ghost" aria-label={`Remover linha ${i+1}`} onClick={()=>update('items',form.items.filter((_,j)=>j!==i))}><Trash2 size={17}/></button></div>)}{errors.items&&<p className="form-error" role="alert">{errors.items}</p>}<button type="button" className="btn btn-secondary" onClick={()=>update('items',[...form.items,{description:'',quantity:1,unitPrice:0,vatRate:23}])}><Plus size={17}/>Adicionar linha</button><InvoiceTotals totals={totals}/></FormSection>}
 </form></Modal>;
}
function InvoiceTotals({totals}){return <div className="invoice-totals">{[['Subtotal',totals.subtotal],['IVA',totals.vat],['Total',totals.total]].map(([label,value])=><div key={label} className={label==='Total'?'invoice-total-final':''}><span>{label}</span><strong>{money(value)}</strong></div>)}</div>;}
function InvoicePreview({invoice,onClose,onEdit,printMode,showToast}) {
 useEffect(()=>{if(!printMode)return;const timer=setTimeout(()=>window.print(),250);return()=>clearTimeout(timer);},[printMode]);
 return <Modal open title="Pré-visualização de factura" subtitle="Documento de demonstração" onClose={onClose} size="xl" footer={<><button className="btn btn-secondary" onClick={onClose}>Fechar</button><button className="btn btn-secondary" onClick={onEdit}><Pencil size={16}/>Editar</button><button className="btn btn-secondary" onClick={()=>window.print()}><Printer size={16}/>Imprimir</button><button className="btn btn-primary" onClick={()=>{showToast('Seleccione «Guardar como PDF» no diálogo de impressão.','info');window.print();}}><Download size={16}/>Exportar PDF</button></>}><article className="invoice-print"><header className="invoice-header"><div><strong className="invoice-brand">TVDE FLEET</strong><p>Gestão de Frota TVDE</p><p>NIF: XXXXXXXX</p></div><div><h2>FACTURA</h2><strong>{invoice.number}</strong><p>{invoice.date}</p><StatusBadge type="info">{invoice.status}</StatusBadge></div></header><section className="invoice-customer"><small>CLIENTE</small><h3>{invoice.customer}</h3><p>NIF: {invoice.customerNif}</p><p>{invoice.customerAddress||'Morada não indicada'}</p></section><div className="table-container"><table className="invoice-table"><thead><tr>{['Descrição','Qtd.','Preço','IVA','Total s/ IVA'].map(t=><th key={t}>{t}</th>)}</tr></thead><tbody>{invoice.items.map((item,i)=><tr key={i}><td>{item.description}</td><td>{item.quantity}</td><td>{money(item.unitPrice)}</td><td>{item.vatRate}%</td><td>{money(item.quantity*item.unitPrice)}</td></tr>)}</tbody></table></div><InvoiceTotals totals={invoiceTotals(invoice.items)}/><p className="invoice-disclaimer">Documento de demonstração — sem validade fiscal. Numeração local, sem comunicação à Autoridade Tributária.</p></article></Modal>;
}
function FilePreview({file,name}) {
 const elementRef=useRef(null);
 useEffect(()=>{if(!file||!elementRef.current)return;const next=URL.createObjectURL(file);elementRef.current.src=next;return()=>URL.revokeObjectURL(next);},[file]);
 if(!file)return <div className="document-preview-empty"><FolderOpen size={29}/><strong>Sem ficheiro anexado</strong><p>Importe um PDF, JPG ou PNG para ver o documento nesta sessão.</p></div>;
 return file.type==='application/pdf'?<iframe ref={elementRef} className="document-frame" title={`Pré-visualização de ${name||file.name}`}/>:<img ref={elementRef} className="document-image" alt={name||file.name}/>;
}
function FileDownloadLink({file}) {
 const linkRef=useRef(null);
 useEffect(()=>{const url=URL.createObjectURL(file);linkRef.current.href=url;return()=>URL.revokeObjectURL(url);},[file]);
 return <a ref={linkRef} className="btn btn-secondary" download={file.name}><Download size={16}/>Exportar original</a>;
}
function DocumentLine({label,value}) {return <div className="document-preview-line"><span>{label}</span><strong>{value||'Por definir'}</strong></div>;}
function ContractPaper({record}) {
 return <article className="document-preview-sheet contract-print">
  <div className="document-preview-kicker">TVDE Fleet · Contrato de demonstração</div>
  <h1>{record.contractType||'Contrato de gestão de frota'}</h1>
  <p>Referência {record.id||'Rascunho'} · Criado para consulta e revisão dos dados registados.</p>
  <section className="document-preview-section"><h2>Partes e viatura</h2><div className="document-preview-grid"><div><DocumentLine label="Proprietário" value={record.owner}/><DocumentLine label="Viatura" value={record.vehicle}/></div><div><DocumentLine label="Início" value={formatDate(record.start)}/><DocumentLine label="Fim" value={formatDate(record.end)}/></div></div></section>
  <section className="document-preview-section"><h2>Condições registadas</h2><DocumentLine label="Tipo" value={record.contractType}/><DocumentLine label="Periodicidade" value={record.frequency}/><DocumentLine label="Comissão" value={record.commission!==''&&record.commission!=null?money(Number(record.commission)):'Por definir'}/><DocumentLine label="Valor fixo" value={record.fixedValue!==''&&record.fixedValue!=null?money(Number(record.fixedValue)):'Por definir'}/></section>
  <section className="document-preview-section"><h2>Observações</h2><p>{record.notes||'Sem observações adicionais.'}</p></section>
  <div className="document-preview-signatures"><div className="document-preview-signature">Proprietário · assinatura</div><div className="document-preview-signature">Entidade gestora · assinatura</div></div>
  <p className="document-preview-note">Pré-visualização gerada a partir dos dados da sessão. Documento não assinado, sem validade jurídica. Confirme os termos com as partes antes de qualquer utilização formal.</p>
 </article>;
}
function DocumentCoverPaper({record}) {
 return <article className="document-preview-sheet"><div className="document-preview-kicker">TVDE Fleet · Registo documental</div><h1>{record.name||record.type||'Documento'}</h1><p>Ficha de demonstração criada a partir dos dados do registo.</p><section className="document-preview-section"><h2>Informação do documento</h2><DocumentLine label="Tipo" value={record.type}/><DocumentLine label="Entidade" value={record.entity}/><DocumentLine label="Emissão" value={formatDate(record.issued)}/><DocumentLine label="Validade" value={formatDate(record.expiry)}/><DocumentLine label="Estado" value={record.status}/></section><section className="document-preview-section"><h2>Observações</h2><p>{record.notes||'Sem observações adicionais.'}</p></section><p className="document-preview-note">Esta ficha não substitui o documento original. Importe um ficheiro para consultar e exportar o original.</p></article>;
}
function DocumentView({kind,record,onClose,onEdit,onDelete,onImport,showToast}) {
 const inputRef=useRef(null);const [fileError,setFileError]=useState('');const isContract=kind==='contract';
 const importFile=e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(!validDocumentFile(file)){setFileError('Seleccione PDF, JPG ou PNG até 10 MB.');return;}setFileError('');onImport(file);};
 const exportPdf=()=>{showToast('Seleccione «Guardar como PDF» no diálogo de impressão.','info');printGeneratedDocument();};
 return <Modal open title={isContract?`Contrato ${record.id}`:record.name||'Documento'} subtitle={isContract?'Pré-visualização do contrato':'Pré-visualização do documento'} onClose={onClose} size="xl" footer={<><button className="btn btn-secondary" onClick={onClose}>Fechar</button><button className="btn btn-secondary" onClick={onEdit}><Pencil size={16}/>Editar</button><button className="btn btn-danger" onClick={onDelete}><Trash2 size={16}/>Apagar</button></>}>
  <div className="document-preview"><div className="document-preview-toolbar"><div><h3>{record.name||record.contractType||(isContract?'Contrato':'Documento')}</h3><div className="document-preview-meta"><span>{isContract?record.id:record.type}</span><span>{record.owner||record.entity}</span><span>{record.file?`Ficheiro: ${record.file.name}`:'Sem ficheiro original'}</span></div></div><div className="file-actions"><input ref={inputRef} type="file" hidden accept="application/pdf,image/jpeg,image/png" onChange={importFile}/><button className="btn btn-secondary" onClick={()=>inputRef.current?.click()}><Upload size={16}/>{record.file?'Substituir ficheiro':'Importar ficheiro'}</button>{record.file&&<FileDownloadLink file={record.file}/>}<button className="btn btn-primary" onClick={exportPdf}><Download size={16}/>{isContract?'Exportar PDF':'Exportar ficha PDF'}</button></div></div>{fileError&&<p className="form-error" role="alert">{fileError}</p>}
  <div className={`document-preview-stage ${!isContract&&record.file?'file-preview-stage':''}`}>{isContract?<ContractPaper record={record}/>:record.file?<FilePreview file={record.file} name={record.name}/>:<DocumentCoverPaper record={record}/>}</div>
  {!isContract&&record.file&&<div className="document-print-cover"><DocumentCoverPaper record={record}/></div>}
  {isContract&&record.file&&<section className="document-preview-section attached-preview"><h3>Ficheiro importado</h3><div className="document-preview-stage"><FilePreview file={record.file} name={record.file.name}/></div></section>}
  </div>
 </Modal>;
}
function DetailView({kind,data,db,openModal,onClose,requestDelete}) {
 const [tab,setTab]=useState('Resumo');
 const tabs=kind==='owner'?['Resumo','Viaturas','Pagamentos','Documentos','Contrato']:kind==='vehicle'?['Resumo','Operação','Documentos','Manutenção','Pagamentos','Histórico']:['Resumo'];
 const ownVehicles=db.vehicles.filter(v=>v.owner===data.name);
 const matches=r=>kind==='owner'?r.owner===data.name:r.vehicle===data.plate;
 const relatedPayments=db.payments.filter(matches);
 const labels=Object.fromEntries(fieldsFor(kind,db).flatMap(s=>s.slice(1)).map(f=>[f.key,f.label]));
 Object.assign(labels,{createdAt:'Data de registo',status:'Estado'}); if(kind==='payment')Object.assign(labels,{period:'Período',net:'Valor líquido'}); if(kind==='vehicle')Object.assign(labels,{inspection:'Inspecção',insurance:'Seguro',license:'Licença TVDE (dias)'}); if(kind==='document')labels.name='Ficheiro';
 const details=<dl className="detail-grid">{Object.entries(labels).filter(([,v])=>v).map(([key,label])=><div className="detail-card" key={key}><dt>{label}</dt><dd>{typeof data[key]==='boolean'?(data[key]?'Sim':'Não'):data[key]===undefined||data[key]===''?'Não indicado':['gross','net','commission','adjustments','fixedValue'].includes(key)?money(data[key]):key==='entityKey'?data.entity:String(data[key])}</dd></div>)}</dl>;
 const related=(rows,type)=>rows.length?<div className="related-list">{rows.map(r=><button key={r.id} className="btn btn-secondary" onClick={()=>openModal(`${type}-view`,r)}>{r.name||r.plate||r.number||r.id} <Eye size={16}/></button>)}</div>:<p className="empty-state">Sem registos associados nesta sessão.</p>;
 return <Modal open title={data.name||data.number||data.plate||String(data.id)} subtitle={entityMeta[kind][1]} onClose={onClose} size="lg" footer={<><button className="btn btn-secondary" onClick={onClose}>Fechar</button><button className="btn btn-secondary" onClick={()=>openModal(`${kind}-edit`,data)}><Pencil size={16}/>Editar</button><button className="btn btn-danger" onClick={()=>requestDelete(kind,data)}><Trash2 size={16}/>Apagar</button>{kind==='payment'&& !['Pago','Auditado'].includes(data.status)&&<button className="btn btn-primary" onClick={()=>openModal('payment-confirm',data)}>Confirmar pagamento</button>}{kind==='invoice'&&<button className="btn btn-primary" onClick={()=>openModal('invoice-preview',data)}>Pré-visualizar</button>}</>}>
 {kind==='owner'&&<div className="detail-grid">{[['Viaturas',ownVehicles.length],['Motoristas',db.drivers.filter(d=>ownVehicles.some(v=>v.plate===d.vehicle)).length],['Total recebido',money(relatedPayments.filter(p=>p.status==='Pago').reduce((s,p)=>s+Number(p.net),0))],['Último pagamento',relatedPayments.filter(p=>p.status==='Pago').at(-1)?.period||'Sem pagamentos']].map(([label,value])=><div key={label} className="detail-card"><span>{label}</span><strong>{value}</strong></div>)}</div>}
 {tabs.length>1&&<div className="detail-tabs" role="tablist" aria-label="Detalhes">{tabs.map(t=><button key={t} role="tab" aria-selected={tab===t} className={tab===t?'active':''} onClick={()=>setTab(t)}>{t}</button>)}</div>}
 {tab==='Resumo'&&<>{kind==='vehicle'&&<div className="detail-vehicle-image"><VehicleAssetImage asset={db.vehicleAssets.find(asset=>asset.id===data.imageId)} alt={`${data.brand} ${data.model}`}/></div>}{details}{kind==='invoice'&&<InvoiceTotals totals={invoiceTotals(data.items)}/>}</>}
 {tab==='Viaturas'&&related(ownVehicles,'vehicle')}{tab==='Pagamentos'&&related(relatedPayments,'payment')}{tab==='Contrato'&&related(db.contracts.filter(matches),'contract')}{tab==='Documentos'&&related(db.documents.filter(d=>d.entityKey===`${kind}:${data.id}`),'document')}{tab==='Operação'&&details}{['Manutenção','Histórico'].includes(tab)&&<p className="empty-state">Sem registos de {tab.toLowerCase()} nesta sessão.</p>}
 </Modal>;
}
function ModalManager({modal,closeModal,openModal,showToast,db,saveRecord,requestDelete,profile,onSaveProfile,onSaveMember,onSaveTemplate,onAddVehicleAsset}) {
 if(!modal.open)return null;
 const [kind,mode]=modal.type.split('-'); const data=modal.data;
 switch(modal.type){
 case 'confirmation':return <ConfirmModal {...data} onCancel={closeModal} onConfirm={()=>{data.onConfirm?.();closeModal();}}/>;
 case 'success':return <SuccessModal {...data} onClose={closeModal}/>;
 case 'warning':return <WarningModal {...data} onClose={closeModal}/>;
 case 'payment-confirm':return <ConfirmModal title="Confirmar pagamento" confirmLabel="Confirmar pagamento" message={`${data.owner} · ${data.vehicle||'Viatura não indicada'} · ${data.period} · ${money(data.net)}. Esta confirmação altera apenas o registo local; não processa pagamentos reais.`} onCancel={closeModal} onConfirm={()=>{saveRecord('payment',{...data,status:'Pago'});closeModal();showToast('Pagamento confirmado com sucesso.');}}/>;
 case 'invoice-preview':return <InvoicePreview invoice={data} onClose={closeModal} onEdit={()=>openModal('invoice-edit',data)} printMode={data.printMode} showToast={showToast}/>;
 case 'profile-edit':return <ProfileForm profile={profile} ModalComponent={Modal} onClose={closeModal} onSave={updated=>{onSaveProfile(updated);closeModal();showToast('Perfil actualizado nesta sessão.');}}/>;
 case 'team-create':case 'team-edit':return <TeamForm member={modal.type==='team-edit'?data:null} ModalComponent={Modal} onClose={closeModal} onSave={member=>{onSaveMember(member);closeModal();showToast('Membro da equipa guardado nesta sessão.');}}/>;
 case 'template-edit':return <TemplateForm template={data} ModalComponent={Modal} onClose={closeModal} onSave={template=>{onSaveTemplate(template);closeModal();showToast('Modelo de email actualizado.');}}/>;
 case 'vehicle-image-create':return <AddVehicleImageModal ModalComponent={Modal} onClose={closeModal} onSave={asset=>{onAddVehicleAsset(asset.file,asset.brand,asset.model,asset.label);closeModal();showToast('Imagem adicionada à biblioteca.');}}/>;
 default:
  if(!entityMeta[kind])return null;
  if(['create','edit','upload'].includes(mode))return <EntityForm kind={kind} data={data} db={db} onAddVehicleAsset={onAddVehicleAsset} onClose={closeModal} onSave={record=>{const saved={...record,id:record.id||(kind==='contract'?generateContractNumber(db.contracts):`${kind.toUpperCase()}-${crypto.randomUUID().slice(0,8)}`)};saveRecord(kind,saved);if(['contract','document'].includes(kind))openModal(`${kind}-view`,saved);else closeModal();showToast(`${entityMeta[kind][1]}: registo ${data?.id?'actualizado':'guardado'} com sucesso.`);}}/>;
  if(['contract','document'].includes(kind))return <DocumentView kind={kind} record={data} onClose={closeModal} onEdit={()=>openModal(`${kind}-edit`,data)} onDelete={()=>requestDelete(kind,data)} onImport={file=>{const updated={...data,file,...(kind==='document'?{name:file.name,status:'Local'}:{})};saveRecord(kind,updated);openModal(`${kind}-view`,updated);showToast('Ficheiro importado para esta sessão.');}} showToast={showToast}/>;
  return <DetailView kind={kind} data={data} db={db} openModal={openModal} onClose={closeModal} requestDelete={requestDelete}/>;
 }
}
const tableColumns={driver:[['name','Motorista'],['vehicle','Viatura'],['phone','Telefone'],['status','Estado']],contract:[['id','Contrato'],['owner','Proprietário'],['vehicle','Viatura'],['start','Início'],['status','Estado']],document:[['name','Documento'],['entity','Entidade'],['type','Tipo'],['status','Estado']],retake:[['id','Retoma'],['owner','Proprietário'],['plate','Viatura'],['status','Estado'],['date','Data']],invoice:[['number','Número'],['customer','Cliente'],['date','Data'],['total','Valor'],['status','Estado']]};
const singularLabel={owner:'proprietário',vehicle:'viatura',driver:'motorista',contract:'contrato',payment:'pagamento',document:'documento',crm:'lead',retake:'retoma',invoice:'factura'};
function ActionIcon({label,icon:Icon,onClick,danger=false}){return <button type="button" className={`action-icon ${danger?'is-danger':''}`} title={label} aria-label={label} onClick={e=>{e.stopPropagation();onClick();}}><Icon size={17}/></button>;}
function rowKeyDown(event,open){if(event.target!==event.currentTarget)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();open();}}
function RecordTable({kind,rows,actions}){
 const openRecord=record=>actions.openModal(kind==='invoice'?'invoice-preview':`${kind}-view`,record);
 return <div className="panel"><div className="table-container"><table><thead><tr>{tableColumns[kind].map(([key,label])=><th key={key}>{label}</th>)}<th>Acções</th></tr></thead><tbody>{rows.map(r=><tr className="record-row" key={r.id} tabIndex={0} aria-label={`Abrir ${singularLabel[kind]} ${r.name||r.number||r.id}`} onClick={()=>openRecord(r)} onKeyDown={e=>rowKeyDown(e,()=>openRecord(r))}>{tableColumns[kind].map(([key])=><td key={key}>{key==='status'?<StatusBadge type={['Pago','Paga','Activo','Ativo','Válido'].includes(r[key])?'success':'info'}>{r[key]||'Registado'}</StatusBadge>:key==='total'?money(r[key]):r[key]||'—'}</td>)}<td><div className="row-actions"><ActionIcon label={`Ver ${singularLabel[kind]}`} icon={Eye} onClick={()=>openRecord(r)}/><ActionIcon label={`Editar ${singularLabel[kind]}`} icon={Pencil} onClick={()=>actions.openModal(`${kind}-edit`,r)}/><ActionIcon label={`Apagar ${singularLabel[kind]}`} icon={Trash2} danger onClick={()=>actions.requestDelete(kind,r)}/>{kind==='invoice'&&<><ActionIcon label="Imprimir factura" icon={Printer} onClick={()=>actions.openModal('invoice-preview',{...r,printMode:'print'})}/><ActionIcon label="Exportar factura em PDF" icon={Download} onClick={()=>actions.openModal('invoice-preview',{...r,printMode:'pdf'})}/></>}</div></td></tr>)}</tbody></table>{!rows.length&&<p className="empty-state">Sem registos.</p>}</div></div>;
}
function EntityPage({kind,actions}){return <div className="page"><PageHeader title={entityMeta[kind][1]} description="Gestão e consulta dos registos da sessão." button={entityMeta[kind][2]} onClick={()=>actions.openModal(`${kind}-${kind==='document'?'upload':'create'}`)}/><RecordTable kind={kind} rows={actions.db[entityMeta[kind][0]]} actions={actions}/></div>;}
function Invoices({actions}) {
 const rows=actions.db.invoices;const billed=rows.filter(i=>!['Cancelada','Rascunho'].includes(i.status));
 const sum=arr=>money(arr.reduce((s,i)=>s+i.total,0));
 return <div className="page"><PageHeader title="Facturação" description="Documentos de demonstração · sem validade fiscal" button="Nova factura" onClick={actions.openInvoice}/><div className="stats-grid">{[['Facturas este mês',sum(billed.filter(i=>i.date.slice(0,7)===today().slice(0,7)))],['Pagas',sum(rows.filter(i=>i.status==='Paga'))],['Pendentes',sum(rows.filter(i=>i.status==='Pendente'))],['Total facturado',sum(billed)]].map(([label,value])=><StatCard key={label} label={label} value={value} change="Dados da sessão" icon={<Receipt size={21}/>} type="blue"/>)}</div><RecordTable kind="invoice" rows={rows} actions={actions}/></div>;
}

function Dashboard({ actions }) {
  const chart = [52, 68, 60, 78, 73, 91, 84, 96];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>A sua operação, numa só vista.</p>
        </div>

        <div className="header-actions">
          <span className="period-chip"><CalendarDays size={16} /> Dados de demonstração</span>

          <button
            className="btn btn-primary"
            onClick={actions.openPayment}
          >
            <Plus size={17} />
            Novo pagamento
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Viaturas ativas"
          value="48"
          change="+6,4%"
          icon={<Car size={21} />}
          type="blue"
        />

        <StatCard
          label="Proprietários"
          value="37"
          change="+3 novos"
          icon={<Users size={21} />}
          type="purple"
        />

        <StatCard
          label="Motoristas"
          value="52"
          change="+2 esta semana"
          icon={<UserRound size={21} />}
          type="green"
        />

        <StatCard
          label="A pagar"
          value="€18.420"
          change="12 pagamentos"
          icon={<Wallet size={21} />}
          type="orange"
        />
      </div>

      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <div>
              <h2>Receita da frota</h2>
              <p>Últimas 8 semanas</p>
            </div>

            <strong>€42.680</strong>
          </div>

          <div className="chart">
            {chart.map((value, index) => (
              <div className="chart-column" key={index}>
                <div
                  className="chart-bar"
                  style={{ height: `${value}%` }}
                />

                <span>Sem {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Atividade recente</h2>
              <p>Últimas operações</p>
            </div>

            <button className="icon-button" aria-label="Ver operação" onClick={()=>actions.navigate('operation')}>
              <ArrowRight size={17} />
            </button>
          </div>

          <ActivityItem
            icon={<CreditCard size={17} />}
            title="Pagamento confirmado"
            description="João Silva · €595,00"
            time="Há 8 min"
          />

          <ActivityItem
            icon={<Car size={17} />}
            title="Nova viatura"
            description="Toyota Corolla · 23-CD-45"
            time="Há 42 min"
          />

          <ActivityItem
            icon={<FileText size={17} />}
            title="Contrato registado"
            description="Ana Martins"
            time="Há 1 h"
          />

          <ActivityItem
            icon={<AlertTriangle size={17} />}
            title="Documento a expirar"
            description="Licença · 45-EF-67"
            time="Há 2 h"
          />
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Pagamentos recentes</h2>
            <p>Últimos apuramentos semanais</p>
          </div>

          <button className="btn btn-secondary" onClick={()=>actions.navigate("payments")}>Ver todos</button>
        </div>

        <PaymentTable actions={actions} />
      </div>
    </div>
  );
}

function StatCard({ label, value, change, icon, type }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${type}`}>{icon}</div>

      <div className="stat-content">
        <span>{label}</span>
        <strong>{value}</strong>

        <small>
          <span className="stat-positive">↑</span> {change}
        </small>
      </div>
    </div>
  );
}

function ActivityItem({ icon, title, description, time }) {
  return (
    <div className="activity-item">
      <div className="activity-icon">{icon}</div>

      <div className="activity-content">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <time>{time}</time>
    </div>
  );
}

function PaymentTable({ actions }) {
  const payments = actions.db.payments;
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Pagamento</th>
            <th>Proprietário</th>
            <th>Período</th>
            <th>Bruto</th>
            <th>Comissão</th>
            <th>Líquido</th>
            <th>Estado</th>
            <th>Acções</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => (
            <tr className="record-row" key={payment.id} tabIndex={0} aria-label={`Abrir pagamento ${payment.id}`} onClick={()=>actions.openModal('payment-view',payment)} onKeyDown={e=>rowKeyDown(e,()=>actions.openModal('payment-view',payment))}>
              <td>
                <strong>{payment.id}</strong>
              </td>

              <td>{payment.owner}</td>

              <td>{payment.period}</td>

              <td>{money(payment.gross)}</td>

              <td>- {money(payment.commission)}</td>

              <td>
                <strong>{money(payment.net)}</strong>
              </td>

              <td>
                <StatusBadge
                  type={
                    payment.status === "Pago"
                      ? "success"
                      : payment.status === "Pendente"
                      ? "warning"
                      : "info"
                  }
                >
                  {payment.status}
                </StatusBadge>
              </td>

              <td><div className="row-actions"><ActionIcon label="Ver pagamento" icon={Eye} onClick={()=>actions.openModal('payment-view',payment)}/><ActionIcon label="Editar pagamento" icon={Pencil} onClick={()=>actions.openModal('payment-edit',payment)}/><ActionIcon label="Apagar pagamento" icon={Trash2} danger onClick={()=>actions.requestDelete('payment',payment)}/>{!["Pago","Auditado"].includes(payment.status)&&<ActionIcon label="Confirmar pagamento" icon={Check} onClick={()=>actions.openModal('payment-confirm',payment)}/>}</div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   PROPRIETÁRIOS
========================================================= */

function Owners({ actions }) {
  const [query,setQuery]=useState(''); const [status,setStatus]=useState('');
  const owners = actions.db.owners.filter(o=>(!status||o.status===status)&&`${o.name} ${o.nif}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="page">
      <PageHeader
        title="Proprietários"
        description="Gestão dos proprietários das viaturas."
        button="Novo proprietário"
        onClick={actions.openOwner}
      />

      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input aria-label="Pesquisar proprietário" placeholder="Pesquisar proprietário..." value={query} onChange={e=>setQuery(e.target.value)}/>
        </div>

        <select aria-label="Filtrar estado" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos os estados</option>{[...new Set(actions.db.owners.map(o=>o.status))].map(v=><option key={v}>{v}</option>)}</select>
      </div>

      <div className="panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Proprietário</th>
                <th>NIF</th>
                <th>Contacto</th>
                <th>Viaturas</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {owners.map((owner) => (
                <tr className="record-row" key={owner.id} tabIndex={0} aria-label={`Abrir proprietário ${owner.name}`} onClick={()=>actions.openModal('owner-view',owner)} onKeyDown={e=>rowKeyDown(e,()=>actions.openModal('owner-view',owner))}>
                  <td>
                    <div className="person-cell">
                      <div className="avatar">
                        {owner.name
                          .split(" ")
                          .map((x) => x[0])
                          .slice(0, 2)
                          .join("")}
                      </div>

                      <strong>{owner.name}</strong>
                    </div>
                  </td>

                  <td>{owner.nif}</td>

                  <td>
                    <div>{owner.phone}</div>
                    <small>{owner.email}</small>
                  </td>

                  <td>{actions.db.vehicles.filter(v=>v.owner===owner.name).length}</td>

                  <td>
                    <StatusBadge
                      type={owner.status === "Ativo" ? "success" : "warning"}
                    >
                      {owner.status}
                    </StatusBadge>
                  </td>

                  <td><div className="row-actions"><ActionIcon label="Ver proprietário" icon={Eye} onClick={()=>actions.openModal('owner-view',owner)}/><ActionIcon label="Editar proprietário" icon={Pencil} onClick={()=>actions.openModal('owner-edit',owner)}/><ActionIcon label="Apagar proprietário" icon={Trash2} danger onClick={()=>actions.requestDelete('owner',owner)}/></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   VIATURAS
========================================================= */

function Vehicles({ actions }) {
 const [query,setQuery]=useState(''); const [status,setStatus]=useState(''); const vehicles=actions.db.vehicles.filter(v=>(!status||v.status===status)&&`${v.plate} ${v.brand} ${v.model}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="page">
      <PageHeader
        title="Viaturas"
        description="Gestão da frota e documentação."
        button="Nova viatura"
        onClick={actions.openVehicle}
      />

      <div className="toolbar">
        <div className="search-box">
          <Search size={17} />
          <input aria-label="Pesquisar viaturas" placeholder="Pesquisar matrícula, marca..." value={query} onChange={e=>setQuery(e.target.value)}/>
        </div>

        <select aria-label="Filtrar estado" value={status} onChange={e=>setStatus(e.target.value)}><option value="">Todos os estados</option>{[...new Set(actions.db.vehicles.map(v=>v.status))].map(v=><option key={v}>{v}</option>)}</select>
      </div>

      <div className="vehicle-grid">
        {vehicles.map((vehicle) => (
          <div className="vehicle-card clickable-card" key={vehicle.id} tabIndex={0} aria-label={`Abrir viatura ${vehicle.plate}`} onClick={()=>actions.openVehicleDetails(vehicle)} onKeyDown={e=>rowKeyDown(e,()=>actions.openVehicleDetails(vehicle))}>
            <div className="vehicle-card-image">
              <VehicleAssetImage asset={actions.db.vehicleAssets.find(asset=>asset.id===vehicle.imageId)} alt={`${vehicle.brand} ${vehicle.model}`}/>

              <StatusBadge
                type={
                  vehicle.status === "Em operação"
                    ? "success"
                    : "warning"
                }
              >
                {vehicle.status}
              </StatusBadge>
            </div>

            <div className="vehicle-card-body">
              <div className="vehicle-card-title">
                <div>
                  <h3>
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <span>{vehicle.plate}</span>
                </div>

                <div className="row-actions"><ActionIcon label="Ver viatura" icon={Eye} onClick={()=>actions.openVehicleDetails(vehicle)}/><ActionIcon label="Editar viatura" icon={Pencil} onClick={()=>actions.openModal('vehicle-edit',vehicle)}/><ActionIcon label="Apagar viatura" icon={Trash2} danger onClick={()=>actions.requestDelete('vehicle',vehicle)}/></div>
              </div>

              <div className="vehicle-info">
                <span>
                  <Users size={15} />
                  {vehicle.owner}
                </span>

                <span>
                  <UserRound size={15} />
                  {vehicle.driver}
                </span>

                <span>
                  <Activity size={15} />
                  {vehicle.km} km
                </span>
              </div>

              <div className="vehicle-alert">
                <Clock3 size={15} />
                Licença TVDE: {vehicle.license !== undefined ? `${vehicle.license} dias` : "Não indicada"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   MOTORISTAS
========================================================= */

function Drivers({ actions }) { return <EntityPage kind="driver" actions={actions}/>; }

function Contracts({ actions }) { return <EntityPage kind="contract" actions={actions}/>; }

function Operation({actions}) {
 const items=actions.db.vehicles.map(v=>[v.plate,`${v.brand} ${v.model}`,v.driver||"Sem motorista",v.status]);

  return (
    <div className="page">
      <PageHeader
        title="Operação"
        description="Estado operacional da frota nesta sessão."
      />

      <div className="operation-grid">
        <div className="operation-card">
          <div className="operation-card-icon green">
            <Car size={22} />
          </div>
          <span>Em operação</span>
          <strong>42</strong>
        </div>

        <div className="operation-card">
          <div className="operation-card-icon yellow">
            <Clock3 size={22} />
          </div>
          <span>Disponíveis</span>
          <strong>4</strong>
        </div>

        <div className="operation-card">
          <div className="operation-card-icon red">
            <Settings size={22} />
          </div>
          <span>Manutenção</span>
          <strong>2</strong>
        </div>
      </div>

      <div className="panel">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Viatura</th>
                <th>Modelo</th>
                <th>Motorista</th>
                <th>Estado</th>
                <th>Atualização</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr className="record-row" key={index} tabIndex={0} aria-label={`Abrir viatura ${item[0]}`} onClick={()=>actions.openModal('vehicle-view',actions.db.vehicles[index])} onKeyDown={e=>rowKeyDown(e,()=>actions.openModal('vehicle-view',actions.db.vehicles[index]))}>
                  <td>
                    <strong>{item[0]}</strong>
                  </td>
                  <td>{item[1]}</td>
                  <td>{item[2]}</td>
                  <td>
                    <StatusBadge
                      type={
                        item[3] === "Em operação" ? "success" : "warning"
                      }
                    >
                      {item[3]}
                    </StatusBadge>
                  </td>
                  <td>Registo local</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGAMENTOS
========================================================= */

function Payments({ actions }) {
  return (
    <div className="page">
      <PageHeader
        title="Pagamentos"
        description="Apuramento e pagamentos aos proprietários."
        button="Registar pagamento"
        onClick={actions.openPayment}
      />

      <div className="payment-flow">
        {[
          "Resultados",
          "Apuramento",
          "Validação",
          "Proprietário",
          "Pagamento",
          "Auditado",
        ].map((step, index) => (
          <div className="flow-step" key={step}>
            <div className={`flow-number ${index < 3 ? "active" : ""}`}>
              {index + 1}
            </div>
            <span>{step}</span>

            {index < 5 && <ArrowRight size={15} />}
          </div>
        ))}
      </div>

      <div className="panel">
        <PaymentTable actions={actions} />
      </div>
    </div>
  );
}

/* =========================================================
   DOCUMENTOS
========================================================= */

function Documents({ actions }) { return <EntityPage kind="document" actions={actions}/>; }

function CRM({actions}) {
 const statuses=[...new Set(['Novo','Contactado','Qualificado','Proposta','Convertido','Perdido',...actions.db.crmLeads.map(l=>l.status)])];
 return <div className="page"><PageHeader title="CRM" description="Leads e aquisição de novos proprietários." button="Novo lead" onClick={()=>actions.openModal('crm-create')}/><div className="crm-board">{statuses.map((status,i)=><div className="crm-column" key={status}><div className="crm-column-header"><span className={`crm-dot ${['blue','yellow','purple','green'][i%4]}`}/><strong>{status}</strong><small>{actions.db.crmLeads.filter(l=>l.status===status).length}</small></div>{actions.db.crmLeads.filter(l=>l.status===status).map(l=><div className="crm-card-wrap" key={l.id}><button className="crm-card" onClick={()=>actions.openModal('crm-view',l)}><strong>{l.name}</strong><span>{l.contactType||'Contacto'} · {l.city||l.source||'Sem origem'}</span></button><div className="row-actions"><ActionIcon label="Ver lead" icon={Eye} onClick={()=>actions.openModal('crm-view',l)}/><ActionIcon label="Editar lead" icon={Pencil} onClick={()=>actions.openModal('crm-edit',l)}/><ActionIcon label="Apagar lead" icon={Trash2} danger onClick={()=>actions.requestDelete('crm',l)}/></div></div>)}</div>)}</div></div>;
}

function Retakes({ actions }) { return <EntityPage kind="retake" actions={actions}/>; }

function Billing({ actions }) { return <Invoices actions={actions}/>; }

function Reports({actions}) {
  return (
    <div className="page">
      <PageHeader
        title="Relatórios"
        description="Indicadores financeiros e operacionais."
      />

      <div className="report-grid">
        <div className="report-card">
          <BarChart3 size={25} />
          <h3>Receita por viatura</h3>
          <p>Comparação de receitas da frota.</p>
          <button className="btn btn-secondary" onClick={()=>actions.navigate("vehicles")}>Ver viaturas</button>
        </div>

        <div className="report-card">
          <CreditCard size={25} />
          <h3>Pagamentos</h3>
          <p>Mapa semanal de pagamentos.</p>
          <button className="btn btn-secondary" onClick={()=>actions.navigate("payments")}>Ver pagamentos</button>
        </div>

        <div className="report-card">
          <Car size={25} />
          <h3>Utilização da frota</h3>
          <p>Disponibilidade e utilização.</p>
          <button className="btn btn-secondary" onClick={()=>actions.navigate("operation")}>Ver operação</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DEFINIÇÕES
========================================================= */

function SettingsPage({ onOpenEmailSettings }) {
  return (
    <div className="page">
      <PageHeader
        title="Definições"
        description="Configuração da plataforma."
      />

      <div className="settings-grid">
        <div className="settings-card">
          <Building2 size={22} />
          <h3>Empresa</h3>
          <p>Dados da empresa, NIF e morada.</p>
          <span className="settings-availability">Disponível com integração</span>
        </div>

        <div className="settings-card">
          <Wallet size={22} />
          <h3>Pagamentos</h3>
          <p>IBAN, comissões e regras de apuramento.</p>
          <span className="settings-availability">Disponível com integração</span>
        </div>

        <div className="settings-card">
          <Bell size={22} />
          <h3>Notificações</h3>
          <p>Alertas e notificações automáticas.</p>
          <span className="settings-availability">Disponível com integração</span>
        </div>

        <div className="settings-card">
          <EnvelopeSimple size={22} />
          <h3>Email</h3>
          <p>Servidor SMTP e envio de email de teste.</p>
          <button type="button" className="btn btn-secondary" onClick={onOpenEmailSettings}>Configurar email</button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE HEADER
========================================================= */

function PageHeader({ title, description, button, onClick }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {button && (
        <button className="btn btn-primary" onClick={onClick}>
          <Plus size={17} />
          {button}
        </button>
      )}
    </div>
  );
}

/* =========================================================
   APP
========================================================= */

export default function App({ onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [navSearch,setNavSearch]=useState('');

  const [modal, setModal] = useState({open:false,type:null,data:null});
  const [db,setDb]=useState(()=>({owners,vehicles,vehicleAssets:vehicleModelCatalog,drivers:initialDrivers,contracts:initialContracts,payments:payments.map((p,i)=>({...p,vehicle:vehicles[i].plate,adjustments:0})),documents:initialDocuments.map(d=>({...d,entityKey:`owner:${owners.find(o=>o.name===d.entity)?.id}`})),crmLeads:initialLeads,retakes:initialRetakes,invoices:initialInvoices}));
  const [profile,setProfile]=useState({name:'Administrador',email:'',phone:'',role:'Administrador'});
  const [teamMembers,setTeamMembers]=useState([{id:'self',name:'Administrador',email:'',role:'Administrador',status:'Ativo'}]);
  const [emailTemplates,setEmailTemplates]=useState(starterTemplates);
  const [toast,setToast]=useState(null);
  const toastTimer=useRef(null);const closeTimer=useRef(null);
  useEffect(()=>()=>{clearTimeout(toastTimer.current);clearTimeout(closeTimer.current);},[]);
  const showToast=useCallback((message,type='success')=>{clearTimeout(toastTimer.current);setToast({message,type});toastTimer.current=setTimeout(()=>setToast(null),3500);},[]);
  const openModal=useCallback((type,data=null)=>{clearTimeout(closeTimer.current);document.querySelector('.modal-overlay')?.classList.remove('modal-closing');setModal({open:true,type,data});},[]);
  const closeModal=useCallback(()=>{document.querySelector('.modal-overlay')?.classList.add('modal-closing');clearTimeout(closeTimer.current);closeTimer.current=setTimeout(()=>setModal({open:false,type:null,data:null}),160);},[]);
  const saveRecord=(kind,record)=>setDb(current=>{
    const key=entityMeta[kind][0];const previous=current[key].find(r=>r.id===record.id);
    const cleanRecord={...record};delete cleanRecord.printMode;
    const nextRecord={...cleanRecord,id:record.id||`${kind.toUpperCase()}-${crypto.randomUUID().slice(0,8)}`};
    const next={...current,[key]:previous?current[key].map(r=>r.id===record.id?nextRecord:r):[...current[key],nextRecord]};
    if(kind==='owner'&&previous&&previous.name!==record.name){
      ['vehicles','contracts','payments','retakes'].forEach(k=>next[k]=next[k].map(r=>r.owner===previous.name?{...r,owner:record.name}:r));
      next.documents=next.documents.map(d=>d.entityKey===`owner:${record.id}`?{...d,entity:record.name}:d);
    }
    if(kind==='vehicle'&&previous&&previous.plate!==record.plate){
      ['drivers','contracts','payments','crmLeads'].forEach(k=>next[k]=next[k].map(r=>r.vehicle===previous.plate?{...r,vehicle:record.plate}:r));
      next.documents=next.documents.map(d=>d.entityKey===`vehicle:${record.id}`?{...d,entity:record.plate}:d);
      next.retakes=next.retakes.map(r=>r.plate===previous.plate?{...r,plate:record.plate}:r);
    }
    if(kind==='driver'){
      next.vehicles=next.vehicles.map(v=>v.plate===record.vehicle?{...v,driver:record.name}:v.driver===(previous?.name||record.name)?{...v,driver:''}:v);
      next.drivers=next.drivers.map(d=>d.id!==nextRecord.id&&record.vehicle&&d.vehicle===record.vehicle?{...d,vehicle:''}:d);
      next.documents=next.documents.map(d=>d.entityKey===`driver:${record.id}`?{...d,entity:record.name}:d);
    }
    if(kind==='vehicle'){
      next.drivers=next.drivers.map(d=>d.name===record.driver?{...d,vehicle:record.plate}:d.vehicle===(previous?.plate||record.plate)?{...d,vehicle:''}:d);
      next.vehicles=next.vehicles.map(v=>v.id!==nextRecord.id&&record.driver&&v.driver===record.driver?{...v,driver:''}:v);
    }
    return next;
  });
  const deleteRecord=(kind,record)=>setDb(current=>{
    const key=entityMeta[kind][0];const next={...current,[key]:current[key].filter(r=>r.id!==record.id)};
    if(kind==='driver')next.vehicles=next.vehicles.map(v=>v.driver===record.name?{...v,driver:''}:v);
    if(kind==='vehicle')next.drivers=next.drivers.map(d=>d.vehicle===record.plate?{...d,vehicle:''}:d);
    return next;
  });
  const requestDelete=(kind,record)=>openModal('confirmation',{title:`Apagar ${singularLabel[kind]}?`,message:`${record.name||record.number||record.plate||record.id} será removido desta sessão. Esta acção não pode ser desfeita.`,confirmLabel:'Apagar',variant:'danger',onConfirm:()=>{deleteRecord(kind,record);showToast(`${singularLabel[kind]} apagado com sucesso.`);}});
  const addVehicleAsset=(file,brand='',model='',label='')=>{const asset={id:`image-${crypto.randomUUID()}`,brand,model,label:label||[brand,model].filter(Boolean).join(' ')||file.name,file,kind:'Imagem importada'};setDb(current=>({...current,vehicleAssets:[...current.vehicleAssets,asset]}));return asset;};
  const deleteVehicleAsset=asset=>openModal('confirmation',{title:'Apagar imagem?',message:`${asset.label} será removida da biblioteca desta sessão.`,confirmLabel:'Apagar',variant:'danger',onConfirm:()=>{setDb(current=>({...current,vehicleAssets:current.vehicleAssets.filter(item=>item.id!==asset.id)}));showToast('Imagem removida da biblioteca.');}});
  const saveProfile=updated=>{setProfile(updated);setTeamMembers(current=>current.map(member=>member.id==='self'?{...member,name:updated.name,email:updated.email,role:updated.role}:member));};
  const saveTeamMember=member=>{const saved={...member,id:member.id||`member-${crypto.randomUUID()}`};setTeamMembers(current=>current.some(item=>item.id===saved.id)?current.map(item=>item.id===saved.id?saved:item):[...current,saved]);if(saved.id==='self')setProfile(current=>({...current,name:saved.name,email:saved.email,role:saved.role}));};
  const deleteTeamMember=member=>openModal('confirmation',{title:'Apagar membro?',message:`${member.name} será removido da equipa desta sessão.`,confirmLabel:'Apagar',variant:'danger',onConfirm:()=>{setTeamMembers(current=>current.filter(item=>item.id!==member.id));showToast('Membro removido da equipa.');}});
  const saveEmailTemplate=template=>setEmailTemplates(current=>current.map(item=>item.id===template.id?template:item));
  const actions={db,openModal,requestDelete,navigate:setActivePage,openOwner:()=>openModal('owner-create'),openVehicle:()=>openModal('vehicle-create'),openDriver:()=>openModal('driver-create'),openContract:()=>openModal('contract-create'),openPayment:()=>openModal('payment-create'),openDocument:()=>openModal('document-upload'),openInvoice:()=>openModal('invoice-create'),openVehicleDetails:vehicle=>openModal('vehicle-view',vehicle)};

  const renderPage = () => {
    switch (activePage) {
      case "owners":
        return <Owners actions={actions} />;

      case "vehicles":
        return <Vehicles actions={actions} />;

      case "vehicle-library":
        return <VehicleLibraryPage assets={db.vehicleAssets} vehicles={db.vehicles} onCreate={asset=>openModal('vehicle-create',{brand:asset.brand,model:asset.model,imageId:asset.id})} onAdd={()=>openModal('vehicle-image-create')} onDelete={deleteVehicleAsset}/>;

      case "drivers":
        return <Drivers actions={actions} />;

      case "contracts":
        return <Contracts actions={actions} />;

      case "operation":
        return <Operation actions={actions} />;

      case "payments":
        return <Payments actions={actions} />;

      case "documents":
        return <Documents actions={actions} />;

      case "crm":
        return <CRM actions={actions} />;

      case "retakes":
        return <Retakes actions={actions} />;

      case "billing":
        return <Billing actions={actions} />;

      case "team":
        return <TeamPage members={teamMembers} onCreate={()=>openModal('team-create')} onEdit={member=>openModal('team-edit',member)} onDelete={deleteTeamMember} onTemplates={()=>setActivePage('email-templates')}/>;

      case "email-templates":
        return <EmailTemplatesPage templates={emailTemplates} profile={profile} onEdit={template=>openModal('template-edit',template)} showToast={showToast}/>;

      case "email-settings":
        return <EmailSettings onClose={()=>setActivePage('settings')} showToast={showToast} />;

      case "reports":
        return <Reports actions={actions} />;

      case "settings":
        return <SettingsPage onOpenEmailSettings={()=>setActivePage('email-settings')} />;

      default:
        return <Dashboard actions={actions} />;
    }
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
      <aside className={`sidebar ${mobileMenu ? "mobile-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Car size={20} />
          </div>

          <div>
            <strong>TVDE Fleet</strong>
            <span>Gestão de frota</span>
          </div>

          <button
            className="mobile-close" aria-label="Fechar menu"
            onClick={() => setMobileMenu(false)}
          >
            <X size={19} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-title">WORKSPACE / PORTUGAL</div>

          {menu.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`nav-item ${
                  activePage === item.id ? "active" : ""
                }`} aria-current={activePage===item.id?"page":undefined}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileMenu(false);
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            key="email-settings"
            className={`nav-item ${activePage === "email-settings" ? "active" : ""}`} aria-current={activePage === "email-settings" ? "page" : undefined}
            onClick={() => {
              setActivePage("email-settings");
              setMobileMenu(false);
            }}
          >
            <Settings size={18} />
            <span>Definições de Email</span>
          </button>
        </nav>

        <div className="sidebar-user"><ProfileMenu profile={profile} onLogout={onLogout} placement="up" onEdit={()=>openModal('profile-edit')} onTeam={()=>{setActivePage('team');setMobileMenu(false);}} onTemplates={()=>{setActivePage('email-templates');setMobileMenu(false);}}/></div>
      </aside>

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <main className="main">
        <header className="topbar">
          <button
            className="mobile-menu" aria-label="Abrir menu"
            onClick={() => setMobileMenu(true)}
          >
            <MenuIcon />
          </button>

          <div className="global-search">
            <Search size={17} />
            <input aria-label="Pesquisar módulos" placeholder="Pesquisar módulos…" value={navSearch} onChange={e=>setNavSearch(e.target.value)} />
            {navSearch&&<div className="module-search-results">{menu.filter(item=>item.label.toLocaleLowerCase('pt').includes(navSearch.toLocaleLowerCase('pt'))).map(item=><button key={item.id} onClick={()=>{setActivePage(item.id);setNavSearch('');}}>{item.label}<ArrowRight size={14}/></button>)}{!menu.some(item=>item.label.toLocaleLowerCase('pt').includes(navSearch.toLocaleLowerCase('pt')))&&<p>Sem módulos encontrados.</p>}</div>}
          </div>

          <div className="topbar-actions">
            <span className="session-chip"><span/>Demonstração</span><button className="icon-button notification-button" aria-label="Ver avisos" onClick={()=>openModal("warning",{title:"Documentos a rever",message:"Licença TVDE de 45-EF-67: o registo de demonstração indica validade de 14 dias.",onAction:()=>{closeModal();setActivePage("documents");}})}>
              <Bell size={19} />
              <span />
            </button>

            <ProfileMenu profile={profile} onLogout={onLogout} compact onEdit={()=>openModal('profile-edit')} onTeam={()=>setActivePage('team')} onTemplates={()=>setActivePage('email-templates')}/>
          </div>
        </header>

        <section className="content" id="main-content" tabIndex={-1}>{renderPage()}</section>
      </main>

      <ModalManager key={`${modal.type}-${modal.data?.id||'new'}`} modal={modal} closeModal={closeModal} openModal={openModal} showToast={showToast} db={db} saveRecord={saveRecord} requestDelete={requestDelete} profile={profile} onSaveProfile={saveProfile} onSaveMember={saveTeamMember} onSaveTemplate={saveEmailTemplate} onAddVehicleAsset={addVehicleAsset}/>

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}

function MenuIcon() {
  return <List size={20} />;
}

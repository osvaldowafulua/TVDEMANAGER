import { useEffect, useId, useRef, useState } from 'react';
import { UserCircle, CaretDown, CaretUp, Pencil, UsersThree, EnvelopeSimple, Plus, Trash, Copy, Check } from '@phosphor-icons/react';

const ROLE_DETAILS = {
  Administrador: 'Gestão integral do espaço de trabalho.',
  Gestor: 'Acompanha frota, documentos e operações.',
  Leitura: 'Consulta registos sem alterações.',
};

export const starterTemplates = [
  { id: 'team-invite', title: 'Convite para a equipa', subject: 'Convite para a equipa TVDE Fleet', body: 'Olá {nome},\n\nPreparámos o seu acesso à equipa TVDE Fleet com o papel {papel}. Confirme os dados com o administrador para concluir a entrada.\n\nObrigado,\nEquipa TVDE Fleet', category: 'Equipa' },
  { id: 'document-expiry', title: 'Documento a expirar', subject: 'Documento a rever · TVDE Fleet', body: 'Olá {nome},\n\nExiste um documento associado à sua operação que precisa de revisão. Consulte o registo na plataforma e confirme os dados antes da data de validade.\n\nObrigado,\nEquipa TVDE Fleet', category: 'Operação' },
  { id: 'contract-created', title: 'Contrato disponível', subject: 'Contrato para revisão · TVDE Fleet', body: 'Olá {nome},\n\nO contrato da sua viatura está disponível para revisão na TVDE Fleet. Confirme as condições registadas antes de qualquer assinatura.\n\nObrigado,\nEquipa TVDE Fleet', category: 'Contratos' },
];

function Avatar({ profile, size = 19 }) {
  return profile.avatar ? <img src={profile.avatar} alt="" className="profile-avatar-image" /> : <UserCircle size={size} aria-hidden="true" />;
}

export function ProfileMenu({ profile, placement = 'down', compact = false, onEdit, onTeam, onTemplates }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const closeOutside = event => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const closeEscape = event => { if (event.key === 'Escape') { setOpen(false); rootRef.current?.querySelector('.profile-trigger')?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeEscape); };
  }, [open]);
  const choose = callback => { setOpen(false); callback(); };
  return <div className={`profile-menu profile-menu--${placement} ${compact ? 'profile-menu--compact' : ''}`} ref={rootRef}>
    <button type="button" className="profile-trigger" aria-label="Abrir menu do perfil" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(value => !value)} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); requestAnimationFrame(() => rootRef.current?.querySelector('[role="menuitem"]')?.focus()); } }}>
      <span className="profile-trigger-avatar"><Avatar profile={profile} size={compact ? 21 : 24} /></span>
      {!compact && <span className="profile-trigger-copy"><strong>{profile.name}</strong><small>{profile.role}</small></span>}
      {!compact && (placement === 'up' ? <CaretUp size={14} /> : <CaretDown size={14} />)}
    </button>
    {open && <div className="profile-popover" role="menu" aria-label="Menu do perfil">
      <div className="profile-popover-head"><strong>{profile.name}</strong><span>{profile.email || 'Email por definir'}</span><small>{profile.role}</small></div>
      <button role="menuitem" onClick={() => choose(onEdit)}><Pencil size={16} />Editar perfil</button>
      <button role="menuitem" onClick={() => choose(onTeam)}><UsersThree size={16} />Equipa e papéis</button>
      <button role="menuitem" onClick={() => choose(onTemplates)}><EnvelopeSimple size={16} />Modelos de email</button>
    </div>}
  </div>;
}

export function ProfileForm({ profile, ModalComponent, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...profile }));
  const [error, setError] = useState('');
  const formId = useId();
  const submit = event => {
    event.preventDefault();
    if (!form.name.trim()) { setError('Indique o nome.'); return; }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Introduza um email válido.'); return; }
    onSave({ ...form, name: form.name.trim(), email: form.email.trim() });
  };
  return <ModalComponent open title="Editar perfil" subtitle="Dados guardados apenas nesta sessão" onClose={onClose} size="md" footer={<><button className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit" form={formId}><Check size={16} />Guardar perfil</button></>}>
    <form id={formId} className="workspace-form" onSubmit={submit} noValidate>
      <label>Nome <span>*</span><input className="form-input" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label>
      <label>Email<input className="form-input" type="email" value={form.email || ''} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="nome@empresa.pt" /></label>
      <label>Telefone<input className="form-input" type="tel" value={form.phone || ''} onChange={event => setForm({ ...form, phone: event.target.value })} placeholder="+351 ..." /></label>
      <div className="workspace-readonly"><span>Papel na equipa</span><strong>{form.role}</strong></div>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  </ModalComponent>;
}

export function TeamPage({ members, onCreate, onEdit, onDelete, onTemplates }) {
  return <div className="page"><div className="page-header"><div><h1>Equipa</h1><p>Utilizadores e papéis desta sessão de demonstração.</p></div><button className="btn btn-primary" onClick={onCreate}><Plus size={16} />Adicionar membro</button></div>
    <div className="role-grid">{Object.entries(ROLE_DETAILS).map(([role, description]) => <div className="role-card" key={role}><span>{role}</span><p>{description}</p></div>)}</div>
    <div className="panel"><div className="panel-header"><div><h2>Membros</h2><p>{members.length} {members.length === 1 ? 'registo' : 'registos'} locais</p></div><button className="btn btn-secondary" onClick={onTemplates}><EnvelopeSimple size={16} />Modelos de email</button></div><div className="table-container"><table><thead><tr><th>Nome</th><th>Email</th><th>Papel</th><th>Estado</th><th>Acções</th></tr></thead><tbody>{members.map(member => <tr key={member.id} className="record-row" tabIndex={0} aria-label={`Editar membro ${member.name}`} onClick={() => onEdit(member)} onKeyDown={event => { if (event.target === event.currentTarget && ['Enter', ' '].includes(event.key)) { event.preventDefault(); onEdit(member); } }}><td><strong>{member.name}</strong></td><td>{member.email || 'Por definir'}</td><td>{member.role}</td><td>{member.status}</td><td><div className="row-actions"><button className="action-icon" aria-label={`Editar ${member.name}`} title="Editar" onClick={event => { event.stopPropagation(); onEdit(member); }}><Pencil size={17} /></button>{member.id !== 'self' && <button className="action-icon is-danger" aria-label={`Apagar ${member.name}`} title="Apagar" onClick={event => { event.stopPropagation(); onDelete(member); }}><Trash size={17} /></button>}</div></td></tr>)}</tbody></table></div></div>
  </div>;
}

export function TeamForm({ member, ModalComponent, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ name: '', email: '', role: 'Gestor', status: 'Por convidar', ...member }));
  const [error, setError] = useState('');
  const formId = useId();
  const submit = event => { event.preventDefault(); if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Indique o nome e um email válido.'); return; } onSave({ ...form, name: form.name.trim(), email: form.email.trim() }); };
  return <ModalComponent open title={member ? 'Editar membro' : 'Adicionar membro'} subtitle="A equipa é demonstrativa; não é enviado nenhum convite." onClose={onClose} size="md" footer={<><button className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit" form={formId}><Check size={16} />Guardar membro</button></>}><form id={formId} className="workspace-form" onSubmit={submit} noValidate><label>Nome <span>*</span><input className="form-input" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} /></label><label>Email <span>*</span><input className="form-input" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} /></label><label>Papel<select className="form-select" value={form.role} onChange={event => setForm({ ...form, role: event.target.value })}>{Object.keys(ROLE_DETAILS).map(role => <option key={role}>{role}</option>)}</select></label><label>Estado<select className="form-select" value={form.status} onChange={event => setForm({ ...form, status: event.target.value })}><option>Por convidar</option><option>Ativo</option><option>Inativo</option></select></label>{error && <p className="form-error" role="alert">{error}</p>}</form></ModalComponent>;
}

function renderTemplateText(value, profile) { return value.replaceAll('{nome}', profile.name || 'Nome').replaceAll('{papel}', profile.role || 'Papel').replaceAll('{empresa}', 'TVDE Fleet'); }

export function EmailTemplatesPage({ templates, profile, onEdit, showToast }) {
  const [selected, setSelected] = useState(templates[0]?.id || '');
  const template = templates.find(item => item.id === selected) || templates[0];
  const copy = async () => { if (!template) return; try { await navigator.clipboard.writeText(`Assunto: ${renderTemplateText(template.subject, profile)}\n\n${renderTemplateText(template.body, profile)}`); showToast('Modelo copiado para a área de transferência.'); } catch { showToast('Não foi possível copiar automaticamente.', 'warning'); } };
  return <div className="page"><div className="page-header"><div><h1>Modelos de email</h1><p>Textos editáveis para a equipa e a operação. Nenhuma mensagem é enviada.</p></div></div><div className="email-template-layout"><div className="template-list">{templates.map(item => <button className={`template-item ${template?.id === item.id ? 'active' : ''}`} key={item.id} onClick={() => setSelected(item.id)}><span>{item.category}</span><strong>{item.title}</strong><small>{item.subject}</small></button>)}</div>{template && <div className="template-preview panel"><div className="panel-header"><div><h2>{template.title}</h2><p>Pré-visualização com dados de exemplo</p></div><div className="file-actions"><button className="btn btn-secondary" onClick={() => onEdit(template)}><Pencil size={16} />Editar</button><button className="btn btn-primary" onClick={copy}><Copy size={16} />Copiar</button></div></div><div className="template-message"><div><span>Assunto</span><strong>{renderTemplateText(template.subject, profile)}</strong></div><p>{renderTemplateText(template.body, profile)}</p></div><p className="template-hint">Variáveis disponíveis: {'{nome}'}, {'{papel}'}, {'{empresa}'}.</p></div>}</div></div>;
}

export function TemplateForm({ template, ModalComponent, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...template }));
  const [error, setError] = useState('');
  const formId = useId();
  const submit = event => { event.preventDefault(); if (!form.title.trim() || !form.subject.trim() || !form.body.trim()) { setError('Preencha o nome, o assunto e o corpo.'); return; } onSave(form); };
  return <ModalComponent open title="Editar modelo de email" subtitle="As alterações ficam apenas nesta sessão" onClose={onClose} size="lg" footer={<><button className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit" form={formId}><Check size={16} />Guardar modelo</button></>}><form id={formId} className="workspace-form" onSubmit={submit} noValidate><label>Nome do modelo<input className="form-input" value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} /></label><label>Assunto<input className="form-input" value={form.subject} onChange={event => setForm({ ...form, subject: event.target.value })} /></label><label>Corpo<textarea className="form-input form-textarea" rows={10} value={form.body} onChange={event => setForm({ ...form, body: event.target.value })} /></label>{error && <p className="form-error" role="alert">{error}</p>}</form></ModalComponent>;
}

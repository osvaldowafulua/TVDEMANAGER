import { useState } from 'react';
import { CheckCircle, Warning, Headset, Phone, EnvelopeSimple, FileText, Receipt, Gauge, SteeringWheel, User } from '@phosphor-icons/react';
import { useAuth } from '../auth/AuthContext';
import { owners, vehicles, payments, initialDrivers, initialContracts, initialDocuments, initialInvoices } from '../data/demo.js';
import { vehicleModelCatalog, VehicleAssetImage } from '../VehicleLibrary.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { money, formatDate } from '../lib/format.js';

const LICENSE_WARNING_DAYS = 30;
const SUPPORT = { phone: '+351 210 000 000', email: 'suporte@tvdefleet.pt', hours: 'Dias úteis, 09:00–19:00' };

// No admin cada apuramento está associado à viatura com o mesmo índice; o painel segue a mesma regra.
const paymentRows = payments.map((payment, i) => ({ ...payment, vehicle: payment.vehicle || vehicles[i]?.plate }));

function statusType(status = '') {
  if (['Pago', 'Paga', 'Ativo', 'Activo', 'Válido', 'Válida', 'Em operação', 'Emitida'].includes(status)) return 'success';
  if (['Pendente', 'A validar', 'Em validação', 'Manutenção', 'Em manutenção'].includes(status) || status.startsWith('Expira')) return 'warning';
  return 'default';
}

// Dados visíveis para o utilizador autenticado, a partir dos mesmos dados de demonstração do admin.
function scopeFor(user, role) {
  const name = user?.name;
  if (role === 'driver') {
    const vehicle = vehicles.find(v => v.driver === name);
    return {
      vehicles: vehicle ? [vehicle] : [],
      driver: initialDrivers.find(d => d.name === name),
      documents: initialDocuments.filter(d => d.entity === name || (vehicle && d.name.includes(vehicle.plate))),
      contracts: [],
      payments: [],
      invoices: [],
    };
  }
  return {
    owner: owners.find(o => o.name === name),
    vehicles: vehicles.filter(v => v.owner === name),
    documents: initialDocuments.filter(d => d.entity === name),
    contracts: initialContracts.filter(c => c.owner === name),
    payments: paymentRows.filter(p => p.owner === name),
    invoices: initialInvoices.filter(i => i.customer === name),
  };
}

function PageHead({ title, description }) {
  return (
    <header className="user-page-head">
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </header>
  );
}

function EmptyState({ children }) {
  return <p className="user-empty">{children}</p>;
}

function LicenseStatus({ days }) {
  if (days == null) return <span className="user-compliance-value">Não indicada</span>;
  const expiring = days <= LICENSE_WARNING_DAYS;
  return (
    <span className={`user-compliance-value ${expiring ? 'is-warning' : 'is-ok'}`}>
      {expiring ? <Warning size={16} aria-hidden="true" /> : <CheckCircle size={16} aria-hidden="true" />}
      {expiring ? `Expira em ${days} dias` : `Válida · ${days} dias`}
    </span>
  );
}

function ComplianceItem({ label, value }) {
  const ok = ['Válido', 'Válida'].includes(value);
  return (
    <div className="user-compliance-item">
      <dt>{label}</dt>
      <dd>
        <span className={`user-compliance-value ${ok ? 'is-ok' : 'is-warning'}`}>
          {ok ? <CheckCircle size={16} aria-hidden="true" /> : <Warning size={16} aria-hidden="true" />}
          {value || 'Por confirmar'}
        </span>
      </dd>
    </div>
  );
}

function VehiclePanel({ vehicle, role }) {
  const asset = vehicleModelCatalog.find(item => item.id === vehicle.imageId);
  return (
    <article className="user-vehicle" aria-labelledby={`vehicle-${vehicle.id}`}>
      <div className="user-vehicle-image">
        <VehicleAssetImage asset={asset} alt={`${vehicle.brand} ${vehicle.model}`} />
      </div>
      <div className="user-vehicle-body">
        <div className="user-vehicle-title">
          <div>
            <h2 id={`vehicle-${vehicle.id}`}>{vehicle.brand} {vehicle.model} <span>{vehicle.year}</span></h2>
            <p className="user-plate">{vehicle.plate}</p>
          </div>
          <StatusBadge type={statusType(vehicle.status)}>{vehicle.status}</StatusBadge>
        </div>

        <dl className="user-facts">
          <div>
            <dt>{role === 'driver' ? 'Proprietário' : 'Motorista'}</dt>
            <dd>{(role === 'driver' ? vehicle.owner : vehicle.driver) || 'Sem motorista atribuído'}</dd>
          </div>
          <div>
            <dt>Quilometragem</dt>
            <dd><Gauge size={16} aria-hidden="true" /> {Number(vehicle.km).toLocaleString('pt-PT')} km</dd>
          </div>
        </dl>

        <dl className="user-compliance">
          <div className="user-compliance-item">
            <dt>Licença TVDE</dt>
            <dd><LicenseStatus days={vehicle.license} /></dd>
          </div>
          <ComplianceItem label="Inspecção" value={vehicle.inspection} />
          <ComplianceItem label="Seguro" value={vehicle.insurance} />
        </dl>
      </div>
    </article>
  );
}

function VehiclesPage({ scope, role }) {
  const expiring = scope.vehicles.filter(v => v.license != null && v.license <= LICENSE_WARNING_DAYS);

  if (role === 'driver') {
    const vehicle = scope.vehicles[0];
    return (
      <>
        <PageHead title="A minha viatura" description="Viatura atribuída, estado da licença TVDE e contactos de suporte." />
        {vehicle ? <VehiclePanel vehicle={vehicle} role={role} /> : <EmptyState>Ainda não tem uma viatura atribuída. Contacte o gestor de frota.</EmptyState>}

        <section className="user-section" aria-labelledby="driver-licence">
          <h2 id="driver-licence" className="user-section-title">Carta de condução</h2>
          <dl className="user-facts">
            <div><dt>Número</dt><dd className="user-mono">{scope.driver?.license || 'Por indicar'}</dd></div>
            <div><dt>Estado</dt><dd><StatusBadge type={statusType(scope.driver?.status)}>{scope.driver?.status || 'Por confirmar'}</StatusBadge></dd></div>
          </dl>
        </section>

        <section className="user-section" aria-labelledby="driver-support">
          <h2 id="driver-support" className="user-section-title">Suporte à operação</h2>
          <ul className="user-contact-list">
            <li><Phone size={18} aria-hidden="true" /><a href={`tel:${SUPPORT.phone.replace(/\s/g, '')}`}>{SUPPORT.phone}</a></li>
            <li><EnvelopeSimple size={18} aria-hidden="true" /><a href={`mailto:${SUPPORT.email}`}>{SUPPORT.email}</a></li>
            <li><Headset size={18} aria-hidden="true" /><span>{SUPPORT.hours}</span></li>
          </ul>
        </section>
      </>
    );
  }

  const inOperation = scope.vehicles.filter(v => v.status === 'Em operação').length;
  return (
    <>
      <PageHead
        title="As minhas viaturas"
        description={`${scope.vehicles.length} ${scope.vehicles.length === 1 ? 'viatura' : 'viaturas'} · ${inOperation} em operação`}
      />
      {expiring.length > 0 && (
        <div className="user-alert" role="status">
          <Warning size={18} aria-hidden="true" />
          <span>
            {expiring.map(v => `Licença TVDE de ${v.plate} expira em ${v.license} dias`).join(' · ')}. Envie a renovação ao gestor de frota.
          </span>
        </div>
      )}
      {scope.vehicles.length
        ? <div className="user-stack">{scope.vehicles.map(vehicle => <VehiclePanel key={vehicle.id} vehicle={vehicle} role={role} />)}</div>
        : <EmptyState>Ainda não tem viaturas registadas. Contacte o gestor de frota para adicionar a primeira viatura.</EmptyState>}
    </>
  );
}

function PaymentsPage({ scope }) {
  const received = scope.payments.filter(p => p.status === 'Pago').reduce((sum, p) => sum + p.net, 0);
  const pending = scope.payments.filter(p => p.status !== 'Pago').reduce((sum, p) => sum + p.net, 0);
  const last = scope.payments[scope.payments.length - 1];

  return (
    <>
      <PageHead title="Pagamentos" description="Apuramentos semanais das suas viaturas e facturas emitidas." />

      <dl className="user-summary">
        <div><dt>Recebido</dt><dd>{money(received)}</dd></div>
        <div><dt>Por receber</dt><dd>{money(pending)}</dd></div>
        <div><dt>Último apuramento</dt><dd>{last ? last.period : '—'}</dd></div>
      </dl>

      <section className="user-section" aria-labelledby="payments-title">
        <h2 id="payments-title" className="user-section-title">Apuramentos</h2>
        {scope.payments.length ? (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr><th scope="col">Referência</th><th scope="col">Período</th><th scope="col">Viatura</th><th scope="col" className="num">Bruto</th><th scope="col" className="num">Comissão</th><th scope="col" className="num">Líquido</th><th scope="col">Estado</th></tr>
              </thead>
              <tbody>
                {scope.payments.map(p => (
                  <tr key={p.id}>
                    <td className="user-mono">{p.id}</td>
                    <td>{p.period}</td>
                    <td className="user-mono">{p.vehicle || '—'}</td>
                    <td className="num">{money(p.gross)}</td>
                    <td className="num">−{money(p.commission)}</td>
                    <td className="num"><strong>{money(p.net)}</strong></td>
                    <td><StatusBadge type={statusType(p.status)}>{p.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>Ainda não existem apuramentos. O primeiro aparece no fim da primeira semana de operação.</EmptyState>}
      </section>

      <section className="user-section" aria-labelledby="invoices-title">
        <h2 id="invoices-title" className="user-section-title">Facturas</h2>
        {scope.invoices.length ? (
          <div className="user-table-wrap">
            <table className="user-table">
              <thead>
                <tr><th scope="col">Número</th><th scope="col">Data</th><th scope="col">Descrição</th><th scope="col" className="num">Total</th><th scope="col">Estado</th></tr>
              </thead>
              <tbody>
                {scope.invoices.map(inv => (
                  <tr key={inv.id}>
                    <td className="user-mono">{inv.number}</td>
                    <td>{formatDate(inv.date)}</td>
                    <td>{inv.items.map(item => item.description).join(', ')}</td>
                    <td className="num"><strong>{money(inv.total)}</strong></td>
                    <td><StatusBadge type={statusType(inv.status)}>{inv.status}</StatusBadge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState>Sem facturas emitidas.</EmptyState>}
        <p className="user-footnote">Documentos de demonstração, sem validade fiscal.</p>
      </section>
    </>
  );
}

function DocumentsPage({ scope, role }) {
  return (
    <>
      <PageHead
        title="Documentos"
        description={role === 'driver' ? 'Documentos pessoais e da viatura atribuída.' : 'Contratos e documentos associados às suas viaturas.'}
      />

      {role === 'owner' && (
        <section className="user-section" aria-labelledby="contracts-title">
          <h2 id="contracts-title" className="user-section-title">Contratos</h2>
          {scope.contracts.length ? (
            <ul className="user-doc-list">
              {scope.contracts.map(c => (
                <li key={c.id}>
                  <FileText size={22} aria-hidden="true" />
                  <div>
                    <strong>{c.contractType} · <span className="user-mono">{c.vehicle}</span></strong>
                    <small><span className="user-mono">{c.id}</span> · {formatDate(c.start)} a {formatDate(c.end)} · {c.frequency}, comissão {money(c.commission)}</small>
                  </div>
                  <StatusBadge type={statusType(c.status)}>{c.status}</StatusBadge>
                </li>
              ))}
            </ul>
          ) : <EmptyState>Sem contratos activos.</EmptyState>}
        </section>
      )}

      <section className="user-section" aria-labelledby="documents-title">
        <h2 id="documents-title" className="user-section-title">Documentos</h2>
        {scope.documents.length ? (
          <ul className="user-doc-list">
            {scope.documents.map(d => (
              <li key={d.id}>
                {d.type === 'Outro' ? <Receipt size={22} aria-hidden="true" /> : <FileText size={22} aria-hidden="true" />}
                <div>
                  <strong>{d.name}</strong>
                  <small>{d.type}</small>
                </div>
                <StatusBadge type={statusType(d.status)}>{d.status}</StatusBadge>
              </li>
            ))}
          </ul>
        ) : <EmptyState>Sem documentos. Envie os seus documentos ao gestor de frota para ficarem aqui disponíveis.</EmptyState>}
      </section>
    </>
  );
}

function ProfilePage({ scope, role }) {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ phone: user?.phone || '', contactEmail: user?.contactEmail || scope.owner?.email || '' });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const submit = event => {
    event.preventDefault();
    const next = {};
    if (!/^\+?[\d\s]{9,16}$/.test(form.phone.trim())) next.phone = 'Indique um telefone válido, por exemplo +351 910 000 000.';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) next.contactEmail = 'Email inválido.';
    setErrors(next);
    setSaved(false);
    if (Object.keys(next).length) return;
    updateUser({ phone: form.phone.trim(), contactEmail: form.contactEmail.trim() });
    setSaved(true);
  };

  const update = key => event => { setForm(v => ({ ...v, [key]: event.target.value })); setSaved(false); };

  return (
    <>
      <PageHead title="Perfil" description="Os seus dados na TVDE Fleet." />

      <section className="user-section" aria-labelledby="identity-title">
        <h2 id="identity-title" className="user-section-title">Identificação</h2>
        <div className="user-identity">
          <span className="user-avatar user-avatar-lg">{user?.name?.split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('')}</span>
          <div>
            <strong>{user?.name}</strong>
            <small>{role === 'driver' ? <><SteeringWheel size={14} aria-hidden="true" /> Motorista</> : <><User size={14} aria-hidden="true" /> Proprietário</>}</small>
          </div>
        </div>
        <dl className="user-facts">
          <div><dt>NIF</dt><dd className="user-mono">{user?.nif || '—'}</dd></div>
          <div><dt>Conta</dt><dd>{user?.email}</dd></div>
          {role === 'owner' && <div><dt>IBAN para pagamentos</dt><dd className="user-mono">{scope.owner?.iban || 'Por indicar'}</dd></div>}
          {role === 'driver' && <div><dt>Carta de condução</dt><dd className="user-mono">{scope.driver?.license || 'Por indicar'}</dd></div>}
        </dl>
        <p className="user-footnote">Para alterar o NIF ou o IBAN, contacte o gestor de frota.</p>
      </section>

      <section className="user-section" aria-labelledby="contacts-title">
        <h2 id="contacts-title" className="user-section-title">Contactos</h2>
        <form className="user-form" onSubmit={submit} noValidate>
          <div className="user-field">
            <label htmlFor="profile-phone">Telefone</label>
            <input id="profile-phone" className="form-input" type="tel" value={form.phone} onChange={update('phone')} aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'profile-phone-error' : undefined} />
            {errors.phone && <span id="profile-phone-error" className="form-error">{errors.phone}</span>}
          </div>
          <div className="user-field">
            <label htmlFor="profile-email">Email de contacto</label>
            <input id="profile-email" className="form-input" type="email" value={form.contactEmail} onChange={update('contactEmail')} aria-invalid={!!errors.contactEmail} aria-describedby={errors.contactEmail ? 'profile-email-error' : undefined} />
            {errors.contactEmail && <span id="profile-email-error" className="form-error">{errors.contactEmail}</span>}
          </div>
          <div className="user-form-actions">
            <button type="submit" className="btn btn-primary">Guardar contactos</button>
            {saved && <span className="user-saved" role="status"><CheckCircle size={16} aria-hidden="true" /> Contactos guardados neste browser.</span>}
          </div>
        </form>
      </section>
    </>
  );
}

export function UserApp({ page }) {
  const { user, role } = useAuth();
  const scope = scopeFor(user, role);

  switch (page) {
    case 'payments': return <PaymentsPage scope={scope} />;
    case 'documents': return <DocumentsPage scope={scope} role={role} />;
    case 'profile': return <ProfilePage scope={scope} role={role} />;
    default: return <VehiclesPage scope={scope} role={role} />;
  }
}


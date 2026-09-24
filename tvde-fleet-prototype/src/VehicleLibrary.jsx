import { useEffect, useId, useRef, useState } from 'react';
import { Car, Images, Plus, UploadSimple, Trash, Check } from '@phosphor-icons/react';

export const vehicleModelCatalog = [
  { id: 'toyota-prius', brand: 'Toyota', model: 'Prius', label: 'Toyota Prius', src: '/vehicles/toyota-prius.svg', kind: 'Ilustração' },
  { id: 'toyota-corolla', brand: 'Toyota', model: 'Corolla', label: 'Toyota Corolla', src: '/vehicles/toyota-corolla.svg', kind: 'Ilustração' },
  { id: 'renault-clio', brand: 'Renault', model: 'Clio', label: 'Renault Clio', src: '/vehicles/renault-clio.svg', kind: 'Ilustração' },
  { id: 'tesla-model-3', brand: 'Tesla', model: 'Model 3', label: 'Tesla Model 3', src: '/vehicles/tesla-model-3.svg', kind: 'Ilustração' },
  { id: 'hyundai-ioniq-5', brand: 'Hyundai', model: 'Ioniq 5', label: 'Hyundai Ioniq 5', src: '/vehicles/hyundai-ioniq-5.svg', kind: 'Ilustração' },
  { id: 'kia-niro', brand: 'Kia', model: 'Niro', label: 'Kia Niro', src: '/vehicles/kia-niro.svg', kind: 'Ilustração' },
];

export const validVehicleImage = file => !!file && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024;

export function VehicleAssetImage({ asset, alt, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!asset?.file || !ref.current) return;
    const url = URL.createObjectURL(asset.file);
    ref.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [asset?.file]);
  if (!asset) return <span className={`vehicle-image-placeholder ${className}`}><Car size={45} aria-hidden="true" /></span>;
  return <img ref={ref} className={className} src={asset.src || undefined} alt={alt || asset.label} loading="lazy" />;
}

export function VehicleImagePicker({ assets, selected, onSelect, onAdd }) {
  const inputRef = useRef(null);
  const [error, setError] = useState('');
  const choose = event => {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (!validVehicleImage(file)) { setError('Escolha JPG, PNG ou WebP até 10 MB.'); return; }
    setError('');
    const asset = onAdd(file);
    onSelect(asset);
  };
  return <section className="vehicle-picker"><div className="vehicle-picker-heading"><div><h3>Imagem da viatura</h3><p>Escolha da biblioteca ou importe uma imagem para esta sessão.</p></div><input ref={inputRef} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={choose} /><button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()}><UploadSimple size={16} />Importar imagem</button></div>
    <div className="vehicle-picker-grid">{assets.map(asset => <button type="button" className={`vehicle-picker-item ${selected === asset.id ? 'selected' : ''}`} key={asset.id} onClick={() => onSelect(asset)} aria-pressed={selected === asset.id}><VehicleAssetImage asset={asset} alt="" /><span>{asset.label}</span>{selected === asset.id && <Check size={16} aria-hidden="true" />}</button>)}</div>
    {error && <p className="form-error" role="alert">{error}</p>}
  </section>;
}

export function VehicleLibraryPage({ assets, vehicles, onCreate, onAdd, onDelete }) {
  const [query, setQuery] = useState('');
  const filtered = assets.filter(asset => `${asset.label} ${asset.brand} ${asset.model}`.toLocaleLowerCase('pt').includes(query.toLocaleLowerCase('pt')));
  return <div className="page"><div className="page-header"><div><h1>Biblioteca de viaturas</h1><p>Modelos e imagens para identificar a frota.</p></div><button className="btn btn-primary" onClick={onAdd}><Plus size={16} />Adicionar imagem</button></div><div className="library-toolbar"><input className="form-input" aria-label="Pesquisar modelos e imagens" placeholder="Pesquisar marca ou modelo…" value={query} onChange={event => setQuery(event.target.value)} /><span>{assets.length} imagens · {vehicleModelCatalog.length} modelos</span></div><div className="vehicle-library-grid">{filtered.map(asset => <article className="vehicle-library-card" key={asset.id}><div className="vehicle-library-image"><VehicleAssetImage asset={asset} alt={`Imagem ${asset.label}`} /></div><div className="vehicle-library-card-body"><div><small>{asset.kind}</small><h2>{asset.label}</h2><p>{asset.brand && asset.model ? `${asset.brand} · ${asset.model}` : 'Imagem personalizada'}</p></div><div className="vehicle-library-card-actions"><button className="btn btn-secondary" onClick={() => onCreate(asset)}><Car size={16} />Criar viatura</button>{asset.file && <button className="action-icon is-danger" title={vehicles.some(vehicle => vehicle.imageId === asset.id) ? 'Imagem em uso' : 'Apagar imagem'} aria-label={`Apagar imagem ${asset.label}`} disabled={vehicles.some(vehicle => vehicle.imageId === asset.id)} onClick={() => onDelete(asset)}><Trash size={17} /></button>}</div></div></article>)}{!filtered.length && <div className="library-empty"><Images size={28} /><strong>Sem imagens encontradas</strong><p>Importe uma imagem ou experimente outra pesquisa.</p></div>}</div><p className="library-disclaimer">As imagens de catálogo são ilustrações. As imagens importadas são guardadas apenas nesta sessão.</p></div>;
}

export function AddVehicleImageModal({ ModalComponent, onSave, onClose }) {
  const [form, setForm] = useState({ label: '', brand: '', model: '', file: null });
  const [error, setError] = useState('');
  const formId = useId();
  const submit = event => { event.preventDefault(); if (!validVehicleImage(form.file)) { setError('Escolha JPG, PNG ou WebP até 10 MB.'); return; } onSave({ ...form, label: form.label.trim() || form.file.name, brand: form.brand.trim(), model: form.model.trim() }); };
  return <ModalComponent open title="Adicionar imagem à biblioteca" subtitle="Ficheiro disponível apenas nesta sessão" onClose={onClose} size="md" footer={<><button className="btn btn-secondary" onClick={onClose}>Cancelar</button><button className="btn btn-primary" type="submit" form={formId}><Check size={16} />Guardar imagem</button></>}><form id={formId} className="workspace-form" onSubmit={submit} noValidate><label>Ficheiro <span>*</span><input className="form-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0] || null; setForm({ ...form, file, label: form.label || file?.name || '' }); setError(file && !validVehicleImage(file) ? 'Escolha JPG, PNG ou WebP até 10 MB.' : ''); }} /></label><label>Nome da imagem<input className="form-input" value={form.label} onChange={event => setForm({ ...form, label: event.target.value })} /></label><div className="form-grid"><label>Marca<input className="form-input" value={form.brand} onChange={event => setForm({ ...form, brand: event.target.value })} /></label><label>Modelo<input className="form-input" value={form.model} onChange={event => setForm({ ...form, model: event.target.value })} /></label></div>{form.file && validVehicleImage(form.file) && <div className="vehicle-import-preview"><VehicleAssetImage asset={{ file: form.file, label: form.label }} alt="Pré-visualização da imagem importada" /></div>}{error && <p className="form-error" role="alert">{error}</p>}</form></ModalComponent>;
}

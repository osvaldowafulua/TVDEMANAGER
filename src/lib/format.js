const moneyFormat = new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' });

export const money = value => moneyFormat.format(Number(value) || 0);
export const round = value => Math.round((Number(value) || 0) * 100) / 100;
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const formatDate = iso => { if (!iso) return ''; const [y, m, d] = String(iso).split('-'); return d ? `${d}/${m}/${y}` : String(iso); };

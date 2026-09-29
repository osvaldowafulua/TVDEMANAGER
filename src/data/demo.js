/* =========================================================
   DADOS DEMO (SINTÉTICOS — NÃO SÃO DADOS REAIS)
========================================================= */

export const owners = [
  {
    id: 1,
    name: 'Rui Alexandre Santos',
    nif: '123456789',
    phone: '+351 910 000 001',
    email: 'rui.santos@demo.pt',
    vehicles: 2,
    status: 'Ativo',
    iban: 'PT50 0000 0000 0000 0000 0000 1',
  },
  {
    id: 2,
    name: 'Catarina Marques',
    nif: '987654321',
    phone: '+351 910 000 002',
    email: 'catarina.marques@demo.pt',
    vehicles: 1,
    status: 'Ativo',
    iban: 'PT50 0000 0000 0000 0000 0000 2',
  },
  {
    id: 3,
    name: 'Diogo Nunes Ferreira',
    nif: '456789123',
    phone: '+351 910 000 003',
    email: 'diogo.ferreira@demo.pt',
    vehicles: 1,
    status: 'Pendente',
    iban: 'PT50 0000 0000 0000 0000 0000 3',
  },
  {
    id: 4,
    name: 'Sofia Ribeiro Lopes',
    nif: '789123456',
    phone: '+351 910 000 004',
    email: 'sofia.lopes@demo.pt',
    vehicles: 2,
    status: 'Ativo',
    iban: 'PT50 0000 0000 0000 0000 0000 4',
  },
];

export const vehicles = [
  {
    id: 1,
    plate: 'AA-00-AA',
    brand: 'Toyota',
    model: 'Prius',
    year: 2022,
    owner: 'Rui Alexandre Santos',
    driver: 'Diogo Nunes Ferreira',
    status: 'Em operação',
    km: '184320',
    inspection: 'Válida',
    insurance: 'Válido',
    license: 32,
    imageId: 'toyota-prius',
  },
  {
    id: 2,
    plate: 'BB-11-BB',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2023,
    owner: 'Catarina Marques',
    driver: 'Pedro Costa',
    status: 'Em operação',
    km: '126450',
    inspection: 'Válida',
    insurance: 'Válido',
    license: 87,
    imageId: 'toyota-corolla',
  },
  {
    id: 3,
    plate: 'CC-22-CC',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    owner: 'Diogo Nunes Ferreira',
    driver: 'João Pereira',
    status: 'Manutenção',
    km: '203120',
    inspection: 'Válida',
    insurance: 'Válido',
    license: 14,
    imageId: 'renault-clio',
  },
];

export const payments = [
  {
    id: 'PAY-2026-091',
    owner: 'Rui Alexandre Santos',
    period: '14/09 — 20/09',
    start: '2026-09-14',
    end: '2026-09-20',
    gross: 620,
    commission: 25,
    net: 595,
    status: 'Pago',
  },
  {
    id: 'PAY-2026-092',
    owner: 'Catarina Marques',
    period: '14/09 — 20/09',
    start: '2026-09-14',
    end: '2026-09-20',
    gross: 710,
    commission: 25,
    net: 685,
    status: 'A validar',
  },
  {
    id: 'PAY-2026-093',
    owner: 'Diogo Nunes Ferreira',
    period: '14/09 — 20/09',
    start: '2026-09-14',
    end: '2026-09-20',
    gross: 540,
    commission: 25,
    net: 515,
    status: 'Pendente',
  },
];

export const initialDrivers = [
  ['Diogo Nunes Ferreira', 'AA-00-AA', 'Ativo'],
  ['Pedro Costa', 'BB-11-BB', 'Ativo'],
  ['João Pereira', 'CC-22-CC', 'Pendente'],
  ['Miguel Santos', 'DD-33-DD', 'Ativo'],
].map(([name, vehicle, status], i) => ({ id: i + 1, name, vehicle, status, phone: `+351 920 000 00${i + 1}`, license: `L-${String(482150 + i * 7).padStart(7, '0')}` }));

export const initialContracts = [
  { id: 'CTR-2026-001', owner: 'Rui Alexandre Santos', vehicle: 'AA-00-AA', start: '2026-06-01', end: '2027-05-31', contractType: 'Gestão de viatura', frequency: 'Semanal', commission: 25, status: 'Ativo' },
  { id: 'CTR-2026-002', owner: 'Catarina Marques', vehicle: 'BB-11-BB', start: '2026-07-12', end: '2027-07-11', contractType: 'Gestão de viatura', frequency: 'Semanal', commission: 25, status: 'Ativo' },
];

export const initialDocuments = [
  ['Contrato CTR-2026-001', 'Rui Alexandre Santos', 'Contrato', 'Ativo'],
  ['Seguro AA-00-AA', 'Rui Alexandre Santos', 'Seguro', 'Válido'],
  ['Licença TVDE CC-22-CC', 'Diogo Nunes Ferreira', 'Licença TVDE', 'Expira em 14 dias'],
  ['Fatura FT 2026/000124', 'Rui Alexandre Santos', 'Outro', 'Emitida'],
].map(([name, entity, type, status], i) => ({ id: i + 1, name, entity, type, status }));

export const initialLeads = [
  'Miguel Fernandes',
  'Rui Almeida',
  'Sandra Lopes',
  'Paulo Costa',
  'Joana Silva',
].map((name, i) => ({ id: i + 1, name, phone: `+351 930 000 00${i + 1}`, status: ['Novo', 'Novo', 'Em contacto', 'Documentação', 'Convertido'][i], contactType: 'Proprietário', city: 'Lisboa' }));

export const initialRetakes = owners.slice(0, 3).map((o, i) => ({
  id: 'RET-00' + (i + 1),
  owner: o.name,
  plate: vehicles[i].plate,
  status: ['Avaliação', 'Agendada', 'Nova'][i],
  reason: ['Fim de contrato', 'Troca', 'Pedido do proprietário'][i],
  date: '2026-09-21',
}));

export const initialInvoices = owners.slice(0, 3).map((o, i) => ({
  id: i + 1,
  number: 'FT 2026/000' + (124 - i),
  customer: o.name,
  customerNif: o.nif,
  customerAddress: 'Lisboa',
  date: i ? '2026-09-20' : '2026-09-21',
  items: [{ description: 'Gestão de viatura TVDE', quantity: 1, unitPrice: 25, vatRate: 23 }],
  subtotal: 25,
  vat: 5.75,
  total: 30.75,
  status: ['Pendente', 'Paga', 'Pendente'][i],
}));

import { useState, useRef } from 'react';
import { EnvelopeSimple, Gear, X, Check } from '@phosphor-icons/react';

const API_URL = '/api/send-email';

export function EmailSettings({ onClose, showToast }) {
  const [form, setForm] = useState(() => ({
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPass: '',
    smtpFrom: 'noreply@tvdefleet.pt',
    testEmail: '',
  }));
  const [status, setStatus] = useState({ connected: false, error: null });
  const [sending, setSending] = useState(false);
  const formRef = useRef(null);

  const callEmailAPI = async (payload) => {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Erro ao enviar email');
    }
    return data;
  };

  const connect = async () => {
    setSending(true);
    setStatus({ connected: false, error: null });
    try {
      await callEmailAPI({
        to: form.smtpUser,
        subject: 'Teste de conexão TVDE Fleet',
        text: 'Se está a ler isto, a conexão SMTP está funcionando.',
        html: '<p>Se está a ler isto, a conexão SMTP está funcionando.</p>',
      });
      setStatus({ connected: true, error: null });
      showToast('Conexão SMTP estabelecida com sucesso.', 'success');
    } catch (err) {
      setStatus({ connected: false, error: err.message });
      showToast('Falha ao conectar SMTP: ' + err.message, 'warning');
    }
    setSending(false);
  };

  const sendTest = async () => {
    if (!form.testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.testEmail)) {
      showToast('Introduza um email válido para teste.', 'warning');
      return;
    }
    setSending(true);
    setStatus({ connected: false, error: null });
    try {
      await callEmailAPI({
        to: form.testEmail,
        subject: 'Email de teste TVDE Fleet',
        text: 'Este é um email de teste da plataforma TVDE Fleet.',
        html: '<p>Este é um email de teste da plataforma TVDE Fleet.</p>',
      });
      showToast('Email de teste enviado com sucesso.', 'success');
    } catch (err) {
      showToast('Falha ao enviar email de teste: ' + err.message, 'warning');
    }
    setSending(false);
  };

  const handleSave = async () => {
    const config = {
      smtpHost: form.smtpHost,
      smtpPort: form.smtpPort,
      smtpUser: form.smtpUser,
      smtpPass: form.smtpPass,
      smtpFrom: form.smtpFrom,
    };
    localStorage.setItem('smtpConfig', JSON.stringify(config));
    setForm({
      smtpHost: config.smtpHost,
      smtpPort: config.smtpPort,
      smtpUser: config.smtpUser,
      smtpPass: '',
      smtpFrom: config.smtpFrom,
    });
    showToast('Configurações de email guardadas localmente. Configure as variáveis de ambiente no servidor para activar o envio.', 'info');
    onClose();
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Definições de Email</h1>
          <p>Configure o servidor SMTP para enviar facturas, contratos e avisos aos clientes.</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-card">
          <div className="settings-card-header">
            <Gear size={20} />
            <h2>Servidor SMTP</h2>
          </div>

          <form ref={formRef} className="workspace-form" onSubmit={e => e.preventDefault()}>
            <div className="form-grid">
              <div>
                <label>Host SMTP <span>*</span></label>
                <input
                  className="form-input"
                  type="text"
                  value={form.smtpHost}
                  onChange={e =>
                    setForm(v => ({ ...v, smtpHost: e.target.value }))
                  }
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div>
                <label>Porta <span>*</span></label>
                <input
                  className="form-input"
                  type="number"
                  value={form.smtpPort}
                  onChange={e =>
                    setForm(v => ({ ...v, smtpPort: e.target.value }))
                  }
                  placeholder="587"
                />
              </div>
            </div>

            <div>
              <label>Utilizador SMTP <span>*</span></label>
              <input
                className="form-input"
                type="email"
                value={form.smtpUser}
                onChange={e => setForm(v => ({ ...v, smtpUser: e.target.value }))}
                placeholder="seu_email@example.com"
              />
            </div>

            <div>
              <label>Password SMTP <span>*</span></label>
              <input
                className="form-input"
                type="password"
                value={form.smtpPass}
                onChange={e => setForm(v => ({ ...v, smtpPass: e.target.value }))}
                placeholder="sua_password"
              />
            </div>

            <div>
              <label>Remetente <span></span></label>
              <input
                className="form-input"
                type="email"
                value={form.smtpFrom}
                onChange={e => setForm(v => ({ ...v, smtpFrom: e.target.value }))}
                placeholder="noreply@tvdefleet.pt"
              />
            </div>
          </form>

          <div className="mt-6">
            <button
              className="btn btn-primary w-full"
              onClick={connect}
              disabled={sending}
            >
              {sending ? 'A testar conexão...' : 'Testar conexão SMTP'}
            </button>
          </div>

          {status.connected && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg text-green-800">
              <span className="icon-check size-4" />
              <span>Servidor SMTP conectado com sucesso</span>
            </div>
          )}

          {status.error && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-800">
              <span className="icon-alert size-4" />
              <span>{status.error}</span>
            </div>
          )}

          <p className="mt-4 text-xs text-muted-2">
            Nota: As credenciais SMTP devem ser configuradas nas variáveis de ambiente do servidor
            (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
            Este formulário apenas testa a conectividade e guarda preferências locais.
          </p>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <EnvelopeSimple size={20} />
            <h2>Enviar email de teste</h2>
          </div>

          <p className="text-sm text-muted-2 mb-4">
            Quer testar se o email está a funcionar corretamente?
          </p>

          <form onSubmit={e => e.preventDefault()}>
            <input
              className="form-input w-full mb-3"
              type="email"
              placeholder="Seu email para teste"
              value={form.testEmail}
              onChange={e => setForm(v => ({ ...v, testEmail: e.target.value }))}
            />
            <button
              className="btn btn-primary w-full"
              onClick={sendTest}
              disabled={sending}
            >
              {sending ? 'A enviar...' : 'Enviar email de teste'}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8">
        <button
          className="btn btn-secondary"
          onClick={onClose}
        >
          <X size={17} /> Cancelar
        </button>
        <button className="btn btn-primary" type="submit" form={formRef} onClick={handleSave}>
          <Check size={17} /> Guardar configurações
        </button>
      </div>
    </div>
  );
}

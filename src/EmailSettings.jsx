import { useState } from 'react';
import { EnvelopeSimple, Gear, X, Check, Warning } from '@phosphor-icons/react';

const API_URL = '/api/send-email';
const STORAGE_KEY = 'smtpConfig';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Preferências guardadas neste browser. A password nunca é guardada; versões antigas guardavam-na, por isso é removida aqui.
function loadSavedConfig() {
  const defaults = { smtpHost: '', smtpPort: '587', smtpUser: '', smtpFrom: 'noreply@tvdefleet.pt' };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if ('smtpPass' in saved) {
      delete saved.smtpPass;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    }
    return {
      smtpHost: saved.smtpHost || defaults.smtpHost,
      smtpPort: saved.smtpPort || defaults.smtpPort,
      smtpUser: saved.smtpUser || defaults.smtpUser,
      smtpFrom: saved.smtpFrom || defaults.smtpFrom,
    };
  } catch {
    return defaults;
  }
}

export function EmailSettings({ onClose, showToast }) {
  const [form, setForm] = useState(() => ({ ...loadSavedConfig(), smtpPass: '', testEmail: '' }));
  const [status, setStatus] = useState({ connected: false, error: null });
  const [sending, setSending] = useState(false);

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
    if (!EMAIL_PATTERN.test(form.smtpUser)) {
      showToast('Introduza o utilizador SMTP (email) para receber o email de teste de conexão.', 'warning');
      return;
    }
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
    if (!EMAIL_PATTERN.test(form.testEmail)) {
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

  const handleSave = () => {
    const config = {
      smtpHost: form.smtpHost,
      smtpPort: form.smtpPort,
      smtpUser: form.smtpUser,
      smtpFrom: form.smtpFrom,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      showToast('Não foi possível guardar as preferências neste browser.', 'warning');
      return;
    }
    setForm(v => ({ ...v, smtpPass: '' }));
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

          <form className="workspace-form" onSubmit={e => e.preventDefault()}>
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

          <div className="email-settings-block">
            <button
              className="btn btn-primary btn-block"
              onClick={connect}
              disabled={sending}
            >
              {sending ? 'A testar conexão...' : 'Testar conexão SMTP'}
            </button>
          </div>

          {status.connected && (
            <div className="email-settings-status success" role="status">
              <Check size={16} aria-hidden="true" />
              <span>Servidor SMTP conectado com sucesso</span>
            </div>
          )}

          {status.error && (
            <div className="email-settings-status error" role="alert">
              <Warning size={16} aria-hidden="true" />
              <span>{status.error}</span>
            </div>
          )}

          <p className="email-settings-note">
            Nota: As credenciais SMTP devem ser configuradas nas variáveis de ambiente do servidor
            (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM).
            O teste de conexão usa essa configuração do servidor e envia um email para o utilizador SMTP indicado.
            Este formulário guarda apenas preferências locais neste browser (nunca a password).
          </p>
        </div>

        <div className="settings-card">
          <div className="settings-card-header">
            <EnvelopeSimple size={20} />
            <h2>Enviar email de teste</h2>
          </div>

          <p>
            Quer testar se o email está a funcionar corretamente?
          </p>

          <form className="email-settings-test" onSubmit={e => e.preventDefault()}>
            <input
              className="form-input"
              type="email"
              placeholder="Seu email para teste"
              value={form.testEmail}
              onChange={e => setForm(v => ({ ...v, testEmail: e.target.value }))}
            />
            <button
              className="btn btn-primary btn-block"
              onClick={sendTest}
              disabled={sending}
            >
              {sending ? 'A enviar...' : 'Enviar email de teste'}
            </button>
          </form>
        </div>
      </div>

      <div className="email-settings-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
        >
          <X size={17} /> Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSave}>
          <Check size={17} /> Guardar configurações
        </button>
      </div>
    </div>
  );
}

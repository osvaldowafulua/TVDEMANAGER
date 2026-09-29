import nodemailer from 'nodemailer';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  text: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort || '587', 10),
      secure: parseInt(smtpPort || '587', 10) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  return transporter;
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: EmailRequest): Promise<EmailResponse> {
  const transport = getTransporter();

  if (!transport) {
    return {
      success: false,
      error: 'Serviço de email não configurado. Verifique as variáveis SMTP_HOST, SMTP_USER, SMTP_PASS no ambiente do servidor.',
    };
  }

  try {
    const info = await transport.sendMail({
      from: `"TVDE Fleet" <${process.env.SMTP_FROM || 'noreply@tvdefleet.pt'}>`,
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao enviar email',
    };
  }
}

export async function handleSendEmail(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Método não permitido' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    process.env.APP_URL,
    // Domínios atribuídos automaticamente pelo Vercel (produção, branch e deployment).
    ...[process.env.VERCEL_PROJECT_PRODUCTION_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_URL]
      .filter(Boolean)
      .map(host => `https://${host}`),
  ].filter(Boolean);

  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ success: false, error: 'Origem não autorizada' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json() as EmailRequest;

    if (!body.to || !body.subject || (!body.html && !body.text)) {
      return new Response(JSON.stringify({ success: false, error: 'Campos obrigatórios: to, subject, html ou text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return new Response(JSON.stringify({ success: false, error: 'Email destinatário inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await sendEmail(body);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ success: false, error: 'Erro ao processar requisição' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

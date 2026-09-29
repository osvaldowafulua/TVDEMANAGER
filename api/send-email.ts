import { handleSendEmail } from '../src/api/send-email.js';

// Vercel Function: em produção substitui o middleware /api/send-email do servidor de desenvolvimento Vite.
export function POST(request: Request): Promise<Response> {
  return handleSendEmail(request);
}

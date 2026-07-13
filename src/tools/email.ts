import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { z } from 'zod';
import { registerGroup } from '../groups.js';
import { SmtpNotConfiguredError } from '../errors.js';
import { validateArgs, withErrorHandling, assertWriteAccess } from '../utils.js';

let transporter: Transporter | null = null;
let lastFailedAt: number | null = null;

function getRetryAfterMs(): number {
  return parseInt(process.env.SMTP_RETRY_AFTER_MS || '30000', 10) || 30000;
}

async function getTransporter(): Promise<Transporter> {
  if (!transporter) {
    if (lastFailedAt !== null && Date.now() - lastFailedAt < getRetryAfterMs()) {
      throw new Error('SMTP connection unavailable, retry later');
    }
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    try {
      await transporter.verify();
      lastFailedAt = null;
    } catch (error) {
      transporter = null;
      lastFailedAt = Date.now();
      throw error;
    }
  }
  return transporter;
}

function smtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function resetTransporter(): void {
  transporter = null;
  lastFailedAt = null;
}

registerGroup({
  name: 'email',
  tools: [
    {
      name: 'email_send',
      description: 'Send a custom email via SMTP',
      inputSchema: {
        type: 'object',
        properties: {
          to: { type: 'string', description: 'Recipient email address(es), comma-separated' },
          subject: { type: 'string', description: 'Email subject' },
          body: { type: 'string', description: 'Email body (HTML supported)' },
          cc: { type: 'string', description: 'CC recipient(s), comma-separated' },
          bcc: { type: 'string', description: 'BCC recipient(s), comma-separated' },
          reply_to: { type: 'string', description: 'Reply-To address' },
        },
        required: ['to', 'subject', 'body'],
      },
      handler: async (args) =>
        withErrorHandling(async () => {
          assertWriteAccess();
          const v = validateArgs(
            z.object({
              to: z.string().min(1),
              subject: z.string().min(1),
              body: z.string().min(1),
              cc: z.string().optional(),
              bcc: z.string().optional(),
              reply_to: z.string().optional(),
            }),
            args,
          );
          if (!smtpConfigured()) {
            throw new SmtpNotConfiguredError();
          }

          const from = process.env.SMTP_FROM || process.env.SMTP_USER;
          const transport = await getTransporter();

          const info = await transport.sendMail({
            from,
            to: v.to,
            subject: v.subject,
            html: v.body,
            cc: v.cc,
            bcc: v.bcc,
            replyTo: v.reply_to,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ success: true, messageId: info.messageId }, null, 2),
              },
            ],
          };
        }),
    },
  ],
});

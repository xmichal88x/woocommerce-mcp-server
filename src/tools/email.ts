import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { registerGroup } from '../groups.js';
import { safeError } from '../errors.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
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
  }
  return transporter;
}

function smtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
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
      handler: async (args) => {
        try {
          if (!smtpConfigured()) {
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(
                    {
                      code: 'SMTP_NOT_CONFIGURED',
                      message: 'Email not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS.',
                      actionable: true,
                    },
                    null,
                    2,
                  ),
                },
              ],
              isError: true,
            };
          }

          const from = process.env.SMTP_FROM || process.env.SMTP_USER;
          const transport = getTransporter();

          const info = await transport.sendMail({
            from,
            to: args.to as string,
            subject: args.subject as string,
            html: args.body as string,
            cc: args.cc as string | undefined,
            bcc: args.bcc as string | undefined,
            replyTo: args.reply_to as string | undefined,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({ success: true, messageId: info.messageId }, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [{ type: 'text', text: JSON.stringify(safeError(error), null, 2) }],
            isError: true,
          };
        }
      },
    },
  ],
});

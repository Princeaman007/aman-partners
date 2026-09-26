import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/** Pièce jointe d'un e-mail (par exemple le fichier joint à une demande de projet). */
export type EmailAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
};

/** Un e-mail à envoyer : toujours une version texte et une version HTML. */
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
  /** Adresse utilisée quand on clique sur « Répondre » (par exemple celle du visiteur). */
  replyTo?: string;
  attachments?: EmailAttachment[];
};

type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
  notificationRecipient: string;
};

function readConfig(): SmtpConfig {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM, EMAIL_TO } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD || !EMAIL_FROM || !EMAIL_TO) {
    throw new Error(
      "Configuration e-mail incomplète : vérifiez SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM et EMAIL_TO dans .env.local.",
    );
  }

  return {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    user: SMTP_USER,
    password: SMTP_PASSWORD,
    from: EMAIL_FROM,
    notificationRecipient: EMAIL_TO,
  };
}

let transporter: Transporter | undefined;

function getTransporter(config: SmtpConfig): Transporter {
  transporter ??= nodemailer.createTransport({
    host: config.host,
    port: config.port,
    // Port 465 : connexion chiffrée dès le départ. Autre port (587) : chiffrement négocié ensuite.
    secure: config.port === 465,
    auth: { user: config.user, pass: config.password },
  });
  return transporter;
}

/** Envoie un e-mail. Lève une erreur si l'envoi échoue. */
export async function sendEmail(message: EmailMessage): Promise<void> {
  const config = readConfig();

  await getTransporter(config).sendMail({
    from: config.from,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html,
    attachments: message.attachments,
  });
}

/** Adresse qui reçoit les notifications de nouvelles demandes. */
export function getNotificationRecipient(): string {
  return readConfig().notificationRecipient;
}

/**
 * Protège un texte saisi par un visiteur avant de l'insérer dans un e-mail HTML.
 * Sans cela, un message contenant du code HTML pourrait modifier l'affichage de l'e-mail.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

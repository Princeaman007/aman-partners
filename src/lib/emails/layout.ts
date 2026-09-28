import "server-only";
import { escapeHtml } from "@/lib/services/email";

/** Couleurs de la charte, écrites en dur : les logiciels de messagerie ignorent les variables CSS. */
const COLORS = {
  text: "#0A0A0A",
  muted: "#525252",
  border: "#E5E5E5",
  background: "#FAFAFA",
  surface: "#FFFFFF",
} as const;

const FONT = "Helvetica, Arial, sans-serif";

/** Une ligne du tableau d'informations d'un e-mail. */
export type EmailDetail = {
  label: string;
  value: string;
};

/** Paragraphe HTML à partir d'un texte saisi : caractères protégés, retours à la ligne conservés. */
export function htmlParagraph(text: string, color: string = COLORS.text): string {
  const safe = escapeHtml(text).replaceAll("\n", "<br>");
  return `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;line-height:1.6;color:${color};">${safe}</p>`;
}

/** Bouton d'action (lien mis en forme), adresse et libellé protégés. */
export function htmlButton(href: string, label: string): string {
  return `<p style="margin:8px 0 24px;"><a href="${escapeHtml(href)}" style="display:inline-block;padding:12px 20px;border-radius:6px;background:${COLORS.text};color:${COLORS.background};font-family:${FONT};font-size:14px;font-weight:600;text-decoration:none;">${escapeHtml(label)}</a></p>`;
}

/** Tableau d'informations (libellé, valeur), toutes les valeurs protégées. */
export function htmlDetails(details: EmailDetail[]): string {
  const rows = details
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:10px 16px 10px 0;border-top:1px solid ${COLORS.border};font-family:${FONT};font-size:13px;color:${COLORS.muted};vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:10px 0;border-top:1px solid ${COLORS.border};font-family:${FONT};font-size:14px;line-height:1.5;color:${COLORS.text};vertical-align:top;">${escapeHtml(value).replaceAll("\n", "<br>")}</td>
        </tr>`,
    )
    .join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 24px;border-bottom:1px solid ${COLORS.border};">${rows}</table>`;
}

/** Tableau d'informations en version texte. */
export function textDetails(details: EmailDetail[]): string {
  return details.map(({ label, value }) => `${label} : ${value}`).join("\n");
}

type LayoutParams = {
  /** Texte d'aperçu affiché par certaines messageries à côté de l'objet. */
  preview: string;
  /** Contenu HTML déjà construit avec htmlParagraph et htmlDetails. */
  content: string;
  /** Mention en bas de l'e-mail. */
  footer?: string;
};

/** Mise en page commune des e-mails du site, dans la charte monochrome. */
export function renderEmailLayout({ preview, content, footer }: LayoutParams): string {
  const footerHtml = footer
    ? `<p style="margin:24px 0 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${COLORS.muted};">${escapeHtml(footer)}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <title>Aman &amp; Partners</title>
  </head>
  <body style="margin:0;padding:0;background:${COLORS.background};">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(preview)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLORS.background};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${COLORS.surface};border:1px solid ${COLORS.border};">
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid ${COLORS.border};font-family:${FONT};font-size:18px;font-weight:700;letter-spacing:-0.01em;color:${COLORS.text};">
                Aman <span style="font-family:Georgia, serif;font-style:italic;font-weight:400;">&amp;</span> <span style="font-weight:400;">Partners</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                ${content}
                ${footerHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export const EMAIL_COLORS = COLORS;

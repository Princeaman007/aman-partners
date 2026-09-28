import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { getRequestById } from "@/lib/admin/requests";
import { getAttachmentDownloadUrl } from "@/lib/services/storage";

/** Durée de validité du lien de téléchargement : 5 minutes. */
const DOWNLOAD_LINK_SECONDS = 300;

type AttachmentRouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Téléchargement de la pièce jointe d'une demande : vérifie la session,
 * puis redirige vers un lien signé et temporaire vers le stockage.
 */
export async function GET(_request: Request, { params }: AttachmentRouteContext) {
  await requireAdmin();

  const { id } = await params;

  try {
    const record = await getRequestById(id);
    if (!record?.attachment) {
      return new NextResponse(null, { status: 404 });
    }

    const url = await getAttachmentDownloadUrl(record.attachment.key, DOWNLOAD_LINK_SECONDS);

    const response = NextResponse.redirect(url);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[admin] Lien de téléchargement impossible :", error);
    return new NextResponse(null, { status: 500 });
  }
}

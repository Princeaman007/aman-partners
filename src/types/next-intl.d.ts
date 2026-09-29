import type messages from "@/messages/fr.json";
import type legalMessages from "@/messages/legal/fr.json";
import type seoMessages from "@/messages/seo/fr.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof messages & typeof legalMessages & typeof seoMessages;
  }
}

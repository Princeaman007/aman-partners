import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  // Textes du site et textes juridiques, rangés dans deux fichiers et fusionnés.
  const [messages, legalMessages] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/legal/${locale}.json`),
  ]);

  return {
    locale,
    messages: { ...messages.default, ...legalMessages.default },
  };
});

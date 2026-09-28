export {};

/** File d'attente et fonction d'appel du Meta Pixel, telles que le script de Meta les attend. */
interface MetaPixelFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
  push: MetaPixelFunction;
  loaded: boolean;
  version: string;
}

declare global {
  interface Window {
    /** File d'attente de la balise Google. */
    dataLayer?: unknown[];
    /** Fonction d'appel de la balise Google. */
    gtag?: (...args: unknown[]) => void;
    /** Fonction d'appel du Meta Pixel. */
    fbq?: MetaPixelFunction;
    _fbq?: MetaPixelFunction;
  }
}

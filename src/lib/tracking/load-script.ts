/** Scripts déjà demandés, pour ne jamais les charger deux fois. */
const requested = new Map<string, Promise<void>>();

/**
 * Ajoute un script externe à la page, de façon asynchrone et une seule fois.
 * En cas d'échec (bloqueur de publicité, réseau), une nouvelle tentative reste possible.
 */
export function loadScript(src: string): Promise<void> {
  const existing = requested.get(src);
  if (existing) {
    return existing;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      requested.delete(src);
      script.remove();
      reject(new Error(`Le script ${src} n'a pas pu être chargé.`));
    };
    document.head.appendChild(script);
  });

  requested.set(src, promise);
  return promise;
}

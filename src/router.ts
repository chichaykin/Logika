import { signal } from '@preact/signals';

export type Route = 'home' | 'solo' | 'computer' | 'duel' | 'stats' | 'settings' | 'rules';

const ROUTES: readonly Route[] = ['home', 'solo', 'computer', 'duel', 'stats', 'settings', 'rules'];

export function parseHash(hash: string): Route {
  const name = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return (ROUTES as readonly string[]).includes(name) ? (name as Route) : 'home';
}

export const route = signal<Route>(typeof location === 'undefined' ? 'home' : parseHash(location.hash));

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    route.value = parseHash(location.hash);
  });
}

export function navigate(r: Route): void {
  const hash = r === 'home' ? '#/' : `#/${r}`;
  if (location.hash !== hash) location.hash = hash;
  else route.value = r;
}

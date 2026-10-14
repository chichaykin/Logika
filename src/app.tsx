import { route } from './router';
import { PegDefs } from './ui/components/Peg';
import { UpdateToast } from './ui/components/UpdateToast';
import { Computer } from './ui/screens/Computer';
import { Duel } from './ui/screens/Duel';
import { Home } from './ui/screens/Home';
import { Rules } from './ui/screens/Rules';
import { Settings } from './ui/screens/Settings';
import { Solo } from './ui/screens/Solo';
import { Stats } from './ui/screens/Stats';

export function App() {
  const currentRoute = route.value;

  return (
    <div class="app-root">
      <PegDefs />
      <UpdateToast />

      {currentRoute === 'home' && <Home />}
      {currentRoute === 'solo' && <Solo />}
      {currentRoute === 'computer' && <Computer />}
      {currentRoute === 'duel' && <Duel />}
      {currentRoute === 'stats' && <Stats />}
      {currentRoute === 'settings' && <Settings />}
      {currentRoute === 'rules' && <Rules />}
    </div>
  );
}

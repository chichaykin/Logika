import { t } from '../../i18n';
import { navigate } from '../../router';
import { KeyPeg, Peg } from '../components/Peg';

export function Rules() {
  return (
    <div class="screen screen-rules">
      <header class="game-header">
        <button type="button" class="btn btn-sm" onClick={() => navigate('home')}>
          ← {t('common.menu')}
        </button>
        <h2>{t('rules.title')}</h2>
        <div style={{ width: 40 }} />
      </header>

      <main class="rules-content card">
        <section class="rule-block">
          <p>{t('rules.p1')}</p>
        </section>

        <section class="rule-block">
          <h3>{t('rules.p2')}</h3>
          <ul class="keys-legend">
            <li>
              <KeyPeg kind="black" />
              <span>{t('rules.black')}</span>
            </li>
            <li>
              <KeyPeg kind="white" />
              <span>{t('rules.white')}</span>
            </li>
          </ul>
          <p>{t('rules.p3')}</p>
        </section>

        <section class="rule-block example-block">
          <h4>Пример подсказки</h4>
          <div class="example-row">
            <div class="example-pegs">
              <Peg color={0} />
              <Peg color={1} />
              <Peg color={2} />
              <Peg color={3} />
            </div>
            <span class="example-arrow">→</span>
            <div class="example-keys">
              <KeyPeg kind="black" />
              <KeyPeg kind="white" />
              <KeyPeg kind="none" />
              <KeyPeg kind="none" />
            </div>
          </div>
          <small>
            1 штырёк угадан точно (чёрный ключ), 1 цвет есть в коде, но на другой позиции (белый ключ), 2 цвета не угаданы.
          </small>
        </section>

        <section class="rule-block">
          <h3>Алгоритм Кнута</h3>
          <p>{t('rules.p4')}</p>
          <p>{t('rules.p5')}</p>
          <p>
            В 1977 году американский математик Дональд Кнут доказал, что любой 4-значный код из 6 цветов
            можно гарантированно отгадать <strong>максимум за 5 попыток</strong>, используя стратегию минимакса:
            выбирается такой ход, который в худшем случае оставляет наименьшее число возможных кандидатов.
          </p>
        </section>

        <section class="rule-block">
          <h3>История «Логики»</h3>
          <p>
            В СССР эта настольная игра выпускалась под названием «Логика» на жёлтом пластиковом поле с цветными
            колпачками-штырьками. Она была адаптацией классической игры Mastermind (1970) Мордехая Мейровица,
            которая восходит к старинной игре «Быки и коровы».
          </p>
        </section>
      </main>
    </div>
  );
}

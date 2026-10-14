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

        {/* Как читать ответ */}
        <section class="rule-block">
          <h3>{t('rules.howToReadTitle')}</h3>
          <p style={{ marginBottom: 10 }}>{t('rules.howToReadP1')}</p>
          <ul class="keys-legend">
            <li>
              <KeyPeg kind="black" />
              <span>{t('rules.black')}</span>
            </li>
            <li>
              <KeyPeg kind="white" />
              <span>{t('rules.white')}</span>
            </li>
            <li>
              <KeyPeg kind="none" />
              <span>{t('rules.empty')}</span>
            </li>
          </ul>
        </section>

        {/* Наглядный пример */}
        <section class="rule-block example-block">
          <h4>{t('rules.exampleTitle')}</h4>
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
          <small>{t('rules.exampleDesc')}</small>
        </section>

        {/* Правило повторов */}
        <section class="rule-block">
          <h3>{t('rules.repeatsRuleTitle')}</h3>
          <p>{t('rules.repeatsRuleP1')}</p>
          <div class="example-row" style={{ marginTop: 10 }}>
            <div class="example-pegs">
              <Peg color={0} />
              <Peg color={0} />
              <Peg color={4} />
              <Peg color={5} />
            </div>
            <span class="example-arrow">→</span>
            <div class="example-keys">
              <KeyPeg kind="black" />
              <KeyPeg kind="none" />
              <KeyPeg kind="none" />
              <KeyPeg kind="none" />
            </div>
          </div>
          <small>{t('rules.exampleRepeatsDesc')}</small>
        </section>

        {/* Как анализировать */}
        <section class="rule-block">
          <h3>{t('rules.strategyTitle')}</h3>
          <p>{t('rules.strategyP1')}</p>
          <p>{t('rules.strategyP2')}</p>
          <p>{t('rules.strategyP3')}</p>
          <p>{t('rules.strategyP4')}</p>
        </section>

        {/* Алгоритм Кнута */}
        <section class="rule-block">
          <h3>{t('rules.knuthTitle')}</h3>
          <p>{t('rules.p4')}</p>
          <p>{t('rules.p5')}</p>
          <p>{t('rules.knuthP1')}</p>
        </section>

        {/* История */}
        <section class="rule-block">
          <h3>{t('rules.historyTitle')}</h3>
          <p>{t('rules.historyP1')}</p>
        </section>
      </main>
    </div>
  );
}

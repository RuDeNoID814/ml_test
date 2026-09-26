/*
  Декоративные оранжевые blob'ы для страницы онбординга.
  Стиль по референсу docs/references/site-model/Insurance Projects.jpeg —
  четыре пятна разного размера в углах, тёплое сияние, subtle motion.
*/
export function OnboardingBlobs() {
  return (
    <div className="onboarding-blobs" aria-hidden>
      <span className="blob blob-tl" />
      <span className="blob blob-tr" />
      <span className="blob blob-bl" />
      <span className="blob blob-br" />
      <span className="blob blob-c" />
    </div>
  );
}

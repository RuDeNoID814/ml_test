/*
  Однотонный фон с едва заметными размытыми пятнами — по референсу Figma.
  Статично, без анимации и волнистых линий (было раньше).
*/
export function TopographyAmbient() {
  return (
    <div className="topography" aria-hidden>
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />
    </div>
  );
}

import Link from 'next/link';

/*
  Аккаунтов пока нет (local-first, ADR 0004), но онбординг/профиль уже
  подключены — поэтому кнопки ведут туда напрямую, без реальной авторизации:
  «Зарегистрироваться» → заполнить данные (/onboarding);
  «Войти» → сразу в профиль (/profile), он сам редиректнёт на онбординг,
  если профиля ещё нет.
*/

export function HeaderAuthButtons() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-4">
      <Link
        href="/profile"
        className="text-ink-3 hover:text-ink px-1 py-1 text-[12px] font-medium transition-colors sm:px-2 sm:py-2 sm:text-[14px]"
      >
        Войти
      </Link>
      <Link
        href="/onboarding"
        className="bg-ink text-paper hover:bg-accent inline-flex items-center rounded-full px-2.5 py-2 text-[12px] font-semibold transition-all sm:gap-2 sm:px-7 sm:py-3.5 sm:text-[15px]"
      >
        Зарегистрироваться
      </Link>
    </div>
  );
}

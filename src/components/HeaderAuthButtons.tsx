'use client';

import { useState } from 'react';
import { ComingSoonModal } from '@/components/ComingSoonModal';

/*
  Аккаунтов пока нет (local-first, ADR 0004). Смысл на будущее:
  «Зарегистрироваться» → заполнить данные, начало (/onboarding);
  «Войти» → вход в аккаунт, дальше в профиль (/profile).
  Сейчас обе — заглушка.
*/

export function HeaderAuthButtons() {
  const [modal, setModal] = useState<'register' | 'login' | null>(null);

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-4">
        <button
          type="button"
          onClick={() => setModal('login')}
          className="text-ink-3 hover:text-ink px-1 py-1 text-[12px] font-medium transition-colors sm:px-2 sm:py-2 sm:text-[14px]"
        >
          Войти
        </button>
        <button
          type="button"
          onClick={() => setModal('register')}
          className="bg-ink text-paper hover:bg-accent inline-flex items-center rounded-full px-2.5 py-2 text-[12px] font-semibold transition-all sm:gap-2 sm:px-7 sm:py-3.5 sm:text-[15px]"
        >
          Зарегистрироваться
        </button>
      </div>
      {modal && (
        <ComingSoonModal
          label={modal === 'register' ? 'Регистрация' : 'Вход'}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}

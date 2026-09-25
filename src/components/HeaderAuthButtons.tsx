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
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setModal('login')}
          className="text-ink-3 hover:text-ink px-2 py-2 text-[14px] font-medium transition-colors"
        >
          Войти
        </button>
        <button
          type="button"
          onClick={() => setModal('register')}
          className="bg-ink text-paper hover:bg-accent inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold transition-all"
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

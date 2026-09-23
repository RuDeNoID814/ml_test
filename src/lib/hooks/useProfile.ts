'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Profile } from '@/db/types';
import type { ProfileDraft } from '../repositories/interfaces';
import { getRepositories } from '../repositories';

type UseProfileState = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
};

export function useProfile() {
  const [state, setState] = useState<UseProfileState>({
    profile: null,
    loading: true,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const p = await getRepositories().profile.getCurrent();
      // Профиль без goal (создан до v0.6.0) → трактуем как «нет профиля»,
      // /profile редиректнёт на онбординг для миграции.
      if (p && !p.goal) {
        setState({ profile: null, loading: false, error: null });
        return;
      }
      setState({ profile: p, loading: false, error: null });
    } catch (e) {
      setState({
        profile: null,
        loading: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const save = useCallback(
    async (draft: ProfileDraft) => {
      await getRepositories().profile.save(draft);
      await refresh();
    },
    [refresh],
  );

  const updateField = useCallback(
    async (patch: Partial<ProfileDraft>) => {
      const current = state.profile;
      if (!current) throw new Error('профиль ещё не создан');
      const draft: ProfileDraft = {
        nickname: current.nickname,
        sex: current.sex,
        dateOfBirth: current.dateOfBirth,
        heightCm: current.heightCm,
        activityLevel: current.activityLevel,
        goal: current.goal,
        ...patch,
      };
      await getRepositories().profile.save(draft);
      await refresh();
    },
    [state.profile, refresh],
  );

  const clear = useCallback(async () => {
    await getRepositories().profile.clear();
    await refresh();
  }, [refresh]);

  return { ...state, save, updateField, clear, refresh };
}

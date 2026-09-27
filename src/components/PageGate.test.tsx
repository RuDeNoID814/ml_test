import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageGate } from './PageGate';

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

// Тест намеренно не зависит от реального реестра в '@/lib/pages' (статусы
// production-роутов меняются со временем) — своя фикстура на все 3 статуса.
vi.mock('@/lib/pages', () => ({
  getPageEntry: (route: string) => {
    const fixtures: Record<string, { route: string; label: string; status: string }> = {
      '/live-route': { route: '/live-route', label: 'Живая', status: 'live' },
      '/placeholder-route': { route: '/placeholder-route', label: 'Заглушка', status: 'placeholder' },
      '/hidden-route': { route: '/hidden-route', label: 'Скрытая', status: 'hidden' },
    };
    return fixtures[route] ?? { route, label: route, status: 'hidden' };
  },
}));

describe('PageGate', () => {
  it('live — рендерит children как есть', () => {
    render(
      <PageGate route="/live-route">
        <div>контент главной</div>
      </PageGate>,
    );
    expect(screen.getByText('контент главной')).toBeInTheDocument();
  });

  it('placeholder со своим placeholderContent — показывает его, а не children', () => {
    render(
      <PageGate route="/placeholder-route" placeholderContent={<div>своя заглушка</div>}>
        <div>реальная форма</div>
      </PageGate>,
    );
    expect(screen.getByText('своя заглушка')).toBeInTheDocument();
    expect(screen.queryByText('реальная форма')).not.toBeInTheDocument();
  });

  it('placeholder без своего placeholderContent — общий PlaceholderPage с меткой страницы', () => {
    render(
      <PageGate route="/placeholder-route">
        <div>реальная форма</div>
      </PageGate>,
    );
    expect(screen.getByText('Заглушка — в разработке')).toBeInTheDocument();
  });

  it('hidden — вызывает notFound(), рендер прерывается до children', () => {
    expect(() =>
      render(
        <PageGate route="/hidden-route">
          <div>секретный контент</div>
        </PageGate>,
      ),
    ).toThrow();
    expect(notFoundMock).toHaveBeenCalled();
  });
});

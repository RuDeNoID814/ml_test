import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageGate } from './PageGate';

const notFoundMock = vi.fn(() => {
  throw new Error('NEXT_NOT_FOUND');
});

vi.mock('next/navigation', () => ({
  notFound: () => notFoundMock(),
}));

describe('PageGate', () => {
  it('live ("/") — рендерит children как есть', () => {
    render(
      <PageGate route="/">
        <div>контент главной</div>
      </PageGate>,
    );
    expect(screen.getByText('контент главной')).toBeInTheDocument();
  });

  it('placeholder ("/onboarding") со своим placeholderContent — показывает его, а не children', () => {
    render(
      <PageGate route="/onboarding" placeholderContent={<div>своя заглушка</div>}>
        <div>реальная форма</div>
      </PageGate>,
    );
    expect(screen.getByText('своя заглушка')).toBeInTheDocument();
    expect(screen.queryByText('реальная форма')).not.toBeInTheDocument();
  });

  it('placeholder без своего placeholderContent — общий PlaceholderPage с меткой страницы', () => {
    render(
      <PageGate route="/onboarding">
        <div>реальная форма</div>
      </PageGate>,
    );
    expect(screen.getByText('Онбординг — в разработке')).toBeInTheDocument();
  });

  it('hidden ("/profile") — вызывает notFound(), рендер прерывается до children', () => {
    expect(() =>
      render(
        <PageGate route="/profile">
          <div>секретный контент профиля</div>
        </PageGate>,
      ),
    ).toThrow();
    expect(notFoundMock).toHaveBeenCalled();
  });
});

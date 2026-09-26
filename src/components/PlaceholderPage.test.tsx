import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlaceholderPage } from './PlaceholderPage';

describe('PlaceholderPage', () => {
  it('показывает переданную метку в заголовке и ссылку на главную', () => {
    render(<PlaceholderPage label="Профиль" />);
    expect(screen.getByText('Профиль — в разработке')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'На главную' })).toHaveAttribute('href', '/');
  });

  it('другая метка — другой заголовок (не захардкожен)', () => {
    render(<PlaceholderPage label="Вес" />);
    expect(screen.getByText('Вес — в разработке')).toBeInTheDocument();
  });
});

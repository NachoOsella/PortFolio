import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { AuthProvider } from '@/context/AuthContext';
import { QueryProvider } from '@/context/QueryProvider';

describe('protected route', () => {
  it('shows a session check before resolving the route', () => {
    render(
      <QueryProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/admin']}>
            <ProtectedRoute />
          </MemoryRouter>
        </AuthProvider>
      </QueryProvider>,
    );
    expect(screen.getByText('Checking session')).toBeInTheDocument();
  });
});

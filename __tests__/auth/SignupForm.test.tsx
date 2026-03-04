/**
 * Tests: SignupForm component
 *
 * Covers:
 *  1. Renders all required fields (full name, email, password, role selector, submit)
 *  2. Does not call signUp when required fields are empty
 *  3. Blocks admin signup for non-@futuretrendsent.info emails and shows an error
 *  4. Calls supabase.auth.signUp with the correct email and password
 *  5. Creates a profile row via supabase.from('profiles').upsert after signup
 *  6. Shows "Please check your email" message when session is null
 *  7. Shows a generic error message when Supabase signUp fails
 *  8. Shows a "already registered" friendly error
 *  9. Calls onSuccess when signup + profile creation succeed
 * 10. Password field enforces a minimum length of 6 characters
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from '@/components/auth/SignupForm';
import { supabase } from '@/lib/supabase';

// ── Supabase mock ───────────────────────────────────────────────────────────
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      onAuthStateChange: jest.fn(() => ({
        data: { subscription: { unsubscribe: jest.fn() } },
      })),
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
    },
    from: jest.fn(),
  },
  supabaseAnonKey: 'test-anon-key',
}));

// Accessors — always returns the current mock reference
const mockSignUp = () => supabase.auth.signUp as jest.Mock;
const mockFrom = () => supabase.from as jest.Mock;

// ── Helpers ──────────────────────────────────────────────────────────────────
/** Mock a successful DB chain: upsert / insert / maybeSingle all resolve OK */
const mockDbSuccess = () => {
  const chain: any = {
    upsert: jest.fn().mockResolvedValue({ error: null }),
    insert: jest.fn().mockResolvedValue({ error: null }),
    select: jest.fn(),
    eq: jest.fn(),
    maybeSingle: jest.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  mockFrom().mockReturnValue(chain);
  return chain;
};

const TEST_USER = {
  id: 'user-abc-123',
  email: 'creator@example.com',
  identities: [{ id: 'identity-1' }],
};

const fillForm = async (
  user: ReturnType<typeof userEvent.setup>,
  opts: {
    fullName?: string;
    email?: string;
    password?: string;
    role?: 'creator' | 'innovator' | 'visionary' | 'admin';
  } = {}
) => {
  const {
    fullName = 'Jane Creator',
    email = 'creator@example.com',
    password = 'password123',
    role = 'creator',
  } = opts;

  await user.type(screen.getByLabelText(/full name/i), fullName);
  await user.type(screen.getByLabelText(/email/i), email);
  await user.type(screen.getByLabelText(/password/i), password);

  if (role !== 'creator') {
    const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
    await user.click(screen.getByRole('radio', { name: new RegExp(roleLabel, 'i') }));
  }
};

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('SignupForm', () => {
  beforeEach(() => {
    mockSignUp().mockReset();
    mockFrom().mockReset();
  });

  // 1. Rendering
  it('renders full name, email, password, role options and submit button', () => {
    render(<SignupForm />);
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /creator/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /innovator/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /visionary/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /admin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  // 2. Empty form — HTML required attribute prevents submission
  it('does not call signUp when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockSignUp()).not.toHaveBeenCalled();
  });

  // 3. Admin role blocked for non-admin email
  it('shows an error when admin role is selected with a non-admin email', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);
    await fillForm(user, { email: 'user@gmail.com', role: 'admin' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/admin accounts require an @futuretrendsent\.info email/i)
      ).toBeInTheDocument()
    );
    expect(mockSignUp()).not.toHaveBeenCalled();
  });

  // 4. Correct credentials passed to Supabase
  it('calls supabase.auth.signUp with the correct email and password', async () => {
    mockSignUp().mockResolvedValueOnce({
      data: { user: TEST_USER, session: { access_token: 'tok' } },
      error: null,
    });
    mockDbSuccess();
    const user = userEvent.setup();
    render(<SignupForm />);
    await fillForm(user, { email: 'creator@example.com', password: 'myPassw0rd' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() =>
      expect(mockSignUp()).toHaveBeenCalledWith({
        email: 'creator@example.com',
        password: 'myPassw0rd',
      })
    );
  });

  // 5. Profile upsert called after successful signup
  it('calls profiles.upsert after a successful signUp', async () => {
    mockSignUp().mockResolvedValueOnce({
      data: { user: TEST_USER, session: { access_token: 'tok' } },
      error: null,
    });
    const chain = mockDbSuccess();
    const user = userEvent.setup();
    render(<SignupForm />);
    await fillForm(user, { fullName: 'Jane Creator' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(mockFrom()).toHaveBeenCalledWith('profiles'));
    expect(chain.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        id: TEST_USER.id,
        email: TEST_USER.email,
        full_name: 'Jane Creator',
        role: 'creator',
      }),
      { onConflict: 'id' }
    );
  });

  // 6. Email confirmation required — session is null
  it('shows "check your email" message when session is null', async () => {
    mockSignUp().mockResolvedValueOnce({
      data: { user: TEST_USER, session: null },
      error: null,
    });
    mockDbSuccess();
    const user = userEvent.setup();
    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() =>
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    );
  });

  // 7. Generic Supabase error shown
  it('shows a generic error when supabase.auth.signUp fails', async () => {
    mockSignUp().mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Signup service unavailable' },
    });
    const user = userEvent.setup();
    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() =>
      expect(screen.getByText(/signup service unavailable/i)).toBeInTheDocument()
    );
  });

  // 8. "Already registered" friendly error
  it('shows friendly message for "already registered" Supabase error', async () => {
    mockSignUp().mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'User already registered' },
    });
    const user = userEvent.setup();
    render(<SignupForm />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() =>
      expect(
        screen.getByText(/recently used.*wait 60 seconds|already registered/i)
      ).toBeInTheDocument()
    );
  });

  // 9. onSuccess callback called on happy path
  it('calls onSuccess after a fully successful signup', async () => {
    mockSignUp().mockResolvedValueOnce({
      data: { user: TEST_USER, session: { access_token: 'tok' } },
      error: null,
    });
    mockDbSuccess();
    const onSuccess = jest.fn();
    const user = userEvent.setup();
    render(<SignupForm onSuccess={onSuccess} />);
    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
  });

  // 10. Password minimum length enforced at the HTML level
  it('enforces a minimum password length of 6 on the input', () => {
    render(<SignupForm />);
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });
});

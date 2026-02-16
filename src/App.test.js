import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      }),
      signOut: jest.fn(),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null }),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
    }),
    removeChannel: jest.fn(),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({}),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: '' } }),
      }),
    },
  },
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  Routes: ({ children }) => <div>{children}</div>,
  Route: () => null,
  Navigate: () => null,
  useNavigate: () => jest.fn(),
}));

describe('App', () => {
  test('renders without crashing', () => {
    const App = require('./App').default;
    render(<App />);
  });
});

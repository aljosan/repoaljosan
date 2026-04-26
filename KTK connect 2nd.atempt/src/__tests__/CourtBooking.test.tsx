import { render, screen } from '@testing-library/react';
import BookingPage from '../pages/BookingPage';

test('renders the active booking page shell', () => {
  render(<BookingPage />);

  expect(screen.getByRole('heading', { name: /court booking/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /request booking/i })).toBeInTheDocument();
  expect(screen.getByText(/max 90 min per booking/i)).toBeInTheDocument();
});

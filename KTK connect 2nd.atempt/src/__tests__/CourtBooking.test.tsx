import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { UserRole } from '../../types';
import * as ClubContext from '../../context/ClubContext';
import CourtBooking from '../../components/views/CourtBooking';

const useClubSpy = jest.spyOn(ClubContext, 'useClub');

beforeEach(() => {
  useClubSpy.mockReturnValue({
    addBooking: jest.fn(() => ({ success: true, message: 'Booking successful!' })),
    allBookings: [],
    blockedSlots: [],
    cancelBooking: jest.fn(),
    groups: [],
    currentUser: {
      id: 'user-1',
      name: 'Alex Johnson',
      avatarUrl: 'https://example.com/avatar.png',
      role: UserRole.Admin,
      credits: 50,
    },
    users: [],
  });
});

afterEach(() => {
  useClubSpy.mockReset();
});

test('switches between booking and management tabs', () => {
  render(<CourtBooking />);

  expect(screen.getByRole('heading', { name: /court booking/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /my upcoming bookings/i }));

  expect(screen.getByText(/no upcoming bookings/i)).toBeInTheDocument();
});

test('opens the booking modal after selecting a slot', () => {
  render(<CourtBooking />);

  const [firstSlot] = screen.getAllByRole('button', { name: /book court/i });
  fireEvent.click(firstSlot);

  expect(screen.getByRole('heading', { name: /book court/i })).toBeInTheDocument();
});

import { render, screen, fireEvent } from '@testing-library/react';
import { jest } from '@jest/globals';
import { UserRole, type ClubEvent, type User } from '../../types';
import * as ClubContext from '../../context/ClubContext';
import EventCard from '../../components/dashboard/EventCard';

const useClubSpy = jest.spyOn(ClubContext, 'useClub');
let joinEventMock: jest.Mock;

beforeEach(() => {
  const users: User[] = [
    {
      id: 'user-1',
      name: 'Alex Johnson',
      avatarUrl: 'https://example.com/avatar.png',
      role: UserRole.Member,
      credits: 100,
    },
  ];

  joinEventMock = jest.fn();

  useClubSpy.mockReturnValue({
    users,
    currentUser: users[0],
    joinEvent: joinEventMock,
    leaveEvent: jest.fn(),
    deleteEvent: jest.fn(),
  });
});

afterEach(() => {
  useClubSpy.mockReset();
});

test('joins an event when the join button is clicked', () => {
  const event: ClubEvent = {
    id: 'event-1',
    title: 'Morning Social',
    type: 'Social',
    startTime: new Date('2025-01-01T10:00:00Z'),
    endTime: new Date('2025-01-01T11:00:00Z'),
    attendees: [],
    maxAttendees: 4,
  };

  render(<EventCard event={event} />);

  fireEvent.click(screen.getByRole('button', { name: /join/i }));

  expect(joinEventMock).toHaveBeenCalledWith('event-1');
});

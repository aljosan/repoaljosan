import { renderHook, act } from '@testing-library/react';
import { useClubData } from '../hooks/useClubData';

const createFutureDate = (daysFromNow: number, hour: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hour, 0, 0, 0);
  return date;
};

test('adds a booking without conflicts', () => {
  const { result } = renderHook(() => useClubData());
  const initialCount = result.current.allBookings.length;

  const startTime = createFutureDate(365, 10);
  const endTime = createFutureDate(365, 11);

  let response: { success: boolean; message: string } | undefined;

  act(() => {
    response = result.current.addBooking(
      {
        courtId: 1,
        courtType: 'Indoor',
        startTime,
        endTime,
        cost: 10,
        notes: 'Practice session',
      },
      'card'
    );
  });

  expect(response?.success).toBe(true);
  expect(result.current.allBookings.length).toBe(initialCount + 1);
});

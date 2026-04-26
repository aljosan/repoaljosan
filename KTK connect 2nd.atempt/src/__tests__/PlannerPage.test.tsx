import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlannerPage from '../pages/PlannerPage';

test('adds a draft session in the active planner page', async () => {
  const user = userEvent.setup();
  render(<PlannerPage />);

  expect(screen.getByRole('heading', { name: /training planner/i })).toBeInTheDocument();
  expect(screen.getByText(/no draft sessions yet/i)).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: /add draft session/i }));

  expect(screen.getByText('New session')).toBeInTheDocument();
  expect(screen.getByText(/focus: technical/i)).toBeInTheDocument();
});

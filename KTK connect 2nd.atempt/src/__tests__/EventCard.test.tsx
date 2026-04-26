import { render, screen } from '@testing-library/react';
import Button from '../components/common/Button';

test('renders the active shared button component', () => {
  render(<Button variant="secondary">Save changes</Button>);

  expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
});

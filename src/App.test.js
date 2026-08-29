import { render, screen } from '@testing-library/react';
import App from './App';

test('renders FundingWala header', () => {
  render(<App />);
  const titleElement = screen.getByText(/FundingWala/i);
  expect(titleElement).toBeInTheDocument();
});

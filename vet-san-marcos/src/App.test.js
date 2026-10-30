import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the veterinary home heading', () => {
  render(<App />);
  expect(screen.getByText(/Cuidamos a quienes más quieres/i)).toBeInTheDocument();
});

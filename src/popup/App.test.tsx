import { render, screen } from '@testing-library/react'

import App from './App'

it('App render', () => {
  render(<App />)

  expect(screen.queryByText(/Popup/i)).toBeInTheDocument()
})

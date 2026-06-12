import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from '../pages/Dashboard'

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '../services/api'

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    api.get.mockResolvedValue({ data: { status: 'success', message: 'Connected' } })
    render(<Dashboard />)
    expect(screen.getByText(/connecting to backend/i)).toBeInTheDocument()
  })

  it('shows error when backend connection fails', async () => {
    api.get.mockRejectedValue(new Error('Network Error'))
    render(<Dashboard />)
    const errorAlert = await screen.findByRole('alert')
    expect(errorAlert).toHaveTextContent(/backend connection failed/i)
  })

  it('renders stat cards with data', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/test') {
        return Promise.resolve({ data: { status: 'success', message: 'Connected' } })
      }
      if (url === '/dashboard/stats') {
        return Promise.resolve({
          data: {
            total_sales_today: 1500.50,
            total_transactions_today: 25,
            total_products: 100,
            low_stock_count: 3,
            total_customers: 45,
            recent_sales: [],
            top_products: [],
          },
        })
      }
      return Promise.reject(new Error('Unknown URL'))
    })

    render(<Dashboard />)

    expect(await screen.findByText(/today's sales/i)).toBeInTheDocument()
    expect(screen.getByText('$1500.5')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
  })

  it('renders success alert when connected', async () => {
    api.get.mockResolvedValue({ data: { status: 'success', message: 'Backend Connected Successfully' } })
    render(<Dashboard />)
    expect(await screen.findByText(/backend connected successfully/i)).toBeInTheDocument()
  })
})

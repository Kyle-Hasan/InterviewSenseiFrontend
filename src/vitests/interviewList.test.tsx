import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InterviewList from '@/components/InterviewList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/app/utils/axiosInstance'
import SignalRContext, { SignalRContextType } from '@/app/contexts/SignalRContext'
import debounce from 'lodash/debounce'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/app/utils/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}))

const mockedAxios = axiosInstance as {
  get: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
}

vi.mock('lodash/debounce', () => ({
  default: (fn: any) => fn,
}))

vi.mock('@/components/VirtualScroller', () => {
  const VirtualScrollerMock = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  VirtualScrollerMock.displayName = 'VirtualScroller'
  return { default: VirtualScrollerMock }
})

vi.mock('@/components/AlertDialogButton', () => {
  const AlertDialogButtonMock = (props: { onConfirm: () => void; buttonContent: React.ReactNode; dialogContent: string }) => (
    <button onClick={props.onConfirm}>Confirm</button>
  )
  AlertDialogButtonMock.displayName = 'AlertDialogButton'
  return { AlertDialogButton: AlertDialogButtonMock, default: AlertDialogButtonMock }
})

vi.mock('@/components/Spinner', () => ({
  __esModule: true,
  default: () => <div role="progressbar">Loading...</div>,
}))

vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />,
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock('hugeicons-react', () => ({
  Delete02Icon: () => <svg data-testid="delete-icon" />,
  PencilEdit02Icon: () => <svg data-testid="pencil-icon" />,
  ArrowUp02Icon: (props: any) => <svg {...props} data-testid="arrow-up-icon" />,
  ArrowDown02Icon: (props: any) => <svg {...props} data-testid="arrow-down-icon" />,
}))

describe('InterviewList', () => {
  const baseInterviews = [
    { id: 1, name: 'Interview 1', createdDate: '2023-01-01' },
    { id: 2, name: 'Interview 2', createdDate: '2023-01-02' },
  ]
  const mockPagination = { total: 2 }
  const mockRouter = { push: vi.fn() }
  ;(useRouter as unknown as vi.Mock).mockReturnValue(mockRouter)
  const createQueryClient = () =>
    new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const mockSignalRContext: SignalRContextType = {
    createConnection: vi.fn().mockResolvedValue(null),
    disconnectConnection: vi.fn().mockResolvedValue(undefined),
    disconnectAllConnections: vi.fn().mockResolvedValue(undefined),
    connections: new Map(),
  }
  const renderComponent = () => {
    const queryClient = createQueryClient()
    return render(
      <QueryClientProvider client={queryClient}>
        <SignalRContext.Provider value={mockSignalRContext}>
          <InterviewList />
        </SignalRContext.Provider>
      </QueryClientProvider>
    )
  }
  beforeEach(() => {
    vi.clearAllMocks()
    ;(mockedAxios.get as vi.Mock).mockResolvedValue({
      data: baseInterviews,
      headers: { pagination: JSON.stringify(mockPagination) },
    })
    ;(mockedAxios.delete as vi.Mock).mockResolvedValue({})
    ;(mockedAxios.put as vi.Mock).mockResolvedValue({ data: baseInterviews[0] })
  })
  it('renders loading state initially', async () => {
    ;(mockedAxios.get as vi.Mock).mockImplementation(() => new Promise(() => {}))
    renderComponent()
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
  })
  it('renders API response on the screen', async () => {
    renderComponent()
    await waitFor(() => {
      baseInterviews.forEach((interview) => {
        expect(screen.getByText(interview.name)).toBeInTheDocument()
      })
    })
  })
  it('navigates to interview view on click', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getByText('Interview 1')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Interview 1'))
    expect(mockRouter.push).toHaveBeenCalledWith('/viewInterview/1')
  })
  it('deletes an interview and removes it from the screen', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getByText('Interview 1')).toBeInTheDocument())
    const confirmButton = screen.getAllByText('Confirm')[0]
    fireEvent.click(confirmButton)
    await waitFor(() => expect(mockedAxios.delete).toHaveBeenCalledWith('/Interview/1'))
    ;(mockedAxios.get as vi.Mock).mockResolvedValueOnce({
      data: baseInterviews.filter((i) => i.id !== 1),
      headers: { pagination: JSON.stringify({ total: 1 }) },
    })
    fireEvent.change(screen.getByPlaceholderText('Search by name'), { target: { value: '' } })
    await waitFor(() => {
      expect(screen.queryByText('Interview 1')).toBeNull()
      expect(screen.getByText('Interview 2')).toBeInTheDocument()
    })
  })
  it('renders filtered interviews after search', async () => {
    const filteredInterviews = [baseInterviews[1]]
    ;(mockedAxios.get as vi.Mock).mockResolvedValueOnce({
      data: filteredInterviews,
      headers: { pagination: JSON.stringify({ total: 1 }) },
    })
    renderComponent()
    const searchInput = await screen.findByPlaceholderText('Search by name')
    fireEvent.change(searchInput, { target: { value: 'Interview 2' } })
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })
    await waitFor(() => {
      expect(screen.getByText('Interview 2')).toBeInTheDocument()
      expect(screen.queryByText('Interview 1')).toBeNull()
    })
  })
  it('renders sorted interviews after sort by date', async () => {
    const sortedByDate = [
      { id: 2, name: 'Interview 2', createdDate: '2023-01-02' },
      { id: 1, name: 'Interview 1', createdDate: '2023-01-01' },
    ]
    ;(mockedAxios.get as vi.Mock).mockResolvedValueOnce({
      data: sortedByDate,
      headers: { pagination: JSON.stringify({ total: 2 }) },
    })
    renderComponent()
    const sortByDateBtn = await screen.findByText('Sort by date')
    fireEvent.click(sortByDateBtn)
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })
    await waitFor(() => {
      const items = screen.getAllByText(/Interview [12]/)
      expect(items[0]).toHaveTextContent('Interview 2')
      expect(items[1]).toHaveTextContent('Interview 1')
    })
  })
  it('renders sorted interviews after sort by name', async () => {
    const sortedByName = [
      { id: 1, name: 'A Interview', createdDate: '2023-01-01' },
      { id: 2, name: 'B Interview', createdDate: '2023-01-02' },
    ]
    ;(mockedAxios.get as vi.Mock).mockResolvedValueOnce({
      data: sortedByName,
      headers: { pagination: JSON.stringify({ total: 2 }) },
    })
    renderComponent()
    const sortByNameBtn = await screen.findByText('Sort by name')
    fireEvent.click(sortByNameBtn)
    await waitFor(() => {
      expect(mockedAxios.get).toHaveBeenCalled()
    })
    await waitFor(() => {
      const items = screen.getAllByText(/Interview/)
      expect(items[0]).toHaveTextContent('A Interview')
      expect(items[1]).toHaveTextContent('B Interview')
    })
  })
  it('renders no interviews message when API returns empty list', async () => {
    ;(mockedAxios.get as vi.Mock).mockResolvedValueOnce({
      data: [],
      headers: { pagination: JSON.stringify({ total: 0 }) },
    })
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('No Interviews')).toBeInTheDocument()
    })
  })
  it('handles query error and logs error message', async () => {
    ;(mockedAxios.get as unknown as vi.Mock).mockRejectedValue(new Error('Test Error'))
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    renderComponent()
    await waitFor(() => {
      const errorLogged = consoleSpy.mock.calls.some((call) => {
        const arg = call[0]
        return typeof arg === 'string'
          ? arg.includes('Test Error')
          : arg instanceof Error && arg.message === 'Test Error'
      })
      expect(errorLogged).toBe(true)
    })
    consoleSpy.mockRestore()
  })
})

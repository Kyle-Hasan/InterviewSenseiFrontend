import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import InterviewList from '@/components/InterviewList'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/app/utils/axiosInstance'
import SignalRContext, { SignalRContextType } from '@/app/contexts/SignalRContext'
import debounce from 'lodash/debounce'

// --- Mocks ---

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock axiosInstance
vi.mock('@/app/utils/axiosInstance', () => ({
  get: vi.fn(),
  delete: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@/app/utils/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}))
// Create a local alias for convenience.
const mockedAxios = axiosInstance

// Unwrap VirtualScroller so it just renders children.
vi.mock('@/components/VirtualScroller', () => {
  const VirtualScrollerMock = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  VirtualScrollerMock.displayName = 'VirtualScroller'
  return { default: VirtualScrollerMock }
})

// Unwrap AlertDialogButton to render a simple "Confirm" button.
vi.mock('@/components/AlertDialogButton', () => {
  const AlertDialogButtonMock = (props: { onConfirm: () => void; buttonContent: React.ReactNode; dialogContent: string }) => (
    <button onClick={props.onConfirm}>Confirm</button>
  )
  AlertDialogButtonMock.displayName = 'AlertDialogButton'
  return { AlertDialogButton: AlertDialogButtonMock, default: AlertDialogButtonMock }
})

// Mock Spinner as a simple div with role="progressbar"
vi.mock('@/components/Spinner', () => ({
  __esModule: true,
  default: () => <div role="progressbar">Loading...</div>,
}))

// Mock UI Input and Button if needed.
vi.mock('@/components/ui/button', () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}));

// Mock hugeicons-react icons.
vi.mock('hugeicons-react', () => ({
  Delete02Icon: () => <svg data-testid="delete-icon" />,
  PencilEdit02Icon: () => <svg data-testid="pencil-icon" />,
  ArrowUp02Icon: (props: any) => <svg {...props} data-testid="arrow-up-icon" />,
  ArrowDown02Icon: (props: any) => <svg {...props} data-testid="arrow-down-icon" />,
}))

// --- Test Suite ---

describe('InterviewList', () => {
  const mockInterviews = [
    { id: 1, name: 'Interview 1', createdDate: '2023-01-01' },
    { id: 2, name: 'Interview 2', createdDate: '2023-01-02' },
  ]
  // Example PaginationParams shape: only total is used.
  const mockPagination = { total: 2 }

  const mockRouter = { push: vi.fn() }
  ;(useRouter as unknown as vi.Mock).mockReturnValue(mockRouter)

  // Create a fresh QueryClient for each test.
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
    ;(axiosInstance.get as vi.Mock).mockResolvedValue({
      data: mockInterviews,
      headers: { pagination: JSON.stringify(mockPagination) },
    })
    ;(axiosInstance.delete as vi.Mock).mockResolvedValue({})
    ;(axiosInstance.put as vi.Mock).mockResolvedValue({ data: mockInterviews[0] })
  })

  it('renders loading state initially', async () => {
    // Simulate loading: axiosInstance.get never resolves.
    ;(axiosInstance.get as vi.Mock).mockImplementation(() => new Promise(() => {}))
    renderComponent()
    expect(await screen.findByRole('progressbar')).toBeInTheDocument()
  })

  it('renders interviews on successful query', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Interview 1')).toBeInTheDocument()
      expect(screen.getByText('Interview 2')).toBeInTheDocument()
    })
  })

  it('navigates to interview view on click', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getByText('Interview 1')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Interview 1'))
    expect(mockRouter.push).toHaveBeenCalledWith('/viewInterview/1')
  })

  it('deletes an interview', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getByText('Interview 1')).toBeInTheDocument())
    // Our AlertDialogButton mock renders a button with text "Confirm".
    const confirmButton = screen.getAllByText('Confirm')[0]
    fireEvent.click(confirmButton)
    await waitFor(() => expect(axiosInstance.delete).toHaveBeenCalledWith('/Interview/1'))
  })

  it('handles search input', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getByPlaceholderText('Search by name')).toBeInTheDocument())
    const searchInput = screen.getByPlaceholderText('Search by name')
    fireEvent.change(searchInput, { target: { value: 'Test' } })
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled())
  })

  it('sorts by date', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getByText('Sort by date')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Sort by date'))
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled())
  })

  it('sorts by name', async () => {
    renderComponent()
    await waitFor(() => expect(screen.getByText('Sort by name')).toBeInTheDocument())
    fireEvent.click(screen.getByText('Sort by name'))
    await waitFor(() => expect(axiosInstance.get).toHaveBeenCalled())
  })

  it('renders no interviews message when no interviews are present', async () => {
    ;(axiosInstance.get as vi.Mock).mockResolvedValue({
      data: [],
      headers: { pagination: JSON.stringify({ total: 0 }) },
    })
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('No Interviews')).toBeInTheDocument()
    })
  })

  it('handles query error', async () => {
    (mockedAxios.get as unknown as vi.Mock).mockRejectedValue(new Error('Test Error'))
(new Error('Test Error'));
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderComponent();
    await waitFor(() => {
      // Check if any console log call contains "Test Error" either as a string or from an Error instance.
      const errorLogged = consoleSpy.mock.calls.some((call) => {
        const arg = call[0];
        if (typeof arg === 'string') {
          return arg.includes('Test Error');
        } else if (arg instanceof Error) {
          return arg.message === 'Test Error';
        }
        return false;
      });
      expect(errorLogged).toBe(true);
    });
    consoleSpy.mockRestore();
  });
})

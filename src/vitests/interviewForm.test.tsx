/// <reference types="vitest" />
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import * as axiosInstance from '@/app/utils/axiosInstance'
import SignalRContext, { SignalRContextType } from '@/app/contexts/SignalRContext'
import debounce from 'lodash/debounce'
import { InterviewForm } from '@/components/InterviewForm'
import { interviewType } from '@/app/types/interviewType'

// --- Mocks ---

// Mock next/navigation to provide useRouter.
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

// Mock axiosInstance completely
vi.mock('@/app/utils/axiosInstance', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
  },
}));

// Explicitly type the mocked axios
const mockedAxios = axiosInstance.default as {
  get: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

// Mock debounce to immediately execute the function.
vi.mock('lodash/debounce', () => ({
  default: (fn: any) => fn,
}));

// Mock VirtualScroller to simply render children.
vi.mock('@/components/VirtualScroller', () => {
  const VirtualScrollerMock = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
  VirtualScrollerMock.displayName = 'VirtualScroller'
  return { default: VirtualScrollerMock }
});

// Mock AlertDialogButton to render a button that calls onConfirm.
vi.mock('@/components/AlertDialogButton', () => {
  const AlertDialogButtonMock = (props: { onConfirm: () => void; buttonContent: React.ReactNode; dialogContent: string }) => (
    <button onClick={props.onConfirm}>Confirm</button>
  )
  AlertDialogButtonMock.displayName = 'AlertDialogButton'
  return { default: AlertDialogButtonMock }
});

// Mock Spinner to render a div with role="progressbar".
vi.mock('@/components/Spinner', () => ({
  __esModule: true,
  default: () => <div role="progressbar">Loading...</div>,
}));

// Mock UI Input and Button with proper exports
vi.mock('@/components/ui/input', () => ({
  __esModule: true,
  default: React.forwardRef((props: any, ref) => <input ref={ref} {...props} />),
  Input: React.forwardRef((props: any, ref) => <input ref={ref} {...props} />),
}));

vi.mock('@/components/ui/button', () => ({
  __esModule: true,
  default: (props: any) => <button {...props} />,
  Button: (props: any) => <button {...props} />,
}));

// Mock hugeicons-react icons.
vi.mock('hugeicons-react', () => ({
  Delete02Icon: () => <svg data-testid="delete-icon" />,
  PencilEdit02Icon: () => <svg data-testid="pencil-icon" />,
  ArrowUp02Icon: (props: any) => <svg {...props} data-testid="arrow-up-icon" />,
  ArrowDown02Icon: (props: any) => <svg {...props} data-testid="arrow-down-icon" />,
}));

// --- Test Suite ---
// For testing, define a dummy interviewType.

describe('InterviewForm', () => {
  const initialData = {
    resume: null,
    resumeUrl: null,
    numberOfBehavioral: 1,
    numberOfTechnical: 1,
    jobDescription: 'Job description',
    name: 'Test Interview',
    secondsPerAnswer: 30,
    additionalDescription: 'Additional description',
    type: interviewType.NonLive,
  };
  const initialResumeUrl = '';
  const initialResumeName = '';
  const allResumes: any[] = [];

  // Router mock.
  const mockRouter = { replace: vi.fn() };
  (useRouter as unknown as vi.Mock).mockReturnValue(mockRouter);

  // Create a fresh QueryClient for each test.
  const createQueryClient = () =>
    new QueryClient({ defaultOptions: { queries: { retry: false } } });

  // Minimal SignalR context.
  const mockSignalRContext: SignalRContextType = {
    createConnection: vi.fn().mockResolvedValue(null),
    disconnectConnection: vi.fn().mockResolvedValue(undefined),
    disconnectAllConnections: vi.fn().mockResolvedValue(undefined),
    connections: new Map(),
  };

  const renderComponent = () => {
    const queryClient = createQueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <SignalRContext.Provider value={mockSignalRContext}>
          <InterviewForm
            initialData={initialData}
            initialResumeName={initialResumeName}
            initialResumeUrl={initialResumeUrl}
            disabled={false}
            allResumes={allResumes}
          />
        </SignalRContext.Provider>
      </QueryClientProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Simulate a successful post request.
    mockedAxios.post.mockResolvedValue({
      data: {
        id: 123,
        questions: [{ id: 1 }, { id: 2 }],
        type: interviewType.NonLive,
      },
    });
  });

  it('renders the form with initial data', async () => {
    renderComponent();
    // Check that the "name" input is rendered.
    expect(screen.getByPlaceholderText('name')).toBeInTheDocument();
    expect(screen.getByText(/Generate Interview Questions|Interview Information/)).toBeInTheDocument();
  });

  it('shows validation error when name is empty', async () => {
    renderComponent();
    const nameInput = screen.getByPlaceholderText('name');
    fireEvent.change(nameInput, { target: { value: '' } });
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Interview needs a name/)).toBeInTheDocument();
    });
  });

  it('submits form and navigates on success', async () => {
    renderComponent();
    expect(screen.getByPlaceholderText('name')).toHaveValue('Test Interview');
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/Interview/generateInterview',
        expect.objectContaining({ name: 'Test Interview' }),
        expect.any(Object)
      );
    });
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalled();
    });
  });

  it('handles query error on submit', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Test Error'));
    renderComponent();
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText(/Errors :/)).toBeInTheDocument();
    });
  });
});
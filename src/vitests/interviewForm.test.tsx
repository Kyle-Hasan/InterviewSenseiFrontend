/// <reference types="vitest" />
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/app/utils/axiosInstance'
import SignalRContext, { SignalRContextType } from '@/app/contexts/SignalRContext'
import debounce from 'lodash/debounce'
import { InterviewForm } from '@/components/InterviewForm'
import { interviewType } from '@/app/types/interviewType'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/app/utils/axiosInstance', () => ({
  get: vi.fn(),
  delete: vi.fn(),
  put: vi.fn(),
  post: vi.fn(),
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
  return { default: AlertDialogButtonMock }
})

vi.mock('@/components/Spinner', () => ({
  __esModule: true,
  default: () => <div role="progressbar">Loading...</div>,
}))

vi.mock('@/components/ui/input', () => ({
  __esModule: true,
  default: React.forwardRef((props: any, ref) => <input ref={ref} {...props} />),
  Input: React.forwardRef((props: any, ref) => <input ref={ref} {...props} />),
}))

vi.mock('@/components/ui/button', () => ({
  __esModule: true,
  default: (props: any) => <button {...props} />,
  Button: (props: any) => <button {...props} />,
}))

vi.mock('hugeicons-react', () => ({
  Delete02Icon: () => <svg data-testid="delete-icon" />,
  PencilEdit02Icon: () => <svg data-testid="pencil-icon" />,
  ArrowUp02Icon: (props: any) => <svg {...props} data-testid="arrow-up-icon" />,
  ArrowDown02Icon: (props: any) => <svg {...props} data-testid="arrow-down-icon" />,
}))

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
  }
  const initialResumeUrl = ''
  const initialResumeName = ''
  const allResumes: any[] = []
  const mockRouter = { replace: vi.fn() }
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
          <InterviewForm
            initialData={initialData}
            initialResumeName={initialResumeName}
            initialResumeUrl={initialResumeUrl}
            disabled={false}
            allResumes={allResumes}
          />
        </SignalRContext.Provider>
      </QueryClientProvider>
    )
  }
  beforeEach(() => {
    vi.clearAllMocks()
    mockedAxios.post.mockResolvedValue({
      data: {
        id: 123,
        questions: [{ id: 1 }, { id: 2 }],
        type: interviewType.NonLive,
      },
    })
  })
  it('renders the form with initial data', async () => {
    renderComponent()
    expect(screen.getByPlaceholderText('name')).toBeInTheDocument()
    expect(screen.getByText(/Generate Interview Questions|Interview Information/)).toBeInTheDocument()
  })
  it('shows validation error when name is empty', async () => {
    renderComponent()
    const nameInput = screen.getByPlaceholderText('name')
    fireEvent.change(nameInput, { target: { value: '' } })
    const submitButton = screen.getByRole('button', { name: /Submit/i })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/Interview needs a name/)).toBeInTheDocument()
    })
  })
  it('shows validation error when sum of behavioral and technical questions is 0 for NonLive interviews', async () => {
    renderComponent()
    fireEvent.click(screen.getByText(/Select the number of behavioral questions/i))
    fireEvent.click(screen.getByText('0'))
    fireEvent.click(screen.getByText(/Select the number of technical questions/i))
    fireEvent.click(screen.getByText('0'))
    const submitButton = screen.getByRole('button', { name: /Submit/i })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/Need more than 1 question/)).toBeInTheDocument()
    })
  })
  it('does not render behavioral, technical, and seconds per answer fields for non NonLive interview types', async () => {
    renderComponent()
    fireEvent.click(screen.getByText(/Select interview type/i))
    fireEvent.click(screen.getByText('Live coding'))
    expect(screen.queryByText('Max seconds per answer')).toBeNull()
    expect(screen.queryByText(/Select the number of behavioral questions/i)).toBeNull()
    expect(screen.queryByText(/Select the number of technical questions/i)).toBeNull()
  })
  it('submits form and navigates on success when all fields are filled', async () => {
    renderComponent()
    const nameInput = screen.getByPlaceholderText('name')
    fireEvent.change(nameInput, { target: { value: 'Updated Interview Name' } })
    fireEvent.click(screen.getByText(/Select interview type/i))
    fireEvent.click(screen.getByText('Non live'))
    const secondsInput = screen.getByPlaceholderText('0')
    fireEvent.change(secondsInput, { target: { value: '45' } })
    fireEvent.click(screen.getByText(/Select the number of behavioral questions/i))
    fireEvent.click(screen.getByText('2'))
    fireEvent.click(screen.getByText(/Select the number of technical questions/i))
    fireEvent.click(screen.getByText('3'))
    const jobDescription = screen.getByText('Job Description').nextElementSibling as HTMLTextAreaElement
    fireEvent.change(jobDescription, { target: { value: 'Updated Job Description' } })
    const additionalDescription = screen.getByText('Additional Description').nextElementSibling as HTMLTextAreaElement
    fireEvent.change(additionalDescription, { target: { value: 'Updated Additional Description' } })
    const submitButton = screen.getByRole('button', { name: /Submit/i })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        '/Interview/generateInterview',
        expect.objectContaining({
          name: 'Updated Interview Name',
          secondsPerAnswer: 45,
          numberOfBehavioral: 2,
          numberOfTechnical: 3,
          jobDescription: 'Updated Job Description',
          additionalDescription: 'Updated Additional Description',
          type: interviewType.NonLive,
        }),
        expect.any(Object)
      )
    })
    await waitFor(() => {
      expect(mockRouter.replace).toHaveBeenCalled()
    })
  })
  it('handles query error on submit', async () => {
    mockedAxios.post.mockRejectedValue(new Error('Test Error'))
    renderComponent()
    const submitButton = screen.getByRole('button', { name: /Submit/i })
    fireEvent.click(submitButton)
    await waitFor(() => {
      expect(screen.getByText(/Errors :/)).toBeInTheDocument()
    })
  })
})

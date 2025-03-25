/// <reference types="vitest" />
import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CodeEditor from '@/components/CodeEditor'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axiosInstance from '@/app/utils/axiosInstance'
import SignalRContext, { SignalRContextType } from '@/app/contexts/SignalRContext'
import debounce from 'lodash/debounce'
import CodeResult from '@/components/CodeResult'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('@/app/utils/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
    put: vi.fn(),
  },
}))
// Use the default export if available; otherwise, use the module.
const mockedAxios = ((axiosInstance as any).default) || axiosInstance

vi.mock('lodash/debounce', () => ({
  default: (fn: any) => fn,
}))

vi.mock('@monaco-editor/react', () => ({
  default: ({ onChange, value }: { onChange: (value: string | undefined, event: unknown) => void; value: string }) => (
    <textarea data-testid="editor" value={value} onChange={(e) => onChange(e.target.value, null)} />
  ),
}))

vi.mock('@/components/CodeResult', () => {
  console.log('Mocking CodeResult')
  return {
    default: ({ codeRunResult }: { codeRunResult: any }) =>
      <div data-testid="code-result">{codeRunResult ? codeRunResult.stdout : 'No Result'}</div>,
  }
})

vi.mock('@/components/ui/button', () => ({
  __esModule: true,
  default: (props: any) => <button {...props} />,
  Button: (props: any) => <button {...props} />,
}));

vi.mock('@/components/ui/input', () => ({
  __esModule: true,
  default: (props: any) => <input {...props} />,
}))

vi.mock('@/components/ui/textarea', () => ({
  __esModule: true,
  default: (props: any) => <textarea {...props} />,
}))

vi.mock('@/components/ui/select', () => ({
  __esModule: true,
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) => <button data-testid={`select-item-${value}`}>{children}</button>,
  SelectTrigger: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => <button data-testid="select-trigger" onClick={onClick}>{children}</button>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <div>{placeholder}</div>,
}));

vi.mock('@/components/FileSelect', () => ({
  default: () => <div>FileSelect</div>,
}));

vi.mock('@/app/hooks/useInterviews', () => ({
  useInterviewStore: () => ({ setInterview: vi.fn() }),
}));



const interviewType = {
  NonLive: 'NonLive',
  LiveCoding: 'LiveCoding',
  CodeReview: 'CodeReview',
  Live: 'Live',
}

describe('CodeEditor', () => {
  const codeDefault = 'print("Hello")'
  const languageDefault = 'python'
  const interviewId = 42
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
          <CodeEditor codeDefault={codeDefault} languageDefault={languageDefault} interviewId={interviewId} />
        </SignalRContext.Provider>
      </QueryClientProvider>
    )
  }
  beforeEach(() => {
    vi.clearAllMocks()
  })
  it('renders the editor with default code and language select', async () => {
    renderComponent()
    expect(screen.getByTestId('editor')).toHaveValue(codeDefault)
    expect(screen.getByText('Select Language')).toBeInTheDocument()
  })
  it('updates code when editor changes', async () => {
    renderComponent()
    const editor = screen.getByTestId('editor')
    fireEvent.change(editor, { target: { value: 'print("Changed")' } })
    expect(editor).toHaveValue('print("Changed")')
  })
  it(
    'submits code and polls for result',
    async () => {
      vi.useFakeTimers()
      mockedAxios.post.mockResolvedValue({
        data: { codeSubmissionId: 101 },
      })
      const fakeResult = {
        stdout: 'Hello World',
        time: '1s',
        memory: 123,
        stderr: null,
        compile_output: null,
        message: null,
        status: { id: 3, description: 'Accepted' },
      }
      mockedAxios.get.mockResolvedValueOnce({ data: fakeResult })
      renderComponent()
      const runButton = screen.getByRole('button', { name: 'Run Code' })
      fireEvent.click(runButton)
      await waitFor(() => {
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/CodeRunner/submitCode',
          {
            sourceCode: codeDefault,
            interviewId,
            stdin: "",
            languageName: languageDefault,
          },
          expect.any(Object)
        )
      })
      await waitFor(() => console.log(screen.debug()))
      vi.advanceTimersByTime(1000)
      await waitFor(() => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          '/CodeRunner/checkSubmission?codeSubmissionId=101'
        )
      })
      await waitFor(() => {
        expect(screen.getByTestId('code-result')).toHaveTextContent('Hello World')
      })
      vi.useRealTimers()
    },
    5000
  )
})

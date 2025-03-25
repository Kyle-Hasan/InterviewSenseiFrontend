import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LiveInterviewTranscript from '@/components/LiveInterviewTranscript'
import { message } from '@/app/types/message'

// Mock UI components
vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ value, onChange, placeholder }: any) => (
    <textarea
      data-testid="message-input"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick }: any) => (
    <button data-testid="send-button" onClick={onClick}>{children}</button>
  ),
}));

// Mock Spinner component
vi.mock('@/components/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock DisplayMessage component
vi.mock('@/components/DisplayMessage', () => ({
  default: ({ message, loading }: { message: message; loading: boolean }) => (
    <div data-testid={`message-${message.id}`}>
      {loading ? 'Loading...' : message.content}
    </div>
  ),
}));

describe('LiveInterviewTranscript', () => {
  const defaultProps = {
    transcripts: [],
    loadingTranscript: false,
    loadingMessage: false,
    loadingInitial: false,
    voiceMode: false,
    sendMessage: vi.fn(),
  };

  const mockMessages: message[] = [
    {
      id: 1,
      interviewId: 1,
      content: 'Hello',
      fromAI: false,
    },
    {
      id: 2,
      interviewId: 1,
      content: 'Hi there!',
      fromAI: true,
    },
  ];

  it('renders without crashing', () => {
    render(<LiveInterviewTranscript {...defaultProps} />);
    expect(screen.getByText('Transcript')).toBeInTheDocument();
  });

  it('shows loading spinner when loadingTranscript is true', () => {
    render(<LiveInterviewTranscript {...defaultProps} loadingTranscript={true} />);
    expect(screen.getByTestId('spinner')).toBeInTheDocument();
  });

  it('displays messages when available', () => {
    render(<LiveInterviewTranscript {...defaultProps} transcripts={mockMessages} />);
    expect(screen.getByTestId('message-1')).toHaveTextContent('Hello');
    expect(screen.getByTestId('message-2')).toHaveTextContent('Hi there!');
  });

  it('shows "No transcript available" when no messages and not loading', () => {
    render(<LiveInterviewTranscript {...defaultProps} />);
    expect(screen.getByText('No transcript available.')).toBeInTheDocument();
  });

  it('shows loading message when loadingMessage is true', () => {
    render(<LiveInterviewTranscript {...defaultProps} loadingMessage={true} />);
    expect(screen.getByTestId('message--2')).toHaveTextContent('Loading...');
  });

  it('shows initial loading message when loadingInitial is true', () => {
    render(<LiveInterviewTranscript {...defaultProps} loadingInitial={true} />);
    expect(screen.getByTestId('message--1')).toHaveTextContent('Loading...');
  });

  it('allows sending messages when not in voice mode', () => {
    render(<LiveInterviewTranscript {...defaultProps} />);
    
    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);
    
    expect(defaultProps.sendMessage).toHaveBeenCalledWith('Test message');
    expect(input).toHaveValue('');
  });

  it('does not show input area when in voice mode', () => {
    render(<LiveInterviewTranscript {...defaultProps} voiceMode={true} />);
    expect(screen.queryByTestId('message-input')).not.toBeInTheDocument();
    expect(screen.queryByTestId('send-button')).not.toBeInTheDocument();
  });

  it('does not send empty messages', () => {
    render(<LiveInterviewTranscript {...defaultProps} />);
    
    const input = screen.getByTestId('message-input');
    const sendButton = screen.getByTestId('send-button');
    
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(sendButton);
    
    expect(defaultProps.sendMessage).not.toHaveBeenCalled();
  });

  it('scrolls to bottom when messages change', () => {
    const { rerender } = render(<LiveInterviewTranscript {...defaultProps} />);
    
    // Mock scrollIntoView
    const mockScrollIntoView = vi.fn();
    const messagesEndRef = document.createElement('div');
    messagesEndRef.scrollIntoView = mockScrollIntoView;
    
    // Update messages
    rerender(<LiveInterviewTranscript {...defaultProps} transcripts={mockMessages} />);
    
    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
}); 
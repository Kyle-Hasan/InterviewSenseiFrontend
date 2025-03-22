import React from 'react'

interface CodeResultProps {
    output: string,
    error: string
}

export default function CodeResult({ output, error }: CodeResultProps) {
  return (
    <div className="rounded-md border border-gray-300 overflow-hidden w-full">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 font-medium text-gray-700">
        Result
      </div>
      <div className="p-4">
        {output && (
          <div className="mb-3">
            <div className="text-sm text-gray-500 mb-1">Output:</div>
            <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
              {output}
            </pre>
          </div>
        )}
        {error && (
          <div>
            <div className="text-sm text-red-500 mb-1">Error:</div>
            <pre className="bg-red-50 p-3 rounded text-sm font-mono text-red-600 overflow-x-auto">
              {error}
            </pre>
          </div>
        )}
        {!output && !error && (
          <div className="text-gray-500 italic text-sm">No output</div>
        )}
      </div>
    </div>
  )
}
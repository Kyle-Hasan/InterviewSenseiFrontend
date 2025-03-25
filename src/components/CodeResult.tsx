import React from 'react'

interface CodeResultProps {
    codeRunResult:CodeRunResult | null
}

interface CodeRunResult {
  stdout: string | null;
  time: string;
  memory: number;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: {
    id: number;
    description: string;
  };
}


export default function CodeResult({ codeRunResult }: CodeResultProps) {
  return (
    <div className="rounded-md border border-gray-300 overflow-hidden w-full">
      <div className="bg-gray-100 px-4 py-2 border-b border-gray-300 font-medium text-gray-700">
        Result
      </div>
      <div className="p-4">
        {codeRunResult?.stdout && (
          <div className="mb-3">
            <div className="text-sm text-gray-500 mb-1">Output:</div>
            <pre className="bg-gray-50 p-3 rounded text-sm font-mono overflow-x-auto">
              {codeRunResult.stdout}
            </pre>
          </div>
        )}
        {codeRunResult?.stderr && (
          <div>
            <div className="text-sm text-red-500 mb-1">Error:</div>
            <pre className="bg-red-50 p-3 rounded text-sm font-mono text-red-600 overflow-x-auto">
              {codeRunResult.stderr}
            </pre>
          </div>
        )}
        {!codeRunResult?.stderr && !codeRunResult?.stdout && (

          <div className="text-gray-500 italic text-sm">No output</div>
        )}
      </div>
    </div>
  )
}
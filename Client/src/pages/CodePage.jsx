import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { toast } from 'sonner'
import { getProblem } from '@/services/problems'
import { runCode, submitCode } from '@/services/code'
import Editor from '@monaco-editor/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Judge0 Language ID Mapping
const LANGUAGE_IDS = {
  cpp: '54',
  java: '62',
  javascript: '63'
}

function CodePage() {
  const { problemId } = useParams()   
  const [problem, setProblem] = useState(null)
  const [loading, setLoading] = useState(true)

  const [language, setLanguage] = useState('java')
  const [code, setCode] = useState('')
  const [codes, setCodes] = useState({})

  // Panel state
  const [activeConsoleTab, setActiveConsoleTab] = useState('result') // 'testcase' | 'result'
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0)
  const [testResults, setTestResults] = useState(null)
  const [overallPassed, setOverallPassed] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')

  const [running, setRunning] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // AI Evaluation Popup state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionData, setSubmissionData] = useState(null)

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await getProblem(problemId)

        if (data.status) {
          setProblem(data.data)

          const defaultCode = data.data.codeSnippets?.java || ''
          setCode(defaultCode)
          setCodes({ java: defaultCode })
        } else {
          toast.error(data.message || data.error || 'Failed to fetch problem')
        }
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProblem()
  }, [problemId])

  const handleLanguageChange = (lang) => {
    setCodes((prev) => ({
      ...prev,
      [language]: code
    }))

    setLanguage(lang)
    setCode(codes[lang] || problem.codeSnippets?.[lang] || '')
  }

  const handleRun = async () => {
    try {
      setRunning(true)
      setActiveConsoleTab('result')
      setStatusMessage('Running test cases...')
      setTestResults(null)

      const languageId = LANGUAGE_IDS[language] || '63'
      const codeData = { sourceCode: code, languageId, problemId }
      const res = await runCode(codeData)

      if (res.status) {
        setTestResults(res.data.testCaseResults || [])
        setOverallPassed(res.data.passed)
        setActiveTestCaseIdx(0)

        if (res.data.passed) {
          setStatusMessage('Accepted')
          toast.success(res.message || 'Accepted! All test cases passed.')
        } else {
          setStatusMessage('Wrong Answer')
          toast.error(`Passed ${res.data.passedTestCases}/${res.data.totalTestCases} test cases.`)
        }
      } else {
        setStatusMessage('Error')
        toast.error(res.message || res.error || 'Execution failed')
      }
    } catch (err) {
      setStatusMessage('Error')
      toast.error(err.message)
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    try {
      setSubmitting(true)
      setActiveConsoleTab('result')
      setStatusMessage('Submitting...')
      setTestResults(null)

      const languageId = LANGUAGE_IDS[language] || '63'
      const codeData = { sourceCode: code, languageId, problemId }
      const res = await submitCode(codeData)

      if (res.status && res.data) {
        setTestResults(res.data.testCaseResults || [])
        setOverallPassed(res.data.passed)
        setActiveTestCaseIdx(0)

        const passedCount = res.data.passedTestCases
        const totalCount = res.data.totalTestCases

        if (res.data.passed) {
          setStatusMessage(`Accepted (${passedCount}/${totalCount})`)
        } else {
          setStatusMessage(`Wrong Answer (${passedCount}/${totalCount})`)
        }

        // Store response data including backend message
        setSubmissionData({ ...res.data, apiMessage: res.message })
        setShowSubmissionModal(true)
      } else {
        setStatusMessage('Error')
        toast.error(res.message || 'Submission failed')
      }
    } catch (err) {
      setStatusMessage('Error')
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-6">Loading...</div>
  if (!problem) return <div className="p-6">Problem not found</div>

  const activeTestCase = testResults?.[activeTestCaseIdx]
  const aiEval = submissionData?.aiEvaluation
  
  // Handle Java JSON serialization where boolean isFirstSubmission becomes firstSubmission
  const isFirst = submissionData?.isFirstSubmission || submissionData?.firstSubmission

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row overflow-x-hidden">
      {/* LEFT PANEL */}
      <div className="w-full lg:w-1/2 lg:h-full overflow-y-auto p-4 sm:p-6 border-b lg:border-b-0 lg:border-r space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold">{problem.title}</h1>

        <div className="flex gap-2 flex-wrap">
          <Badge>{problem.difficulty}</Badge>
          {problem.topics?.map((t, i) => (
            <Badge key={i} variant="secondary">{t}</Badge>
          ))}
        </div>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <p className="text-sm whitespace-pre-wrap break-words">{problem.description}</p>
          </CardContent>
        </Card>

        {/* Examples */}
        <div>
          <h2 className="font-semibold mb-2 text-sm sm:text-base">Examples</h2>
          {problem.examples?.map((ex) => (
            <Card key={ex.exampleNum} className="mb-2">
              <CardContent className="p-3">
                <pre className="text-xs sm:text-sm whitespace-pre-wrap overflow-x-auto">{ex.exampleText}</pre>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Constraints */}
        <div>
          <h2 className="font-semibold mb-2 text-sm sm:text-base">Constraints</h2>
          <ul className="list-disc ml-5 text-xs sm:text-sm space-y-1">
            {problem.constraints?.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-[600px] lg:min-h-0 lg:h-full">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center p-3 sm:p-4 border-b bg-white">
          <h2 className="font-semibold text-sm sm:text-base">Code Editor</h2>

          <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto justify-end">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="border rounded px-2 py-1 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-slate-400"
            >
              {Object.keys(problem.codeSnippets || {}).map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={handleRun} disabled={running}>
              {running ? 'Running...' : 'Run'}
            </Button>

            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>

        {/* EDITOR */}
        <div className="h-[400px] lg:h-full lg:flex-1 w-full relative">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme="vs-dark"
            options={{
              automaticLayout: true,
              minimap: { enabled: false }
            }}
          />
        </div>

        {/* LEETCODE STYLE LIGHT CONSOLE PANEL */}
        <div className="h-64 border-t bg-slate-50 flex flex-col font-sans shrink-0">
          {/* CONSOLE HEADER TABS */}
          <div className="flex items-center gap-4 px-4 pt-2 border-b bg-white text-sm">
            <button
              onClick={() => setActiveConsoleTab('testcase')}
              className={`pb-2 font-medium ${
                activeConsoleTab === 'testcase'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Testcase
            </button>
            <button
              onClick={() => setActiveConsoleTab('result')}
              className={`pb-2 font-medium ${
                activeConsoleTab === 'result'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Result
            </button>
          </div>

          {/* CONSOLE CONTENT AREA */}
          <div className="flex-1 p-3 sm:p-4 overflow-y-auto text-sm">
            {activeConsoleTab === 'testcase' && (
              <div className="space-y-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {problem.testCases?.map((tc, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestCaseIdx(idx)}
                      className={`px-3 py-1 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                        activeTestCaseIdx === idx
                          ? 'bg-slate-200 text-slate-900'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>
                {problem.testCases?.[activeTestCaseIdx] && (
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">Input</span>
                    <pre className="bg-white border border-slate-200 p-3 rounded text-slate-800 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                      {problem.testCases[activeTestCaseIdx].input}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeConsoleTab === 'result' && (
              <div>
                {/* Status Badge Header */}
                {statusMessage && (
                  <div className="mb-3 flex items-center gap-2">
                    <span
                      className={`text-sm sm:text-base font-bold ${
                        overallPassed === true
                          ? 'text-emerald-600'
                          : overallPassed === false
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {statusMessage}
                    </span>
                  </div>
                )}

                {/* Case Tabs if Results Exist */}
                {testResults && testResults.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {testResults.map((tc, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveTestCaseIdx(idx)}
                          className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                            activeTestCaseIdx === idx
                              ? 'bg-slate-200 text-slate-900 border border-slate-300'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              tc.passed ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                          Case {idx + 1}
                        </button>
                      ))}
                    </div>

                    {activeTestCase && (
                      <div className="space-y-3">
                        {/* Input */}
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Input</span>
                          <pre className="bg-white border border-slate-200 p-2.5 rounded text-slate-800 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                            {activeTestCase.input}
                          </pre>
                        </div>

                        {/* Output */}
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Output</span>
                          <pre className="bg-white border border-slate-200 p-2.5 rounded text-slate-800 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                            {activeTestCase.actualOutput || '(empty)'}
                          </pre>
                        </div>

                        {/* Expected Output */}
                        <div>
                          <span className="text-xs text-slate-500 block mb-1">Expected</span>
                          <pre className="bg-white border border-slate-200 p-2.5 rounded text-slate-800 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                            {activeTestCase.expectedOutput}
                          </pre>
                        </div>

                        {/* Error output if present */}
                        {activeTestCase.error && (
                          <div>
                            <span className="text-xs text-rose-500 block mb-1">Error</span>
                            <pre className="bg-rose-50 border border-rose-200 p-2.5 rounded text-rose-600 font-mono text-xs whitespace-pre-wrap overflow-x-auto">
                              {activeTestCase.error}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs py-4">
                    {running || submitting ? 'Processing...' : 'Run or Submit code to see testcase results.'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SUBMISSION EVALUATION POPUP MODAL */}
      {showSubmissionModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
                  Submission & Evaluation Result
                </h2>
                <Badge variant={submissionData?.passed ? "default" : "destructive"}>
                  {submissionData?.passed ? "Passed" : "Failed"}
                </Badge>
              </div>
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-xl font-bold rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-800 dark:text-slate-200">
              
              {/* Submission Status Message Banner */}
              <div
                className={`p-3.5 rounded-lg border text-sm font-medium flex items-center justify-between ${
                  isFirst
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'
                }`}
              >
                <span>
                  {isFirst
                    ? 'Code submitted successfully and score generated.'
                    : 'Code already submitted previously. No score generated.'}
                </span>
                <Badge
                  variant="outline"
                  className={
                    isFirst
                      ? 'border-emerald-300 text-emerald-700 dark:text-emerald-300'
                      : 'border-amber-300 text-amber-700 dark:text-amber-300'
                  }
                >
                  {isFirst ? 'Submitted' : 'Re-submission'}
                </Badge>
              </div>

              {/* Test Cases Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Public Test Cases
                  </span>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {submissionData?.passedTestCases} / {submissionData?.totalTestCases} Passed
                  </p>
                </div>

                <div className="p-3 sm:p-4 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Hidden Test Cases
                  </span>
                  <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {submissionData?.passedHiddenTestCases} / {submissionData?.totalHiddenTestCases} Passed
                  </p>
                </div>
              </div>

              {/* AI Evaluation Output */}
              {aiEval && (
                <div className="space-y-6">
                  {/* Verdict & Summary */}
                  <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        Verdict: {aiEval.verdict}
                      </span>
                      {aiEval.overall_score !== undefined && (
                        <Badge variant="outline" className="text-sm font-semibold">
                          Score: {aiEval.overall_score}/100
                        </Badge>
                      )}
                    </div>
                    {aiEval.summary && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {aiEval.summary}
                      </p>
                    )}
                  </div>

                  {/* Approach & Complexity */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiEval.approach && (
                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 border-b pb-1">
                          Approach & Algorithm
                        </h3>
                        <p className="text-xs font-medium text-slate-500">
                          Algorithm: <span className="text-slate-800 dark:text-slate-200">{aiEval.approach.algorithm}</span>
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          Correctness: <span className="text-slate-800 dark:text-slate-200">{aiEval.approach.correctness}</span>
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {aiEval.approach.description}
                        </p>
                      </div>
                    )}

                    {aiEval.complexity && (
                      <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 border-b pb-1">
                          Complexity Analysis
                        </h3>
                        <div className="flex gap-4 text-xs font-medium">
                          <span>
                            Time: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{aiEval.complexity.time}</code>
                          </span>
                          <span>
                            Space: <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{aiEval.complexity.space}</code>
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {aiEval.complexity.explanation}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Code Quality */}
                  {aiEval.code_quality && (
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="flex items-center justify-between border-b pb-1">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          Code Quality
                        </h3>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          Quality Score: {aiEval.code_quality.score}/100
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {aiEval.code_quality.strengths?.length > 0 && (
                          <div>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                              Strengths
                            </span>
                            <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                              {aiEval.code_quality.strengths.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiEval.code_quality.issues?.length > 0 && (
                          <div>
                            <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                              Issues / Areas for Improvement
                            </span>
                            <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                              {aiEval.code_quality.issues.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Optimization Suggestions */}
                  {aiEval.optimization?.suggestions?.length > 0 && (
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 border-b pb-1">
                        Optimization Suggestions
                      </h3>
                      <ul className="list-disc ml-4 text-xs space-y-1 text-slate-600 dark:text-slate-300">
                        {aiEval.optimization.suggestions.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Edge Cases */}
                  {aiEval.edge_cases?.length > 0 && (
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
                      <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 border-b pb-1">
                        Edge Cases to Consider
                      </h3>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {aiEval.edge_cases.map((ec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {ec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview Feedback */}
                  {aiEval.interview_feedback && (
                    <div className="p-4 rounded-lg bg-indigo-50/50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-3">
                      <h3 className="font-semibold text-sm text-indigo-950 dark:text-slate-100 border-b border-indigo-100 dark:border-slate-700 pb-1">
                        Interview Feedback & Recommendation
                      </h3>

                      {aiEval.interview_feedback.recommendation && (
                        <p className="text-xs text-indigo-900 dark:text-slate-200 italic">
                          "{aiEval.interview_feedback.recommendation}"
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {aiEval.interview_feedback.strengths?.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                              Strengths:
                            </span>
                            <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                              {aiEval.interview_feedback.strengths.map((s, idx) => (
                                <li key={idx}>{s}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {aiEval.interview_feedback.areas_to_improve?.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                              Areas to Improve:
                            </span>
                            <ul className="list-disc ml-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                              {aiEval.interview_feedback.areas_to_improve.map((a, idx) => (
                                <li key={idx}>{a}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
              <Button size="sm" onClick={() => setShowSubmissionModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodePage
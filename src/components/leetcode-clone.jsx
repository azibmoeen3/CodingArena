"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#111111]">
      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
    </div>
  )
});
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Loader2, PlayCircle, Send, ChevronLeft, CheckCircle2, XCircle,
  AlertTriangle, Clock, Tag, Lightbulb, ChevronDown, ChevronUp,
  RotateCcw, Maximize2, Settings, Terminal, Sparkles, Pencil
} from "lucide-react";
import Whiteboard from "./Whiteboard";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { runCode, pollSubmissionResult } from "@/actions/runcode.action";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getResultStatusTone } from "@/lib/submission";

export default function LeetCodeClone({ problem }) {
  const router = useRouter();
  const { userId, isSignedIn } = useAuth();

  const languages = problem.languages;
  const initialCode = problem.initialCode;
  const standardInput = problem.standardInput;
  const expectedOutput = problem.expectedOutput;

  const [language, setLanguage] = useState(languages[0]);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionToken, setSubmissionToken] = useState(null);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [resultStatus, setResultStatus] = useState(null);
  const [userStdin, setUserStdin] = useState("");
  const [userExpectedOutput, setUserExpectedOutput] = useState("");

  // Tabs
  const [leftTab, setLeftTab] = useState("description");
  const [bottomTab, setBottomTab] = useState("testcase");
  const [showHints, setShowHints] = useState(false);

  // Submission history
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Result details
  const [resultDetails, setResultDetails] = useState(null);

  // AI Hint
  const [aiHint, setAiHint] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const refreshSubmissionHistory = async () => {
    if (!isSignedIn || !userId) return;
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/submissions?userId=${userId}&problemId=${problem.id}`);
      if (response.ok) setSubmissionHistory(await response.json());
    } catch (e) { console.error(e); }
    finally { setHistoryLoading(false); }
  };

  useEffect(() => {
    const storedLang = localStorage.getItem("selectedLang") || languages[0].value;
    const currentLang = languages.find((l) => l.value === storedLang) || languages[0];
    const storedCode = localStorage.getItem(`code-${currentLang.value}-${problem.title}`) || initialCode[currentLang.value];
    setLanguage(currentLang);
    setCode(storedCode);
    if (standardInput?.[currentLang.value]) setUserStdin(standardInput[currentLang.value]);
    if (expectedOutput?.[currentLang.value]) setUserExpectedOutput(expectedOutput[currentLang.value]);
  }, [problem.title]);

  useEffect(() => { refreshSubmissionHistory(); }, [isSignedIn, userId, problem.id]);

  useEffect(() => {
    if (!submissionToken || !isSubmitting) return;
    const fetchResults = async () => {
      setOutput("Processing...");
      try {
        const pollingResult = await pollSubmissionResult(submissionToken, activeSubmissionId);
        if (!pollingResult.success) {
          setOutput(`Error: ${pollingResult.error}`);
          setResultStatus("error");
        } else {
          const r = pollingResult.result;
          setResultStatus(getResultStatusTone(r.verdict));
          setResultDetails(r);

          let text = "";
          if (r.verdict === "Accepted") text += "✅ Accepted\n\n";
          else if (r.verdict === "Wrong Answer") text += "❌ Wrong Answer\n\n";
          else if (r.verdict === "Time Limit Exceeded") text += "⏱️ Time Limit Exceeded\n\n";
          else if (r.compile_error) text += "⚠️ Compilation Error\n\n";
          else if (r.runtime_error) text += "⚠️ Runtime Error\n\n";

          if (r.output) text += `Output:\n${r.output}\n\n`;
          if (r.expected && r.verdict === "Wrong Answer") text += `Expected:\n${r.expected}\n\n`;
          if (typeof r.runtime === "number") text += `Runtime: ${r.runtime}s  `;
          if (typeof r.memory === "number") text += `Memory: ${r.memory} KB`;

          setOutput(text);
          setBottomTab("result");
          await refreshSubmissionHistory();
        }
      } catch (e) {
        setOutput("Unexpected error.");
        setResultStatus("error");
      } finally { setIsSubmitting(false); }
    };
    fetchResults();
  }, [submissionToken, isSubmitting]);

  const handleLanguageChange = (value) => {
    localStorage.setItem(`code-${language.value}-${problem.title}`, code);
    const newLang = languages.find((l) => l.value === value);
    if (!newLang) return;
    localStorage.setItem("selectedLang", newLang.value);
    setLanguage(newLang);
    setCode(localStorage.getItem(`code-${newLang.value}-${problem.title}`) || initialCode[newLang.value]);
    if (standardInput?.[newLang.value]) setUserStdin(standardInput[newLang.value]);
    if (expectedOutput?.[newLang.value]) setUserExpectedOutput(expectedOutput[newLang.value]);
  };

  const handleReset = () => {
    if (confirm("Reset code to initial state?")) {
      setCode(initialCode[language.value]);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setOutput("Submitting...");
    setResultStatus(null);
    setResultDetails(null);
    localStorage.setItem(`code-${language.value}-${problem.title}`, code);

    try {
      const result = await runCode({
        code, value: language.value, id: language.id, language: language.value,
        problemId: problem.id, problemTitle: problem.title,
        stdin: userStdin, expected_output: userExpectedOutput,
      });
      if (result.success && result.token) {
        setSubmissionToken(result.token);
        setActiveSubmissionId(result.submissionId || null);
      } else {
        setOutput(`Error: ${result.error || "Failed to submit"}`);
        setResultStatus("error");
        setIsSubmitting(false);
      }
    } catch (e) {
      setOutput("Unexpected error while submitting.");
      setResultStatus("error");
      setIsSubmitting(false);
    }
  };

  const getAiHint = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const response = await fetch("/api/ai/hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemTitle: problem.title,
          problemDescription: problem.description,
          userCode: code,
          language: language.label,
        }),
      });
      const data = await response.json();
      if (data.hint) setAiHint(data.hint);
      else if (data.error) setAiHint(`Error: ${data.error}`);
    } catch (e) {
      setAiHint("Failed to get AI hint. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const statusBanner = () => {
    if (!resultStatus || !resultDetails) return null;
    const configs = {
      accepted: { bg: "bg-green-500/10 border-green-500/30 animate-success", text: "text-green-400", icon: CheckCircle2, label: "Accepted" },
      "wrong-answer": { bg: "bg-red-500/10 border-red-500/30 animate-shake", text: "text-red-400", icon: XCircle, label: "Wrong Answer" },
      "time-limit": { bg: "bg-amber-500/10 border-amber-500/30", text: "text-amber-400", icon: Clock, label: "Time Limit Exceeded" },
      "compile-error": { bg: "bg-orange-500/10 border-orange-500/30", text: "text-orange-400", icon: AlertTriangle, label: "Compilation Error" },
      error: { bg: "bg-red-500/10 border-red-500/30", text: "text-red-400", icon: XCircle, label: "Error" },
    };
    const c = configs[resultStatus] || configs.error;
    const Icon = c.icon;
    return (
      <div className={`flex items-center gap-3 px-5 py-4 rounded-xl border ${c.bg} transition-all duration-500`}>
        <div className={`p-2 rounded-full ${c.bg.split(' ')[0]} border border-current opacity-80`}>
          <Icon className={`h-5 w-5 ${c.text}`} />
        </div>
        <div className="flex flex-col">
          <span className={`text-lg font-bold ${c.text}`}>{c.label}</span>
          {resultDetails.runtime != null && (
            <span className="text-xs text-muted-foreground">
              Runtime: {resultDetails.runtime}s • Memory: {resultDetails.memory} KB
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a] text-foreground">
      {/* Top Header Bar */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-card/40 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/problems")} className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded">#{problem.id}</span>
            <h1 className="text-sm font-semibold tracking-tight">{problem.title}</h1>
            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm ${problem.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border border-green-500/20" :
              problem.difficulty === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}>
              {problem.difficulty}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={getAiHint}
            disabled={isAiLoading}
            variant="ghost"
            size="sm"
            className="h-8 text-[10px] font-bold bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg px-3 hidden md:flex"
          >
            {isAiLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5" />}
            AI Hint
          </Button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-lg border border-white/5">
            <Clock className="h-3 w-3" />
            <span className="font-mono">00:00:00</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </header>

      <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
        {/* Left Panel: Description */}
        <Panel defaultSize={45} minSize={30} className="relative">
          <div className="h-full flex flex-col bg-[#0f0f0f] border-r border-white/5">
            <div className="flex border-b border-white/5 bg-card/20 shrink-0">
              {["description", "editorial", "submissions", "draw"].map((tab) => (
                <button key={tab} onClick={() => setLeftTab(tab)}
                  className={`px-6 py-3 text-xs font-semibold capitalize transition-all relative ${leftTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}>
                  <div className="flex items-center gap-2">
                    {tab === "draw" && <Pencil className="h-3 w-3" />}
                    {tab}
                  </div>
                  {leftTab === tab && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)]" />}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {leftTab === "description" && (
                <div className="space-y-6">
                  {/* Category & Stats */}
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold rounded-lg bg-white/5 text-muted-foreground border border-white/10 uppercase tracking-wide">
                      <Tag className="h-3 w-3" /> {problem.category}
                    </span>
                    {problem.acceptance && (
                      <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                        Success Rate: <span className="text-foreground">{problem.acceptance}</span>
                      </span>
                    )}
                  </div>

                  {/* Markdown Content */}
                  <div className="prose prose-premium max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ node, ...props }) => <h2 className="text-2xl font-bold text-foreground mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h3 className="text-lg font-bold text-foreground mt-8 mb-4 border-b border-white/5 pb-2" {...props} />,
                        p: ({ node, ...props }) => <p className="mb-4 text-muted-foreground leading-relaxed" {...props} />,
                        code({ inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return !inline && match ? (
                            <div className="rounded-xl overflow-hidden border border-white/5 my-6">
                              <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" customStyle={{ padding: "1.5rem", fontSize: "13px", background: "transparent" }} {...props}>
                                {String(children).replace(/\n$/, "")}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className="bg-white/10 px-1.5 py-0.5 rounded text-primary text-xs font-mono" {...props}>{children}</code>
                          );
                        },
                        li: ({ node, ...props }) => <li className="mb-2 list-disc ml-4" {...props} />,
                      }}
                    >
                      {problem.description}
                    </ReactMarkdown>
                  </div>

                  {/* Hints Section */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-400" /> Hints
                      </h4>
                    </div>

                    {aiHint && (
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground leading-relaxed animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase">AI Coach</span>
                        </div>
                        {aiHint}
                      </div>
                    )}

                    {problem.hints && problem.hints.length > 0 && (
                      <div className="space-y-3">
                        {problem.hints.map((hint, i) => (
                          <div key={i} className="group border border-white/5 rounded-xl bg-white/[0.02] overflow-hidden">
                            <button
                              onClick={() => setShowHints(prev => ({ ...prev, [i]: !prev[i] }))}
                              className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <span>Hint {i + 1}</span>
                              {showHints[i] ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                            {showHints[i] && (
                              <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-top-1">
                                {hint}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {leftTab === "submissions" && (
                <div className="space-y-4">
                  {historyLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                      <span className="text-xs text-muted-foreground font-medium">Loading history...</span>
                    </div>
                  ) : submissionHistory.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                      <Terminal className="h-8 w-8 mx-auto text-white/10 mb-3" />
                      <p className="text-sm text-muted-foreground">No submissions yet for this problem.</p>
                    </div>
                  ) : (
                    submissionHistory.map((s) => (
                      <div key={s._id} className="group glass-card rounded-xl border border-white/5 p-4 hover:border-primary/30 transition-all cursor-pointer">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-sm font-bold tracking-tight ${s.status === "Accepted" ? "text-green-400" : "text-red-400"
                            }`}>{s.status}</span>
                          <span className="text-[10px] font-mono text-muted-foreground uppercase bg-white/5 px-2 py-0.5 rounded">{s.language}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{new Date(s.createdAt).toLocaleString()}</span>
                          {s.runtime && <span>{s.runtime}s • {s.memory}KB</span>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {leftTab === "draw" && (
                <div className="h-full">
                  <Whiteboard />
                </div>
              )}
            </div>
          </div>
        </Panel>

        <PanelResizeHandle className="w-1 bg-white/5 hover:bg-primary/20 transition-colors" />

        {/* Right Panel: Editor & Result */}
        <Panel defaultSize={55} minSize={40}>
          <PanelGroup direction="vertical">
            {/* Editor section */}
            <Panel defaultSize={65} minSize={30}>
              <div className="h-full flex flex-col bg-[#111111]">
                <div className="h-12 flex items-center justify-between px-4 bg-[#0f0f0f] border-b border-white/5 shrink-0">
                  <div className="flex items-center gap-3">
                    <Select value={language.value} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="h-8 w-36 bg-white/5 border-white/10 text-xs font-semibold rounded-lg hover:bg-white/10 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1a1a] border-white/10">
                        {languages.map((l) => (
                          <SelectItem key={l.value} value={l.value} className="text-xs">{l.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <button onClick={handleReset} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-all" title="Reset Code">
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleSubmit} disabled={isSubmitting} variant="secondary" size="sm" className="h-8 rounded-lg text-xs font-bold px-4 bg-white/5 hover:bg-white/10 border border-white/10">
                      {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <PlayCircle className="h-3 w-3 mr-2" />}
                      Run
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting} size="sm" className="h-8 rounded-lg text-xs font-bold px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_15px_rgba(34,197,94,0.3)]">
                      <Send className="h-3 w-3 mr-2" />
                      Submit
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                  <Editor
                    key={language.value}
                    height="100%"
                    language={language.value}
                    value={code}
                    onChange={(v) => setCode(v || "")}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineNumbers: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 20 },
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      renderLineHighlight: "all",
                      cursorSmoothCaretAnimation: "on",
                      smoothScrolling: true,
                    }}
                  />
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="h-1 bg-white/5 hover:bg-primary/20 transition-colors" />

            {/* Console / Result Section */}
            <Panel defaultSize={35} minSize={20}>
              <div className="h-full flex flex-col bg-[#0f0f0f]">
                <div className="flex border-b border-white/5 bg-card/10 shrink-0">
                  <button onClick={() => setBottomTab("testcase")}
                    className={`px-6 py-3 text-[11px] font-bold uppercase tracking-wider transition-all relative ${bottomTab === "testcase" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}>
                    Test Cases
                    {bottomTab === "testcase" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                  </button>
                  <button onClick={() => setBottomTab("result")}
                    className={`px-6 py-3 text-[11px] font-bold uppercase tracking-wider transition-all relative ${bottomTab === "result" ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                      }`}>
                    Result
                    {bottomTab === "result" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                    {resultStatus === 'accepted' && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                  {bottomTab === "testcase" && (
                    <div className="space-y-5 animate-in fade-in duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Input (stdin)</label>
                        <textarea
                          value={userStdin}
                          onChange={(e) => setUserStdin(e.target.value)}
                          className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-mono focus:outline-none focus:border-primary/30 transition-all min-h-[80px]"
                          placeholder="Enter test inputs here..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Expected Output</label>
                        <textarea
                          value={userExpectedOutput}
                          onChange={(e) => setUserExpectedOutput(e.target.value)}
                          className="w-full p-4 rounded-xl bg-white/[0.03] border border-white/10 text-sm font-mono focus:outline-none focus:border-primary/30 transition-all min-h-[80px]"
                          placeholder="Optional expected output for comparison..."
                        />
                      </div>
                    </div>
                  )}

                  {bottomTab === "result" && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                      {statusBanner()}
                      {output ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Output Logs</span>
                            <button onClick={() => setOutput("")} className="text-[10px] font-bold text-primary hover:underline">Clear</button>
                          </div>
                          <pre className="p-5 rounded-xl bg-black border border-white/5 text-sm font-mono text-muted-foreground leading-relaxed whitespace-pre-wrap overflow-x-auto shadow-inner">
                            {output}
                          </pre>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <div className="p-4 rounded-full bg-white/5 mb-4 border border-white/10">
                            <PlayCircle className="h-8 w-8 text-white/20" />
                          </div>
                          <p className="text-sm text-muted-foreground font-medium">Run your code to see the magic happen here.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  );
}

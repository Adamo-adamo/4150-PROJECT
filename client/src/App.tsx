import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import {
  ArrowDownUp,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Filter,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Library,
  ListChecks,
  LogIn,
  LogOut,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "wouter";

type Mode = "masters" | "career";
type ApplicationKind = "Programme" | "Graduate role";
type Status = "Researching" | "Preparing" | "Ready to apply" | "Applied" | "Shortlisted" | "Interviewing" | "Offer";
type RequirementState = "Ready" | "In progress" | "Missing";
type TaskState = "To do" | "In progress" | "Done";

type Requirement = { id: string; label: string; state: RequirementState; required: boolean; note?: string };
type Task = { id: string; label: string; due: string; state: TaskState; priority: "High" | "Medium" | "Low" };
type AppRecord = {
  id: string;
  kind: ApplicationKind;
  mode: Mode;
  organization: string;
  title: string;
  location: string;
  deadline: string;
  status: Status;
  shortlisted: boolean;
  progress: number;
  requirements: Requirement[];
  tasks: Task[];
  note: string;
  adviserNote?: string;
};
type DocumentRecord = { id: string; name: string; type: string; updated: string; readiness: number; linked: number };

type View = "dashboard" | "applications" | "compare" | "tasks" | "documents" | "deadlines" | "adviser" | "settings" | "billing";

const navItems: { id: View; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "dashboard", label: "Workspace", icon: LayoutDashboard },
  { id: "applications", label: "Applications", icon: Library },
  { id: "compare", label: "Compare paths", icon: BarChart3 },
  { id: "tasks", label: "Action list", icon: ListChecks },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "deadlines", label: "Deadlines", icon: CalendarDays },
  { id: "adviser", label: "Adviser review", icon: Users },
];

const seedDocuments: DocumentRecord[] = [
  { id: "doc-1", name: "CV — product strategy.pdf", type: "CV", updated: "Today", readiness: 100, linked: 3 },
  { id: "doc-2", name: "Academic transcript.pdf", type: "Transcript", updated: "2 days ago", readiness: 100, linked: 5 },
  { id: "doc-3", name: "Personal statement v2.docx", type: "Personal Statement", updated: "Yesterday", readiness: 72, linked: 2 },
  { id: "doc-4", name: "Reference — Dr. Morgan.pdf", type: "Reference", updated: "Sep 24, 2026", readiness: 88, linked: 4 },
];

const seedApplications: AppRecord[] = [
  {
    id: "app-1", kind: "Programme", mode: "masters", organization: "Northbridge University", title: "MSc Digital Strategy & Innovation", location: "London · Hybrid", deadline: "2026-11-12", status: "Preparing", shortlisted: true, progress: 76,
    requirements: [
      { id: "r1", label: "Academic transcript", state: "Ready", required: true, note: "Uploaded and linked" },
      { id: "r2", label: "Personal statement", state: "In progress", required: true, note: "Add programme-specific examples" },
      { id: "r3", label: "Two academic references", state: "Ready", required: true, note: "Both references linked" },
      { id: "r4", label: "IELTS / language score", state: "Ready", required: true, note: "IELTS 8.0" },
      { id: "r5", label: "Portfolio", state: "Missing", required: false, note: "Optional for this programme" },
    ],
    tasks: [
      { id: "t1", label: "Tailor personal statement", due: "Oct 28", state: "In progress", priority: "High" },
      { id: "t2", label: "Request final reference copy", due: "Oct 20", state: "Done", priority: "Medium" },
      { id: "t3", label: "Complete application form", due: "Nov 5", state: "To do", priority: "High" },
    ],
    note: "Strong fit for the product strategy route. Confirm whether the optional portfolio adds value before submitting.", adviserNote: "Good shortlist choice. Keep the opening paragraph specific to the programme's innovation studio."
  },
  {
    id: "app-2", kind: "Programme", mode: "masters", organization: "Eastmere School of Management", title: "MA Brand & Consumer Insight", location: "Manchester · On campus", deadline: "2026-12-03", status: "Shortlisted", shortlisted: true, progress: 58,
    requirements: [
      { id: "r6", label: "Academic transcript", state: "Ready", required: true },
      { id: "r7", label: "Personal statement", state: "In progress", required: true },
      { id: "r8", label: "One academic reference", state: "Missing", required: true },
      { id: "r9", label: "Portfolio / campaign sample", state: "Missing", required: true },
    ],
    tasks: [
      { id: "t4", label: "Create campaign sample PDF", due: "Nov 13", state: "To do", priority: "High" },
      { id: "t5", label: "Email potential referee", due: "Oct 31", state: "To do", priority: "Medium" },
    ],
    note: "Best fit for brand planning and consumer insight. Keep as a high-priority alternative."
  },
  {
    id: "app-3", kind: "Programme", mode: "masters", organization: "Harbour Institute of Technology", title: "MSc Technology & Society", location: "Edinburgh · On campus", deadline: "2027-01-15", status: "Researching", shortlisted: false, progress: 34,
    requirements: [
      { id: "r10", label: "Academic transcript", state: "Ready", required: true },
      { id: "r11", label: "Statement of purpose", state: "Missing", required: true },
      { id: "r12", label: "Quantitative methods evidence", state: "In progress", required: true },
    ],
    tasks: [{ id: "t6", label: "Check module fit", due: "Nov 7", state: "In progress", priority: "Low" }],
    note: "Interesting stretch option. Research the methods modules before adding to the final shortlist."
  },
  {
    id: "app-4", kind: "Graduate role", mode: "career", organization: "Aster & Field", title: "Graduate Brand Planner", location: "London · Hybrid", deadline: "2026-10-30", status: "Ready to apply", shortlisted: true, progress: 82,
    requirements: [
      { id: "r13", label: "CV tailored to role", state: "Ready", required: true },
      { id: "r14", label: "Portfolio / work sample", state: "Ready", required: true },
      { id: "r15", label: "Numerical reasoning test", state: "In progress", required: true },
      { id: "r16", label: "Cover letter", state: "Ready", required: false },
    ],
    tasks: [
      { id: "t7", label: "Finish numerical reasoning practice", due: "Oct 23", state: "In progress", priority: "High" },
      { id: "t8", label: "Submit application", due: "Oct 30", state: "To do", priority: "High" },
    ],
    note: "Your strongest near-term opportunity. Submit before the final week to avoid the deadline rush.", adviserNote: "Your portfolio is a clear strength here. Use the first three slides to show strategic thinking."
  },
  {
    id: "app-5", kind: "Graduate role", mode: "career", organization: "Civic Thread", title: "Graduate Client Strategy Associate", location: "Bristol · Hybrid", deadline: "2026-11-19", status: "Researching", shortlisted: false, progress: 45,
    requirements: [
      { id: "r17", label: "CV tailored to role", state: "In progress", required: true },
      { id: "r18", label: "Case study exercise", state: "Missing", required: true },
      { id: "r19", label: "Video interview", state: "Missing", required: true },
    ],
    tasks: [{ id: "t9", label: "Review client case format", due: "Oct 27", state: "To do", priority: "Medium" }],
    note: "Good learning environment. Compare role responsibilities with Aster & Field before deciding."
  },
  {
    id: "app-6", kind: "Graduate role", mode: "career", organization: "Lumen House", title: "Graduate Partnerships Executive", location: "Remote · UK", deadline: "2026-12-10", status: "Researching", shortlisted: false, progress: 28,
    requirements: [
      { id: "r20", label: "CV tailored to role", state: "Missing", required: true },
      { id: "r21", label: "Written exercise", state: "Missing", required: true },
      { id: "r22", label: "Interview preparation", state: "In progress", required: true },
    ],
    tasks: [{ id: "t10", label: "Save role examples", due: "Nov 1", state: "To do", priority: "Low" }],
    note: "Keep in research until you have reviewed the day-to-day role and progression route."
  },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function daysUntil(value: string) {
  const target = new Date(`${value}T12:00:00`).getTime();
  return Math.ceil((target - new Date("2026-10-07T12:00:00").getTime()) / 86400000);
}

function deadlineLabel(value: string) {
  const days = daysUntil(value);
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function cx(...parts: Array<string | false | undefined>) { return parts.filter(Boolean).join(" "); }

function StatusPill({ status }: { status: Status | RequirementState | TaskState }) {
  const tone = status === "Ready" || status === "Done" || status === "Offer" ? "success" : status === "Missing" || status === "To do" ? "warning" : status === "Applied" || status === "Shortlisted" ? "accent" : "neutral";
  return <span className={`pill pill-${tone}`}><span className="pill-dot" />{status}</span>;
}

function ProgressBar({ value, small = false }: { value: number; small?: boolean }) {
  return <div className={cx("progress-track", small && "progress-small")}><span style={{ width: `${value}%` }} /></div>;
}

function App() {
  const auth = useAuth();
  const [location, navigate] = useLocation();
  const [demoMode, setDemoMode] = useState(() => new URLSearchParams(window.location.search).get("demo") === "1");
  const [mode, setMode] = useState<Mode>(() => (localStorage.getItem("gradmap-mode") as Mode) || "masters");
  const [apps, setApps] = useState<AppRecord[]>(seedApplications);
  const [documents, setDocuments] = useState<DocumentRecord[]>(seedDocuments);
  const [activeView, setActiveView] = useState<View>(() => {
    const value = location.split("/")[2] as View;
    return value === "applications" || value === "compare" || value === "tasks" || value === "documents" || value === "deadlines" || value === "adviser" || value === "settings" || value === "billing" ? value : "dashboard";
  });
  const [selectedId, setSelectedId] = useState("app-1");
  const [toast, setToast] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const isPublic = location === "/" || location === "/pricing" || location === "/privacy" || location === "/terms" || location === "/sign-in" || location === "/sign-up";
  const isAppPath = location.startsWith("/app");
  const displayApps = apps.filter(app => app.mode === mode);

  function flash(message: string) { setToast(message); window.setTimeout(() => setToast(null), 2800); }
  function openDemo() { setDemoMode(true); navigate("/app"); setActiveView("dashboard"); }
  function go(view: View) { setActiveView(view); navigate(view === "dashboard" ? "/app" : `/app/${view}`); }
  function setWorkspaceMode(next: Mode) { setMode(next); localStorage.setItem("gradmap-mode", next); flash(`${next === "masters" ? "Master's Application" : "Career"} Mode selected`); }
  function updateApp(id: string, patch: Partial<AppRecord>) { setApps(current => current.map(app => app.id === id ? { ...app, ...patch } : app)); }
  function toggleTask(appId: string, taskId: string) { setApps(current => current.map(app => app.id === appId ? { ...app, tasks: app.tasks.map(task => task.id === taskId ? { ...task, state: task.state === "Done" ? "To do" : "Done" } : task) } : app)); flash("Action list updated"); }
  function updateRequirement(appId: string, requirementId: string) { setApps(current => current.map(app => app.id === appId ? { ...app, requirements: app.requirements.map(item => item.id === requirementId ? { ...item, state: item.state === "Ready" ? "Missing" : "Ready" } : item) } : app)); flash("Readiness updated"); }
  function addApplication(payload: { kind: ApplicationKind; organization: string; title: string; deadline: string }) {
    const item: AppRecord = { id: `new-${Date.now()}`, ...payload, mode, location: "To be confirmed", status: "Researching", shortlisted: false, progress: 18, requirements: [{ id: `r-${Date.now()}`, label: "Add your first requirement", state: "Missing", required: true }], tasks: [{ id: `t-${Date.now()}`, label: "Define the next action", due: "Oct 31", state: "To do", priority: "Medium" }], note: "Add context, fit notes, and the next decision here." };
    setApps(current => [item, ...current]); setSelectedId(item.id); setShowAdd(false); flash("Application added to your workspace");
  }
  function exportSummary() {
    const rows = [["Path", "Organization", "Deadline", "Status", "Progress", "Shortlisted"], ...displayApps.map(app => [app.title, app.organization, app.deadline, app.status, `${app.progress}%`, app.shortlisted ? "Yes" : "No"] )];
    const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "gradmap-action-plan.csv"; anchor.click(); URL.revokeObjectURL(url); flash("Summary exported as CSV");
  }

  if (isPublic && !demoMode) {
    if (location === "/pricing") return <PublicPricingPage onDemo={openDemo} onLogin={startLogin} />;
    if (location === "/privacy" || location === "/terms") return <PublicInfoPage type={location === "/privacy" ? "privacy" : "terms"} onDemo={openDemo} onLogin={startLogin} />;
    return <PublicSite onDemo={openDemo} onLogin={startLogin} onPricing={() => navigate("/pricing")} />;
  }
  if (!isAppPath && !demoMode) return <PublicSite onDemo={openDemo} onLogin={startLogin} onPricing={() => navigate("/pricing")} />;
  if (!demoMode && !auth.isAuthenticated && !auth.loading) return <AuthWall onLogin={startLogin} onDemo={openDemo} />;
  if (auth.loading && !demoMode) return <div className="loading-screen"><div className="brand-mark">G</div><p>Preparing your planning desk…</p></div>;

  const selected = apps.find(app => app.id === selectedId) ?? displayApps[0] ?? apps[0];
  return <>
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup"><div className="brand-mark">G</div><div><div className="brand-name">GradMap</div><div className="brand-kicker">APPLICATION DESK</div></div></div>
        <div className="workspace-switcher"><div className="workspace-avatar">JM</div><div className="workspace-meta"><strong>{auth.user?.name || "Jordan Morgan"}</strong><span>{mode === "masters" ? "Master's planning" : "Career planning"}</span></div><ChevronDown size={15} /></div>
        <nav className="primary-nav" aria-label="Workspace navigation">
          <div className="nav-label">Plan</div>
          {navItems.map(item => { const Icon = item.icon; return <button key={item.id} className={cx("nav-item", activeView === item.id && "active")} onClick={() => go(item.id)}><Icon size={17} /><span>{item.label}</span>{item.id === "deadlines" && <span className="nav-count">3</span>}</button>; })}
          <div className="nav-label nav-label-spaced">Workspace</div>
          <button className={cx("nav-item", activeView === "settings" && "active")} onClick={() => go("settings")}><Settings size={17} /><span>Settings</span></button>
          <button className={cx("nav-item", activeView === "billing" && "active")} onClick={() => go("billing")}><Zap size={17} /><span>Plan & billing</span></button>
        </nav>
        <div className="sidebar-bottom"><div className="rail-tip"><Sparkles size={16} /><div><strong>One clear next step</strong><span>Keep your shortlist moving.</span></div></div><button className="user-rail" onClick={() => demoMode ? flash("Demo workspace — no account changes are saved") : auth.logout()}><div className="user-avatar">{(auth.user?.name || "JM").slice(0, 2).toUpperCase()}</div><div><strong>{auth.user?.name || "Jordan Morgan"}</strong><span>{demoMode ? "Demo workspace" : "Sign out"}</span></div><MoreHorizontal size={16} /></button></div>
      </aside>
      <main className="main-canvas">
        <div className="topbar"><div className="mobile-brand"><div className="brand-mark">G</div><strong>GradMap</strong></div><div className="crumbs"><span>Workspace</span><span>/</span><strong>{navItems.find(i => i.id === activeView)?.label || (activeView === "settings" ? "Settings" : "Plan & billing")}</strong></div><div className="top-actions"><span className="fictional-label"><CircleHelp size={14} /> Fictional data workspace</span><button className="icon-button" aria-label="Notifications" onClick={() => flash("You're all caught up")}><Bell size={18} /><span className="notification-dot" /></button><div className="top-avatar">{(auth.user?.name || "JM").slice(0, 2).toUpperCase()}</div></div></div>
        <div className="content-wrap">
          {activeView === "dashboard" && <Dashboard apps={displayApps} mode={mode} onMode={setWorkspaceMode} onGo={go} onSelect={id => { setSelectedId(id); go("applications"); }} onAdd={() => setShowAdd(true)} onExport={exportSummary} />}
          {activeView === "applications" && <ApplicationsView apps={displayApps} selected={selected} onSelect={setSelectedId} onAdd={() => setShowAdd(true)} onUpdate={updateApp} onToggleTask={toggleTask} onUpdateRequirement={updateRequirement} onExport={exportSummary} />}
          {activeView === "compare" && <CompareView apps={displayApps} onSelect={setSelectedId} />}
          {activeView === "tasks" && <TasksView apps={displayApps} onToggleTask={toggleTask} />}
          {activeView === "documents" && <DocumentsView documents={documents} apps={displayApps} onUpload={() => { setDocuments(current => [{ id: `doc-${Date.now()}`, name: "New planning document.pdf", type: "Other", updated: "Just now", readiness: 30, linked: 0 }, ...current]); flash("Demo document added"); }} />}
          {activeView === "deadlines" && <DeadlinesView apps={displayApps} onSelect={id => { setSelectedId(id); go("applications"); }} />}
          {activeView === "adviser" && <AdviserView apps={displayApps} />}
          {activeView === "settings" && <SettingsView mode={mode} onMode={setWorkspaceMode} onToast={flash} />}
          {activeView === "billing" && <BillingView showUpgrade={showUpgrade} setShowUpgrade={setShowUpgrade} onToast={flash} />}
        </div>
      </main>
    </div>
    {showAdd && <AddApplicationDialog mode={mode} onClose={() => setShowAdd(false)} onCreate={addApplication} />}
    {toast && <div className="toast"><CheckCircle2 size={16} /> {toast}</div>}
  </>;
}

function PublicSite({ onDemo, onLogin, onPricing }: { onDemo: () => void; onLogin: () => void; onPricing: () => void }) {
  return (
    <div className="public-site">
      <header className="public-header">
        <div className="public-brand"><div className="brand-mark">G</div><strong>GradMap</strong><span>Application desk</span></div>
        <nav><a href="#how">How it works</a><button className="link-button" onClick={onPricing}>Plans</button><button className="button button-ghost" onClick={onLogin}><LogIn size={16} /> Sign in</button></nav>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> A calmer way to plan what comes next</div>
          <h1>Compare the paths.<br /><em>Plan the next move.</em></h1>
          <p className="hero-lede">GradMap brings your master's applications and graduate job search into one focused planning desk — so every deadline, document, and decision has a clear place.</p>
          <div className="hero-actions"><button className="button button-primary button-large" onClick={onDemo}>Open the demo workspace <ArrowRight size={17} /></button><button className="text-action" onClick={onLogin}>Create your account <span>→</span></button></div>
          <div className="hero-note"><CheckCircle2 size={15} /> Fictional sample data · No real admissions predictions</div>
        </div>
        <div className="hero-preview">
          <div className="preview-window">
            <div className="preview-bar"><span /><span /><span /><div className="preview-url">gradmap / workspace</div></div>
            <div className="preview-body">
              <div className="preview-sidebar"><div className="mini-logo">G</div><i /><i /><i /><i /><i /></div>
              <div className="preview-main">
                <div className="mini-top"><div><small>Tuesday, 7 October 2026</small><strong>Your application desk</strong></div><div className="mini-user">JM</div></div>
                <div className="mini-stats"><div><small>In motion</small><strong>06</strong></div><div><small>Due soon</small><strong className="amber">03</strong></div><div><small>Ready</small><strong className="teal">68%</strong></div></div>
                <div className="mini-table">
                  <div className="mini-table-head"><span>PATH</span><span>DEADLINE</span><span>READY</span></div>
                  <div className="mini-row"><span><b className="mini-dot teal-dot" /> MSc Digital Strategy</span><span>12 Nov</span><span><ProgressBar value={76} small /></span></div>
                  <div className="mini-row"><span><b className="mini-dot amber-dot" /> Graduate Brand Planner</span><span>30 Oct</span><span><ProgressBar value={82} small /></span></div>
                  <div className="mini-row"><span><b className="mini-dot blue-dot" /> MA Brand Insight</span><span>03 Dec</span><span><ProgressBar value={58} small /></span></div>
                </div>
              </div>
            </div>
            <div className="preview-callout"><Sparkles size={14} /><span><strong>Next action</strong><br />Tailor personal statement</span><ArrowRight size={15} /></div>
          </div>
        </div>
      </section>
      <section id="how" className="value-strip">
        <div><span className="strip-number">01</span><strong>Compare without tab overload</strong><p>See requirements, fit notes, and deadlines side by side.</p></div>
        <div><span className="strip-number">02</span><strong>Know what is missing</strong><p>Turn every application into a simple readiness checklist.</p></div>
        <div><span className="strip-number">03</span><strong>Keep momentum visible</strong><p>Make the next action obvious, even on a busy week.</p></div>
      </section>
      <section className="mode-section">
        <div className="section-kicker">Choose your planning lens</div><h2>One desk. Two ways forward.</h2>
        <div className="mode-cards">
          <div className="mode-card mode-card-teal"><div className="mode-icon"><GraduationCap size={23} /></div><div><h3>Master's applications</h3><p>Compare programmes, entry requirements, documents, and intake deadlines in one view.</p><button onClick={onDemo}>Explore the demo <ArrowRight size={15} /></button></div></div>
          <div className="mode-card mode-card-ink"><div className="mode-icon"><BriefcaseBusiness size={23} /></div><div><h3>Graduate careers</h3><p>Track roles, assessments, interview prep, and reusable career documents without losing the thread.</p><button onClick={onDemo}>Explore the demo <ArrowRight size={15} /></button></div></div>
        </div>
      </section>
      <section className="public-pricing"><div><div className="section-kicker">Simple by design</div><h2>Start free. Upgrade when your shortlist is clear.</h2><p>Use the basic planning tier for one season. Upgrade flows are shown as a test experience in this demo.</p></div><div className="price-teaser"><span>Free planning</span><strong>£0</strong><small>Core workspace · fictional data</small><button className="button button-secondary" onClick={onPricing}>See plans <ArrowRight size={15} /></button></div></section>
      <footer className="public-footer"><div className="public-brand"><div className="brand-mark">G</div><strong>GradMap</strong></div><span>Plan with more clarity. © 2026</span><div><button onClick={onPricing}>Pricing</button><button onClick={onLogin}>Sign in</button></div></footer>
    </div>
  );
}

function PublicPricingPage({ onDemo, onLogin }: { onDemo: () => void; onLogin: () => void }) {
  return <div className="public-site"><header className="public-header"><button className="public-brand" onClick={() => window.location.assign("/")}><div className="brand-mark">G</div><strong>GradMap</strong><span>Application desk</span></button><nav><button className="button button-ghost" onClick={onLogin}><LogIn size={16} /> Sign in</button></nav></header><main className="public-pricing-page"><div className="section-kicker">Plans that fit the decision</div><h1>Start free. Upgrade when your shortlist is clear.</h1><p className="pricing-lede">Use GradMap for one focused season of planning. This public page shows the intended subscription mechanics; the workspace upgrade is a test-only flow and never collects payment.</p><div className="pricing-grid"><PriceCard name="Free planning" price="£0" suffix="forever" description="For getting your first plan clear." features={["One planning mode", "Up to 5 paths", "Tasks, deadlines & notes", "Reusable document library"]} cta="Start with the demo" onClick={onDemo} /><PriceCard name="One-season pass" price="£29" suffix="per season" description="For a focused application season." features={["Unlimited paths", "Side-by-side comparison", "Exportable action plan", "Progress & readiness views"]} cta="Open workspace" featured onClick={onDemo} /><PriceCard name="Adviser / university" price="£99" suffix="per seat / season" description="For guided progression conversations." features={["Read-only adviser view", "Shared review summaries", "Cohort-ready exports", "Priority workspace support"]} cta="Sign in to explore" onClick={onLogin} /></div><button className="text-action pricing-back" onClick={() => window.location.assign("/")}>← Back to GradMap home</button></main></div>;
}

function PublicInfoPage({ type, onDemo, onLogin }: { type: "privacy" | "terms"; onDemo: () => void; onLogin: () => void }) {
  const privacy = type === "privacy";
  return <div className="public-site"><header className="public-header"><button className="public-brand" onClick={() => window.location.assign("/")}><div className="brand-mark">G</div><strong>GradMap</strong><span>Application desk</span></button><nav><button className="text-action" onClick={onDemo}>Open demo <ArrowRight size={15} /></button><button className="button button-ghost" onClick={onLogin}><LogIn size={16} /> Sign in</button></nav></header><main className="legal-page"><div className="section-kicker">{privacy ? "Privacy & PICS" : "Terms of service"}</div><h1>{privacy ? "Your planning data, explained clearly." : "A planning workspace, not an admissions oracle."}</h1><p className="legal-lede">{privacy ? "GradMap is designed around data minimisation, clear consent, and user control. This demo uses fictional sample data and does not create a real student profile." : "GradMap helps you organise applications and career actions. It does not predict admission, guarantee an offer, or replace advice from a university, employer, or qualified adviser."}</p><div className="legal-sections"><section><h2>{privacy ? "What we collect" : "Use of the service"}</h2><p>{privacy ? "A production workspace would collect account details, workspace preferences, application records, task completion, document metadata, and consent timestamps only where needed to provide the service." : "Use GradMap for personal planning and review. Keep fictional data clearly separate from any real application submission, and check each institution or employer's current requirements before acting."}</p></section><section><h2>{privacy ? "Your choices" : "Fictional demo boundary"}</h2><p>{privacy ? "You can export your plan, change preferences, withdraw optional marketing consent, or request deletion. Consent and privacy acknowledgement timestamps are retained only for audit and compliance purposes." : "The sample universities, programmes, roles, deadlines, adviser notes, and readiness scores in this workspace are fictional. No scraping, live admissions decision, or external submission occurs in this build."}</p></section><section><h2>{privacy ? "Regional notices" : "Contact"}</h2><p>{privacy ? "A production deployment should provide GDPR and Hong Kong PDPO notices, PICS disclosures, a lawful-basis record, and a clear contact route for data requests before account activation." : "Questions about this fictional product concept can be routed through the account owner or adviser workspace. Payment and upgrade screens in this demo are test-only."}</p></section></div><button className="text-action pricing-back" onClick={() => window.location.assign("/")}>← Back to GradMap home</button></main></div>;
}

function AuthWall({ onLogin, onDemo }: { onLogin: () => void; onDemo: () => void }) { return <div className="auth-wall"><div className="auth-card"><div className="brand-mark">G</div><div className="section-kicker">Your planning desk</div><h1>Sign in to continue</h1><p>Use your GradMap account to keep your applications, tasks, and documents in one place.</p><button className="button button-primary button-large" onClick={onLogin}><LogIn size={17} /> Sign in with Manus</button><button className="text-action" onClick={onDemo}>Continue with fictional demo data <ArrowRight size={15} /></button><small>Demo data is fictional and will not be saved to an account.</small></div></div>; }

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="page-header"><div><div className="section-kicker">{eyebrow}</div><h1>{title}</h1>{description && <p>{description}</p>}</div>{action && <div className="header-action">{action}</div>}</div>; }

function Dashboard({ apps, mode, onMode, onGo, onSelect, onAdd, onExport }: { apps: AppRecord[]; mode: Mode; onMode: (mode: Mode) => void; onGo: (view: View) => void; onSelect: (id: string) => void; onAdd: () => void; onExport: () => void }) {
  const allTasks = apps.flatMap(app => app.tasks.map(task => ({ ...task, app })));
  const dueSoon = apps.filter(app => daysUntil(app.deadline) <= 45).sort((a, b) => a.deadline.localeCompare(b.deadline));
  const inMotion = apps.filter(app => !["Offer", "Applied"].includes(app.status)).length;
  const readyAverage = Math.round(apps.reduce((total, app) => total + app.progress, 0) / Math.max(1, apps.length));
  const next = allTasks.find(task => task.state !== "Done");
  return <div><PageHeader eyebrow="Tuesday, 7 October 2026" title="Your application desk" description="A clear view of every path, deadline, and next decision." action={<><button className="button button-secondary" onClick={onExport}><Download size={16} /> Export summary</button><button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add a path</button></>} /><div className="mode-toggle"><span>Planning lens</span><button className={mode === "masters" ? "selected" : ""} onClick={() => onMode("masters")}><GraduationCap size={15} /> Master's applications</button><button className={mode === "career" ? "selected" : ""} onClick={() => onMode("career")}><BriefcaseBusiness size={15} /> Graduate careers</button></div><div className="stat-grid"><StatCard label="In motion" value={String(inMotion).padStart(2, "0")} note="paths in your workspace" icon={<Target size={18} />} /><StatCard label="Due soon" value={String(dueSoon.length).padStart(2, "0")} note="within the next 45 days" icon={<Clock3 size={18} />} tone="amber" /><StatCard label="Readiness" value={`${readyAverage}%`} note="average document readiness" icon={<BarChart3 size={18} />} tone="teal" /><StatCard label="Shortlisted" value={String(apps.filter(app => app.shortlisted).length).padStart(2, "0")} note="paths worth your attention" icon={<CheckCircle2 size={18} />} tone="blue" /></div><div className="dashboard-grid"><section className="panel panel-wide"><div className="panel-heading"><div><div className="panel-label">Your shortlist</div><h2>Paths to keep moving</h2></div><button className="text-action" onClick={() => onGo("applications")}>View all <ArrowRight size={14} /></button></div><div className="application-table"><div className="table-head"><span>Path</span><span>Deadline</span><span>Progress</span><span>Status</span><span /></div>{apps.slice(0, 4).map(app => <button className="table-row" key={app.id} onClick={() => onSelect(app.id)}><span className="path-cell"><span className={cx("path-icon", app.kind === "Programme" ? "path-icon-teal" : "path-icon-ink")}>{app.kind === "Programme" ? <GraduationCap size={16} /> : <BriefcaseBusiness size={16} />}</span><span><strong>{app.title}</strong><small>{app.organization} · {app.location}</small></span></span><span className={cx("deadline-cell", daysUntil(app.deadline) <= 30 && "deadline-soon")}><strong>{formatDate(app.deadline)}</strong><small>{deadlineLabel(app.deadline)}</small></span><span className="progress-cell"><div><ProgressBar value={app.progress} /><small>{app.progress}% ready</small></div></span><span><StatusPill status={app.status} /></span><ArrowRight size={16} className="row-arrow" /></button>)}</div></section><section className="panel next-panel"><div className="panel-label">Next best action</div><div className="next-action-icon"><Sparkles size={18} /></div><h2>{next?.label || "Review your shortlist"}</h2><p>{next ? `${next.app.organization} · due ${next.due}` : "Your workspace is ready for a new path."}</p><button className="button button-primary" onClick={() => next && onSelect(next.app.id)}>Open action <ArrowRight size={15} /></button><div className="panel-divider" /><div className="mini-progress-heading"><span>Season progress</span><strong>{readyAverage}%</strong></div><ProgressBar value={readyAverage} /><small className="muted">Keep the route visible, one action at a time.</small></section></div><div className="dashboard-bottom"><section className="panel"><div className="panel-heading"><div><div className="panel-label">Timeline</div><h2>Upcoming deadlines</h2></div><button className="icon-button" onClick={() => onGo("deadlines")} aria-label="View deadlines"><ArrowRight size={17} /></button></div>{dueSoon.slice(0, 3).map(app => <button className="deadline-item" key={app.id} onClick={() => onSelect(app.id)}><div className="date-block"><strong>{new Date(`${app.deadline}T12:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(`${app.deadline}T12:00:00`))}</span></div><div><strong>{app.title}</strong><small>{app.organization}</small></div><span className="deadline-tag">{daysUntil(app.deadline) <= 30 ? "Focus soon" : "On track"}</span></button>)}</section><section className="panel"><div className="panel-heading"><div><div className="panel-label">Workspace pulse</div><h2>What is missing</h2></div><CircleAlert size={18} className="muted" /></div><div className="missing-row"><div className="missing-icon missing-amber"><FileText size={16} /></div><div><strong>3 requirements</strong><span>need your attention</span></div><button onClick={() => onGo("applications")}>Review <ArrowRight size={14} /></button></div><div className="missing-row"><div className="missing-icon missing-blue"><ListChecks size={16} /></div><div><strong>4 actions</strong><span>are due this week</span></div><button onClick={() => onGo("tasks")}>Open list <ArrowRight size={14} /></button></div><div className="missing-row"><div className="missing-icon missing-teal"><FolderOpen size={16} /></div><div><strong>1 document</strong><span>is ready to reuse</span></div><button onClick={() => onGo("documents")}>View library <ArrowRight size={14} /></button></div></section></div></div>;
}

function StatCard({ label, value, note, icon, tone = "default" }: { label: string; value: string; note: string; icon: React.ReactNode; tone?: string }) { return <div className={cx("stat-card", `stat-${tone}`)}><div className="stat-icon">{icon}</div><div className="stat-label">{label}</div><strong>{value}</strong><small>{note}</small></div>; }

function ApplicationsView({ apps, selected, onSelect, onAdd, onUpdate, onToggleTask, onUpdateRequirement, onExport }: { apps: AppRecord[]; selected: AppRecord; onSelect: (id: string) => void; onAdd: () => void; onUpdate: (id: string, patch: Partial<AppRecord>) => void; onToggleTask: (appId: string, taskId: string) => void; onUpdateRequirement: (appId: string, requirementId: string) => void; onExport: () => void }) {
  const [search, setSearch] = useState(""); const [filter, setFilter] = useState<"All" | "Shortlisted">("All"); const [sort, setSort] = useState<"deadline" | "progress">("deadline");
  const filtered = apps.filter(app => `${app.title} ${app.organization}`.toLowerCase().includes(search.toLowerCase())).filter(app => filter === "All" || app.shortlisted).sort((a, b) => sort === "deadline" ? a.deadline.localeCompare(b.deadline) : b.progress - a.progress);
  return <div><PageHeader eyebrow="Application index" title="Your paths" description="Keep every programme and role in one clear, comparable view." action={<><button className="button button-secondary" onClick={onExport}><Download size={16} /> Export</button><button className="button button-primary" onClick={onAdd}><Plus size={17} /> Add a path</button></>} /><div className="filter-bar"><div className="search-box"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search programmes, roles, organisations…" aria-label="Search applications" /></div><button className={cx("filter-button", filter === "Shortlisted" && "active")} onClick={() => setFilter(filter === "All" ? "Shortlisted" : "All")}><Filter size={15} /> {filter === "All" ? "All paths" : "Shortlisted"}</button><button className="filter-button" onClick={() => setSort(sort === "deadline" ? "progress" : "deadline")}><ArrowDownUp size={15} /> Sort: {sort === "deadline" ? "deadline" : "readiness"}</button></div><div className="workspace-columns"><section className="panel panel-list"><div className="list-header"><span>{filtered.length} paths</span><span className="muted">{filter === "All" ? "Showing all" : "Your shortlist"}</span></div>{filtered.map(app => <button key={app.id} className={cx("list-card", app.id === selected.id && "selected")} onClick={() => onSelect(app.id)}><div className="list-card-icon">{app.kind === "Programme" ? <GraduationCap size={17} /> : <BriefcaseBusiness size={17} />}</div><div className="list-card-copy"><div className="list-card-top"><strong>{app.title}</strong>{app.shortlisted && <span className="shortlist-star">★</span>}</div><small>{app.organization}</small><div className="list-card-meta"><span>{formatDate(app.deadline)}</span><StatusPill status={app.status} /></div><ProgressBar value={app.progress} small /></div><ArrowRight size={15} className="list-card-arrow" /></button>)}{filtered.length === 0 && <div className="empty-state"><Search size={22} /><strong>No paths found</strong><span>Try a different search or filter.</span></div>}</section><ApplicationDetail app={selected} onUpdate={onUpdate} onToggleTask={onToggleTask} onUpdateRequirement={onUpdateRequirement} /></div></div>;
}

function ApplicationDetail({ app, onUpdate, onToggleTask, onUpdateRequirement }: { app: AppRecord; onUpdate: (id: string, patch: Partial<AppRecord>) => void; onToggleTask: (appId: string, taskId: string) => void; onUpdateRequirement: (appId: string, requirementId: string) => void }) {
  const readyCount = app.requirements.filter(r => r.state === "Ready").length; const openTasks = app.tasks.filter(t => t.state !== "Done").length;
  return <section className="panel detail-panel"><div className="detail-top"><div className={cx("detail-kind", app.kind === "Programme" ? "teal" : "ink")}>{app.kind === "Programme" ? <GraduationCap size={17} /> : <BriefcaseBusiness size={17} />} {app.kind}</div><button className={cx("shortlist-button", app.shortlisted && "selected")} onClick={() => onUpdate(app.id, { shortlisted: !app.shortlisted })}>{app.shortlisted ? "★ Shortlisted" : "☆ Add to shortlist"}</button></div><div className="detail-title"><div><h2>{app.title}</h2><p>{app.organization} <span>·</span> {app.location}</p></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="detail-meta-grid"><div><span>Deadline</span><strong>{formatDate(app.deadline)}</strong><small className="deadline-soon">{deadlineLabel(app.deadline)}</small></div><div><span>Status</span><select value={app.status} onChange={e => onUpdate(app.id, { status: e.target.value as Status })}>{["Researching", "Preparing", "Ready to apply", "Applied", "Shortlisted", "Interviewing", "Offer"].map(status => <option key={status}>{status}</option>)}</select></div><div><span>Readiness</span><strong>{app.progress}%</strong><ProgressBar value={app.progress} small /></div></div><div className="detail-section"><div className="section-heading"><div><span className="panel-label">Requirements</span><h3>What needs to be ready</h3></div><span className="section-count">{readyCount}/{app.requirements.length} ready</span></div><div className="requirements-list">{app.requirements.map(req => <button className="requirement-row" key={req.id} onClick={() => onUpdateRequirement(app.id, req.id)}><span className={cx("requirement-check", req.state === "Ready" && "checked")}>{req.state === "Ready" ? <Check size={13} /> : <span />}</span><span className="requirement-copy"><strong>{req.label}</strong><small>{req.note || (req.required ? "Required for this path" : "Optional")}</small></span><StatusPill status={req.state} /></button>)}</div></div><div className="detail-section"><div className="section-heading"><div><span className="panel-label">Action list</span><h3>Keep the next move visible</h3></div><span className="section-count">{openTasks} open</span></div><div className="task-mini-list">{app.tasks.map(task => <button className="task-mini-row" key={task.id} onClick={() => onToggleTask(app.id, task.id)}><span className={cx("task-checkbox", task.state === "Done" && "checked")}>{task.state === "Done" && <Check size={13} />}</span><span><strong className={task.state === "Done" ? "task-done" : ""}>{task.label}</strong><small>{task.due} · {task.priority} priority</small></span><StatusPill status={task.state} /></button>)}</div></div><div className="detail-section note-section"><div className="section-heading"><div><span className="panel-label">Working note</span><h3>Why this path matters</h3></div><MessageSquareText size={18} className="muted" /></div><p>{app.note}</p>{app.adviserNote && <div className="adviser-inline"><Users size={15} /><span><strong>Demo adviser note</strong>{app.adviserNote}</span></div>}</div></section>;
}

function CompareView({ apps, onSelect }: { apps: AppRecord[]; onSelect: (id: string) => void }) {
  const [selected, setSelected] = useState<string[]>(apps.slice(0, 3).map(app => app.id)); const [query, setQuery] = useState("");
  const visible = apps.filter(app => `${app.organization} ${app.title}`.toLowerCase().includes(query.toLowerCase())); const chosen = apps.filter(app => selected.includes(app.id)); const allReqs = Array.from(new Set(chosen.flatMap(app => app.requirements.map(req => req.label))));
  function toggle(id: string) { setSelected(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 4 ? [...current, id] : current); }
  return <div><PageHeader eyebrow="Decision canvas" title="Compare paths" description="Put the trade-offs beside each other before you commit to a shortlist." action={<button className="button button-secondary" onClick={() => window.print()}><Download size={16} /> Print view</button>} /><div className="compare-controls"><div className="search-box"><Search size={16} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a path to compare…" aria-label="Find a path to compare" /></div><span className="compare-hint">Select 2–4 paths · {selected.length} selected</span></div><div className="compare-picker">{visible.map(app => <button key={app.id} className={cx("compare-chip", selected.includes(app.id) && "selected")} onClick={() => toggle(app.id)}><span className={cx("chip-icon", app.kind === "Programme" ? "teal" : "ink")}>{app.kind === "Programme" ? <GraduationCap size={14} /> : <BriefcaseBusiness size={14} />}</span><span><strong>{app.title}</strong><small>{app.organization}</small></span>{selected.includes(app.id) ? <CheckCircle2 size={16} /> : <span className="chip-empty" />}</button>)}</div>{chosen.length < 2 ? <div className="empty-state panel"><BarChart3 size={28} /><strong>Select at least two paths</strong><span>Use the cards above to create your comparison set.</span></div> : <div className="panel compare-panel"><div className="compare-scroll"><table className="compare-table"><thead><tr><th>Requirement</th>{chosen.map(app => <th key={app.id}><button onClick={() => onSelect(app.id)}><span className={cx("table-icon", app.kind === "Programme" ? "teal" : "ink")}>{app.kind === "Programme" ? <GraduationCap size={14} /> : <BriefcaseBusiness size={14} />}</span><strong>{app.title}</strong><small>{app.organization}</small></button></th>)}</tr></thead><tbody><tr className="summary-row"><th>Deadline</th>{chosen.map(app => <td key={app.id}><strong className={daysUntil(app.deadline) <= 30 ? "deadline-soon" : ""}>{formatDate(app.deadline)}</strong><small>{deadlineLabel(app.deadline)}</small></td>)}</tr><tr className="summary-row"><th>Readiness</th>{chosen.map(app => <td key={app.id}><strong>{app.progress}%</strong><ProgressBar value={app.progress} small /></td>)}</tr>{allReqs.map(req => <tr key={req}><th>{req}</th>{chosen.map(app => { const item = app.requirements.find(r => r.label === req); return <td key={app.id}>{item ? <StatusPill status={item.state} /> : <span className="not-applicable">Not tracked</span>}</td>; })}</tr>)}<tr className="summary-row"><th>Next action</th>{chosen.map(app => <td key={app.id}><strong className="next-cell">{app.tasks.find(t => t.state !== "Done")?.label || "Ready to submit"}</strong></td>)}</tr></tbody></table></div></div>}</div>;
}

function TasksView({ apps, onToggleTask }: { apps: AppRecord[]; onToggleTask: (appId: string, taskId: string) => void }) { const [filter, setFilter] = useState<"All" | TaskState>("All"); const tasks = apps.flatMap(app => app.tasks.map(task => ({ ...task, app }))).filter(task => filter === "All" || task.state === filter).sort((a, b) => a.due.localeCompare(b.due)); return <div><PageHeader eyebrow="Momentum tracker" title="Action list" description="A practical list of the next actions that move your applications forward." action={<button className="button button-primary"><Plus size={17} /> Add task</button>} /><div className="task-summary"><div><span>Open actions</span><strong>{tasks.filter(t => t.state !== "Done").length}</strong></div><div><span>High priority</span><strong>{tasks.filter(t => t.priority === "High" && t.state !== "Done").length}</strong></div><div><span>Completed</span><strong>{tasks.filter(t => t.state === "Done").length}</strong></div></div><div className="filter-tabs">{(["All", "To do", "In progress", "Done"] as const).map(value => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div><section className="panel"><div className="task-table"><div className="table-head"><span>Action</span><span>Path</span><span>Due</span><span>Priority</span><span>Status</span></div>{tasks.map(task => <button className="task-table-row" key={`${task.app.id}-${task.id}`} onClick={() => onToggleTask(task.app.id, task.id)}><span className="task-label"><span className={cx("task-checkbox", task.state === "Done" && "checked")}>{task.state === "Done" && <Check size={13} />}</span><strong className={task.state === "Done" ? "task-done" : ""}>{task.label}</strong></span><span><strong>{task.app.title}</strong><small>{task.app.organization}</small></span><span className={daysUntil(task.app.deadline) <= 30 ? "deadline-soon" : ""}>{task.due}</span><span className={cx("priority-text", task.priority === "High" && "high")}>{task.priority}</span><span><StatusPill status={task.state} /></span></button>)}</div></section></div>; }

function DocumentsView({ documents, apps, onUpload }: { documents: DocumentRecord[]; apps: AppRecord[]; onUpload: () => void }) { return <div><PageHeader eyebrow="Reusable library" title="Documents" description="Keep the right version ready to reuse across every path." action={<button className="button button-primary" onClick={onUpload}><Plus size={17} /> Add document</button>} /><div className="document-banner"><div className="document-banner-icon"><FolderOpen size={22} /></div><div><strong>One library, many applications</strong><p>Documents in this demo are fictional metadata records. Link them to a path when they are ready.</p></div><ArrowRight size={17} /></div><div className="document-grid">{documents.map(doc => <article className="document-card" key={doc.id}><div className="document-card-top"><div className="file-icon"><FileText size={19} /></div><button className="icon-button" aria-label={`More actions for ${doc.name}`}><MoreHorizontal size={17} /></button></div><div className="document-type">{doc.type}</div><h3>{doc.name}</h3><p>Updated {doc.updated} · Linked to {doc.linked} {doc.linked === 1 ? "path" : "paths"}</p><div className="document-readiness"><div><span>Readiness</span><strong>{doc.readiness}%</strong></div><ProgressBar value={doc.readiness} small /></div><button className="document-link-button" onClick={() => onUpload()}><Plus size={14} /> Link to a path</button></article>)}</div><section className="panel document-help"><div className="panel-label">Document readiness</div><h2>Make “ready to reuse” obvious.</h2><div className="readiness-steps"><div><span className="step-number">1</span><strong>Keep one source of truth</strong><small>Update the reusable version, not five copies.</small></div><div><span className="step-number">2</span><strong>Link it to a path</strong><small>See exactly where a document is still missing.</small></div><div><span className="step-number">3</span><strong>Review before submit</strong><small>Make the last check a calm one.</small></div></div></section></div>; }

function DeadlinesView({ apps, onSelect }: { apps: AppRecord[]; onSelect: (id: string) => void }) { const sorted = [...apps].sort((a, b) => a.deadline.localeCompare(b.deadline)); return <div><PageHeader eyebrow="Dates that matter" title="Deadline tracker" description="Keep the next important date visible, without turning your week into a spreadsheet." action={<button className="button button-secondary" onClick={() => window.print()}><CalendarDays size={16} /> Print timeline</button>} /><div className="deadline-summary"><div className="deadline-summary-primary"><span className="panel-label">Nearest deadline</span><strong>Graduate Brand Planner</strong><small>Aster & Field · due in 23 days</small><ProgressBar value={82} /></div><div><span className="panel-label">This month</span><strong>2</strong><small>applications to move forward</small></div><div><span className="panel-label">Next month</span><strong>3</strong><small>planned milestones</small></div></div><section className="panel"><div className="timeline-list">{sorted.map((app, index) => <button className="timeline-row" key={app.id} onClick={() => onSelect(app.id)}><div className="timeline-date"><strong>{new Date(`${app.deadline}T12:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat("en-GB", { month: "short" }).format(new Date(`${app.deadline}T12:00:00`))}</span></div><div className={cx("timeline-line", index === sorted.length - 1 && "last")} /><div className="timeline-content"><div><StatusPill status={app.status} /><span className="timeline-kind">{app.kind}</span></div><strong>{app.title}</strong><small>{app.organization} · {app.location}</small><div className="timeline-bottom"><span className={daysUntil(app.deadline) <= 30 ? "deadline-soon" : "muted"}>{deadlineLabel(app.deadline)}</span><span>{app.progress}% ready</span></div></div><ArrowRight size={16} className="row-arrow" /></button>)}</div></section></div>; }

function AdviserView({ apps }: { apps: AppRecord[] }) { const shortlist = apps.filter(app => app.shortlisted); return <div><PageHeader eyebrow="Read-only review" title="Adviser review" description="A concise view to share in a supervision conversation. This demo review is fictional." action={<span className="demo-badge"><Users size={14} /> Demo adviser view</span>} /><div className="adviser-banner"><div className="adviser-avatar"><Users size={20} /></div><div><strong>Review prepared for Jordan Morgan</strong><p>Last reviewed 7 October 2026 · Fictional adviser notes only</p></div><button className="button button-secondary"><MessageSquareText size={15} /> Add note</button></div><div className="adviser-grid"><section className="panel"><div className="panel-label">Shortlist signal</div><h2>{shortlist.length} paths worth discussing</h2><p className="panel-intro">Your shortlist has a clear near-term focus. Bring the open requirements below to your next conversation.</p>{shortlist.map(app => <div className="adviser-path" key={app.id}><div className={cx("path-icon", app.kind === "Programme" ? "path-icon-teal" : "path-icon-ink")}>{app.kind === "Programme" ? <GraduationCap size={16} /> : <BriefcaseBusiness size={16} />}</div><div><strong>{app.title}</strong><small>{app.organization} · {app.progress}% ready</small></div><span>{app.requirements.filter(r => r.state !== "Ready").length} open items</span></div>)}</section><section className="panel adviser-notes"><div className="panel-label">Conversation prompts</div><h2>Questions to bring</h2><div className="prompt"><span>01</span><p>Which path gives you the strongest evidence for the direction you want to explore?</p></div><div className="prompt"><span>02</span><p>What is the one document or requirement most likely to slow down your shortlist?</p></div><div className="prompt"><span>03</span><p>What would make your final decision feel considered rather than rushed?</p></div></section></div></div>; }

function SettingsView({ mode, onMode, onToast }: { mode: Mode; onMode: (mode: Mode) => void; onToast: (message: string) => void }) { return <div><PageHeader eyebrow="Workspace preferences" title="Settings" description="Shape the workspace around the way you are planning this season." /><div className="settings-grid"><section className="panel settings-panel"><div className="panel-label">Planning mode</div><h2>Choose your main lens</h2><p>You can switch between modes in this demo. A production workspace would keep a separate archive for each planning season.</p><div className="settings-modes"><button className={mode === "masters" ? "selected" : ""} onClick={() => onMode("masters")}><GraduationCap size={20} /><strong>Master's applications</strong><span>Programmes, requirements, statements, references</span><CheckCircle2 size={17} /></button><button className={mode === "career" ? "selected" : ""} onClick={() => onMode("career")}><BriefcaseBusiness size={20} /><strong>Graduate careers</strong><span>Roles, assessments, interviews, portfolio</span><CheckCircle2 size={17} /></button></div></section><section className="panel settings-panel"><div className="panel-label">Privacy & data</div><h2>Your planning data</h2><div className="settings-row"><div><strong>Fictional demo workspace</strong><span>Sample data is clearly labeled and not sourced from real universities.</span></div><span className="pill pill-success"><span className="pill-dot" /> Active</span></div><div className="settings-row"><div><strong>Marketing messages</strong><span>Keep your focus on the application, not your inbox.</span></div><button className="toggle" onClick={() => onToast("Marketing preference saved")}><span /></button></div><div className="settings-row"><div><strong>Export or delete</strong><span>Download a summary or request workspace removal.</span></div><button className="text-action" onClick={() => onToast("Your request has been noted for the demo")}>Manage <ArrowRight size={14} /></button></div></section></div></div>; }

function BillingView({ showUpgrade, setShowUpgrade, onToast }: { showUpgrade: boolean; setShowUpgrade: (value: boolean) => void; onToast: (message: string) => void }) { return <div><PageHeader eyebrow="Choose your season" title="Plans that fit the decision" description="Start with a free planning desk. Upgrade flows are shown as a test experience in this demo." /><div className="billing-note"><Sparkles size={16} /><span><strong>Test upgrade flow only.</strong> No real payment is collected in this fictional workspace.</span></div><div className="pricing-grid"><PriceCard name="Free planning" price="£0" suffix="forever" description="For getting your first plan clear." features={["One planning mode", "Up to 5 paths", "Tasks, deadlines & notes", "Reusable document library"]} cta="Current plan" current /><PriceCard name="One-season pass" price="£29" suffix="per season" description="For a focused application season." features={["Unlimited paths", "Side-by-side comparison", "Exportable action plan", "Progress & readiness views"]} cta="Test upgrade" featured onClick={() => setShowUpgrade(true)} /><PriceCard name="Adviser / university" price="£99" suffix="per seat / season" description="For guided progression conversations." features={["Read-only adviser view", "Shared review summaries", "Cohort-ready exports", "Priority workspace support"]} cta="Talk to us" onClick={() => onToast("Thanks — the demo has saved your interest")} /></div>{showUpgrade && <div className="upgrade-panel"><div><div className="panel-label">Test upgrade</div><h2>Ready to keep your shortlist moving?</h2><p>This demo simulates the upgrade handoff. No payment details are requested and no charge is made.</p></div><div className="upgrade-actions"><button className="button button-secondary" onClick={() => setShowUpgrade(false)}>Not now</button><button className="button button-primary" onClick={() => { setShowUpgrade(false); onToast("Test upgrade complete — One-season pass enabled"); }}>Confirm test upgrade <ArrowRight size={15} /></button></div></div>}</div>; }

function PriceCard({ name, price, suffix, description, features, cta, featured, current, onClick }: { name: string; price: string; suffix: string; description: string; features: string[]; cta: string; featured?: boolean; current?: boolean; onClick?: () => void }) { return <article className={cx("price-card", featured && "featured")}>{featured && <div className="price-ribbon">Most useful for a busy season</div>}<div className="price-card-top"><span className="panel-label">{name}</span>{current && <span className="current-label">Current</span>}</div><div className="price-value"><strong>{price}</strong><span>{suffix}</span></div><p>{description}</p><div className="price-features">{features.map(feature => <span key={feature}><Check size={14} />{feature}</span>)}</div><button className={cx("button", featured ? "button-primary" : "button-secondary")} onClick={onClick}>{cta}{!current && <ArrowRight size={15} />}</button></article>; }

function AddApplicationDialog({ mode, onClose, onCreate }: { mode: Mode; onClose: () => void; onCreate: (payload: { kind: ApplicationKind; organization: string; title: string; deadline: string }) => void }) { const [kind, setKind] = useState<ApplicationKind>(mode === "masters" ? "Programme" : "Graduate role"); const [organization, setOrganization] = useState(""); const [title, setTitle] = useState(""); const [deadline, setDeadline] = useState("2026-12-18"); return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="modal-card"><div className="modal-header"><div><div className="section-kicker">Add to your map</div><h2>New {kind.toLowerCase()}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button></div><div className="form-grid"><label>Type<select value={kind} onChange={e => setKind(e.target.value as ApplicationKind)}><option>Programme</option><option>Graduate role</option></select></label><label>Organisation<input value={organization} onChange={e => setOrganization(e.target.value)} placeholder={kind === "Programme" ? "e.g. Northbridge University" : "e.g. Aster & Field"} /></label><label className="full">Name<input value={title} onChange={e => setTitle(e.target.value)} placeholder={kind === "Programme" ? "e.g. MSc Digital Strategy" : "e.g. Graduate Brand Planner"} /></label><label>Deadline<input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} /></label></div><div className="modal-footer"><span>Start with the essentials. Add requirements on the detail page.</span><div><button className="button button-secondary" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={!organization || !title} onClick={() => onCreate({ kind, organization, title, deadline })}>Add path <ArrowRight size={15} /></button></div></div></div></div>; }

export default App;

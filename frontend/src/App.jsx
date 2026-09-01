import Card from "./components/common/Card";
import ProgressBar from "./components/common/ProgressBar";
import AppShell from './components/layouts/AppShell';

function App() {
  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Welcome to SAMVAAD 
            
          </h2>

          <p className="mt-2 text-slate-600">
            Continue your learning journey.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Current Streak
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              7 days
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              XP Earned
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              450 XP
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-sm font-medium text-slate-500">
              Lessons Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              12
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900">
            Your Progress
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Keep going! You're making great progress.
          </p>

          <div className="mt-5">
            <ProgressBar value={65} showLabel />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

export default App;
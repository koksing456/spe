export default function Layout({ children }) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold text-gray-100">
                Stanford Prison Experiment AI Simulation
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Interactive Digital Recreation & Analysis
              </p>
            </div>
          </div>
        </header>
        <main className="w-full">
          {children}
        </main>
      </div>
    )
  }
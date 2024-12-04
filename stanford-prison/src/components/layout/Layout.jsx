export default function Layout({ children }) {
    return (
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-full mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-100">
              Stanford Prison Experiment
            </h1>
          </div>
        </header>
        <main className="w-full">
          {children}
        </main>
      </div>
    )
  }
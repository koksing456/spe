import { useState, useEffect } from 'react'
import { fetchAnalyticsSummary } from '../services/api'

export default function Analytics() {
    const [analytics, setAnalytics] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchAnalyticsSummary()
                setAnalytics(data)
                setLoading(false)
            } catch (err) {
                setError(err.message)
                setLoading(false)
            }
        }

        fetchData()
        // Refresh every 5 minutes
        const interval = setInterval(fetchData, 5 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return (
        <div className="bg-gray-800 bg-opacity-90 shadow rounded-lg p-6 text-gray-300">
            Loading analytics...
        </div>
    )
    
    if (error) return (
        <div className="bg-gray-800 bg-opacity-90 shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Analytics</h2>
            <div className="text-red-400">
                Error loading analytics. Data collection in progress...
            </div>
        </div>
    )
    
    if (!analytics) return null

    return (
        <div className="bg-gray-800 bg-opacity-90 shadow rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Simulation Analytics</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Stats */}
                <div className="border border-gray-700 rounded p-4 bg-gray-900 bg-opacity-50">
                    <h3 className="font-semibold mb-2 text-gray-300">Overview</h3>
                    <p className="text-gray-400">Total Interactions: {analytics.total_interactions}</p>
                </div>

                {/* Pattern Frequencies */}
                <div className="border border-gray-700 rounded p-4 bg-gray-900 bg-opacity-50">
                    <h3 className="font-semibold mb-2 text-gray-300">Behavior Patterns</h3>
                    <ul className="text-gray-400">
                        {Object.entries(analytics.pattern_frequencies || {}).map(([pattern, count]) => (
                            <li key={pattern}>
                                {pattern}: {count} occurrences
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Stress Analysis */}
                <div className="border border-gray-700 rounded p-4 bg-gray-900 bg-opacity-50">
                    <h3 className="font-semibold mb-2 text-gray-300">Stress Analysis</h3>
                    {Object.entries(analytics.stress_analysis || {}).map(([agentId, data]) => (
                        <div key={agentId} className="mb-2">
                            <p className="font-medium text-gray-300">{agentId}:</p>
                            <p className="text-gray-400">Current Level: {data.current_level}</p>
                            <p className="text-gray-400">Average: {data.average?.toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                {/* Agent Evolution */}
                <div className="border border-gray-700 rounded p-4 bg-gray-900 bg-opacity-50">
                    <h3 className="font-semibold mb-2 text-gray-300">Agent Evolution</h3>
                    {Object.entries(analytics.agent_evolution || {}).map(([agentId, data]) => (
                        <div key={agentId} className="mb-2">
                            <p className="font-medium text-gray-300">{agentId}:</p>
                            {data.current_state && (
                                <div className="pl-2">
                                    <p className="text-gray-400">Current Traits:</p>
                                    {Object.entries(data.current_state.personality_traits || {}).map(([trait, value]) => (
                                        <p key={trait} className="text-sm text-gray-400">
                                            {trait}: {value.toFixed(2)}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
} 
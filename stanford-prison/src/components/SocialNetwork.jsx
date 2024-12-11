import { useState, useEffect } from 'react'
import { fetchSocialNetwork } from '../services/api'

export default function SocialNetwork() {
    const [network, setNetwork] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchSocialNetwork()
                setNetwork(data)
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
            Loading social network data...
        </div>
    )
    
    if (error) return (
        <div className="bg-gray-800 bg-opacity-90 shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Social Network</h2>
            <div className="text-red-400">
                Error loading social network. Relationship data collection in progress...
            </div>
        </div>
    )
    
    if (!network) return null

    return (
        <div className="bg-gray-800 bg-opacity-90 shadow rounded-lg p-6 border border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4 text-gray-300">Social Network Analysis</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Relationships */}
                <div className="border border-gray-700 rounded p-4 bg-gray-900 bg-opacity-50">
                    <h3 className="font-semibold mb-2 text-gray-300">Relationships</h3>
                    <div className="space-y-2">
                        {Object.entries(network.relationships || {}).map(([key, relationship]) => (
                            <div key={key} className="p-2 bg-gray-800 rounded">
                                <p className="font-medium text-gray-300">
                                    {relationship.agent1_id} ↔ {relationship.agent2_id}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Type: {relationship.relation_type}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Strength: {(relationship.strength * 100).toFixed(1)}%
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Groups */}
                <div className="border border-gray-700 rounded p-4 bg-gray-900 bg-opacity-50">
                    <h3 className="font-semibold mb-2 text-gray-300">Groups</h3>
                    <div className="space-y-2">
                        {Object.entries(network.groups || {}).map(([groupId, group]) => (
                            <div key={groupId} className="p-2 bg-gray-800 rounded">
                                <p className="font-medium text-gray-300">Group: {group.id}</p>
                                <p className="text-sm text-gray-400">Purpose: {group.purpose}</p>
                                <p className="text-sm text-gray-400">
                                    Members: {Array.from(group.members).join(', ')}
                                </p>
                                <p className="text-sm text-gray-400">
                                    Cohesion: {(group.cohesion_level * 100).toFixed(1)}%
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Influence Scores */}
                <div className="border border-gray-700 rounded p-4 bg-gray-900 bg-opacity-50">
                    <h3 className="font-semibold mb-2 text-gray-300">Influence Scores</h3>
                    <div className="space-y-2">
                        {Object.entries(network.influence_scores || {}).map(([agentId, score]) => (
                            <div key={agentId} className="flex justify-between items-center">
                                <span className="text-gray-300">{agentId}</span>
                                <div className="w-2/3 bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className="bg-purple-600 h-2.5 rounded-full"
                                        style={{ width: `${score * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
} 
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const fetchAnalyticsSummary = async () => {
    try {
        const response = await fetch(`${API_URL}/analytics/summary`)
        if (!response.ok) {
            throw new Error('Failed to fetch analytics')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching analytics:', error)
        throw error
    }
}

export const fetchSocialNetwork = async () => {
    try {
        const response = await fetch(`${API_URL}/social/network`)
        if (!response.ok) {
            throw new Error('Failed to fetch social network')
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching social network:', error)
        throw error
    }
} 
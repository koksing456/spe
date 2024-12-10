import { create } from 'zustand'

const WS_URL = 'ws://localhost:8000/ws'
const RECONNECT_INTERVAL = 5000 // 5 seconds
const FOUR_HOURS_IN_MS = 4 * 60 * 60 * 1000 // 4 hours in milliseconds

const useSimulationStore = create((set) => ({
    messages: [],
    currentState: {
        day: 1,
        hour: 6,
        incident_count: 0,
        stress_level: 0
    },
    isConnected: false,
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    updateState: (newState) => set({ currentState: newState }),
    setConnected: (connected) => set({ isConnected: connected })
}))

class WebSocketService {
    constructor() {
        this.socket = null
        this.store = useSimulationStore
        this.isConnecting = false
        this.nextUpdateTimeout = null
    }

    connect() {
        if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
            return
        }

        this.isConnecting = true
        console.log('Connecting to WebSocket...')

        try {
            this.socket = new WebSocket(WS_URL)

            this.socket.onopen = () => {
                console.log('WebSocket connected')
                this.isConnecting = false
                this.store.getState().setConnected(true)
                this.scheduleNextUpdate()
            }

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    if (data.type === 'state_update') {
                        this.store.getState().updateState(data.state)
                    } else if (data.type === 'new_messages') {
                        data.messages.forEach(message => {
                            this.store.getState().addMessage(message)
                        })
                    } else if (data.type === 'incident') {
                        // Dispatch custom event for IncidentCounter
                        const newIncidentEvent = new CustomEvent('newIncident', {
                            detail: {
                                type: data.incident.type,
                                severity: data.incident.severity,
                                description: data.incident.description,
                                timestamp: data.incident.timestamp
                            }
                        })
                        window.dispatchEvent(newIncidentEvent)
                    }
                } catch (error) {
                    console.error('Error processing message:', error)
                }
            }

            this.socket.onclose = () => {
                console.log('WebSocket disconnected')
                this.isConnecting = false
                this.store.getState().setConnected(false)
                this.clearScheduledUpdate()
                setTimeout(() => this.connect(), RECONNECT_INTERVAL)
            }

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error)
            this.isConnecting = false
            setTimeout(() => this.connect(), RECONNECT_INTERVAL)
        }
    }

    scheduleNextUpdate() {
        // Calculate time until next 4-hour mark
        const now = new Date()
        const hours = now.getHours()
        const nextInterval = Math.ceil(hours / 4) * 4
        const delay = ((nextInterval - hours + 24) % 24) * 60 * 60 * 1000 - 
                     now.getMinutes() * 60 * 1000 - 
                     now.getSeconds() * 1000

        console.log(`Next update scheduled in ${delay/1000/60} minutes`)

        // Clear any existing timeout
        this.clearScheduledUpdate()

        // Schedule next update
        this.nextUpdateTimeout = setTimeout(() => {
            this.advanceSimulation()
            // Schedule next update in 4 hours
            this.scheduleNextUpdate()
        }, delay)
    }

    clearScheduledUpdate() {
        if (this.nextUpdateTimeout) {
            clearTimeout(this.nextUpdateTimeout)
            this.nextUpdateTimeout = null
        }
    }

    async advanceSimulation() {
        try {
            const response = await fetch('http://localhost:8000/next-step', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.store.getState().currentState)
            })

            if (!response.ok && response.status !== 422) {
                console.error('Failed to advance simulation:', await response.text())
            }
        } catch (error) {
            console.error('Error advancing simulation:', error)
        }
    }

    disconnect() {
        this.clearScheduledUpdate()
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }
}

export const websocketService = new WebSocketService()
export { useSimulationStore } 
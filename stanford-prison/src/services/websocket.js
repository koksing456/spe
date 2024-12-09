import { create } from 'zustand'

const WS_URL = 'ws://localhost:8000/ws'
const RECONNECT_INTERVAL = 5000 // 5 seconds
const SIMULATION_INTERVAL = 10000 // 10 seconds between updates

const useSimulationStore = create((set) => ({
    messages: [],
    currentState: {
        day: 1,
        hour: 6,
        incident_count: 0,
        stress_level: 0
    },
    isConnected: false,
    isRunning: true,
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    updateState: (newState) => set({ currentState: newState }),
    setConnected: (connected) => set({ isConnected: connected }),
    setRunning: (running) => set({ isRunning: running }),
}))

class WebSocketService {
    static instance = null
    
    constructor() {
        if (WebSocketService.instance) {
            return WebSocketService.instance
        }
        this.socket = null
        this.store = useSimulationStore
        this.isConnecting = false
        this.simulationInterval = null
        WebSocketService.instance = this
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
                this.startSimulation()
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
                    } else if (data.type === 'simulation_end') {
                        console.log('Simulation ended:', data.reason)
                        this.stopSimulation()
                        this.store.getState().setRunning(false)
                    }
                } catch (error) {
                    console.error('Error processing message:', error)
                }
            }

            this.socket.onclose = () => {
                console.log('WebSocket disconnected')
                this.isConnecting = false
                this.store.getState().setConnected(false)
                this.stopSimulation()
                // Attempt to reconnect after delay
                setTimeout(() => this.connect(), RECONNECT_INTERVAL)
            }

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error)
                this.socket.close()
            }

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error)
            this.isConnecting = false
            // Attempt to reconnect after delay
            setTimeout(() => this.connect(), RECONNECT_INTERVAL)
        }
    }

    startSimulation() {
        if (this.simulationInterval) {
            return
        }

        const advanceSimulation = async () => {
            if (!this.store.getState().isRunning) {
                return
            }

            try {
                const response = await fetch('http://localhost:8000/next-step', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...this.store.getState().currentState,
                        messages: this.store.getState().messages
                    })
                })

                if (!response.ok) {
                    if (response.status !== 422) {  // Ignore validation errors
                        console.error('Failed to advance simulation:', await response.text())
                    }
                }
            } catch (error) {
                console.error('Error advancing simulation:', error)
            }
        }

        // Start the simulation loop
        advanceSimulation() // Run immediately
        this.simulationInterval = setInterval(advanceSimulation, SIMULATION_INTERVAL)
    }

    stopSimulation() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval)
            this.simulationInterval = null
        }
    }

    disconnect() {
        this.stopSimulation()
        if (this.socket) {
            this.socket.close()
            this.socket = null
        }
    }

    isConnected() {
        return this.socket?.readyState === WebSocket.OPEN
    }
}

export const websocketService = new WebSocketService()
export { useSimulationStore } 
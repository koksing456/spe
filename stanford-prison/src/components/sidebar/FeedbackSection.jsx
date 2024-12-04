import { useState } from 'react'

export default function FeedbackSection() {
  const [feedback, setFeedback] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle feedback submission
    console.log('Feedback submitted:', feedback)
    setFeedback('')
  }

  return (
    <div className="prison-card">
      <h2>Feedback</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your thoughts about the experiment..."
          className="w-full h-24 px-3 py-2 text-sm bg-gray-800 border-gray-700 prison-text rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        />
        <button
          type="submit"
          className="mt-2 w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-800"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  )
} 
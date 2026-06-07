import {useEffect, useState} from 'react'
import './index.css'

// commit to trigger pipeline - 1

function App() {
    const [message, setMessage] = useState<string>('')

    useEffect(() => {
        fetch('http://localhost:3000')
            .then((res) => res.text())
            .then(setMessage)
    }, [])

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <p className="text-2xl font-semibold text-white">{message}</p>
        </div>
    )
}

export default App

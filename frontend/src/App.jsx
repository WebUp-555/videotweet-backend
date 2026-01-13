import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './index.css';

function App() {    
  const [count, setCount] = useState(0)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white p-8 rounded-xl shadow-xl text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Tailwind CSS is Working 🚀
        </h1>

        <p className="text-gray-700 mb-6">
          If you see styles, Tailwind is successfully installed.
        </p>

        <button className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition">
          Test Button
        </button>
      </div>
    </div>
  );
}


export default App

"use client"

import Image from "next/image"
import { useState, useEffect, useCallback } from "react"

const GAME_DURATION = 30 // seconds
const MOLE_SHOW_TIME = 800 // ms - how long a mole stays visible
const MOLE_SPAWN_INTERVAL = 600 // ms - how often a new mole can appear

export default function Home() {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false))
  const [whacked, setWhacked] = useState<boolean[]>(Array(9).fill(false))
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [isPlaying, setIsPlaying] = useState(false)
  const [highScore, setHighScore] = useState(0)

  // Spawn moles randomly
  useEffect(() => {
    if (!isPlaying) return

    const spawnMole = () => {
      const emptyHoles = moles.map((isMole, idx) => (!isMole ? idx : -1)).filter((idx) => idx !== -1)

      if (emptyHoles.length === 0) return

      const randomHole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)]

      setMoles((prev) => {
        const newMoles = [...prev]
        newMoles[randomHole] = true
        return newMoles
      })

      // Hide mole after MOLE_SHOW_TIME
      setTimeout(() => {
        setMoles((prev) => {
          const newMoles = [...prev]
          newMoles[randomHole] = false
          return newMoles
        })
        setWhacked((prev) => {
          const newWhacked = [...prev]
          newWhacked[randomHole] = false
          return newWhacked
        })
      }, MOLE_SHOW_TIME)
    }

    const interval = setInterval(spawnMole, MOLE_SPAWN_INTERVAL)
    return () => clearInterval(interval)
  }, [isPlaying, moles])

  // Game timer
  useEffect(() => {
    if (!isPlaying || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsPlaying(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPlaying, timeLeft])

  // Update high score when game ends
  useEffect(() => {
    if (!isPlaying && timeLeft === 0 && score > highScore) {
      setHighScore(score)
    }
  }, [isPlaying, timeLeft, score, highScore])

  const handleWhack = useCallback(
    (index: number) => {
      if (!isPlaying || !moles[index] || whacked[index]) return

      setWhacked((prev) => {
        const newWhacked = [...prev]
        newWhacked[index] = true
        return newWhacked
      })

      setScore((prev) => prev + 1)

      // Hide mole quickly after being whacked
      setTimeout(() => {
        setMoles((prev) => {
          const newMoles = [...prev]
          newMoles[index] = false
          return newMoles
        })
      }, 100)
    },
    [isPlaying, moles, whacked],
  )

  const startGame = () => {
    setMoles(Array(9).fill(false))
    setWhacked(Array(9).fill(false))
    setScore(0)
    setTimeLeft(GAME_DURATION)
    setIsPlaying(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 flex flex-col items-center py-8 px-4">
      <h1 className="mb-6 text-5xl font-extrabold text-amber-800 drop-shadow-lg">🔨 Whack-a-Mole!</h1>

      {/* Score Board */}
      <div className="flex flex-wrap gap-6 justify-center items-center mb-6 bg-amber-100 px-8 py-4 rounded-xl shadow-lg">
        <div className="text-center">
          <p className="text-sm font-medium text-amber-700">Score</p>
          <p className="text-4xl font-bold text-amber-900">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-amber-700">Time</p>
          <p className={`text-4xl font-bold ${timeLeft <= 5 ? "text-red-600 animate-pulse" : "text-amber-900"}`}>
            {timeLeft}s
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-amber-700">High Score</p>
          <p className="text-4xl font-bold text-amber-900">{highScore}</p>
        </div>
      </div>

      {/* Start/Restart Button */}
      <button
        onClick={startGame}
        className="mb-6 px-8 py-3 text-xl font-bold text-white bg-green-500 rounded-full shadow-lg hover:bg-green-600 active:scale-95 transition-all cursor-pointer"
      >
        {isPlaying ? "Restart" : timeLeft === 0 ? "Play Again!" : "Start Game!"}
      </button>

      {/* Game Over Message */}
      {!isPlaying && timeLeft === 0 && (
        <div className="mb-4 text-2xl font-bold text-amber-800 animate-bounce">
          Game Over! You scored {score} points! 🎉
        </div>
      )}

      {/* Game Grid */}
      <div className="grid grid-cols-3 gap-2 max-w-xl w-full">
        {moles.map((hasMole, idx) => (
          <div
            key={idx}
            onClick={() => handleWhack(idx)}
            className="relative h-40 flex items-end justify-center cursor-pointer overflow-hidden"
          >
            {/* Mole */}
            <div
              className={`absolute bottom-12 z-10 transition-all duration-150 ${
                hasMole ? (whacked[idx] ? "translate-y-full scale-90 opacity-50" : "translate-y-0") : "translate-y-full"
              }`}
            >
              <Image src="/mole.jpg" alt="Mole" width={100} height={80} className="drop-shadow-lg" draggable={false} />
            </div>
            {/* Dirt Hole */}
            <Image
              src="/dirt.png"
              alt="Dirt hole"
              width={160}
              height={80}
              className="relative z-20"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Instructions */}
      {!isPlaying && timeLeft === GAME_DURATION && (
        <p className="mt-6 text-amber-800 text-center max-w-md">
          Click or tap the moles as they pop up! You have {GAME_DURATION} seconds to score as many points as possible.
        </p>
      )}
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { useSpeechRecognition } from 'react-speech-recognition'

const correctPunctuation = (transcript) => `${transcript}...`

const Dictaphone = () => {
  const [correctedTranscript, setCorrectedTranscript] = useState('')
  const { finalTranscript } = useSpeechRecognition()

  const prevFinalTranscriptRef = useRef()
  useEffect(() => {
    prevFinalTranscriptRef.current = finalTranscript;
  })
  const prevFinalTranscript = prevFinalTranscriptRef.current

  useEffect(() => {
    if (finalTranscript !== '') {
      const newSpeech = finalTranscript.substr(prevFinalTranscript.length).trim()
      setCorrectedTranscript(`${correctedTranscript} ${correctPunctuation(newSpeech)}`)
    }
  }, [finalTranscript])

  return <span>{correctedTranscript}</span>
}

export default Dictaphone
// components/VoiceRecorder.tsx
import { useState, useRef } from 'react';
import axios from 'axios';

interface VoiceRecorderProps {
  onRecordingComplete: (userMessage: any, assistantMessage: any) => void;
}

export default function VoiceRecorder({ onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(5);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const handleRecordingComplete = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      // Ensure we're sending with the correct filename and type
      formData.append('audio', audioBlob, 'recording.webm');

      console.log('Sending audio:', {
        type: audioBlob.type,
        size: audioBlob.size
      });

      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        maxBodyLength: Infinity,
      });
      
      const { userMessage, assistantMessage } = response.data;
      onRecordingComplete(userMessage, assistantMessage);
    } catch (error) {
      console.error('Error processing audio:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000
        }
      });
      
      // Try to use a format that OpenAI supports
      const mimeType = 'audio/webm';
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType
      });
      
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        handleRecordingComplete(audioBlob);
        setTimer(5);
        stream.getTracks().forEach(track => track.stop());
      };

      setIsRecording(true);
      mediaRecorderRef.current.start();

      const countdown = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);

      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          clearInterval(countdown);
        }
      }, 5000);
    } catch (err) {
      console.error('Error starting recording:', err);
      setIsRecording(false);
    }
  };

  return (
    <button
      onClick={startRecording}
      disabled={isRecording}
      className="w-full p-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
    >
      {isRecording ? `Recording... ${timer}s` : 'Start Recording'}
    </button>
  );
}
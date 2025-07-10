import { useState, useRef } from "react";
import { Button } from "./button";
import { Mic, Square } from "lucide-react";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  disabled?: boolean;
  isRecording?: boolean;
  onRecordingStart?: () => void;
}

export function AudioRecorder({ 
  onRecordingComplete, 
  disabled, 
  isRecording: externalIsRecording,
  onRecordingStart
}: AudioRecorderProps) {
  const [internalIsRecording, setInternalIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  const isRecording = externalIsRecording ?? internalIsRecording;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setInternalIsRecording(true);
      onRecordingStart?.();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setInternalIsRecording(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      className={`p-2 ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
    >
      {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}

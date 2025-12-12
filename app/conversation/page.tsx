"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Play, Pause, Square, Mic } from "lucide-react"

import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { API_BASE_URL } from "@/config"

type AudioFile = {
  _id: string
  userId: string
  filename: string
  originalName: string
  size: number
  duration: number
  format: string
  transcription?: string
  createdAt: string
}

export default function ConversationPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const username = searchParams.get('username')

  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [playingStates, setPlayingStates] = useState<Record<string, boolean>>({})

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({})

  const adminKey = (window as any).ADMIN_KEY || localStorage.getItem('adminKey')

  useEffect(() => {
    const fetchAudioFiles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/audio`, {
          headers: {
            'x-admin-key': adminKey || '',
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Filter audio files for the specific user
          const userAudioFiles = data.filter((audio: AudioFile) => audio.userId === userId);
          setAudioFiles(userAudioFiles);
        } else {
          console.error('Failed to fetch audio files');
        }
      } catch (error) {
        console.error('Error fetching audio files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchAudioFiles();
    }
  }, [userId, adminKey])

  const handlePlay = (audioId: string) => {
    const audio = audioRefs.current[audioId];
    if (audio) {
      // Stop all other playing audios
      Object.keys(playingStates).forEach(id => {
        if (id !== audioId && playingStates[id]) {
          const otherAudio = audioRefs.current[id];
          if (otherAudio) {
            otherAudio.pause();
            otherAudio.currentTime = 0;
          }
          setPlayingStates(prev => ({ ...prev, [id]: false }));
        }
      });

      audio.play();
      setPlayingStates(prev => ({ ...prev, [audioId]: true }));
    }
  }

  const handlePause = (audioId: string) => {
    const audio = audioRefs.current[audioId];
    if (audio) {
      audio.pause();
      setPlayingStates(prev => ({ ...prev, [audioId]: false }));
    }
  }

  const handleStop = (audioId: string) => {
    const audio = audioRefs.current[audioId];
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setPlayingStates(prev => ({ ...prev, [audioId]: false }));
    }
  }

  const handleAudioEnded = (audioId: string) => {
    setPlayingStates(prev => ({ ...prev, [audioId]: false }));
  }

  return (
    <DashboardLayout activeItem="Dashboard">
      <div className="p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <Card className="bg-card shadow-sm border-0 rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Mic className="h-6 w-6 text-[#6F42C1]" />
                Audio Conversation with {username}
              </CardTitle>
            </CardHeader>
          </Card>

          {isLoading ? (
            <Card className="bg-card shadow-sm border-0 rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6F42C1] mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading audio files...</p>
              </CardContent>
            </Card>
          ) : audioFiles.length === 0 ? (
            <Card className="bg-card shadow-sm border-0 rounded-xl">
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No audio files found for this admin.</p>
              </CardContent>
            </Card>
          ) : (
            audioFiles.map((audio) => (
              <Card key={audio._id} className="bg-card shadow-sm border-0 rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{audio.originalName || audio.filename}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(audio.createdAt).toLocaleDateString()}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={() => handlePlay(audio._id)}
                      variant="outline"
                      size="lg"
                      disabled={playingStates[audio._id]}
                      className="bg-[#6F42C1] hover:bg-[#5A2D91] text-white border-[#6F42C1]"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Play
                    </Button>
                    <Button
                      onClick={() => handlePause(audio._id)}
                      variant="outline"
                      size="lg"
                      disabled={!playingStates[audio._id]}
                    >
                      <Pause className="h-5 w-5 mr-2" />
                      Pause
                    </Button>
                    <Button
                      onClick={() => handleStop(audio._id)}
                      variant="outline"
                      size="lg"
                    >
                      <Square className="h-5 w-5 mr-2" />
                      Stop
                    </Button>
                  </div>

                  <audio
                    ref={(el) => {
                      audioRefs.current[audio._id] = el;
                      if (el) {
                        el.addEventListener('ended', () => handleAudioEnded(audio._id));
                      }
                    }}
                    src={`${API_BASE_URL}/audio/${audio.filename}`}
                    className="hidden"
                  />

                  {/* Transcription */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Transcription</h4>
                    <Textarea
                      value={audio.transcription || "No transcription available"}
                      placeholder="Transcription will appear here..."
                      className="min-h-[100px] resize-none"
                      readOnly
                    />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

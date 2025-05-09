import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BadgeExtended } from "@/components/ui/badge-extended";
import { AlertCircle, CheckCircle2, Circle, Mic, MicOff, Video, VideoOff } from "lucide-react";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

export default function RealtimeDetection() {
  const [activeTab, setActiveTab] = useState<string>("video");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [confidenceScore, setConfidenceScore] = useState<number>(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  
  // Analysis interval in milliseconds (3 seconds)
  const ANALYSIS_INTERVAL = 3000;
  // Interval reference for cleanup
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Video analysis mutation
  const videoAnalysisMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      formData.append("file", blob, "realtime-video.webm");
      const response = await apiRequest("/api/deepfake-detection", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setAnalysisResult(data);
      setConfidenceScore(data.isAuthentic ? data.confidenceScore : 100 - data.confidenceScore);
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: "Could not analyze video frame. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Voice analysis mutation
  const voiceAnalysisMutation = useMutation({
    mutationFn: async (blob: Blob) => {
      const formData = new FormData();
      formData.append("file", blob, "realtime-audio.webm");
      const response = await apiRequest("/api/voice-detection", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      setAnalysisResult(data);
      setConfidenceScore(data.isAI ? 100 - data.confidence : data.confidence);
    },
    onError: (error) => {
      toast({
        title: "Analysis failed",
        description: "Could not analyze audio segment. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Start media stream
  const startStream = async () => {
    try {
      // Request permissions based on active tab
      const constraints = {
        video: activeTab === "video" && videoEnabled,
        audio: audioEnabled,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // If video is enabled and we're in video mode, show the stream
      if (videoRef.current && activeTab === "video" && videoEnabled) {
        videoRef.current.srcObject = stream;
      }

      // Reset analysis state
      setAnalysisResult(null);
      setConfidenceScore(0);
      recordedChunksRef.current = [];

      // Begin recording
      startRecording();

    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Permission denied",
        description: "Please allow access to your camera and/or microphone.",
        variant: "destructive",
      });
    }
  };

  // Stop media stream
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }

    // Clear analysis interval
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }

    setIsRecording(false);
    setIsAnalyzing(false);
  };

  // Start recording media
  const startRecording = () => {
    if (!streamRef.current) return;

    const options = { mimeType: "video/webm" };
    
    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, options);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = handleDataAvailable;
      mediaRecorder.start(ANALYSIS_INTERVAL); // Collect data every 3 seconds
      setIsRecording(true);

      // Set up interval to analyze collected chunks
      analysisIntervalRef.current = setInterval(analyzeLatestChunk, ANALYSIS_INTERVAL);

    } catch (e) {
      console.error("Exception while creating MediaRecorder:", e);
      toast({
        title: "Recording failed",
        description: "Could not start recording. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle recorded chunks
  const handleDataAvailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) {
      recordedChunksRef.current.push(event.data);
      analyzeLatestChunk();
    }
  };

  // Analyze the most recent chunk
  const analyzeLatestChunk = () => {
    if (recordedChunksRef.current.length === 0) return;

    const latestChunk = recordedChunksRef.current[recordedChunksRef.current.length - 1];
    setIsAnalyzing(true);

    if (activeTab === "video") {
      videoAnalysisMutation.mutate(latestChunk);
    } else {
      voiceAnalysisMutation.mutate(latestChunk);
    }

    setIsAnalyzing(false);
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopStream();
    } else {
      startStream();
    }
  };

  // Handle tab change
  useEffect(() => {
    // Stop current stream when changing tabs
    if (isRecording) {
      stopStream();
    }
  }, [activeTab]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-500 text-transparent bg-clip-text">
          Real-time Detection
        </h1>
        <p className="text-lg mb-8">
          Analyze video or audio in real-time to detect AI-generated content as it happens.
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
            <TabsTrigger value="video">Video Analysis</TabsTrigger>
            <TabsTrigger value="audio">Voice Analysis</TabsTrigger>
          </TabsList>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Live {activeTab === "video" ? "Video" : "Audio"}</CardTitle>
                <CardDescription>
                  {activeTab === "video" 
                    ? "Your camera feed will be analyzed in real-time for deepfake indicators" 
                    : "Your microphone will be analyzed in real-time for AI-generated voice patterns"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeTab === "video" ? (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    {!isRecording && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white text-xl font-medium">Click Start to enable camera</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-950 rounded-lg overflow-hidden flex items-center justify-center">
                    {isRecording ? (
                      <div className="text-center">
                        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                          <div className="absolute w-full h-full rounded-full bg-indigo-500/20 animate-ping"></div>
                          <div className="absolute w-20 h-20 rounded-full bg-indigo-500/30"></div>
                          <Mic className="w-10 h-10 text-white relative z-10" />
                        </div>
                        <p className="text-white text-xl font-medium">Listening...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-gray-700">
                          <Mic className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="text-white text-xl font-medium">Click Start to enable microphone</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <div className="flex gap-2 w-full">
                  {activeTab === "video" && (
                    <Button 
                      variant={videoEnabled ? "default" : "outline"} 
                      onClick={() => setVideoEnabled(!videoEnabled)}
                      className="flex-1"
                    >
                      {videoEnabled ? <Video className="mr-2 h-4 w-4" /> : <VideoOff className="mr-2 h-4 w-4" />}
                      {videoEnabled ? "Camera On" : "Camera Off"}
                    </Button>
                  )}
                  <Button 
                    variant={audioEnabled ? "default" : "outline"} 
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="flex-1"
                  >
                    {audioEnabled ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                    {audioEnabled ? "Mic On" : "Mic Off"}
                  </Button>
                </div>
                
                <Button 
                  onClick={toggleRecording} 
                  variant={isRecording ? "destructive" : "default"}
                  className="w-full"
                >
                  {isRecording ? "Stop" : "Start"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Real-time Analysis</CardTitle>
                <CardDescription>
                  {activeTab === "video" 
                    ? "Detection results for potential deepfake indicators" 
                    : "Detection results for AI-generated voice patterns"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isRecording ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Analysis confidence</span>
                        <span className="text-sm font-medium">{confidenceScore}%</span>
                      </div>
                      <Progress value={confidenceScore} className="h-2" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant={isAnalyzing ? "outline" : "default"}>
                          {isAnalyzing ? "Analyzing..." : "Latest result"}
                        </Badge>
                        
                        {analysisResult && (
                          activeTab === "video" ? (
                            analysisResult.isAuthentic ? (
                              <BadgeExtended variant="success">
                                Authentic
                              </BadgeExtended>
                            ) : (
                              <Badge variant="destructive">
                                Possible Deepfake
                              </Badge>
                            )
                          ) : (
                            !analysisResult.isAI ? (
                              <BadgeExtended variant="success">
                                Human Voice
                              </BadgeExtended>
                            ) : (
                              <Badge variant="destructive">
                                Possible AI Voice
                              </Badge>
                            )
                          )
                        )}
                      </div>

                      {analysisResult && (
                        <div className="border rounded-lg p-4 space-y-3">
                          <h4 className="font-semibold">Detected markers:</h4>
                          <ul className="space-y-2">
                            {analysisResult.details && analysisResult.details.map((detail: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                {((activeTab === "video" && analysisResult.isAuthentic) || 
                                   (activeTab === "audio" && !analysisResult.isAI)) ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                )}
                                <span className="text-sm">{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Circle className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active analysis</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Click the Start button to begin real-time {activeTab === "video" ? "video" : "voice"} analysis.
                    </p>
                  </div>
                )}
              </CardContent>
              {analysisResult && (
                <CardFooter>
                  <div className="w-full">
                    <h4 className="font-semibold mb-3">Recommendations:</h4>
                    <ul className="space-y-2">
                      {analysisResult.recommendations && analysisResult.recommendations.slice(0, 3).map((rec: string, index: number) => (
                        <li key={index} className="text-sm">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
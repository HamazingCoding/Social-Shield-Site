import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import FileUpload from "@/components/FileUpload";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type VoiceAnalysisResult = {
  isAI: boolean;
  confidence: number;
  details: string[];
  recommendations: string[];
};

export default function VoiceDetection() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  
  const analyzeVoiceMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('audio', file);
      
      const response = await apiRequest('POST', '/api/voice-detection', formData);
      const data = await response.json();
      return data as VoiceAnalysisResult;
    }
  });
  
  const handleFileSelect = (file: File) => {
    setAudioFile(file);
    analyzeVoiceMutation.reset();
  };
  
  const handleAnalyzeAudio = () => {
    if (audioFile) {
      analyzeVoiceMutation.mutate(audioFile);
    }
  };
  
  const removeFile = () => {
    setAudioFile(null);
    analyzeVoiceMutation.reset();
  };
  
  return (
    <section id="voice-detection" className="py-12 md:py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-10">
          <div className="md:w-2/5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">AI Voice Detection</h2>
            <p className="text-neutral-700 mb-6">
              Upload audio from phone calls, voicemails, or other voice communications to verify authenticity and detect AI-generated voices.
            </p>
            
            <div className="bg-white rounded-xl p-6 shadow-sm mb-6 border border-neutral-200">
              <h3 className="font-semibold mb-3 flex items-center">
                <i className="fas fa-exclamation-triangle text-accent mr-2"></i>
                Warning Signs of Voice Fraud
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Unusual cadence or rhythm in speech patterns</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Inconsistent background noises or complete silence</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Requests for immediate action involving sensitive information</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Unnatural breathing patterns or lack thereof</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
              <h3 className="font-semibold mb-3">How Our AI Voice Detection Works</h3>
              <p className="text-neutral-700 text-sm mb-3">Our system analyzes multiple aspects of voice recordings:</p>
              <div className="space-y-2">
                <div className="rounded-lg bg-neutral-50 p-3">
                  <div className="font-medium mb-1">Spectral Analysis</div>
                  <p className="text-xs text-neutral-600">Examines frequency patterns that differ between real and synthetic voices</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <div className="font-medium mb-1">Temporal Patterns</div>
                  <p className="text-xs text-neutral-600">Analyzes rhythm, cadence, and micro-pauses present in natural speech</p>
                </div>
                <div className="rounded-lg bg-neutral-50 p-3">
                  <div className="font-medium mb-1">Emotional Consistency</div>
                  <p className="text-xs text-neutral-600">Evaluates if emotional cues align naturally with the spoken content</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-3/5 bg-white rounded-xl shadow-md p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Upload Audio File</h3>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Supports MP3, WAV, M4A</span>
            </div>
            
            {!audioFile && (
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="audio/*"
                maxSize={20}
                icon="fa-microphone-alt"
                fileType="audio"
                supportedFormats="Supports MP3, WAV, M4A"
              />
            )}
            
            {audioFile && !analyzeVoiceMutation.isPending && !analyzeVoiceMutation.isSuccess && (
              <div className="mb-6">
                <div className="p-4 bg-neutral-50 rounded-lg mb-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <i className="fas fa-file-audio text-primary mr-3"></i>
                    <span className="font-medium">{audioFile.name}</span>
                  </div>
                  <button 
                    className="text-red-500 hover:text-red-700"
                    onClick={removeFile}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                
                <Button
                  className="w-full bg-primary hover:bg-primary-light"
                  onClick={handleAnalyzeAudio}
                >
                  Analyze Audio
                  <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            )}
            
            {analyzeVoiceMutation.isPending && (
              <div className="mb-6">
                <div className="bg-neutral-50 rounded-xl p-6 text-center">
                  <div className="animate-spin mb-4 mx-auto">
                    <i className="fas fa-circle-notch text-3xl text-primary"></i>
                  </div>
                  <h4 className="font-medium mb-1">Analyzing Audio</h4>
                  <p className="text-sm text-neutral-500">This may take up to 30 seconds</p>
                  <div className="mt-4">
                    <Progress value={75} className="h-2 bg-neutral-200" />
                  </div>
                </div>
              </div>
            )}

            {analyzeVoiceMutation.isSuccess && (
              <div>
                <div className={`rounded-xl border ${
                  analyzeVoiceMutation.data.isAI 
                    ? "border-red-200 bg-red-50" 
                    : "border-green-200 bg-green-50"
                } p-6 mb-6`}>
                  <div className="flex items-start">
                    <div className={`${
                      analyzeVoiceMutation.data.isAI 
                        ? "bg-red-100 rounded-full p-3 mr-4" 
                        : "bg-green-100 rounded-full p-3 mr-4"
                    }`}>
                      <i className={`${
                        analyzeVoiceMutation.data.isAI 
                          ? "fas fa-robot text-red-500" 
                          : "fas fa-check text-green-500"
                      }`}></i>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        analyzeVoiceMutation.data.isAI 
                          ? "text-red-700" 
                          : "text-green-700"
                      } mb-2`}>
                        {analyzeVoiceMutation.data.isAI 
                          ? "AI-Generated Voice Detected" 
                          : "Authentic Voice Detected"
                        }
                      </h4>
                      <p className={`text-sm ${
                        analyzeVoiceMutation.data.isAI 
                          ? "text-red-600" 
                          : "text-green-600"
                      } mb-3`}>
                        Our analysis indicates this is likely {
                          analyzeVoiceMutation.data.isAI 
                            ? "an AI-generated voice" 
                            : "a genuine voice"
                        } with {analyzeVoiceMutation.data.confidence}% confidence.
                      </p>
                      <div className="bg-white bg-opacity-50 rounded-lg p-3">
                        <h5 className="font-medium text-sm mb-2">
                          {analyzeVoiceMutation.data.isAI ? "Detection Details:" : "Analysis Details:"}
                        </h5>
                        <ul className="text-xs space-y-1 text-neutral-700">
                          {analyzeVoiceMutation.data.details.map((detail, index) => (
                            <li key={index}>• {detail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-neutral-200 p-4">
                  <h4 className="font-medium mb-3">Recommendations</h4>
                  <ul className="space-y-2 text-sm">
                    {analyzeVoiceMutation.data.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-end">
                    <Button className="bg-neutral-800 hover:bg-black text-white text-sm">
                      Download Report
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {analyzeVoiceMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <i className="fas fa-exclamation-triangle text-red-500"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-1">Error Processing Audio</h4>
                    <p className="text-sm text-red-600">
                      There was a problem analyzing your audio file. Please try again or use a different file.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

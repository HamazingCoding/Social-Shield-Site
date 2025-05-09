import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import DeepfakeScene from "@/components/three/DeepfakeScene";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type DeepfakeAnalysisResult = {
  isAuthentic: boolean;
  confidenceScore: number;
  manipulationMarkers: number;
  details: string[];
  recommendations: string[];
};

export default function DeepfakeDetection() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const analyzeVideoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('video', file);
      
      const response = await apiRequest('POST', '/api/deepfake-detection', formData);
      const data = await response.json();
      return data as DeepfakeAnalysisResult;
    }
  });
  
  const handleFileSelect = (file: File) => {
    setVideoFile(file);
    analyzeVideoMutation.reset();
    
    // Create a URL for video preview
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };
  
  const handleAnalyzeVideo = () => {
    if (videoFile) {
      analyzeVideoMutation.mutate(videoFile);
    }
  };
  
  const removeFile = () => {
    setVideoFile(null);
    analyzeVideoMutation.reset();
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
  };
  
  return (
    <section id="deepfake-detection" className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row-reverse items-start gap-10">
          <div className="md:w-2/5">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-primary">Deepfake Video Detection</h2>
            <p className="text-neutral-700 mb-6">
              Upload video from video calls, online meetings or social media to identify deepfake manipulation and synthetic faces.
            </p>
            
            <div className="bg-neutral-50 rounded-xl p-6 shadow-sm mb-6 border border-neutral-200">
              <h3 className="font-semibold mb-3 flex items-center">
                <i className="fas fa-exclamation-triangle text-accent mr-2"></i>
                Spotting Deepfake Videos
              </h3>
              <ul className="space-y-2 text-neutral-700">
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Unnatural eye movements or blinking patterns</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Facial features that change shape or position subtly</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Inconsistent skin tone or lighting across the face</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check text-secondary mt-1 mr-2"></i>
                  <span>Blurry or distorted areas around the mouth, hair, or ears</span>
                </li>
              </ul>
            </div>
            
            <div className="canvas-container mb-6">
              <div className="w-full h-full relative overflow-hidden h-[240px]">
                <DeepfakeScene />
              </div>
            </div>
            
            <div className="bg-neutral-50 rounded-xl p-6 shadow-sm border border-neutral-200">
              <h3 className="font-semibold mb-3">Common Deepfake Scenarios</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-primary mb-1">Executive Impersonation</div>
                  <p className="text-neutral-600">Criminals impersonate executives in video calls to authorize fraudulent transactions</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-primary mb-1">Identity Verification Bypass</div>
                  <p className="text-neutral-600">Synthetic faces used to bypass video-based KYC or identity verification</p>
                </div>
                <div className="p-3 bg-white rounded-lg">
                  <div className="font-medium text-primary mb-1">Social Manipulation</div>
                  <p className="text-neutral-600">Deepfakes of friends or family members in distress requesting urgent financial help</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:w-3/5 bg-neutral-50 rounded-xl shadow-md p-6 border border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Upload Video for Analysis</h3>
              <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Supports MP4, MOV, AVI</span>
            </div>
            
            {!videoFile && (
              <FileUpload
                onFileSelect={handleFileSelect}
                accept="video/*"
                maxSize={100}
                icon="fa-video"
                fileType="video"
                supportedFormats="Supports MP4, MOV, AVI"
              />
            )}
            
            {videoFile && videoUrl && (
              <div className="mb-6">
                <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <video 
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    src={videoUrl}
                    controls
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">{videoFile.name}</div>
                  <button 
                    className="text-red-500 text-sm hover:underline"
                    onClick={removeFile}
                  >
                    <i className="fas fa-times-circle mr-1"></i>
                    Remove
                  </button>
                </div>
              </div>
            )}
            
            {videoFile && !analyzeVideoMutation.isPending && !analyzeVideoMutation.isSuccess && (
              <div className="mb-6">
                <Button
                  className="w-full bg-primary hover:bg-primary-light"
                  onClick={handleAnalyzeVideo}
                >
                  Analyze Video
                  <i className="fas fa-arrow-right ml-2"></i>
                </Button>
              </div>
            )}
            
            {analyzeVideoMutation.isPending && (
              <div className="mb-6">
                <div className="bg-white rounded-xl p-6 text-center border border-neutral-200">
                  <div className="animate-spin mb-4 mx-auto">
                    <i className="fas fa-circle-notch text-3xl text-primary"></i>
                  </div>
                  <h4 className="font-medium mb-1">Analyzing Video</h4>
                  <p className="text-sm text-neutral-500">This may take up to a minute</p>
                  <div className="mt-4 h-2 bg-neutral-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                </div>
              </div>
            )}
            
            {analyzeVideoMutation.isSuccess && (
              <div>
                <div className={`rounded-xl border ${
                  analyzeVideoMutation.data.isAuthentic 
                    ? "border-green-200 bg-green-50" 
                    : "border-red-200 bg-red-50"
                } p-6 mb-6`}>
                  <div className="flex items-start">
                    <div className={`${
                      analyzeVideoMutation.data.isAuthentic 
                        ? "bg-green-100 rounded-full p-3 mr-4" 
                        : "bg-red-100 rounded-full p-3 mr-4"
                    }`}>
                      <i className={`${
                        analyzeVideoMutation.data.isAuthentic 
                          ? "fas fa-check text-green-500" 
                          : "fas fa-robot text-red-500"
                      }`}></i>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        analyzeVideoMutation.data.isAuthentic 
                          ? "text-green-700" 
                          : "text-red-700"
                      } mb-2`}>
                        {analyzeVideoMutation.data.isAuthentic 
                          ? "Authentic Video Detected" 
                          : "Deepfake Video Detected"
                        }
                      </h4>
                      <p className={`text-sm ${
                        analyzeVideoMutation.data.isAuthentic 
                          ? "text-green-600" 
                          : "text-red-600"
                      } mb-3`}>
                        Our analysis indicates this is likely {
                          analyzeVideoMutation.data.isAuthentic 
                            ? "a genuine video" 
                            : "a deepfake video"
                        } with {analyzeVideoMutation.data.confidenceScore}% confidence.
                      </p>
                      <div className="bg-white bg-opacity-50 rounded-lg p-3">
                        <h5 className="font-medium text-sm mb-2">Analysis Details:</h5>
                        <ul className="text-xs space-y-1 text-neutral-700">
                          {analyzeVideoMutation.data.details.map((detail, index) => (
                            <li key={index}>• {detail}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-white p-4 rounded-lg border border-neutral-200">
                    <div className="text-sm font-medium mb-2">Face Authenticity Score</div>
                    <div className="flex items-end">
                      <span className={`text-2xl font-bold ${
                        analyzeVideoMutation.data.isAuthentic 
                          ? "text-green-500" 
                          : "text-red-500"
                      }`}>
                        {analyzeVideoMutation.data.confidenceScore}%
                      </span>
                      <span className="text-xs text-neutral-500 ml-2 mb-1">confidence</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-neutral-200">
                    <div className="text-sm font-medium mb-2">Manipulation Markers</div>
                    <div className="flex items-end">
                      <span className={`text-2xl font-bold ${
                        analyzeVideoMutation.data.manipulationMarkers > 0 
                          ? "text-red-500" 
                          : "text-green-500"
                      }`}>
                        {analyzeVideoMutation.data.manipulationMarkers}
                      </span>
                      <span className="text-xs text-neutral-500 ml-2 mb-1">detected</span>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-xl border border-neutral-200 p-4">
                  <h4 className="font-medium mb-3">
                    {analyzeVideoMutation.data.isAuthentic ? "Still Concerned?" : "Recommendations"}
                  </h4>
                  {analyzeVideoMutation.data.isAuthentic && (
                    <p className="text-sm text-neutral-600 mb-3">
                      Even with high confidence in our analysis, always follow these practices:
                    </p>
                  )}
                  <ul className="space-y-2 text-sm">
                    {analyzeVideoMutation.data.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                        <span>{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {analyzeVideoMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <i className="fas fa-exclamation-triangle text-red-500"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-1">Error Processing Video</h4>
                    <p className="text-sm text-red-600">
                      There was a problem analyzing your video file. Please try again or use a different file.
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

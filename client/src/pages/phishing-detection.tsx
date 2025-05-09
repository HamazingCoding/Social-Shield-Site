import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type LinkAnalysisResult = {
  isPhishing: boolean;
  confidence: number;
  details: string[];
  recommendations: string[];
};

type EmailAnalysisResult = {
  isPhishing: boolean;
  riskLevel: number;
  details: {
    sender: string;
    links: string;
    content: string;
    urgency: string;
  };
  recommendations: string[];
};

export default function PhishingDetection() {
  const [linkToCheck, setLinkToCheck] = useState("");
  const [emailContent, setEmailContent] = useState("");
  
  const analyzeLinkMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest('POST', '/api/phishing-detection/link', { url });
      const data = await response.json();
      return data as LinkAnalysisResult;
    }
  });
  
  const analyzeEmailMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest('POST', '/api/phishing-detection/email', { content });
      const data = await response.json();
      return data as EmailAnalysisResult;
    }
  });
  
  const handleLinkAnalysis = () => {
    if (linkToCheck.trim()) {
      analyzeLinkMutation.mutate(linkToCheck.trim());
    }
  };
  
  const handleEmailAnalysis = () => {
    if (emailContent.trim()) {
      analyzeEmailMutation.mutate(emailContent.trim());
    }
  };
  
  return (
    <section id="phishing-detection" className="py-12 md:py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 text-primary">Phishing Link & Email Detection</h2>
          <p className="text-neutral-700 max-w-2xl mx-auto">
            Verify suspicious links and analyze emails to identify phishing attempts before they compromise your personal information.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Link Analysis Tool */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-link text-primary mr-2"></i>
              Link Analysis
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Enter a suspicious URL</label>
              <div className="flex">
                <Input
                  type="text"
                  placeholder="https://example.com/verify-account"
                  className="flex-1 rounded-r-none"
                  value={linkToCheck}
                  onChange={(e) => setLinkToCheck(e.target.value)}
                />
                <Button
                  className="bg-primary hover:bg-primary-light text-white font-medium rounded-l-none"
                  onClick={handleLinkAnalysis}
                  disabled={analyzeLinkMutation.isPending || !linkToCheck.trim()}
                >
                  {analyzeLinkMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    "Check"
                  )}
                </Button>
              </div>
            </div>
            
            {analyzeLinkMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <i className="fas fa-exclamation-triangle text-red-500"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-1">Error Analyzing Link</h4>
                    <p className="text-sm text-red-600">
                      There was a problem analyzing this URL. Please check the format and try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {analyzeLinkMutation.isSuccess && (
              <div>
                <div className={`rounded-xl border ${
                  analyzeLinkMutation.data.isPhishing 
                    ? "border-red-200 bg-red-50" 
                    : "border-green-200 bg-green-50"
                } p-4 mb-6`}>
                  <div className="flex items-start">
                    <div className={`${
                      analyzeLinkMutation.data.isPhishing 
                        ? "bg-red-100 rounded-full p-2 mr-3" 
                        : "bg-green-100 rounded-full p-2 mr-3"
                    }`}>
                      <i className={`${
                        analyzeLinkMutation.data.isPhishing 
                          ? "fas fa-exclamation-triangle text-red-500" 
                          : "fas fa-check text-green-500"
                      }`}></i>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        analyzeLinkMutation.data.isPhishing 
                          ? "text-red-700" 
                          : "text-green-700"
                      } mb-1`}>
                        {analyzeLinkMutation.data.isPhishing 
                          ? "Phishing Attempt Detected" 
                          : "Safe Link Detected"
                        }
                      </h4>
                      <p className="text-sm text-red-600">
                        {analyzeLinkMutation.data.isPhishing 
                          ? "This URL appears to be a phishing attempt mimicking a legitimate website." 
                          : "This URL appears to be legitimate and safe to visit."
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-neutral-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-sm mb-2">Detection Details:</h4>
                  <ul className="text-sm space-y-2">
                    {analyzeLinkMutation.data.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <i className={`${
                          analyzeLinkMutation.data.isPhishing 
                            ? "fas fa-times-circle text-red-500" 
                            : "fas fa-check-circle text-green-500"
                        } mt-1 mr-2`}></i>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="text-sm text-neutral-600 p-4 bg-neutral-50 rounded-lg">
                  <div className="font-medium mb-2">Recommendation:</div>
                  <ul className="space-y-1">
                    {analyzeLinkMutation.data.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          {/* Email Analysis Tool */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <i className="fas fa-envelope text-primary mr-2"></i>
              Email Analysis
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">Paste suspicious email content</label>
              <Textarea 
                placeholder="Copy and paste the entire email content here, including headers if possible..." 
                className="w-full min-h-[150px] resize-none"
                value={emailContent}
                onChange={(e) => setEmailContent(e.target.value)}
              />
              <div className="mt-3 flex justify-end">
                <Button
                  className="bg-primary hover:bg-primary-light text-white font-medium"
                  onClick={handleEmailAnalysis}
                  disabled={analyzeEmailMutation.isPending || !emailContent.trim()}
                >
                  {analyzeEmailMutation.isPending ? (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  ) : (
                    <span>Analyze Email</span>
                  )}
                </Button>
              </div>
            </div>
            
            {analyzeEmailMutation.isError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-4">
                <div className="flex items-start">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <i className="fas fa-exclamation-triangle text-red-500"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-1">Error Analyzing Email</h4>
                    <p className="text-sm text-red-600">
                      There was a problem analyzing this email content. Please try again.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {analyzeEmailMutation.isSuccess && (
              <div>
                <div className={`rounded-xl border ${
                  analyzeEmailMutation.data.isPhishing 
                    ? analyzeEmailMutation.data.riskLevel > 80 
                      ? "border-red-200 bg-red-50" 
                      : "border-yellow-200 bg-yellow-50"
                    : "border-green-200 bg-green-50"
                } p-4 mb-6`}>
                  <div className="flex items-start">
                    <div className={`${
                      analyzeEmailMutation.data.isPhishing
                        ? analyzeEmailMutation.data.riskLevel > 80
                          ? "bg-red-100 rounded-full p-2 mr-3"
                          : "bg-yellow-100 rounded-full p-2 mr-3"
                        : "bg-green-100 rounded-full p-2 mr-3"
                    }`}>
                      <i className={`${
                        analyzeEmailMutation.data.isPhishing
                          ? analyzeEmailMutation.data.riskLevel > 80
                            ? "fas fa-exclamation-triangle text-red-500"
                            : "fas fa-exclamation-circle text-yellow-500"
                          : "fas fa-check text-green-500"
                      }`}></i>
                    </div>
                    <div>
                      <h4 className={`font-semibold ${
                        analyzeEmailMutation.data.isPhishing
                          ? analyzeEmailMutation.data.riskLevel > 80
                            ? "text-red-700"
                            : "text-yellow-700"
                          : "text-green-700"
                      } mb-1`}>
                        {analyzeEmailMutation.data.isPhishing
                          ? analyzeEmailMutation.data.riskLevel > 80
                            ? "Dangerous Phishing Email Detected"
                            : "Suspicious Email Detected"
                          : "Safe Email Detected"
                        }
                      </h4>
                      <p className={`text-sm ${
                        analyzeEmailMutation.data.isPhishing
                          ? analyzeEmailMutation.data.riskLevel > 80
                            ? "text-red-600"
                            : "text-yellow-600"
                          : "text-green-600"
                      }`}>
                        {analyzeEmailMutation.data.isPhishing
                          ? "This email contains several suspicious elements that suggest it may be a phishing attempt."
                          : "This email appears to be legitimate with no signs of phishing."}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-neutral-200 overflow-hidden mb-4">
                  <div className="bg-neutral-50 p-3 border-b border-neutral-200">
                    <h4 className="font-medium">Risk Assessment</h4>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <div className="w-full bg-neutral-200 rounded-full h-2.5 mr-2">
                        <div className={`${
                          analyzeEmailMutation.data.riskLevel > 80
                            ? "bg-red-500"
                            : analyzeEmailMutation.data.riskLevel > 50
                              ? "bg-yellow-500"
                              : "bg-green-500"
                        } h-2.5 rounded-full`} style={{ width: `${analyzeEmailMutation.data.riskLevel}%` }}></div>
                      </div>
                      <span className="text-sm font-medium whitespace-nowrap">
                        {analyzeEmailMutation.data.riskLevel}% Risk
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Sender Legitimacy</span>
                        <span className={`${
                          analyzeEmailMutation.data.details.sender === "Suspicious" || analyzeEmailMutation.data.details.sender === "Fake"
                            ? "text-red-500"
                            : analyzeEmailMutation.data.details.sender === "Questionable"
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}>
                          {analyzeEmailMutation.data.details.sender}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Link Safety</span>
                        <span className={`${
                          analyzeEmailMutation.data.details.links === "Dangerous" 
                            ? "text-red-500"
                            : analyzeEmailMutation.data.details.links === "Suspicious"
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}>
                          {analyzeEmailMutation.data.details.links}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Content Analysis</span>
                        <span className={`${
                          analyzeEmailMutation.data.details.content === "Dangerous" 
                            ? "text-red-500"
                            : analyzeEmailMutation.data.details.content === "Suspicious"
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}>
                          {analyzeEmailMutation.data.details.content}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Urgency Level</span>
                        <span className={`${
                          analyzeEmailMutation.data.details.urgency === "High (Red Flag)" 
                            ? "text-red-500"
                            : analyzeEmailMutation.data.details.urgency === "Medium"
                              ? "text-yellow-500"
                              : "text-green-500"
                        }`}>
                          {analyzeEmailMutation.data.details.urgency}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-neutral-600 p-4 bg-neutral-50 rounded-lg">
                  <div className="font-medium mb-2">Recommendations:</div>
                  <ul className="space-y-1">
                    {analyzeEmailMutation.data.recommendations.map((recommendation, index) => (
                      <li key={index}>• {recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Educational Section */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-sm border border-neutral-200">
          <h3 className="text-xl font-semibold mb-4">Phishing Education Center</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="text-lg font-medium mb-2 text-primary">Red Flags in Emails</div>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-exclamation-circle text-accent mt-1 mr-2"></i>
                  <span>Urgent requests for personal information</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-exclamation-circle text-accent mt-1 mr-2"></i>
                  <span>Poor spelling and grammar</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-exclamation-circle text-accent mt-1 mr-2"></i>
                  <span>Mismatched or suspicious email domains</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-exclamation-circle text-accent mt-1 mr-2"></i>
                  <span>Generic greetings like "Dear Customer"</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="text-lg font-medium mb-2 text-primary">Link Safety Checking</div>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Hover over links before clicking to see true URL</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Check for HTTPS and proper spelling of domain</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Be wary of shortened URLs (bit.ly, tinyurl)</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-check-circle text-secondary mt-1 mr-2"></i>
                  <span>Use our link scanner for any suspicious URLs</span>
                </li>
              </ul>
            </div>
            
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="text-lg font-medium mb-2 text-primary">Protective Measures</div>
              <ul className="text-sm space-y-2">
                <li className="flex items-start">
                  <i className="fas fa-shield-alt text-primary mt-1 mr-2"></i>
                  <span>Enable two-factor authentication on accounts</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-shield-alt text-primary mt-1 mr-2"></i>
                  <span>Use different passwords for different services</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-shield-alt text-primary mt-1 mr-2"></i>
                  <span>Keep software and browsers updated</span>
                </li>
                <li className="flex items-start">
                  <i className="fas fa-shield-alt text-primary mt-1 mr-2"></i>
                  <span>Verify requests through official channels</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

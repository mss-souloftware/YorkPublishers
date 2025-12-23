'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, ChevronRight, Upload, FileText, Image, Shield, Mic, CreditCard } from 'lucide-react';
import { useRouter } from "next/navigation";
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';

const steps = [
  { id: 1, title: 'Book Details', icon: FileText },
  { id: 2, title: 'Manuscript', icon: Upload },
  { id: 3, title: 'Cover Design', icon: Image },
  { id: 4, title: 'Copyright', icon: Shield },
  { id: 5, title: 'Audiobook', icon: Mic },
  { id: 6, title: 'Payment', icon: CreditCard },
];

export default function NewBookSubmission() {
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header/>
        <div className=" border-b border-border px-6 py-4">
          <h1 className="text-3xl font-bold">Submit New Book for Publishing</h1>
          <p className="text-muted-foreground">Complete all steps to send your manuscript for review</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Step {currentStep} of {steps.length}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="grid grid-cols-6 gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex flex-col items-center space-y-2 ${
                    currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-center">{step.title}</p>
                </div>
              ))}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>{steps[currentStep - 1].title}</CardTitle>
                <CardDescription>
                  {currentStep === 1 && 'Enter basic information about your book'}
                  {currentStep === 2 && 'Upload your final manuscript file'}
                  {currentStep === 3 && 'Upload a proposed cover design'}
                  {currentStep === 4 && 'Request copyright registration assistance'}
                  {currentStep === 5 && 'Request an audiobook production (optional)'}
                  {currentStep === 6 && 'Complete payment to submit for review'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Book Details */}
                {currentStep === 1 && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input placeholder="The Great Adventure" />
                      </div>
                      <div className="space-y-2">
                        <Label>ISBN (optional)</Label>
                        <Input placeholder="978-3-16-148410-0" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Publication Date (planned)</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description / Synopsis</Label>
                      <Textarea rows={6} placeholder="Write a compelling summary of your book..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Genre / Category</Label>
                      <Input placeholder="Fiction, Mystery, Self-Help..." />
                    </div>
                  </>
                )}

                {/* Step 2: Manuscript Upload */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">Drop your manuscript here</p>
                      <p className="text-sm text-muted-foreground">PDF, DOCX, or EPUB • Max 50MB</p>
                      <Button variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Version: Draft v1.0 • Submitted automatically upon completion
                    </p>
                  </div>
                )}

                {/* Step 3: Cover Design */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-12 text-center">
                      <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-lg font-medium">Upload Cover Design</p>
                      <p className="text-sm text-muted-foreground">High-res JPG/PNG • 1600x2560 recommended</p>
                      <Button variant="outline" className="mt-4">
                        Choose File
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label>Designer Name (optional)</Label>
                      <Input placeholder="John Doe Designs" />
                    </div>
                  </div>
                )}

                {/* Step 4: Copyright */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <RadioGroup defaultValue="yes">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="copyright-yes" />
                        <Label htmlFor="copyright-yes">Yes, I want assistance registering copyright</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="copyright-no" />
                        <Label htmlFor="copyright-no">No, I will handle copyright myself</Label>
                      </div>
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label>Additional Notes (optional)</Label>
                      <Textarea rows={4} placeholder="Any special instructions for copyright filing..." />
                    </div>
                  </div>
                )}

                {/* Step 5: Audiobook */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <RadioGroup defaultValue="no">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="audio-yes" />
                        <Label htmlFor="audio-yes">Yes, produce an audiobook version</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="audio-no" />
                        <Label htmlFor="audio-no">No audiobook needed</Label>
                      </div>
                    </RadioGroup>
                    <div className="space-y-2">
                      <Label>Preferred Narrator Style (optional)</Label>
                      <Input placeholder="Deep male voice, British accent..." />
                    </div>
                  </div>
                )}

                {/* Step 6: Payment */}
                {currentStep === 6 && (
                  <div className="space-y-6">
                    <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                      <div className="flex justify-between">
                        <span>Manuscript Review Fee</span>
                        <span className="font-semibold">$149.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Copyright Assistance (optional)</span>
                        <span className="font-semibold">$99.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Audiobook Production Deposit (optional)</span>
                        <span className="font-semibold">$299.00</span>
                      </div>
                      <div className="border-t pt-4 flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>$547.00</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Expiry</Label>
                          <Input placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label>CVC</Label>
                          <Input placeholder="123" />
                        </div>
                        <div className="space-y-2">
                          <Label>ZIP</Label>
                          <Input placeholder="12345" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>

                  {currentStep === steps.length ? (
                    <Button size="lg">
                      Submit for Review
                    </Button>
                  ) : (
                    <Button onClick={nextStep}>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
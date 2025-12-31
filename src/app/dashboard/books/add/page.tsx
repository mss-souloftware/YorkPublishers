'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Progress } from '@/components/ui/progress';
import {
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  NotebookTabs,
  ChartBarStacked,
  Image,
  CreditCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/Global/Sidebar';
import Header from '@/components/Global/Header';

import Step1PersonalInfo from '@/components/BookFormSteps/Step1PersonalInfo';
import Step2BookDetails from '@/components/BookFormSteps/Step2BookDetails';
import Step3AdditionalDetails from '@/components/BookFormSteps/Step3AdditionalDetails';
import Step4BookCategory from '@/components/BookFormSteps/Step4BookCategory';
import Step5CoverDesign from '@/components/BookFormSteps/Step5CoverDesign';
import Step6Payment from '@/components/BookFormSteps/Step6Payment';

const steps = [
  { id: 1, title: 'Personal Information', icon: User },
  { id: 2, title: 'Book Details', icon: FileText },
  { id: 3, title: 'Additional Details', icon: NotebookTabs },
  { id: 4, title: 'Book Category', icon: ChartBarStacked },
  { id: 5, title: 'Cover Design', icon: Image },
  { id: 6, title: 'Payment', icon: CreditCard },
];

export default function NewBookSubmission() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (currentStep / steps.length) * 100;

  useEffect(() => {
    const loadDraft = async () => {
      try {
        const res = await fetch('/api/books');
        if (res.ok) {
          const draft = await res.json();
          if (draft) {
            setFormData(draft);
            setSelectedCategories(draft.categories || []);
          }
        }
      } catch (err) {
        console.error('Failed to load draft:', err);
      }
    };
    loadDraft();
  }, []);

  const updateFormData = (newData: Partial<any>) => {
    setFormData((prev: any) => ({ ...prev, ...newData }));
  };

  const saveDraft = async () => {
    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categories: selectedCategories,
          status: 'Draft',
        }),
      });
      if (!res.ok) {
        throw new Error('Failed to save draft');
      }
    } catch (err) {
      console.error('Draft save failed:', err);
      toast.error('Failed to save draft');
    }
  };

  const deleteDraft = async () => {
    try {
      const res = await fetch('/api/books', {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete draft');
      }
    } catch (err) {
      console.error('Draft delete failed:', err);
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length) {
      await saveDraft();
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;

    if (!formData.title) {
      toast.error('Book title is required!');
      return;
    }
    if (selectedCategories.length === 0) {
      toast.error('At least one category is required!');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categories: selectedCategories,
          status: 'Submitted',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      await deleteDraft(); // Delete draft after successful submit

      toast.success('Book submitted successfully for review!');

      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit book. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1PersonalInfo data={formData} updateData={updateFormData} />;
      case 2:
        return <Step2BookDetails data={formData} updateData={updateFormData} />;
      case 3:
        return <Step3AdditionalDetails data={formData} updateData={updateFormData} />;
      case 4:
        return (
          <Step4BookCategory
            selected={selectedCategories}
            setSelected={setSelectedCategories}
          />
        );
      case 5:
        return <Step5CoverDesign data={formData} updateData={updateFormData} />;
      case 6:
        return <Step6Payment />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <div className="border-b border-border px-6 py-4">
          <h1 className="text-3xl font-bold">Submit New Book for Publishing</h1>
          <p className="text-muted-foreground">
            Complete all steps to send your manuscript for review
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Progress */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-center text-muted-foreground">
                Step {currentStep} of {steps.length} — {steps[currentStep - 1].title}
              </p>
            </div>

            {/* Step Icons */}
            <div className="grid grid-cols-6 gap-4">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={`text-center ${
                    currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <div
                    className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.id
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/30'
                    }`}
                  >
                    <step.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs mt-2">{step.title}</p>
                </div>
              ))}
            </div>

            {/* Current Step Content */}
            <div className="mt-8">{renderStep()}</div>

            {/* Navigation */}
            <div className="flex justify-between pt-8">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentStep === steps.length ? (
                <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>Submitting...</>
                  ) : (
                    <>
                      Submit for Review
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={nextStep}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
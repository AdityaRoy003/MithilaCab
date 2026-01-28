'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Smile, Meh, Frown, Check } from 'lucide-react';

interface WellnessCheckDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onComplete: (isWell: boolean) => void;
}

const wellnessQuestions = [
    { id: 'fatigue', question: 'How rested do you feel today?', options: [ { value: 'rested', label: 'Well-Rested', icon: Smile }, { value: 'tired', label: 'A Little Tired', icon: Meh }, { value: 'exhausted', label: 'Exhausted', icon: Frown } ] },
    { id: 'stress', question: 'How is your current stress level?', options: [ { value: 'low', label: 'Low', icon: Smile }, { value: 'medium', label: 'Moderate', icon: Meh }, { value: 'high', label: 'High', icon: Frown } ] },
];

export function WellnessCheckDialog({ isOpen, onOpenChange, onComplete }: WellnessCheckDialogProps) {
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const { toast } = useToast();

    const handleAnswerChange = (questionId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = () => {
        const isWell = answers.fatigue === 'rested' && answers.stress === 'low';
        
        onComplete(isWell);

        if (!isWell) {
             toast({
                variant: 'destructive',
                title: 'Your well-being is important',
                description: "We recommend taking a break. You cannot go online at this time. Please contact support if you need assistance.",
                duration: 7000,
            });
        }
    };
    
    const allQuestionsAnswered = Object.keys(answers).length === wellnessQuestions.length;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Pre-Drive Wellness Check</DialogTitle>
                    <DialogDescription>
                        Your safety and well-being are our top priority. Please answer a few quick questions before you start your shift.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    {wellnessQuestions.map(({ id, question, options }) => (
                        <div key={id} className="space-y-3">
                            <Label className="font-semibold">{question}</Label>
                            <RadioGroup
                                onValueChange={(value) => handleAnswerChange(id, value)}
                                className="grid grid-cols-3 gap-2"
                            >
                                {options.map(option => (
                                     <Label key={option.value} className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${answers[id] === option.value ? 'border-primary bg-primary/10' : 'hover:bg-accent/50'}`}>
                                        <RadioGroupItem value={option.value} className="sr-only" />
                                        <option.icon className="h-7 w-7 mb-2" />
                                        <span className="text-xs font-medium">{option.label}</span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        </div>
                    ))}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!allQuestionsAnswered}>
                        <Check className="mr-2" /> Submit & Go Online
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

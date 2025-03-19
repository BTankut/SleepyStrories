import React, { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useApp } from '@/lib/AppContext';
import { X } from "lucide-react";

interface GenerationProgressModalProps {
  onCancel: () => void;
}

const GenerationProgressModal = ({ onCancel }: GenerationProgressModalProps) => {
  const { t } = useApp();
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'text' | 'images' | 'audio' | 'completed'>('text');

  // Simulate progress
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (stage === 'text') {
      timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 2;
          if (newProgress >= 35) {
            clearInterval(timer);
            setStage('images');
            return 35;
          }
          return newProgress;
        });
      }, 200);
    } else if (stage === 'images') {
      timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 1.5;
          if (newProgress >= 75) {
            clearInterval(timer);
            setStage('audio');
            return 75;
          }
          return newProgress;
        });
      }, 300);
    } else if (stage === 'audio') {
      timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 1;
          if (newProgress >= 100) {
            clearInterval(timer);
            setStage('completed');
            return 100;
          }
          return newProgress;
        });
      }, 400);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [stage]);

  // Get message based on current stage
  const getMessage = () => {
    switch (stage) {
      case 'text':
        return t('story.generating_text');
      case 'images':
        return t('story.generating_images');
      case 'audio':
        return t('story.generating_audio');
      case 'completed':
        return t('story.completed');
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md relative border">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onCancel}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold mb-4">{t('story.loading')}</h2>
        
        <div className="space-y-6">
          <Progress value={progress} className="h-2" />
          
          <div className="text-center text-muted-foreground">
            <p className="mb-2">{getMessage()}</p>
            <p className="text-sm">{Math.round(progress)}%</p>
          </div>
          
          {stage !== 'completed' && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onCancel}
            >
              {t('story.cancel')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationProgressModal;
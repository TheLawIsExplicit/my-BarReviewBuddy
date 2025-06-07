import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, CheckCircle, RotateCcw, Clock, Bookmark, Tag, Play, Pause, Save, Edit3 } from 'lucide-react';
import type { Question } from '@shared/schema';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  isCompleted: boolean;
  onMarkCompleted: () => void;
  onReset: () => void;
  studyMode: 'practice' | 'timed';
  onSaveAnswer?: (answer: string) => void;
  userAnswer?: string;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  isCompleted,
  onMarkCompleted,
  onReset,
  studyMode,
  onSaveAnswer,
  userAnswer
}: QuestionCardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState(userAnswer || '');
  const [answerTimer, setAnswerTimer] = useState(0);
  const [answerTimerActive, setAnswerTimerActive] = useState(false);

  // Answer timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (answerTimerActive) {
      interval = setInterval(() => {
        setAnswerTimer((prev) => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [answerTimerActive]);

  // Update practice answer when userAnswer prop changes
  useEffect(() => {
    setPracticeAnswer(userAnswer || '');
  }, [userAnswer]);

  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const startAnswerTimer = () => {
    if (!answerTimerActive && practiceAnswer.trim() === '') {
      setAnswerTimerActive(true);
      setAnswerTimer(0);
    }
  };

  const stopAnswerTimer = () => {
    setAnswerTimerActive(false);
  };

  const handleSaveAnswer = () => {
    if (onSaveAnswer && practiceAnswer.trim()) {
      onSaveAnswer(practiceAnswer);
      setAnswerTimerActive(false);
    }
  };

  const formatAnswerTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatAnswer = (answerText: string) => {
    const sections = answerText.split('\n\n');
    return sections.map((section, index) => {
      if (section.startsWith('**ANSWER:**')) {
        return (
          <div key={index} className="bg-accent/5 rounded-lg p-6 border-l-4 border-accent">
            <h4 className="font-semibold text-gray-900 mb-3">ANSWER:</h4>
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: section.replace('**ANSWER:**', '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
              }}
            />
          </div>
        );
      } else if (section.startsWith('**LEGAL BASIS:**')) {
        const content = section.replace('**LEGAL BASIS:**', '').trim();
        const items = content.split('\n- ').filter(item => item.trim());
        return (
          <div key={index} className="bg-blue-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L3 7v10a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z"/>
              </svg>
              LEGAL BASIS:
            </h4>
            <ul className="space-y-2 text-gray-800">
              {items.map((item, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{item.replace(/^- /, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      } else if (section.startsWith('**ANALYSIS:**')) {
        const content = section.replace('**ANALYSIS:**', '').trim();
        const paragraphs = content.split('\n\n');
        return (
          <div key={index} className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-secondary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
              </svg>
              ANALYSIS:
            </h4>
            <div className="space-y-4 text-gray-800 leading-relaxed">
              {paragraphs.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        );
      } else if (section.startsWith('**CONCLUSION:**')) {
        return (
          <div key={index} className="bg-yellow-50 rounded-lg p-6 border-l-4 border-warning">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-warning" />
              CONCLUSION:
            </h4>
            <p className="text-gray-800 leading-relaxed">
              {section.replace('**CONCLUSION:**', '').trim()}
            </p>
          </div>
        );
      }
      return null;
    }).filter(Boolean);
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200 overflow-hidden">
      {/* Question Header */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-secondary">Question</span>
              <span className="text-lg font-bold text-primary">{questionNumber}</span>
              <span className="text-sm text-secondary">of</span>
              <span className="text-sm font-semibold text-secondary">{totalQuestions}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={
                question.difficulty === 'Hard' ? 'destructive' :
                question.difficulty === 'Medium' ? 'secondary' : 'outline'
              }>
                {question.difficulty}
              </Badge>
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <Clock className="w-3 h-3 mr-1" />
                {question.timeLimit} min
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              onClick={onMarkCompleted}
              variant="ghost"
              size="sm"
              className={`p-2 transition-colors ${
                isCompleted 
                  ? 'text-accent hover:text-accent/80' 
                  : 'text-secondary hover:text-accent'
              }`}
              title="Mark as completed"
            >
              <CheckCircle className="w-5 h-5" />
            </Button>
            <Button
              onClick={onReset}
              variant="ghost"
              size="sm"
              className="p-2 text-secondary hover:text-primary transition-colors"
              title="Reset question"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="mt-3 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bookmark className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-700">{question.subject}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-secondary" />
            <span className="text-sm text-secondary">{question.topic}</span>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <CardContent className="p-6">
        <div className="prose prose-lg max-w-none">
          <div className="bg-surface rounded-lg p-6 mb-6 border-l-4 border-primary">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {question.question}
            </p>
          </div>
        </div>

        {/* Practice Answer Section */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900 flex items-center">
              <Edit3 className="w-5 h-5 mr-2 text-primary" />
              Your Practice Answer
            </h4>
            {answerTimer > 0 && (
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="w-4 h-4 text-warning" />
                <span className="font-mono text-warning">{formatAnswerTime(answerTimer)}</span>
                <Button
                  onClick={answerTimerActive ? stopAnswerTimer : () => setAnswerTimerActive(true)}
                  size="sm"
                  variant="ghost"
                  className="p-1"
                >
                  {answerTimerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </Button>
              </div>
            )}
          </div>
          
          <div className="relative">
            <Textarea
              value={practiceAnswer}
              onChange={(e) => {
                setPracticeAnswer(e.target.value);
                startAnswerTimer();
              }}
              placeholder="Start typing your answer here to begin the timer..."
              className="min-h-[200px] resize-y border-2 border-gray-200 focus:border-primary"
              disabled={showAnswer}
            />
            {practiceAnswer.trim() && (
              <div className="absolute top-2 right-2">
                <Button
                  onClick={handleSaveAnswer}
                  size="sm"
                  className="flex items-center space-x-1 text-xs"
                >
                  <Save className="w-3 h-3" />
                  <span>Save</span>
                </Button>
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-500 flex items-center justify-between">
            <span>Characters: {practiceAnswer.length}</span>
            <span>Words: {practiceAnswer.trim() ? practiceAnswer.trim().split(/\s+/).length : 0}</span>
          </div>
        </div>

        {/* Answer Toggle Button */}
        <div className="flex items-center justify-center mb-6">
          <Button
            onClick={toggleAnswer}
            className="inline-flex items-center px-6 py-3 shadow-sm"
          >
            {showAnswer ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                <span>Hide Model Answer</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                <span>Show Model Answer</span>
              </>
            )}
          </Button>
        </div>

        {/* Answer Section */}
        {showAnswer && (
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center space-x-2 mb-4">
              <svg className="w-5 h-5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Detailed Answer & Analysis</h3>
            </div>

            <div className="space-y-6">
              {formatAnswer(question.answer)}

              {/* References */}
              <div className="grid md:grid-cols-2 gap-4">
                {question.codal && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/>
                      </svg>
                      CODAL PROVISIONS:
                    </h5>
                    <p className="text-sm text-gray-700">{question.codal}</p>
                  </div>
                )}
                {question.jurisprudence && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L3 7v10a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                      </svg>
                      JURISPRUDENCE:
                    </h5>
                    <p className="text-sm text-gray-700">{question.jurisprudence}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

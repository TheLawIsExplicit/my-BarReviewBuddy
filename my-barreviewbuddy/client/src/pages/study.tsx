import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { apiRequest } from '@/lib/queryClient';
import type { Question, UserProgress } from '@shared/schema';
import QuestionCard from '@/components/question-card';
import Sidebar from '@/components/sidebar';
import Timer from '@/components/timer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scale, Clock, Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

export default function StudyPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [studyMode, setStudyMode] = useState<'practice' | 'timed'>('practice');
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);

  // Fetch questions based on selected subject
  const { data: questions = [], isLoading: questionsLoading } = useQuery<Question[]>({
    queryKey: ['/api/questions', selectedSubject],
    queryFn: async () => {
      const response = await fetch(`/api/questions${selectedSubject !== 'all' ? `?subject=${selectedSubject}` : ''}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch questions');
      return response.json();
    }
  });

  // Fetch user progress
  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: ['/api/progress']
  });

  // Create/update progress mutation
  const progressMutation = useMutation({
    mutationFn: async (data: { questionId: number; completed: boolean; timeSpent?: number; studyMode: string }) => {
      return apiRequest('POST', '/api/progress', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
    }
  });

  // Create study session mutation
  const sessionMutation = useMutation({
    mutationFn: async (data: { startTime: string; mode: string }) => {
      return apiRequest('POST', '/api/sessions', data);
    }
  });

  const currentQuestion = questions[currentQuestionIndex];
  const completedQuestions = new Set(progress.filter(p => p.completed).map(p => p.questionId));

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0 && studyMode === 'timed') {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, studyMode]);

  // Initialize timer when question changes in timed mode
  useEffect(() => {
    if (currentQuestion && studyMode === 'timed') {
      setTimeLeft(currentQuestion.timeLimit * 60);
    }
  }, [currentQuestion, studyMode]);

  // Start study session
  useEffect(() => {
    if (!sessionStartTime) {
      const startTime = new Date().toISOString();
      setSessionStartTime(startTime);
      sessionMutation.mutate({
        startTime,
        mode: studyMode
      });
    }
  }, [studyMode, sessionStartTime]);

  const handleSubjectChange = (subject: string) => {
    setSelectedSubject(subject);
    setCurrentQuestionIndex(0);
  };

  const handleStudyModeToggle = () => {
    const newMode = studyMode === 'practice' ? 'timed' : 'practice';
    setStudyMode(newMode);
    setTimerActive(false);
    
    if (newMode === 'timed' && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit * 60);
    }
  };

  const handleTimerToggle = () => {
    if (studyMode === 'timed') {
      setTimerActive(!timerActive);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTimerActive(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTimerActive(false);
    }
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestionIndex(index);
    setTimerActive(false);
  };

  const handleMarkCompleted = () => {
    if (currentQuestion) {
      const currentProgress = progress.find(p => p.questionId === currentQuestion.id);
      const timeSpent = studyMode === 'timed' ? (currentQuestion.timeLimit * 60 - timeLeft) : undefined;
      
      progressMutation.mutate({
        questionId: currentQuestion.id,
        completed: !currentProgress?.completed,
        timeSpent,
        studyMode
      });
    }
  };

  const handleRandomQuestion = () => {
    if (questions.length > 0) {
      const randomIndex = Math.floor(Math.random() * questions.length);
      setCurrentQuestionIndex(randomIndex);
      setTimerActive(false);
    }
  };

  const handleReset = () => {
    setTimerActive(false);
    if (currentQuestion && studyMode === 'timed') {
      setTimeLeft(currentQuestion.timeLimit * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getSubjectCounts = () => {
    const counts: Record<string, number> = {
      all: questions.length,
      political: 0,
      mercantile: 0,
      civil: 0,
      labor: 0,
      criminal: 0,
      remedial: 0
    };

    questions.forEach(q => {
      const subject = q.subject.toLowerCase();
      if (subject.includes('political')) counts.political++;
      else if (subject.includes('mercantile') || subject.includes('taxation')) counts.mercantile++;
      else if (subject.includes('civil')) counts.civil++;
      else if (subject.includes('labor')) counts.labor++;
      else if (subject.includes('criminal')) counts.criminal++;
      else if (subject.includes('remedial') || subject.includes('ethics') || subject.includes('legal forms')) counts.remedial++;
    });

    return counts;
  };

  if (questionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Scale className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Questions Available</h2>
          <p className="text-gray-600">No questions found for the selected subject.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen">
      {/* Study Mode Controls */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Timer Display (Desktop) */}
            {studyMode === 'timed' && (
              <div className="hidden md:flex items-center space-x-4">
                <Timer timeLeft={timeLeft} />
                <Button
                  onClick={handleTimerToggle}
                  variant="default"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{timerActive ? 'Pause' : 'Start'}</span>
                </Button>
              </div>
            )}

            {!studyMode || studyMode === 'practice' ? <div></div> : null}

            {/* Study Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-secondary">Practice</span>
              <button
                onClick={handleStudyModeToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  studyMode === 'timed' ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform ${
                    studyMode === 'timed' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-secondary">Timed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Timer */}
      {studyMode === 'timed' && (
        <div className="md:hidden bg-warning/90 backdrop-blur-sm text-white p-3 z-40">
          <div className="flex items-center justify-center space-x-4">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg font-semibold">{formatTime(timeLeft)}</span>
            <Button
              onClick={handleTimerToggle}
              variant="ghost"
              size="sm"
              className="text-white hover:text-white/80"
            >
              {timerActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <Sidebar
            completedCount={completedQuestions.size}
            totalCount={questions.length}
            selectedSubject={selectedSubject}
            onSubjectChange={handleSubjectChange}
            subjectCounts={getSubjectCounts()}
          />

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Question */}
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                isCompleted={completedQuestions.has(currentQuestion.id)}
                onMarkCompleted={handleMarkCompleted}
                onReset={handleReset}
                studyMode={studyMode}
                onSaveAnswer={(answer) => {
                  progressMutation.mutate({
                    questionId: currentQuestion.id,
                    completed: false,
                    timeSpent: 0,
                    studyMode
                  });
                }}
                userAnswer={progress.find(p => p.questionId === currentQuestion.id)?.userAnswer || undefined}
              />
            )}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="ghost"
                className="flex items-center space-x-2"
              >
                <span>←</span>
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-secondary">Question</span>
                <select
                  value={currentQuestionIndex + 1}
                  onChange={(e) => handleQuestionSelect(parseInt(e.target.value) - 1)}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  {questions.map((_, index) => (
                    <option key={index} value={index + 1}>
                      {index + 1}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-secondary">of {questions.length}</span>
              </div>

              <Button
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <span>→</span>
              </Button>
            </div>

            {/* Question List Preview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">All Questions</h3>
              </div>

              <div className="grid gap-3">
                {questions.slice(0, 5).map((question, index) => (
                  <div
                    key={question.id}
                    onClick={() => handleQuestionSelect(index)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-surface transition-colors cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full text-white text-sm font-semibold flex items-center justify-center ${
                        currentQuestionIndex === index ? 'bg-primary' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{question.topic}</p>
                        <p className="text-xs text-secondary">{question.subject}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        question.difficulty === 'Hard' ? 'destructive' :
                        question.difficulty === 'Medium' ? 'secondary' : 'outline'
                      }>
                        {question.difficulty}
                      </Badge>
                      {completedQuestions.has(question.id) && (
                        <div className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center">
                          ✓
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-3">
        <Button
          onClick={handleMarkCompleted}
          size="icon"
          className="w-12 h-12 bg-accent hover:bg-accent/90 rounded-full shadow-lg"
          title="Mark as completed"
        >
          ✓
        </Button>
        <Button
          onClick={handleRandomQuestion}
          size="icon"
          className="w-12 h-12 bg-primary hover:bg-primary/90 rounded-full shadow-lg"
          title="Random question"
        >
          <Shuffle className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, TrendingUp, Clock, Award, Target, BookOpen } from 'lucide-react';
import type { UserProgress, StudySession } from '@shared/schema';

export default function StudyAnalyticsPage() {
  // Fetch user progress
  const { data: progress = [] } = useQuery<UserProgress[]>({
    queryKey: ['/api/progress']
  });

  // Calculate analytics
  const totalCompleted = progress.filter(p => p.completed).length;
  const totalAnswered = progress.length;
  const averageTimeSpent = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + (p.timeSpent || 0), 0) / progress.length / 60)
    : 0;

  const subjectProgress = progress.reduce((acc, p) => {
    const subject = 'Unknown'; // This would need to be joined with questions data
    if (!acc[subject]) acc[subject] = { completed: 0, total: 0 };
    acc[subject].total++;
    if (p.completed) acc[subject].completed++;
    return acc;
  }, {} as Record<string, { completed: number; total: number }>);

  const studyModeStats = progress.reduce((acc, p) => {
    if (!acc[p.studyMode]) acc[p.studyMode] = 0;
    acc[p.studyMode]++;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-surface min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Analytics</h1>
          <p className="text-secondary">Track your bar exam preparation progress</p>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalCompleted}</p>
                  <p className="text-sm text-secondary">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalAnswered}</p>
                  <p className="text-sm text-secondary">Attempted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{averageTimeSpent}</p>
                  <p className="text-sm text-secondary">Avg. Minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAnswered > 0 ? Math.round((totalCompleted / totalAnswered) * 100) : 0}%
                  </p>
                  <p className="text-sm text-secondary">Success Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Study Mode Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="w-5 h-5" />
              <span>Study Mode Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(studyModeStats).map(([mode, count]) => (
                <div key={mode} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant={mode === 'timed' ? 'default' : 'secondary'}>
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Badge>
                    <span className="text-sm text-gray-600">{count} questions</span>
                  </div>
                  <div className="w-32">
                    <Progress 
                      value={totalAnswered > 0 ? (count / totalAnswered) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5" />
              <span>Recent Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {progress.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No progress yet</h3>
                <p className="text-gray-600">Start practicing questions to see your analytics.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {progress.slice(-5).map((p, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Question #{p.questionId}</p>
                      <p className="text-sm text-gray-600">
                        {p.studyMode} mode • {p.timeSpent ? `${Math.round(p.timeSpent / 60)} min` : 'No time recorded'}
                      </p>
                    </div>
                    <Badge variant={p.completed ? 'default' : 'secondary'}>
                      {p.completed ? 'Completed' : 'In Progress'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
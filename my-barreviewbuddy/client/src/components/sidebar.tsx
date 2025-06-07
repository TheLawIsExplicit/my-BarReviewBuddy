import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface SidebarProps {
  completedCount: number;
  totalCount: number;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
  subjectCounts: Record<string, number>;
}

const subjects = [
  { key: 'all', label: 'All Subjects' },
  { key: 'political', label: 'Political Law & PIL' },
  { key: 'mercantile', label: 'Mercantile & Taxation Laws' },
  { key: 'civil', label: 'Civil Law' },
  { key: 'labor', label: 'Labor Law & Social Legislation' },
  { key: 'criminal', label: 'Criminal Law' },
  { key: 'remedial', label: 'Remedial Law, Legal Ethics & Legal Forms' }
];

export default function Sidebar({
  completedCount,
  totalCount,
  selectedSubject,
  onSubjectChange,
  subjectCounts
}: SidebarProps) {
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Progress Overview */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary">Overall Progress</span>
                <span className="text-sm font-semibold text-accent">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-surface rounded-lg p-3">
                <div className="text-2xl font-bold text-accent">{completedCount}</div>
                <div className="text-xs text-secondary">Completed</div>
              </div>
              <div className="bg-surface rounded-lg p-3">
                <div className="text-2xl font-bold text-primary">{totalCount}</div>
                <div className="text-xs text-secondary">Total</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject Filters */}
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Subject</h3>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <Button
                key={subject.key}
                onClick={() => onSubjectChange(subject.key)}
                variant="ghost"
                className={`w-full justify-between text-left px-3 py-2 h-auto ${
                  selectedSubject === subject.key
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'hover:bg-surface'
                }`}
              >
                <span className="text-sm font-medium">{subject.label}</span>
                <Badge 
                  variant="secondary"
                  className={`text-xs ${
                    selectedSubject === subject.key
                      ? 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {subjectCounts[subject.key] || 0}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Study Tips */}
      <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/10 p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Lightbulb className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold text-gray-900">Study Tip</h3>
        </div>
        <p className="text-sm text-secondary leading-relaxed">
          Focus on understanding the legal principles behind each case. Memorize the key provisions and landmark jurisprudence for better retention.
        </p>
      </div>
    </div>
  );
}

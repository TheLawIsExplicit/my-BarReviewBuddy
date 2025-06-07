import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, BookOpen, Clock } from 'lucide-react';
import type { CustomQuestion, InsertCustomQuestion } from '@shared/schema';

interface CreateQuestionForm {
  subject: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  timeLimit: number;
  question: string;
  answer: string;
  codal: string;
  jurisprudence: string;
}

const initialForm: CreateQuestionForm = {
  subject: '',
  topic: '',
  difficulty: 'Medium',
  timeLimit: 30,
  question: '',
  answer: '',
  codal: '',
  jurisprudence: ''
};

const subjects = [
  'Political Law and Public International Law',
  'Mercantile and Taxation Laws',
  'Civil Law',
  'Labor Law and Social Legislation',
  'Criminal Law',
  'Remedial Law, Legal Ethics, & Legal Forms'
];

export default function CustomQuestionsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CreateQuestionForm>(initialForm);

  // Fetch custom questions
  const { data: customQuestions = [], isLoading } = useQuery<CustomQuestion[]>({
    queryKey: ['/api/custom-questions']
  });

  // Create custom question mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertCustomQuestion) => {
      return apiRequest('POST', '/api/custom-questions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-questions'] });
      setIsCreating(false);
      setForm(initialForm);
    }
  });

  // Update custom question mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CustomQuestion> }) => {
      return apiRequest('PUT', `/api/custom-questions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-questions'] });
      setEditingId(null);
      setForm(initialForm);
    }
  });

  // Delete custom question mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/custom-questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/custom-questions'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.subject || !form.topic || !form.question || !form.answer) {
      return;
    }

    const questionData: InsertCustomQuestion = {
      ...form,
      createdAt: new Date().toISOString(),
      codal: form.codal || undefined,
      jurisprudence: form.jurisprudence || undefined
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: questionData });
    } else {
      createMutation.mutate(questionData);
    }
  };

  const handleEdit = (question: CustomQuestion) => {
    setForm({
      subject: question.subject,
      topic: question.topic,
      difficulty: question.difficulty as 'Easy' | 'Medium' | 'Hard',
      timeLimit: question.timeLimit,
      question: question.question,
      answer: question.answer,
      codal: question.codal || '',
      jurisprudence: question.jurisprudence || ''
    });
    setEditingId(question.id);
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setForm(initialForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading custom questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Questions</h1>
            <p className="text-secondary">Create and manage your own practice questions</p>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="flex items-center space-x-2"
            disabled={isCreating}
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </Button>
        </div>

        {/* Create/Edit Form */}
        {isCreating && (
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>{editingId ? 'Edit Question' : 'Create New Question'}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Select
                      value={form.subject}
                      onValueChange={(value) => setForm({ ...form, subject: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>
                            {subject}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic *
                    </label>
                    <Input
                      value={form.topic}
                      onChange={(e) => setForm({ ...form, topic: e.target.value })}
                      placeholder="Enter topic"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <Select
                      value={form.difficulty}
                      onValueChange={(value) => setForm({ ...form, difficulty: value as 'Easy' | 'Medium' | 'Hard' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (minutes)
                    </label>
                    <Input
                      type="number"
                      value={form.timeLimit}
                      onChange={(e) => setForm({ ...form, timeLimit: parseInt(e.target.value) || 30 })}
                      min="1"
                      max="180"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question *
                  </label>
                  <Textarea
                    value={form.question}
                    onChange={(e) => setForm({ ...form, question: e.target.value })}
                    placeholder="Enter the question..."
                    className="min-h-[120px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Answer *
                  </label>
                  <Textarea
                    value={form.answer}
                    onChange={(e) => setForm({ ...form, answer: e.target.value })}
                    placeholder="Enter the detailed answer..."
                    className="min-h-[200px]"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Codal Provisions (Optional)
                    </label>
                    <Textarea
                      value={form.codal}
                      onChange={(e) => setForm({ ...form, codal: e.target.value })}
                      placeholder="Enter relevant codal provisions..."
                      className="min-h-[80px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Jurisprudence (Optional)
                    </label>
                    <Textarea
                      value={form.jurisprudence}
                      onChange={(e) => setForm({ ...form, jurisprudence: e.target.value })}
                      placeholder="Enter relevant cases..."
                      className="min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingId ? 'Update Question' : 'Create Question'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancel}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Your Custom Questions ({customQuestions.length})
          </h2>
          
          {customQuestions.length === 0 ? (
            <Card className="bg-white shadow-sm border border-gray-200">
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No custom questions yet</h3>
                <p className="text-gray-600 mb-4">Create your first custom question to get started.</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {customQuestions.map((question) => (
                <Card key={question.id} className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant="outline">{question.subject}</Badge>
                          <Badge variant={
                            question.difficulty === 'Hard' ? 'destructive' :
                            question.difficulty === 'Medium' ? 'secondary' : 'outline'
                          }>
                            {question.difficulty}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {question.timeLimit} min
                          </div>
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{question.topic}</h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-2">
                          {question.question}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(question)}
                          disabled={isCreating}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteMutation.mutate(question.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { Clock } from 'lucide-react';

interface TimerProps {
  timeLeft: number;
}

export default function Timer({ timeLeft }: TimerProps) {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 300) return 'text-red-600'; // 5 minutes or less
    if (timeLeft <= 600) return 'text-orange-600'; // 10 minutes or less
    return 'text-warning';
  };

  return (
    <div className="flex items-center space-x-2 bg-warning/10 px-4 py-2 rounded-lg">
      <Clock className={`w-4 h-4 ${getTimerColor()}`} />
      <span className={`font-mono text-lg font-semibold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}

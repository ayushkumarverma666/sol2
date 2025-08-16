'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Zap, Clock, Star, CheckCircle, TrendingUp, Users, Target, Gift, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  timeEstimate: string;
  completed: boolean;
  progress: number;
  requirements: string[];
}

export default function TasksPage() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userStats, setUserStats] = useState({
    totalEarned: 0,
    tasksCompleted: 0,
    currentStreak: 0,
    level: 1,
    experience: 0,
    nextLevelExp: 100
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Sample tasks data
  const sampleTasks: Task[] = [
    {
      id: '1',
      title: 'Complete Daily Check-in',
      description: 'Log in to the platform and check your daily rewards',
      reward: 0.1,
      difficulty: 'easy',
      category: 'Daily',
      timeEstimate: '1 min',
      completed: false,
      progress: 0,
      requirements: ['Connect wallet', 'Visit platform']
    },
    {
      id: '2',
      title: 'Share on Social Media',
      description: 'Share your experience with Solana Rewards on Twitter or Discord',
      reward: 0.25,
      difficulty: 'easy',
      category: 'Social',
      timeEstimate: '3 min',
      completed: false,
      progress: 0,
      requirements: ['Post on social media', 'Include #SolanaRewards']
    },
    {
      id: '3',
      title: 'Complete Survey',
      description: 'Fill out a quick survey about your blockchain experience',
      reward: 0.5,
      difficulty: 'medium',
      category: 'Research',
      timeEstimate: '5 min',
      completed: false,
      progress: 0,
      requirements: ['Answer all questions', 'Provide honest feedback']
    },
    {
      id: '4',
      title: 'Refer a Friend',
      description: 'Invite a friend to join Solana Rewards platform',
      reward: 1.0,
      difficulty: 'hard',
      category: 'Referral',
      timeEstimate: '10 min',
      completed: false,
      progress: 0,
      requirements: ['Friend signs up', 'Friend completes first task']
    },
    {
      id: '5',
      title: 'Write a Review',
      description: 'Write a detailed review of the platform on a review site',
      reward: 0.75,
      difficulty: 'medium',
      category: 'Content',
      timeEstimate: '8 min',
      completed: false,
      progress: 0,
      requirements: ['Minimum 100 words', 'Include platform features']
    },
    {
      id: '6',
      title: 'Join Community Call',
      description: 'Participate in our weekly community Discord call',
      reward: 0.3,
      difficulty: 'easy',
      category: 'Community',
      timeEstimate: '15 min',
      completed: false,
      progress: 0,
      requirements: ['Join Discord', 'Attend call', 'Participate in discussion']
    }
  ];

  useEffect(() => {
    setTasks(sampleTasks);
    if (connected) {
      // Load user progress from localStorage or backend
      loadUserProgress();
    }
  }, [connected]);

  const loadUserProgress = () => {
    const saved = localStorage.getItem('solanaRewardsProgress');
    if (saved) {
      const progress = JSON.parse(saved);
      setUserStats(progress.stats);
      setTasks(progress.tasks);
    }
  };

  const saveUserProgress = (newTasks: Task[], newStats: any) => {
    const progress = {
      tasks: newTasks,
      stats: newStats,
      timestamp: Date.now()
    };
    localStorage.setItem('solanaRewardsProgress', JSON.stringify(progress));
  };

  const startTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress: 10 } : task
    ));
    toast.success('Task started! Complete the requirements to earn rewards.');
  };

  const updateTaskProgress = (taskId: string, progress: number) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, progress } : task
    ));
  };

  const completeTask = async (taskId: string) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    setIsProcessing(true);
    
    try {
      // Simulate task completion and reward distribution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update task status
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, completed: true, progress: 100 } : t
      );
      
      // Update user stats
      const newStats = {
        ...userStats,
        totalEarned: userStats.totalEarned + task.reward,
        tasksCompleted: userStats.tasksCompleted + 1,
        experience: userStats.experience + (task.difficulty === 'easy' ? 10 : task.difficulty === 'medium' ? 25 : 50),
        currentStreak: userStats.currentStreak + 1
      };

      // Check for level up
      if (newStats.experience >= newStats.nextLevelExp) {
        newStats.level += 1;
        newStats.experience -= newStats.nextLevelExp;
        newStats.nextLevelExp = Math.floor(newStats.nextLevelExp * 1.5);
        toast.success(`🎉 Level Up! You're now level ${newStats.level}`);
      }

      setTasks(updatedTasks);
      setUserStats(newStats);
      saveUserProgress(updatedTasks, newStats);

      // Show success message
      toast.success(`🎉 Task completed! You earned ${task.reward} SOL`);
      
      // Simulate SOL transfer to wallet (in real app, this would be a real transaction)
      simulateRewardTransfer(task.reward);
      
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateRewardTransfer = async (amount: number) => {
    // In a real application, this would be an actual Solana transaction
    // For now, we'll simulate it
    toast.success(`💰 ${amount} SOL has been added to your wallet balance!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Daily': return <Clock className="w-4 h-4" />;
      case 'Social': return <Users className="w-4 h-4" />;
      case 'Research': return <Target className="w-4 h-4" />;
      case 'Referral': return <TrendingUp className="w-4 h-4" />;
      case 'Content': return <Gift className="w-4 h-4" />;
      case 'Community': return <Users className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20">
        <Navigation />
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="solana-card border-0">
              <CardContent className="pt-12 pb-12">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
                <p className="text-muted-foreground mb-6">
                  Connect your Solana wallet to start earning SOL by completing tasks
                </p>
                <Button size="lg" className="solana-gradient text-white">
                  <Wallet className="w-5 h-5 mr-2" />
                  Connect Wallet
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-50/20">
      <Navigation />
      
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Complete Tasks, Earn SOL</h1>
            <p className="text-xl text-muted-foreground">
              Choose from various tasks and start earning rewards instantly
            </p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="solana-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold solana-gradient-text">{userStats.totalEarned.toFixed(2)} SOL</div>
                    <div className="text-sm text-muted-foreground">Total Earned</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="solana-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold solana-gradient-text">{userStats.tasksCompleted}</div>
                    <div className="text-sm text-muted-foreground">Tasks Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="solana-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold solana-gradient-text">{userStats.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="solana-card border-0">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div>
                    <div className="text-2xl font-bold solana-gradient-text">Level {userStats.level}</div>
                    <div className="text-sm text-muted-foreground">
                      {userStats.experience}/{userStats.nextLevelExp} XP
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Level Progress */}
          <Card className="solana-card border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Level {userStats.level}</span>
                  <span>Level {userStats.level + 1}</span>
                </div>
                <Progress 
                  value={(userStats.experience / userStats.nextLevelExp) * 100} 
                  className="h-3"
                />
                <div className="text-center text-sm text-muted-foreground">
                  {userStats.experience} / {userStats.nextLevelExp} XP
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => (
                  <Card key={task.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(task.category)}
                          <Badge variant="secondary" className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold solana-gradient-text">{task.reward} SOL</div>
                          <div className="text-xs text-muted-foreground">Reward</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {task.timeEstimate}
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Requirements:</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {task.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {task.completed ? (
                        <Button disabled className="w-full bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : task.progress === 0 ? (
                        <Button 
                          onClick={() => startTask(task.id)}
                          className="w-full solana-gradient text-white"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Task
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => completeTask(task.id)}
                          disabled={isProcessing}
                          className="w-full solana-gradient text-white"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Task
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="daily" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.filter(task => task.category === 'Daily').map((task) => (
                  <Card key={task.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(task.category)}
                          <Badge variant="secondary" className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold solana-gradient-text">{task.reward} SOL</div>
                          <div className="text-xs text-muted-foreground">Reward</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {task.timeEstimate}
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Requirements:</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {task.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {task.completed ? (
                        <Button disabled className="w-full bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : task.progress === 0 ? (
                        <Button 
                          onClick={() => startTask(task.id)}
                          className="w-full solana-gradient text-white"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Task
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => completeTask(task.id)}
                          disabled={isProcessing}
                          className="w-full solana-gradient text-white"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Task
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.filter(task => task.category === 'Social').map((task) => (
                  <Card key={task.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(task.category)}
                          <Badge variant="secondary" className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold solana-gradient-text">{task.reward} SOL</div>
                          <div className="text-xs text-muted-foreground">Reward</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {task.timeEstimate}
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Requirements:</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {task.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {task.completed ? (
                        <Button disabled className="w-full bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : task.progress === 0 ? (
                        <Button 
                          onClick={() => startTask(task.id)}
                          className="w-full solana-gradient text-white"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Task
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => completeTask(task.id)}
                          disabled={isProcessing}
                          className="w-full solana-gradient text-white"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Task
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="special" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.filter(task => !['Daily', 'Social'].includes(task.category)).map((task) => (
                  <Card key={task.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(task.category)}
                          <Badge variant="secondary" className={getDifficultyColor(task.difficulty)}>
                            {task.difficulty}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold solana-gradient-text">{task.reward} SOL</div>
                          <div className="text-xs text-muted-foreground">Reward</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{task.title}</CardTitle>
                      <CardDescription>{task.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {task.timeEstimate}
                      </div>
                      
                      {task.progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Requirements:</div>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {task.requirements.map((req, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {task.completed ? (
                        <Button disabled className="w-full bg-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Completed
                        </Button>
                      ) : task.progress === 0 ? (
                        <Button 
                          onClick={() => startTask(task.id)}
                          className="w-full solana-gradient text-white"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Start Task
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => completeTask(task.id)}
                          disabled={isProcessing}
                          className="w-full solana-gradient text-white"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Complete Task
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 
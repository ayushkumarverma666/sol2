'use client';

import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Gift, Wallet, Zap, Star, Users, ShoppingCart, CreditCard, Coins, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Reward {
  id: string;
  title: string;
  description: string;
  category: string;
  cost: number;
  image: string;
  available: boolean;
  popular: boolean;
  redemptionType: 'gift_card' | 'subscription' | 'merchandise' | 'crypto';
}

export default function RewardsPage() {
  const { publicKey, connected, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redemptionAmount, setRedemptionAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Sample rewards data
  const sampleRewards: Reward[] = [
    {
      id: '1',
      title: 'Netflix Gift Card',
      description: '1 month subscription to Netflix streaming service',
      category: 'Entertainment',
      cost: 0.5,
      image: '/api/placeholder/200/150',
      available: true,
      popular: true,
      redemptionType: 'subscription'
    },
    {
      id: '2',
      title: 'Amazon Gift Card',
      description: '$25 Amazon gift card for online shopping',
      category: 'Shopping',
      cost: 0.4,
      image: '/api/placeholder/200/150',
      available: true,
      popular: true,
      redemptionType: 'gift_card'
    },
    {
      id: '3',
      title: 'Spotify Premium',
      description: '3 months of Spotify Premium music streaming',
      category: 'Entertainment',
      cost: 0.3,
      image: '/api/placeholder/200/150',
      available: true,
      popular: false,
      redemptionType: 'subscription'
    },
    {
      id: '4',
      title: 'Starbucks Gift Card',
      description: '$20 Starbucks gift card for coffee and food',
      category: 'Food & Beverage',
      cost: 0.35,
      image: '/api/placeholder/200/150',
      available: true,
      popular: false,
      redemptionType: 'gift_card'
    },
    {
      id: '5',
      title: 'Solana Merchandise',
      description: 'Exclusive Solana branded t-shirt and hoodie',
      category: 'Merchandise',
      cost: 0.8,
      image: '/api/placeholder/200/150',
      available: true,
      popular: false,
      redemptionType: 'merchandise'
    },
    {
      id: '6',
      title: 'USDC Stablecoin',
      description: 'Convert your SOL to USDC stablecoin',
      category: 'Crypto',
      cost: 0.1,
      image: '/api/placeholder/200/150',
      available: true,
      popular: true,
      redemptionType: 'crypto'
    },
    {
      id: '7',
      title: 'Discord Nitro',
      description: '1 month Discord Nitro subscription',
      category: 'Gaming',
      cost: 0.25,
      image: '/api/placeholder/200/150',
      available: true,
      popular: false,
      redemptionType: 'subscription'
    },
    {
      id: '8',
      title: 'Uber Eats Credit',
      description: '$30 Uber Eats delivery credit',
      category: 'Food & Beverage',
      cost: 0.45,
      image: '/api/placeholder/200/150',
      available: true,
      popular: false,
      redemptionType: 'gift_card'
    }
  ];

  useEffect(() => {
    setRewards(sampleRewards);
    if (connected && publicKey) {
      fetchUserBalance();
    }
  }, [connected, publicKey]);

  const fetchUserBalance = async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      const balance = await connection.getBalance(publicKey);
      setUserBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRewardRedemption = async (reward: Reward) => {
    if (!connected || !publicKey) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (userBalance < reward.cost) {
      toast.error('Insufficient balance for this reward');
      return;
    }

    setSelectedReward(reward);
    setRedemptionAmount(reward.cost.toString());
  };

  const confirmRedemption = async () => {
    if (!selectedReward || !publicKey) return;

    setIsRedeeming(true);
    
    try {
      // Simulate reward redemption process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real application, this would:
      // 1. Deduct SOL from user's balance
      // 2. Process the reward (send gift card, activate subscription, etc.)
      // 3. Update user's reward history
      
      toast.success(`🎉 ${selectedReward.title} redeemed successfully!`);
      
      // Update user balance
      setUserBalance(prev => prev - selectedReward.cost);
      
      // Close dialog
      setSelectedReward(null);
      setRedemptionAmount('');
      
    } catch (error) {
      console.error('Redemption failed:', error);
      toast.error('Failed to redeem reward. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Entertainment': return <Zap className="w-4 h-4" />;
      case 'Shopping': return <ShoppingCart className="w-4 h-4" />;
      case 'Food & Beverage': return <Gift className="w-4 h-4" />;
      case 'Merchandise': return <Star className="w-4 h-4" />;
      case 'Crypto': return <Coins className="w-4 h-4" />;
      case 'Gaming': return <Users className="w-4 h-4" />;
      default: return <Gift className="w-4 h-4" />;
    }
  };

  const getRedemptionTypeColor = (type: string) => {
    switch (type) {
      case 'gift_card': return 'bg-blue-500';
      case 'subscription': return 'bg-green-500';
      case 'merchandise': return 'bg-purple-500';
      case 'crypto': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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
                  Connect your Solana wallet to view and redeem available rewards
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
            <h1 className="text-4xl font-bold mb-4">Redeem Your Rewards</h1>
            <p className="text-xl text-muted-foreground">
              Convert your earned SOL into amazing rewards and gift cards
            </p>
          </div>

          {/* User Balance */}
          <Card className="solana-card border-0 mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wallet className="w-8 h-8 text-purple-600" />
                  <div>
                    <div className="text-sm text-muted-foreground">Available Balance</div>
                    <div className="text-3xl font-bold solana-gradient-text">
                      {isLoading ? '...' : `${userBalance.toFixed(4)} SOL`}
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={fetchUserBalance} disabled={isLoading}>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Rewards Categories */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="entertainment">Entertainment</TabsTrigger>
              <TabsTrigger value="shopping">Shopping</TabsTrigger>
              <TabsTrigger value="food">Food & Beverage</TabsTrigger>
              <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                          {getCategoryIcon(reward.category)}
                        </div>
                        {reward.popular && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant="secondary" className={getRedemptionTypeColor(reward.redemptionType)}>
                            {reward.redemptionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold solana-gradient-text">{reward.cost} SOL</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleRewardRedemption(reward)}
                        disabled={!reward.available || userBalance < reward.cost}
                        className="w-full solana-gradient text-white"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {userBalance < reward.cost ? 'Insufficient Balance' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="entertainment" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.filter(reward => reward.category === 'Entertainment').map((reward) => (
                  <Card key={reward.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                          {getCategoryIcon(reward.category)}
                        </div>
                        {reward.popular && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant="secondary" className={getRedemptionTypeColor(reward.redemptionType)}>
                            {reward.redemptionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold solana-gradient-text">{reward.cost} SOL</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleRewardRedemption(reward)}
                        disabled={!reward.available || userBalance < reward.cost}
                        className="w-full solana-gradient text-white"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {userBalance < reward.cost ? 'Insufficient Balance' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="shopping" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.filter(reward => reward.category === 'Shopping').map((reward) => (
                  <Card key={reward.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                          {getCategoryIcon(reward.category)}
                        </div>
                        {reward.popular && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant="secondary" className={getRedemptionTypeColor(reward.redemptionType)}>
                            {reward.redemptionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold solana-gradient-text">{reward.cost} SOL</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleRewardRedemption(reward)}
                        disabled={!reward.available || userBalance < reward.cost}
                        className="w-full solana-gradient text-white"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {userBalance < reward.cost ? 'Insufficient Balance' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="food" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.filter(reward => reward.category === 'Food & Beverage').map((reward) => (
                  <Card key={reward.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                          {getCategoryIcon(reward.category)}
                        </div>
                        {reward.popular && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant="secondary" className={getRedemptionTypeColor(reward.redemptionType)}>
                            {reward.redemptionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold solana-gradient-text">{reward.cost} SOL</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleRewardRedemption(reward)}
                        disabled={!reward.available || userBalance < reward.cost}
                        className="w-full solana-gradient text-white"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {userBalance < reward.cost ? 'Insufficient Balance' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="merchandise" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.filter(reward => reward.category === 'Merchandise').map((reward) => (
                  <Card key={reward.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                          {getCategoryIcon(reward.category)}
                        </div>
                        {reward.popular && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant="secondary" className={getRedemptionTypeColor(reward.redemptionType)}>
                            {reward.redemptionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold solana-gradient-text">{reward.cost} SOL</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleRewardRedemption(reward)}
                        disabled={!reward.available || userBalance < reward.cost}
                        className="w-full solana-gradient text-white"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {userBalance < reward.cost ? 'Insufficient Balance' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="crypto" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {rewards.filter(reward => reward.category === 'Crypto').map((reward) => (
                  <Card key={reward.id} className="solana-card border-0 hover:solana-glow transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="relative">
                        <div className="w-full h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center">
                          {getCategoryIcon(reward.category)}
                        </div>
                        {reward.popular && (
                          <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                            Popular
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(reward.category)}
                          <Badge variant="secondary" className={getRedemptionTypeColor(reward.redemptionType)}>
                            {reward.redemptionType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold solana-gradient-text">{reward.cost} SOL</div>
                        </div>
                      </div>
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleRewardRedemption(reward)}
                        disabled={!reward.available || userBalance < reward.cost}
                        className="w-full solana-gradient text-white"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        {userBalance < reward.cost ? 'Insufficient Balance' : 'Redeem Now'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Redemption Dialog */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redeem {selectedReward?.title}</DialogTitle>
            <DialogDescription>
              Confirm your reward redemption. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Reward Cost:</span>
                <span className="text-lg font-bold solana-gradient-text">{selectedReward?.cost} SOL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Your Balance:</span>
                <span className="text-lg font-bold">{userBalance.toFixed(4)} SOL</span>
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <span className="font-medium">Remaining Balance:</span>
                <span className="text-lg font-bold text-green-600">
                  {(userBalance - (selectedReward?.cost || 0)).toFixed(4)} SOL
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Redemption Amount (SOL)</Label>
              <Input
                id="amount"
                type="number"
                value={redemptionAmount}
                onChange={(e) => setRedemptionAmount(e.target.value)}
                step="0.001"
                min="0"
                max={selectedReward?.cost}
              />
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setSelectedReward(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmRedemption}
                disabled={isRedeeming || parseFloat(redemptionAmount) !== selectedReward?.cost}
                className="flex-1 solana-gradient text-white"
              >
                {isRedeeming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4 mr-2" />
                    Confirm Redemption
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
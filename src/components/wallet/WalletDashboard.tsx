'use client';

import { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet, Send, Receive, History, TrendingUp, ArrowUpRight, ArrowDownLeft, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionItem {
  signature: string;
  type: 'send' | 'receive' | 'task_reward';
  amount: number;
  timestamp: Date;
  from: string;
  to: string;
  status: 'confirmed' | 'pending' | 'failed';
}

export const WalletDashboard = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock transaction data for demonstration
  const mockTransactions: TransactionItem[] = [
    {
      signature: '5J7X...',
      type: 'task_reward',
      amount: 0.5,
      timestamp: new Date(Date.now() - 3600000),
      from: 'Task System',
      to: publicKey?.toString() || '',
      status: 'confirmed'
    },
    {
      signature: '3K9Y...',
      type: 'receive',
      amount: 2.0,
      timestamp: new Date(Date.now() - 7200000),
      from: '0x1234...5678',
      to: publicKey?.toString() || '',
      status: 'confirmed'
    },
    {
      signature: '7M2N...',
      type: 'send',
      amount: 1.5,
      timestamp: new Date(Date.now() - 10800000),
      from: publicKey?.toString() || '',
      to: '0x8765...4321',
      status: 'confirmed'
    }
  ];

  useEffect(() => {
    if (connected && publicKey) {
      fetchBalance();
      setTransactions(mockTransactions);
    }
  }, [connected, publicKey]);

  const fetchBalance = async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      toast.error('Failed to fetch balance');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!publicKey || !recipientAddress || !transferAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setIsTransferring(true);
      
      const recipientPubKey = new PublicKey(recipientAddress);
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Add to transaction history
      const newTransaction: TransactionItem = {
        signature: signature.slice(0, 8) + '...',
        type: 'send',
        amount: amount,
        timestamp: new Date(),
        from: publicKey.toString(),
        to: recipientAddress,
        status: 'confirmed'
      };

      setTransactions([newTransaction, ...transactions]);
      setBalance(balance - amount);
      setTransferAmount('');
      setRecipientAddress('');
      
      toast.success(`Successfully transferred ${amount} SOL`);
    } catch (error) {
      console.error('Transfer failed:', error);
      toast.error('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return address.slice(0, 4) + '...' + address.slice(-4);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'send':
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      case 'receive':
        return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
      case 'task_reward':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      default:
        return <Wallet className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'send':
        return 'text-red-500';
      case 'receive':
        return 'text-green-500';
      case 'task_reward':
        return 'text-purple-500';
      default:
        return 'text-gray-500';
    }
  };

  if (!connected) {
    return (
      <Card className="solana-card border-0">
        <CardContent className="pt-8 pb-8 text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Wallet Not Connected</h3>
          <p className="text-muted-foreground">Connect your wallet to view your dashboard</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="solana-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Balance
          </CardTitle>
          <CardDescription>Your current SOL balance and wallet address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold solana-gradient-text mb-2">
              {isLoading ? '...' : `${balance.toFixed(4)} SOL`}
            </div>
            <Button variant="outline" size="sm" onClick={fetchBalance} disabled={isLoading}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <span className="text-sm text-muted-foreground">Wallet Address:</span>
            <div className="flex items-center gap-2">
              <code className="text-sm">{formatAddress(publicKey?.toString() || '')}</code>
              <Button variant="ghost" size="sm" onClick={copyAddress}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full h-20 solana-gradient text-white">
              <Send className="w-5 h-5 mr-2" />
              Send SOL
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send SOL</DialogTitle>
              <DialogDescription>Transfer SOL to another wallet address</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="Enter wallet address"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (SOL)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  step="0.001"
                  min="0"
                />
              </div>
              <Button 
                onClick={handleTransfer} 
                disabled={isTransferring || !recipientAddress || !transferAmount}
                className="w-full"
              >
                {isTransferring ? 'Sending...' : 'Send SOL'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="w-full h-20">
          <Receive className="w-5 h-5 mr-2" />
          Receive SOL
        </Button>
      </div>

      {/* Transaction History */}
      <Card className="solana-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Recent transactions and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-3">
              {transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <div className="font-medium">{tx.type === 'send' ? 'Sent' : tx.type === 'receive' ? 'Received' : 'Task Reward'}</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getTransactionColor(tx.type)}`}>
                      {tx.type === 'send' ? '-' : '+'}{tx.amount} SOL
                    </div>
                    <div className="text-xs text-muted-foreground">{tx.signature}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="sent" className="space-y-3">
              {transactions.filter(tx => tx.type === 'send').map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <div className="font-medium">Sent to {formatAddress(tx.to)}</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-500">-{tx.amount} SOL</div>
                    <div className="text-xs text-muted-foreground">{tx.signature}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="received" className="space-y-3">
              {transactions.filter(tx => tx.type === 'receive').map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <div className="font-medium">Received from {formatAddress(tx.from)}</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-500">+{tx.amount} SOL</div>
                    <div className="text-xs text-muted-foreground">{tx.signature}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="rewards" className="space-y-3">
              {transactions.filter(tx => tx.type === 'task_reward').map((tx, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(tx.type)}
                    <div>
                      <div className="font-medium">Task Reward</div>
                      <div className="text-sm text-muted-foreground">
                        {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-500">+{tx.amount} SOL</div>
                    <div className="text-xs text-muted-foreground">{tx.signature}</div>
                  </div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

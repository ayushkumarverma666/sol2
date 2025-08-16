'use client';

import { Navigation } from '@/components/layout/Navigation';
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWallet } from '@solana/wallet-adapter-react';
import { Wallet, Settings, User, Shield, Activity, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { connected, disconnect, publicKey } = useWallet();

  const handleDisconnect = () => {
    disconnect();
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
                  Connect your Solana wallet to view your profile and wallet dashboard
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
            <h1 className="text-4xl font-bold mb-4">Your Profile & Wallet</h1>
            <p className="text-xl text-muted-foreground">
              Manage your account, view wallet details, and track your earnings
            </p>
          </div>

          {/* Profile Info */}
          <Card className="solana-card border-0 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details and wallet information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-purple-600" />
                    <span className="font-medium">Wallet Address:</span>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm break-all">
                      {publicKey?.toString()}
                    </code>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Status:</span>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    Connected
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" className="flex-1">
                  <Activity className="w-4 h-4 mr-2" />
                  Activity Log
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDisconnect}
                  className="flex-1"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Dashboard */}
          <WalletDashboard />
        </div>
      </div>
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { X, Copy, Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ShareProgramModalProps {
  programId: string;
  programName: string;
  onClose: () => void;
}

export function ShareProgramModal({ programId, programName, onClose }: ShareProgramModalProps) {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Generate shareable link (in production, this would be a proper sharing URL)
  const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/trainer/programs/${programId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!email) return;

    try {
      setSending(true);
      // TODO: Implement email sending API
      alert(`Email sharing will be sent to: ${email}`);
      onClose();
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Share Program
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {programName}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Copy Link */}
          <div className="space-y-2">
            <Label>Share Link</Label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-gray-50 dark:bg-gray-900"
              />
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={16} className="text-green-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Anyone with this link can view the program details
            </p>
          </div>

          {/* Email Share */}
          <div className="space-y-2">
            <Label htmlFor="email">Send via Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1"
              />
              <Button
                onClick={handleSendEmail}
                disabled={!email || sending}
                className="bg-wondrous-primary hover:bg-purple-700 text-white"
              >
                <Mail size={16} className="mr-2" />
                Send
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Share this program with a colleague or client via email
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

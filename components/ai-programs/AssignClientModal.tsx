'use client';

import { useState, useEffect } from 'react';
import { X, User, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type { ClientProfile } from '@/lib/types/client-profile';

interface AssignClientModalProps {
  programId: string;
  programName: string;
  onClose: () => void;
  onAssigned?: () => void;
}

export function AssignClientModal({ programId, programName, onClose, onAssigned }: AssignClientModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        const response = await fetch('/api/clients');

        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }

        const data = await response.json();
        setClients(data.clients || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client =>
    `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedClientId) return;

    try {
      setAssigning(true);
      const response = await fetch(`/api/ai-programs/${programId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: selectedClientId }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign program');
      }

      if (onAssigned) onAssigned();
      onClose();
    } catch (error) {
      console.error('Error assigning program:', error);
      alert('Failed to assign program to client');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-gray-100">
              Assign Program
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

        <CardContent className="p-6 flex-1 overflow-auto">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search clients..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Client List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
            </div>
          ) : filteredClients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm ? 'No clients found matching your search.' : 'No clients available.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedClientId === client.id
                      ? 'border-wondrous-magenta bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-wondrous-magenta/20 to-wondrous-blue/20 flex items-center justify-center flex-shrink-0">
                      <User size={20} className="text-wondrous-magenta" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {client.first_name} {client.last_name}
                        </h3>
                        {selectedClientId === client.id && (
                          <CheckCircle2 size={16} className="text-wondrous-magenta" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{client.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedClientId || assigning}
            className="flex-1 bg-wondrous-primary hover:bg-purple-700 text-white"
          >
            {assigning ? 'Assigning...' : 'Assign Program'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PresenceUser {
  id: string;
  name: string;
  color: string;
  lastSeen: string;
  section?: string;
}

interface UseRealtimePresenceResult {
  viewers: PresenceUser[];
  currentUser: PresenceUser | null;
  updatePresence: (updates: Partial<PresenceUser>) => void;
  isConnected: boolean;
}

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', 
  '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'
];

const generateId = () => crypto.randomUUID();
const generateColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];
const generateName = () => `User ${Math.floor(Math.random() * 1000)}`;

export function useRealtimePresence(channelName: string): UseRealtimePresenceResult {
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const [currentUser, setCurrentUser] = useState<PresenceUser | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    // Initialize current user
    const storedUser = sessionStorage.getItem('presence_user');
    let user: PresenceUser;
    
    if (storedUser) {
      user = JSON.parse(storedUser);
    } else {
      user = {
        id: generateId(),
        name: generateName(),
        color: generateColor(),
        lastSeen: new Date().toISOString(),
      };
      sessionStorage.setItem('presence_user', JSON.stringify(user));
    }
    setCurrentUser(user);

    // Set up presence channel
    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: PresenceUser[] = [];
        
        Object.keys(state).forEach(key => {
          const presences = state[key] as any[];
          if (presences.length > 0) {
            users.push(presences[0] as PresenceUser);
          }
        });
        
        setViewers(users.filter(u => u.id !== user.id));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await presenceChannel.track(user);
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [channelName]);

  const updatePresence = useCallback(async (updates: Partial<PresenceUser>) => {
    if (!channel || !currentUser) return;

    const updatedUser = {
      ...currentUser,
      ...updates,
      lastSeen: new Date().toISOString(),
    };
    
    setCurrentUser(updatedUser);
    sessionStorage.setItem('presence_user', JSON.stringify(updatedUser));
    
    await channel.track(updatedUser);
  }, [channel, currentUser]);

  return { viewers, currentUser, updatePresence, isConnected };
}

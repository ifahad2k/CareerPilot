"use client";

import { useState, useEffect } from 'react';
import { useFirebaseAuth } from '@/components/Providers';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Loader2,
  X,
  Target,
} from 'lucide-react';

// ============================================================
// Page: Calendar
// ============================================================
//
// Pillar 4 — Productivity & Progress Tracker
// - Monthly calendar view with events
// - Event creation for interviews, deadlines
// - Integration with application tracker
// ============================================================

interface Event {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: 'interview' | 'deadline' | 'reminder' | 'milestone';
  relatedAppId?: string;
}

const EVENT_COLORS: Record<string, string> = {
  interview: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
  deadline: 'bg-red-500/10 border-red-500/30 text-red-500',
  reminder: 'bg-amber-500/10 border-amber-500/30 text-amber-500',
  milestone: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarPage() {
  const { user, loading: authLoading } = useFirebaseAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    type: 'reminder' as Event['type'],
  });

  // Fetch events
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Add empty slots for days before first day of month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentDate.getMonth() === selectedDate.getMonth() &&
      currentDate.getFullYear() === selectedDate.getFullYear()
    );
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const addEvent = async () => {
    if (!newEvent.title || !selectedDate) {
      toast.error('Please enter an event title');
      return;
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newEvent.title,
          date: selectedDate.toISOString().split('T')[0],
          time: newEvent.time || null,
          type: newEvent.type,
        }),
      });

      if (res.ok) {
        toast.success('Event added');
        setShowEventModal(false);
        setNewEvent({ title: '', time: '', type: 'reminder' });
        fetchEvents();
      } else {
        toast.error('Failed to add event');
      }
    } catch (error) {
      toast.error('Failed to add event');
    }
  };

  const days = getDaysInMonth(currentDate);
  const selectedDayEvents = selectedDate
    ? getEventsForDay(selectedDate.getDate())
    : [];

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <CalendarIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Track interviews, deadlines, and milestones
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h2 className="text-xl font-semibold text-foreground">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={index} className="aspect-square" />;
              }

              const dayEvents = getEventsForDay(day);
              const hasEvents = dayEvents.length > 0;
              const eventType = hasEvents ? dayEvents[0].type : null;

              return (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors
                    ${isToday(day)
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : isSelected(day)
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted'
                    }
                  `}
                >
                  <span className={isToday(day) ? '' : 'text-foreground'}>{day}</span>
                  {hasEvents && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${EVENT_COLORS[eventType!].split(' ')[1].replace('bg-', 'bg-').replace('/10', '')}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Events Sidebar */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">
              {selectedDate
                ? selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Select a date'}
            </h3>
            {selectedDate && (
              <button
                onClick={() => setShowEventModal(true)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 text-primary" />
              </button>
            )}
          </div>

          {selectedDayEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedDayEvents.map(event => (
                <div
                  key={event.id}
                  className={`p-3 rounded-lg border ${EVENT_COLORS[event.type]}`}
                >
                  <p className="font-medium text-foreground">{event.title}</p>
                  {event.time && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {selectedDate
                  ? 'No events on this day'
                  : 'Click a date to view events'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Add Event</h2>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="e.g. Google Interview"
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                  className="w-full h-10 px-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Event Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['interview', 'deadline', 'reminder', 'milestone'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewEvent({ ...newEvent, type })}
                      className={`
                        px-3 py-2 rounded-lg text-sm capitalize transition-colors border
                        ${newEvent.type === type
                          ? EVENT_COLORS[type]
                          : 'border-border hover:bg-muted text-foreground'
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 h-10 border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addEvent}
                className="flex-1 h-10 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors"
              >
                Add Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
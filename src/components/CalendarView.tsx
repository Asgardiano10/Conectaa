import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { DateSelectArg, EventClickArg } from '@fullcalendar/core';
import { subscribeEvents, createEvent, updateEvent, deleteEvent } from "../api/events";
import { useAuth } from "../context/AuthContext";
import { Event } from "../types";

interface CalendarViewProps {
  filters: {
    assignedTo?: string;
    category?: string;
  };
}

export default function CalendarView({ filters }: CalendarViewProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const unsub = subscribeEvents({
      assigned_to: filters.assignedTo,
      callback: (arr) => setEvents(arr)
    });
    return () => unsub();
  }, [filters.assignedTo]);

  const calendarEvents = events
    .filter(e => !filters.category || e.category === filters.category)
    .map(e => ({
      id: e.id!,
      title: e.title,
      start: e.start_date,
      end: e.end_date,
      backgroundColor: getCategoryColor(e.category),
      borderColor: getCategoryColor(e.category),
      extendedProps: e
    }));

  function getCategoryColor(category: string) {
    const colors = {
      'visita': '#10B981',
      'reuniao': '#3B82F6',
      'cobranca': '#F59E0B',
      'outro': '#6B7280'
    };
    return colors[category as keyof typeof colors] || colors.outro;
  }

  function handleSelect(selectInfo: DateSelectArg) {
    if (!user) return;
    
    setSelectedEvent({
      title: '',
      description: '',
      start_date: selectInfo.start.toISOString(),
      end_date: selectInfo.end.toISOString(),
      category: 'visita',
      status: 'planejado',
      assigned_to: user.id,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    setIsEditing(false);
    setShowModal(true);
  }

  function handleEventClick(info: EventClickArg) {
    const event = info.event.extendedProps as Event;
    if (event.created_by === user?.id || user?.role === 'SUPERVISOR') {
      setSelectedEvent(event);
      setIsEditing(true);
      setShowModal(true);
    }
  }

  async function handleSaveEvent() {
    if (!selectedEvent || !user) return;

    try {
      if (isEditing && selectedEvent.id) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { created_at, ...updateData } = selectedEvent;
        await updateEvent(selectedEvent.id, updateData);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, updated_at, ...eventData } = selectedEvent;
        await createEvent(eventData);
      }
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  }

  async function handleDeleteEvent() {
    if (!selectedEvent?.id || !user) return;
    
    if (selectedEvent.created_by === user.id || user.role === 'SUPERVISOR') {
      if (confirm('Deseja excluir este evento?')) {
        try {
          await deleteEvent(selectedEvent.id);
          setShowModal(false);
          setSelectedEvent(null);
        } catch (error) {
          console.error('Erro ao excluir evento:', error);
        }
      }
    }
  }

  return (
    <div className="h-full">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        selectable={true}
        select={handleSelect}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="auto"
        locale="pt-br"
        buttonText={{
          today: 'Hoje',
          month: 'Mês',
          week: 'Semana',
          day: 'Dia'
        }}
      />

      {/* Modal de Evento */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-secondary rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {isEditing ? 'Editar Evento' : 'Novo Evento'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input
                  type="text"
                  value={selectedEvent.title}
                  onChange={(e) => setSelectedEvent({...selectedEvent, title: e.target.value})}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={selectedEvent.description}
                  onChange={(e) => setSelectedEvent({...selectedEvent, description: e.target.value})}
                  className="input"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <select
                  value={selectedEvent.category}
                  onChange={(e) => setSelectedEvent({...selectedEvent, category: e.target.value as any})}
                  className="input"
                >
                  <option value="visita">Visita</option>
                  <option value="reuniao">Reunião</option>
                  <option value="cobranca">Cobrança</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={selectedEvent.status}
                  onChange={(e) => setSelectedEvent({...selectedEvent, status: e.target.value as any})}
                  className="input"
                >
                  <option value="planejado">Planejado</option>
                  <option value="realizado">Realizado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button onClick={handleSaveEvent} className="btn flex-1">
                Salvar
              </button>
              {isEditing && (
                <button onClick={handleDeleteEvent} className="btn bg-red-600 hover:bg-red-700">
                  Excluir
                </button>
              )}
              <button 
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

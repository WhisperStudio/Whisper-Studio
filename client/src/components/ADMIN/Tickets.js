// ✅ Tickets.js (med støtte for admin-svar til tickets) - Fikset
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import api from '../../utils/api';

const Wrapper = styled.div`
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
`;

const TicketForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: #0f172a;
  color: white;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border-radius: 8px;
  border: none;
  background: #0f172a;
  color: white;
  resize: vertical;
`;

const Button = styled.button`
  background: #2d72d9;
  color: white;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const TicketList = styled.div`
  background: #0f172a;
  border-radius: 8px;
  padding: 1rem;
`;

const TicketItem = styled.div`
  background: #1e293b;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const ReplyInput = styled.textarea`
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #0f172a;
  color: white;
  border: 1px solid #2d72d9;
  border-radius: 6px;
  width: 100%;
  resize: vertical;
`;

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [error, setError] = useState(null);
  const [replyMap, setReplyMap] = useState({});

  useEffect(() => {
    api.get('/tickets')
      .then(res => {
        const data = res.data;
        // FIX: Robustly find the array in the response. The API might return the array
        // directly, or nested under a "data" or "tickets" key. test
        const ticketsArray = Array.isArray(data)
          ? data
          : (data && (Array.isArray(data.data) ? data.data : Array.isArray(data.tickets) ? data.tickets : null));

        if (ticketsArray) {
          setTickets(ticketsArray);
        } else {
          console.warn('⚠️ Received data is not an array or a recognized wrapper object:', data);
          setTickets([]); // Default to empty array if format is unexpected
        }
      })
      .catch(err => {
        console.error('❌ Feil ved henting av tickets:', err);
        setError('Kunne ikke hente tickets');
        // FIX: Ensure state is a clean array on API error to prevent crashes.
        setTickets([]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject || !form.message) return;

    try {
      const res = await api.post('/tickets', form);
      // FIX: Ensure the response data is a valid object before adding it. This prevents
      // adding null, an array, or other primitives to the tickets list.
      if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        setTickets(prev => [...prev, res.data]);
        setForm({ subject: '', message: '' });
      } else {
        console.error('❌ Received unexpected data after creating ticket:', res.data);
        setError('An error occurred while updating the ticket list.');
      }
    } catch (err) {
      console.error('❌ Feil ved innsending av ticket:', err);
      setError('Kunne ikke sende ticket');
    }
  };

  const handleReply = async (ticketId) => {
    const reply = replyMap[ticketId];
    if (!reply?.trim()) return;

    try {
      await api.post(`/tickets/${ticketId}/reply`, { reply });
      // This is an optimistic update, which is fine. It assumes the API call succeeds.
      const updated = tickets.map(t =>
        t._id === ticketId ? { ...t, adminReply: reply } : t
      );
      setTickets(updated);
      setReplyMap(prev => ({ ...prev, [ticketId]: '' }));
    } catch (err) {
      console.error('❌ Feil ved admin-svar:', err);
    }
  };

  return (
    <Wrapper>
      <h2>Support Tickets</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <TicketForm onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Subject"
          value={form.subject}
          onChange={e => setForm({ ...form, subject: e.target.value })}
        />
        <TextArea
          rows="4"
          placeholder="Describe your issue..."
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
        />
        <Button type="submit">Submit Ticket</Button>
      </TicketForm>

      <TicketList>
        {/* This check is correct, but was failing because `tickets` was not an array */}
        {!Array.isArray(tickets) || tickets.length === 0 ? (
          <p style={{ color: '#ccc' }}>Ingen tickets ennå.</p>
        ) : (
          tickets.map(ticket => (
            // Ensure ticket is a valid object before trying to render it
            (ticket && typeof ticket === 'object') && (
              <TicketItem key={ticket._id}>
                <strong>{ticket.subject}</strong>
                <p>{ticket.message}</p>
                {ticket.adminReply && (
                  <p style={{ marginTop: '0.5rem', color: '#4CAF50' }}>
                    <strong>Admin svarte:</strong> {ticket.adminReply}
                  </p>
                )}
                <ReplyInput
                  rows="2"
                  placeholder="Svar på denne ticketen..."
                  value={replyMap[ticket._id] || ''}
                  onChange={e => setReplyMap(prev => ({ ...prev, [ticket._id]: e.target.value }))}
                />
                <Button onClick={() => handleReply(ticket._id)}>Send svar</Button>
              </TicketItem>
            )
          ))
        )}
      </TicketList>
    </Wrapper>
  );
}

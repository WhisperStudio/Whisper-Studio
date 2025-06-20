// src/components/Tickets.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FiTrash2, FiCheckCircle } from "react-icons/fi";
import api from "../utils/api";

// Styled components
const TicketsContainer = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.cardBg};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow};
`;

const Title = styled.h2`
  margin-bottom: 16px;
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TicketItem = styled.div`
  padding: 12px;
  background-color: ${({ theme }) => theme.bodyBg};
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: ${({ theme }) => theme.inputFocus};
  }
`;

const TicketHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TicketDetail = styled.div`
  margin-top: 8px;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background-color: ${({ bgColor }) => bgColor || "#2563eb"};
  color: #fff;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
  }
`;

const Input = styled.input`
  padding: 6px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 4px;
  width: 100%;
  margin-top: 4px;
`;

const TextArea = styled.textarea`
  padding: 6px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 4px;
  width: 100%;
  margin-top: 4px;
  resize: vertical;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  z-index: 1500;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.cardBg};
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  position: relative;
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  position: absolute;
  right: 16px;
  top: 16px;
`;

const Label = styled.label`
  font-weight: 500;
  margin-top: 8px;
  display: block;
`;

const Select = styled.select`
  width: 100%;
  padding: 6px;
  border: 1px solid ${({ theme }) => theme.inputBorder};
  border-radius: 4px;
  margin-top: 4px;
`;

const StatusBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #fff;
  background-color: ${({ status }) => {
    if (status === "open") return "green";
    if (status === "pending") return "orange";
    if (status === "closed") return "red";
    return "#aaa";
  }};
`;

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState("");

  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/tickets");
      setTickets(res.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.reply || "");
  };

  const handleUpdateTicket = async () => {
    try {
      const updatePayload = {
        reply: replyText,
        status: selectedTicket.status
      };
      const res = await api.put(`/api/tickets/${selectedTicket._id}`, updatePayload);
      const updatedTicket = res.data;
      await fetchTickets();
      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    try {
      await api.delete(`/api/tickets/${ticketId}`);
      await fetchTickets();
      setSelectedTicket(null);
    } catch (error) {
      console.error("Error deleting ticket:", error);
    }
  };

  return (
    <TicketsContainer>
      <Title>Tickets</Title>
      <TicketList>
        {tickets.map((ticket) => (
          <TicketItem key={ticket._id} onClick={() => handleSelectTicket(ticket)}>
            <TicketHeader>
              <div>
                <strong>{ticket.name}</strong> ({ticket.email})
              </div>
              <div>
                Status: <StatusBadge status={ticket.status}>{ticket.status}</StatusBadge>
              </div>
            </TicketHeader>
            <TicketDetail>
              <em>
                Category: {ticket.category}
                {ticket.subCategory ? ` (${ticket.subCategory})` : ""}
              </em>
            </TicketDetail>
            <TicketDetail>
              {ticket.message.length > 60
                ? ticket.message.slice(0, 60) + "..."
                : ticket.message}
            </TicketDetail>
            {ticket.reply && (
              <TicketDetail>
                <strong>Reply:</strong> {ticket.reply.length > 60 ? ticket.reply.slice(0, 60) + "..." : ticket.reply}
              </TicketDetail>
            )}
          </TicketItem>
        ))}
      </TicketList>

      {selectedTicket && (
        <ModalOverlay onClick={() => setSelectedTicket(null)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <CloseButton onClick={() => setSelectedTicket(null)}>×</CloseButton>
            <h3>Ticket Details</h3>
            <p>
              <strong>Name:</strong> {selectedTicket.name} <br />
              <strong>Email:</strong> {selectedTicket.email} <br />
              <strong>Category:</strong> {selectedTicket.category} {selectedTicket.subCategory && `(${selectedTicket.subCategory})`}
            </p>
            <p>
              <strong>Message:</strong><br /> {selectedTicket.message}
            </p>
            <p>
              <strong>Status:</strong> <StatusBadge status={selectedTicket.status}>{selectedTicket.status}</StatusBadge>
            </p>
            {selectedTicket.reply && (
              <p>
                <strong>Existing Reply:</strong> {selectedTicket.reply}
              </p>
            )}
            <Label htmlFor="ticketStatus">Change Status:</Label>
            <Select
              id="ticketStatus"
              value={selectedTicket.status}
              onChange={(e) => setSelectedTicket({ ...selectedTicket, status: e.target.value })}
            >
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="closed">Closed</option>
            </Select>
            <Label htmlFor="ticketReply">Your Reply:</Label>
            <TextArea
              id="ticketReply"
              rows="4"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <ButtonGroup>
              <ActionButton bgColor="#2563eb" onClick={handleUpdateTicket}>
                <FiCheckCircle /> Oppdater
              </ActionButton>
              <ActionButton
                bgColor="#dc2626"
                onClick={() => handleDeleteTicket(selectedTicket._id)}
              >
                <FiTrash2 /> Slett
              </ActionButton>
            </ButtonGroup>
          </ModalContent>
        </ModalOverlay>
      )}
    </TicketsContainer>
  );
};

export default Tickets;

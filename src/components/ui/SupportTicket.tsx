import React, { useState } from 'react';
import { MessageSquare, Clock, CheckCircle, AlertTriangle, User } from 'lucide-react';
import Button from './Button';

interface SupportTicketProps {
  ticket: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  onUpdate?: (ticketId: string, updates: any) => void;
  isAdmin?: boolean;
}

const SupportTicket: React.FC<SupportTicketProps> = ({ ticket, onUpdate, isAdmin = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'in_progress':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStatusIcon(ticket.status)}
          <div>
            <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
            <p className="text-sm text-gray-500">#{ticket.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
            {ticket.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
            {ticket.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium mb-2">
          {ticket.category}
        </span>
        <p className={`text-gray-700 ${!isExpanded && 'line-clamp-2'}`}>
          {ticket.description}
        </p>
        {ticket.description.length > 100 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 text-sm mt-1"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          Created: {new Date(ticket.created_at).toLocaleDateString()}
        </div>
        <div>
          Updated: {new Date(ticket.updated_at).toLocaleDateString()}
        </div>
      </div>

      {isAdmin && onUpdate && (
        <div className="mt-4 flex space-x-2">
          {ticket.status === 'open' && (
            <Button
              size="sm"
              onClick={() => onUpdate(ticket.id, { status: 'in_progress' })}
            >
              Start Working
            </Button>
          )}
          {ticket.status === 'in_progress' && (
            <Button
              size="sm"
              onClick={() => onUpdate(ticket.id, { status: 'resolved' })}
            >
              Mark Resolved
            </Button>
          )}
          {ticket.status === 'resolved' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdate(ticket.id, { status: 'closed' })}
            >
              Close Ticket
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default SupportTicket;
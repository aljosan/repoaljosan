import React, { useState, useRef, useEffect } from 'react';
import { Group } from '../../types';
import { useGroups, useMembers } from '../../context/ClubContext';
import { Avatar } from '../ui/Avatar';
import Button from '../ui/Button';
import Icon from '../ui/Icon';

interface GroupChatProps {
  group: Group;
}

const GroupChat: React.FC<GroupChatProps> = ({ group }) => {
  const { users, currentUser } = useMembers();
  const { addMessageToGroup } = useGroups();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [group.messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      addMessageToGroup(group.id, message.trim());
      setMessage('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="text-xl font-bold">{group.name}</h3>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {group.messages.map(msg => {
          const sender = users.find(u => u.id === msg.userId);
          const isMe = sender?.id === currentUser.id;
          return (
            <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && sender && <Avatar user={sender} size="sm" />}
              <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ${isMe ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-200' : 'text-gray-500'}`}>
                    {!isMe ? `${sender?.name.split(' ')[0]} at ` : ''}
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center gap-3">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <Button type="submit" className="rounded-full !p-3">
          <Icon name="send" className="w-5 h-5" />
        </Button>
      </form>
    </div>
  );
};

export default GroupChat;

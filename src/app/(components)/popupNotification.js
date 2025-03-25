// PopupNotification.js
import React from 'react';

const PopupNotification = ({ message, type, onClose }) => {
  if (!message) return null;

  // Styling based on the type of message (success, error, etc.)
  const backgroundColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded-md shadow-lg ${backgroundColor} text-white`}
    >
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button onClick={onClose} className="text-white font-bold">X</button>
      </div>
    </div>
  );
};

export default PopupNotification;

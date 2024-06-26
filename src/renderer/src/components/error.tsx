/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import React from 'react';
import useErrorStore from '../store/errorStore';

const ErrorDialog: React.FC = () => {
  const errorStore = useErrorStore((state) => state);

  if (!errorStore.pending) {
    return null;
  }

  return (
    <div className="alert alert-danger alert-popup" role="alert">
      <audio autoPlay>
        <source src="/alert.mp3" type="audio/mp3"></source>
      </audio>
      <div style={{ float: 'left' }}>
        {errorStore.messages.map((error, index) => (
          <div key={index}>
            [{error.timestamp}] {error.message}
          </div>
        ))}
      </div>

      <button
        className="btn btn-danger"
        style={{ float: 'right' }}
        onClick={() => {
          errorStore.acknowledge();
        }}
      >
        X
      </button>
    </div>
  );
};

export default ErrorDialog;

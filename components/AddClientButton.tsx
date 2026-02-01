'use client';

import { useState } from 'react';
import AddClientModal from './AddClientModal';
import { useRouter } from 'next/navigation';

export default function AddClientButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh(); // Refresh the page to show new client
  };

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all duration-300 border border-white/10 hover:border-white/20 backdrop-blur-xl hover:scale-105" 
        style={{ fontFamily: 'Inria Sans, sans-serif', fontWeight: '300' }}
      >
        + Add Client
      </button>

      <AddClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

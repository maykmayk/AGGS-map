import { useEffect, useState } from 'react';

export default function MobileCheck() {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setShowWarning(!isMobile);
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md mx-4">
        <h2 className="text-xl font-bold mb-4">Avviso</h2>
        <p className="mb-4">
          Questa applicazione è ottimizzata per dispositivi mobili. Per una migliore esperienza,
          ti consigliamo di accedervi dal tuo smartphone.
        </p>
        <button
          onClick={() => setShowWarning(false)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
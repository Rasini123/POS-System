 
import { useState, useEffect } from 'react';
import { invoiceService } from '../services/POS/invoiceService';

export const useAuthenticatedImage = (imageUrl) => {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImage = async () => {
      if (!imageUrl) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await invoiceService.getInvoiceImage();
        setImageData(data);
      } catch (err) {
        setError(err);

      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageUrl]);

  return { imageData, loading, error };
};
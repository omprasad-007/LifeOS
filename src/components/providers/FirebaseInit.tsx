'use client';

import { useEffect } from 'react';
import { app } from '@/lib/firebase';

export default function FirebaseInit() {
  useEffect(() => {
    // Access app to guarantee initialization on client mount
    if (app) {
      // Firebase ready
    }
  }, []);

  return null;
}

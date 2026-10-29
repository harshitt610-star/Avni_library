'use client';

import React, { Suspense } from 'react';
import LoginPage from '../login/page';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}

'use client';

import Providers from './providers';
import AdminView from './components/AdminView';

export default function Home() {
  return (
    <Providers>
      <AdminView />
    </Providers>
  );
}

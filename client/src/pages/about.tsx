import React from 'react';
import Link from 'next/link';

export default function About() {
  return (
    <div>
      About page
      <Link href="/">
        <a>Home</a>
      </Link>
    </div>
  );
}

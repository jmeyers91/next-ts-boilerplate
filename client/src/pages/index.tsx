import React from 'react';
import Link from 'next/link';
import styled from '../styled';

export default function IndexPage() {
  return (
    <Root>
      Index page
      <Link href="/about">
        <a>About</a>
      </Link>
    </Root>
  );
}

const Root = styled('div')<{ color?: string }>`
  background-color: ${props => props.color || 'red'};
`;

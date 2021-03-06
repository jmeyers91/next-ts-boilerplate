import React from 'react';
import Link from 'next/link';
import styled from '../styled';
import imageSrc from '../assets/images/cat.jpg';

export default function IndexPage() {
  return (
    <Root>
      Index page
      <Link href="/about">
        <a>About</a>
      </Link>
      <div>Cat:</div>
      <img src={imageSrc} />
    </Root>
  );
}

const Root = styled('div')<{ color?: string }>`
  background-color: ${props => props.color || 'red'};
`;

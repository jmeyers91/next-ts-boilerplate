import React from 'react';
import Link from 'next/link';
import styled from '../styled';

const imageSrc = require('../assets/images/cat.jpg');

export default function IndexPage() {
  return (
    <Root>
      Index page
      <Link href="/about">
        <a>About</a>
      </Link>
      <img src={imageSrc} />
    </Root>
  );
}

const Root = styled('div')<{ color?: string }>`
  background-color: ${props => props.color || 'red'};
`;

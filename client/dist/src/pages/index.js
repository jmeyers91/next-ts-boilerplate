import React from 'react';
import Link from 'next/link';
import styled from '../styled';
export default function IndexPage() {
    return (React.createElement(Root, null,
        "Index page",
        React.createElement(Link, { href: "/about" },
            React.createElement("a", null, "About"))));
}
const Root = styled('div') `
  background-color: ${props => props.color || 'red'};
`;
//# sourceMappingURL=index.js.map
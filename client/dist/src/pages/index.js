import React from 'react';
import Link from 'next/link';
import styled from '../styled';
const imageSrc = require('../assets/images/cat.jpg');
export default function IndexPage() {
    return (React.createElement(Root, null,
        "Index page",
        React.createElement(Link, { href: "/about" },
            React.createElement("a", null, "About")),
        React.createElement("img", { src: imageSrc })));
}
const Root = styled('div') `
  background-color: ${props => props.color || 'red'};
`;
//# sourceMappingURL=index.js.map
// TicketingIframe.js
import React from 'react';
import styled from 'styled-components';

const Iframe = styled.iframe`
  position: fixed;
  bottom: 20px;
  right: 20px;
  border: none;
  width: 400px;
  height: 600px;
  z-index: 9999;
`;

const TicketingIframe = () => (
  <Iframe
    src="https://bifrost-beta.vercel.app/"
    title="Ticketing System"
  />
);

export default TicketingIframe;

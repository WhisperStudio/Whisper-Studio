import React from 'react';
import styled from 'styled-components';
import BugReport from '../components/BugReport';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #152238 0%, #0a0f1a 100%);
  padding: 2rem 1rem;
`;

const BugReportPage = () => {
  return (
    <PageContainer>
      <BugReport />
    </PageContainer>
  );
};

export default BugReportPage;

import React from 'react';
import logoImage from './images/logo.jpeg';

const CRMSLogo = ({ className = "w-14 h-14" }) => (
  <img 
    src={logoImage}
    alt="CRMS Logo"
    className={className}
    style={{ objectFit: 'contain' }}
  />
);

export default CRMSLogo;

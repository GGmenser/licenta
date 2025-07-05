import React from 'react';
import Test from '../pages/test';
import {Link, useMatch, useResolvedPath} from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
  
    <footer>
      <Link to="/test">Test</Link>
    </footer>
  )
}

export default Footer

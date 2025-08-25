import React, { useState } from "react";
import "./Navbar.css";
import { Link, useMatch, useResolvedPath } from "react-router-dom";
import Product from "../pages/Product";

function Navbar() {
  function showSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.display = "flex";
  }

  function closeSidebar() {
    const sidebar = document.querySelector(".sidebar");
    sidebar.style.display = "none";
  }
  return (
    <header>
      <div className="logo">
        <Link to="/" className="logo">
          Monochrome
        </Link>
      </div>
      <ul className="sidebar">
        <li>
          <Link to="/product">Our Product</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
        <li>
          <Link to="/test">test</Link>
        </li>
        <li>
          <Link to="/contact">Contact</Link>
        </li>
        <li onClick={closeSidebar}>
          <a href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </a>
        </li>
      </ul>
      <ul>
        <li className="hide">
          <Link to="/product">Our Product</Link>
        </li>
        <li className="hide">
          <Link to="/about">About</Link>
        </li>
        <li className="hide">
          <Link to="/test">Test</Link>
        </li>
        <li className="hide" style={{ marginRight: 30 }}>
          <Link to="/contact">Contact</Link>
        </li>
        <li
          className="hideSidebar"
          style={{ marginRight: 30 }}
          onClick={showSidebar}
        >
          <a href="#">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              viewBox="0 -960 960 960"
              width="24px"
              fill="#e3e3e3"
            >
              <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
            </svg>
          </a>
        </li>
      </ul>
    </header>
  );
}

export default Navbar;

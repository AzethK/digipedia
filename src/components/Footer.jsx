import React from "react";
import githubIcon from "../assets/github.svg";
import linkedinIcon from "../assets/linkedin.svg";
import dapiIcon from "../assets/dapi.png";

const Footer = () => {
  return (
    <div className="footer">
      <a href="https://github.com/AzethK/digipedia" target="_blank">
        <img src={githubIcon} alt="GitHub" className="footer-icon" />
      </a>
      <a href="https://www.linkedin.com/in/douglas-ruiz-souta/" target="_blank">
        <img src={linkedinIcon} alt="LinkedIn" className="footer-icon" />
      </a>
      <a href="https://digi-api.com/" target="_blank">
        <img src={dapiIcon} alt="DAPI" className="footer-icon" />
      </a>
    </div>
  );
};

export default Footer;

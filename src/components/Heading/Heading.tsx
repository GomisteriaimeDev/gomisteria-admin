import React from 'react';
import './Heading.scss'; // Assuming your SASS file is named Heading.scss

const Heading = ({ level, text, bold }:any) => {
  const HeadingTag:any = `h${level}`; // Dynamically set the heading tag based on the level prop
  
  return (
    <HeadingTag className={bold ? 'bold' : ''}>{text}</HeadingTag>
  );
};

export default Heading;

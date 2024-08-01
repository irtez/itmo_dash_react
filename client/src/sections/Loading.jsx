import React from 'react';
import './styles/sections.css'


const Loading = (props) => {
  const height = props.height || '100vh'
  const marginTop = props.marginTop || '0'
  const spinnerSize = props.spinnerSize || '7em'
  return (
    <section id="loading" style={{height: height, marginTop: marginTop}}> 
        <div className="spinner" style={{height: spinnerSize, width: spinnerSize}}>
            <div className="circle"></div>
        </div>
    </section>
  );
};

export default Loading;
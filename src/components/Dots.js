import React, { Component } from 'react';

class Dots extends Component {
  render() {
    const _self=this;
    const data = this.props.data;
    const circles=data.map(function(d,i){
      return (
        <circle className="dot" 
                r="5" 
                cx={_self.props.x(d.date)} 
                cy={_self.props.y(d.close)} 
                fill={(_self.props.dotActive === i) ? _self.props.fillColor : "transparent"}
                key={i} />
      );
    });
    return(
        <g>
          {circles}
        </g>
    );
  }
}

export default Dots;
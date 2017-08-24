import React, { Component } from 'react';

class ToolTip extends Component {
  render() {
    const points = this.props.tooltip.data;
    let visibility="hidden";
    let transform="";
    let x=0;
    let y=0;
    const width=200,height=points.length * 30 + 20;
    const transformText='translate(15,15)';
    let transformArrow="";

    if(this.props.tooltip.display===true){
        var position = this.props.tooltip.pos;

        x= position.x + width/2;
        y= position.y + height;
        visibility="visible";

        if(x > width + 20){
            transform='translate(' + (x-width*3/2 - 10) + ',' + (y-height-30) + ')';
            transformArrow='translate('+(width - 21)+','+(height/2)+') rotate(-90,20,0)';
        } else if(x < width +20){
            transform='translate('+(position.x + 10)+',' + (y-height-30) + ')';
            transformArrow='translate(-20,'+(height/2)+') rotate(90,20,0)';
        }

    } else{
        visibility="hidden";
    }

    let textPoints = [];
    let pointsDate = "";
    let indexOffset = 0;
    if(points.length > 0) {
      textPoints = points.map(function(point,i){
        if(point !== null)
        {
          pointsDate = point.point.day;
          let textOffset = 20;
          if (indexOffset !== 0) {
            textOffset = (indexOffset + 1) * 20;
          }
          indexOffset++;
          return (
            <g key={i} transform={"translate(0,"+ textOffset +")"}>
              <circle r="5" cx={0} cy={0} fill={point.color} stroke='black'/>
              <text is x="10" y={5} text-anchor="start"  font-size="15px" fill="#a9f3ff">
                {point.code + ': ' + point.point.close}
              </text>
            </g>
          );  
        }
        return null;  
      });
    }
    return (
        <g transform={transform}>
            <rect class="shadow" is width={width} height={height} rx="5" ry="5" visibility={visibility} fill="#6391da" opacity=".9"/>
            <polygon class="shadow" is points="10,0  30,0  20,10" transform={transformArrow}
                     fill="#6391da" opacity=".9" visibility={visibility}/>
            <g is visibility={visibility} transform={transformText}>
              <text is x={width/2-10} y="5" text-anchor="middle" font-size="15px" fill="#fff" stroke="#fff">{pointsDate}</text>
              {textPoints}
            </g>
        </g>
    );
  }
}

export default ToolTip;
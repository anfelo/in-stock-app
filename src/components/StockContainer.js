import React from 'react';

// Component Imports
import Stock from './Stock';

const StocksContianer = props => {
  const stocks = props.data.map(function(stock,i){
    return <Stock name={stock.name} code={stock.code} key={i} index={i} onRemoveStock={props.onRemoveStock}/>
  });
  return (
    <div className="stocks-container">
      {stocks}
    </div>
  );
}

export default StocksContianer;
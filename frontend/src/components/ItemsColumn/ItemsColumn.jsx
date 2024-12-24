import React from 'react';
// import React, { useContext, useEffect, useState } from 'react';
// import ItemsService from "../../services/ItemsService";

// import { Context } from "../../index";


function ItemsColumn( {items} ){
  return (
    <div>
      {items.map(item => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
          <p>Status: {item.status}</p>
        </div>
      ))}
    </div>
  );
}

export default ItemsColumn;
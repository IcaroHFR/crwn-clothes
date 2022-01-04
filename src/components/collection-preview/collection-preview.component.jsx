import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import CollectionItem from '../collection-item/collection-item.component';

import './collection-preview.styles.scss';

const CollectionPreview = ({ title, items, history, match }) => {
  let location = useLocation();
  let navigate = useNavigate();
  return(
    <div className='collection-preview'>
      <h1
        className='title'
        onClick={() => navigate(`${location.pathname}/${title.toLowerCase()}`)}
      >
        {title.toUpperCase()}
      </h1>
      <div className='preview'>
        {items
          .filter((item, idx) => idx < 4)
          .map(item => (
            <CollectionItem key={item.id} item={item} />
          ))}
      </div>
    </div>
  );
}

export default CollectionPreview;
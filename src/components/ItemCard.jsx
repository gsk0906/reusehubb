import React from 'react';
import { Link } from 'react-router-dom';
import ItemImage from './ItemImage';
import StatusBadge from './StatusBadge';
import { formatPrice } from '../utils/format';

const ItemCard = ({ item }) => {
  const {
    _id,
    id,
    title,
    price,
    category,
    condition,
    isSold,
    status,
    imageUrl,
    image,
    seller,
  } = item;

  const itemId = _id || id;
  const isItemSold = isSold || (typeof status === 'string' && status.toLowerCase() === 'sold');
  const displayStatus = isItemSold ? 'Sold' : 'Available';

  const sellerName = typeof seller === 'object' ? seller?.name : 'Campus Student';
  const sellerDept = typeof seller === 'object' ? seller?.department || seller?.hostel : null;

  return (
    <article className={`item-card ${isItemSold ? 'is-sold' : ''}`}>
      <Link to={`/items/${itemId}`} className="item-card-link">
        <div className="item-card-media">
          <ItemImage
            src={imageUrl || image}
            alt={title}
            className="item-card-img"
          />
          <div className="item-card-badges">
            <StatusBadge status={displayStatus} size="small" />
            {condition && <StatusBadge status={condition} size="small" />}
          </div>
          {isItemSold && <div className="sold-overlay">SOLD</div>}
        </div>

        <div className="item-card-content">
          <div className="item-card-meta-top">
            <span className="item-category-tag">{category || 'General'}</span>
            <span className="item-price">
              {formatPrice(price)}
            </span>
          </div>

          <h3 className="item-card-title" title={title}>
            {title}
          </h3>

          <div className="item-card-footer">
            <div className="seller-brief">
              <span className="seller-avatar-tiny" aria-hidden="true">
                {sellerName.charAt(0).toUpperCase()}
              </span>
              <span className="seller-name">{sellerName}</span>
              {sellerDept && <span className="seller-dept">• {sellerDept}</span>}
            </div>
            <span className="view-details-arrow">View →</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ItemCard;

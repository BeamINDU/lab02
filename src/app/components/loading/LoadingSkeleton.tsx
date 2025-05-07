import React from 'react';
// import Skeleton from 'react-loading-skeleton';

const LoadingSkeleton = () => {
    return (
      <div className="skeleton-container">
        <div className="skeleton skeleton-circle"></div> {/* Profile Picture */}
        <div className="skeleton skeleton-text"></div> {/* Name */}
        <div className="skeleton skeleton-text"></div> {/* Bio */}
      </div>
    );
  };

export default LoadingSkeleton;
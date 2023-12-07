import React, { useCallback, useState } from 'react';
import './Card.css'; // Import the CSS file for styles
import moment from 'moment';
import AttendanceListComponent from '../../../components/AttendanceListComponent';
// Material Icons can be imported using Material-UI or similar libraries
import { EventAvailable, EventBusy, LocationOn, Tag } from '@mui/icons-material'; 

export default function Card({
  name,
  source,
  projectPrice,
  startDate,
  endDate,
  location,
  attendees, 
  projectId,
  isFirst
}) {
  // Define state and functions to manage animations and styles (if needed)

  const formatMomentDate = (dateString) => {
    return dateString ? moment.utc(dateString).format("DD/MM/YY, (ddd), hh:mm A,") + " UTC+8" : "N/A";
  };

  return (
    <div className={`card-container ${isFirst ? 'first-card' : ''}`}>
      <img src={source} alt={name} className="card-image" />
      {isFirst && (
        <div className="details-container">
          <div className="item">
            <span className="name">{name}</span>
          </div>

          <div className="item">
            <EventAvailable style={{ fontSize: 25 }} />
            <span className="label">Start:</span>
            <span className="value">{formatMomentDate(startDate)}</span>
          </div>

          <div className="item">
            <EventBusy style={{ fontSize: 25 }} />
            <span className="label">End:</span>
            <span className="value">{formatMomentDate(endDate)}</span>
          </div>

          <div className="item">
            <LocationOn style={{ fontSize: 25 }} />
            <span className="value">{location}</span>
          </div>

          <div className="item">
            <Tag style={{ fontSize: 25 }} />
            <span className="value">{`RM ${projectPrice}`}</span>
          </div>

          <AttendanceListComponent projectId={projectId} isCompact={true} />

        </div>
      )}

    </div>
  );
}

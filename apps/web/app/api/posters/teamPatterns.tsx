import React from 'react';

export function getTeamBackground(
  code: string,
  side: 'left' | 'right',
  primary: string,
  secondary: string
) {
  const isLeft = side === 'left';
  
  if (code === 'AR') {
    // Argentina - Light blue and white vertical stripes
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{ flex: 1, backgroundColor: primary }} />
        <div style={{ flex: 1, backgroundColor: secondary }} />
        <div style={{ flex: 1, backgroundColor: primary }} />
        <div style={{ flex: 1, backgroundColor: secondary }} />
        <div style={{ flex: 1, backgroundColor: primary }} />
      </div>
    );
  }

  if (code === 'BR') {
    // Brazil - Green with yellow geometric shapes (diamond style)
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', position: 'relative', backgroundColor: primary, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: isLeft ? -100 : 500,
          left: isLeft ? -200 : 100,
          width: 800,
          height: 800,
          backgroundColor: secondary,
          transform: 'rotate(45deg)',
          opacity: 0.9,
          display: 'flex'
        }} />
      </div>
    );
  }
  
  if (code === 'HR') {
    // Croatia - Red and white checkers (approximated with repeating divs)
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', height: '100%', backgroundColor: secondary }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} style={{ display: 'flex', width: '100%', height: '10%' }}>
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} style={{ flex: 1, backgroundColor: (i + j) % 2 === 0 ? primary : secondary }} />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (code === 'FR' || code === 'IT') {
    // Solid with a side stripe
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: primary, position: 'relative' }}>
         <div style={{
          position: 'absolute',
          top: 0,
          [isLeft ? 'right' : 'left']: 0,
          width: 40,
          height: '100%',
          backgroundColor: secondary,
          opacity: 0.8,
          display: 'flex'
        }} />
      </div>
    );
  }

  // Default: solid primary color
  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100%', 
      backgroundColor: primary 
    }} />
  );
}

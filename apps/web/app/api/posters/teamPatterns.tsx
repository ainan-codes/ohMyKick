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

  if (code === 'PT') {
    // Portugal - Split roughly 40/60
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%' }}>
        <div style={{ width: '40%', height: '100%', backgroundColor: primary }} />
        <div style={{ width: '60%', height: '100%', backgroundColor: secondary }} />
      </div>
    );
  }

  if (code === 'DE') {
    // Germany - Horizontal stripes (black, red, yellow)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <div style={{ width: '100%', height: '33.3%', backgroundColor: primary }} />
        <div style={{ width: '100%', height: '33.3%', backgroundColor: secondary }} />
        <div style={{ width: '100%', height: '33.4%', backgroundColor: '#FFCC00' }} />
      </div>
    );
  }

  if (code === 'ES') {
    // Spain - Thick horizontal yellow stripe
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <div style={{ width: '100%', height: '25%', backgroundColor: primary }} />
        <div style={{ width: '100%', height: '50%', backgroundColor: secondary }} />
        <div style={{ width: '100%', height: '25%', backgroundColor: primary }} />
      </div>
    );
  }

  if (code === 'GB_ENG') {
    // England - Red cross on white background
    return (
      <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: secondary, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', top: 0, bottom: 0, width: '20%', backgroundColor: primary }} />
        <div style={{ position: 'absolute', left: 0, right: 0, height: '20%', backgroundColor: primary }} />
      </div>
    );
  }

  // Default: A dynamic dual-color angled split that works beautifully for any country
  return (
    <div style={{ 
      display: 'flex', 
      width: '100%', 
      height: '100%', 
      backgroundColor: primary,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: -200,
        bottom: -200,
        [isLeft ? 'right' : 'left']: '40%',
        width: '150%',
        backgroundColor: secondary,
        transform: isLeft ? 'rotate(-25deg)' : 'rotate(25deg)',
        opacity: 0.85,
        display: 'flex'
      }} />
    </div>
  );
}

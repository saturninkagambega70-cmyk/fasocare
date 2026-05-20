import React, { memo } from 'react';
import Svg, { Path, G, Circle } from 'react-native-svg';

export const FasoCareIcon = memo(({ size = 24, color = '#0d6e3f' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityRole="image" accessibilityLabel="FasoCare">
    <Circle cx="12" cy="12" r="11" stroke={color} strokeWidth="2" />
    <G transform="translate(4, 4)">
      <Path d="M8 0V16M0 8H16" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </G>
    <Path d="M12 9L13 11H15L13.5 12.5L14 14.5L12 13.5L10 14.5L10.5 12.5L9 11H11L12 9Z" fill="#ef4444" />
  </Svg>
));

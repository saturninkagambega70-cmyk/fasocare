import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';

export default function SkeletonLoader({ count = 3, style }) {
  const opAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={[{ paddingHorizontal: 20 }, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <Animated.View key={i} style={[skeletonCard, { opacity: opAnim }]}>
          <View style={skeletonAvatar} />
          <View style={{ flex: 1 }}>
            <View style={skeletonLine} />
            <View style={[skeletonLine, { width: '60%', marginTop: 8 }]} />
          </View>
        </Animated.View>
      ))}
    </View>
  );
}

const skeletonCard = {
  flexDirection: 'row',
  padding: 20,
  borderRadius: 24,
  marginBottom: 12,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#e2e8f0',
};

const skeletonAvatar = {
  width: 50,
  height: 50,
  borderRadius: 16,
  backgroundColor: '#e2e8f0',
  marginRight: 15,
};

const skeletonLine = {
  height: 12,
  backgroundColor: '#cbd5e1',
  borderRadius: 6,
};

import React, { useEffect, useRef } from 'react';
import {
  ViewStyle,
  StyleSheet,
  DimensionValue,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

type SkeletonBoxProps = {
  width: DimensionValue;
  height: DimensionValue;
  radius?: number;
  style?: ViewStyle;
};

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  radius = 8,
  style,
}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius: radius,
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.25)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2b4a5a',
    overflow: 'hidden',
  },
});

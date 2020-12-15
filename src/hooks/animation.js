import React from 'react';
import { Animated, StyleSheet } from 'react-native';

import { complement } from '../utils/arr';

const animationConfig = {
  useNativeDriver: true,
  friction: 8
};

const styles = StyleSheet.create({
  top: {
    top: 0
  },
  bottom: {
    bottom: 0
  }
});

function getStyle(state, animatedValue) {
  const {
    position,
    topOffset,
    bottomOffset,
    keyboardOffset,
    keyboardHeight,
    height
  } = state;
  const isBottom = position === 'bottom';
  const offset = isBottom ? bottomOffset : topOffset;
  const range = [-(height * 1.5), offset, keyboardOffset + keyboardHeight];

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: isBottom ? complement(range) : range
  });

  return {
    ...styles[position],
    transform: [{ translateY }]
  };
}

function useAnimation(state) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const animate = ({ toValue }) => {
    return new Promise((resolve) => {
      Animated.spring(animatedValue, {
        ...animationConfig,
        toValue
      }).start(() => resolve());
    });
  };

  const animationStyle = getStyle(state, animatedValue);

  return {
    animate,
    animationStyle
  };
}

export { useAnimation };

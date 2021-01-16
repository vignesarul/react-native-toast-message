import React from 'react';
import { PanResponder, Animated } from 'react-native';

import { isIOS } from '../utils/platform';

function useSwipeToDismiss(animatedValue, state) {
  const swipeUp = (dy) => animatedValue.setValue(1 + dy / 100);
  const swipeDown = (dy) => animatedValue.setValue(1 - dy / 100);

  const move = (gesture) => {
    const { position, keyboardVisible } = state;
    const { dy } = gesture;
    console.log(dy, gesture);
    const swipe = position === 'bottom' ? swipeDown : swipeUp;
    swipe(dy);
  };

  const release = () => {};

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (event, gesture) => {
        const { dx, dy } = gesture;
        // Fixes onPress handler https://github.com/calintamas/react-native-toast-message/issues/113
        return Math.abs(dx) > 1 || Math.abs(dy) > 1;
      },
      onPanResponderGrant: () => {
        console.log('grant');
        animatedValue.setOffset(animatedValue._value);
        animatedValue.setValue(0);
      },
      onPanResponderMove: Animated.event([null, { dy: animatedValue }], {
        useNativeDriver: false
      }),
      onPanResponderRelease: (event, gesture) => {
        const { vy } = gesture;
        animatedValue.flattenOffset();

        Animated.spring(animatedValue, {
          offset: state.topOffset,
          velocity: vy,
          useNativeDriver: true
        }).start();
      }
    })
  ).current;

  return {
    panResponder
  };
}

export { useSwipeToDismiss };

import React from 'react';
import { Animated, PanResponder, ViewPropTypes, Keyboard } from 'react-native';
import PropTypes from 'prop-types';

import { SuccessToast, ErrorToast, InfoToast } from './components';
import { useSimpleReducer, useAnimation, useConfig } from './hooks';
import { isFunc } from './utils/type';
import styles from './styles';

const initialState = {
  // config
  topOffset: 30,
  bottomOffset: 40,
  keyboardOffset: 15,
  height: 60,
  position: 'top',
  type: 'success',
  visibilityTime: 4000,
  autoHide: true,

  // meta
  isVisible: false,
  keyboardHeight: 0,
  keyboardVisible: false,

  // content
  text1: '',
  text2: '',
  customProps: {},

  // callbacks
  onPress: undefined
};

function Toast(props, ref) {
  const {
    style,
    topOffset,
    bottomOffset,
    keyboardOffset,
    visibilityTime,
    autoHide,
    height,
    position,
    type
  } = props;
  const [state, updateState] = useSimpleReducer({
    ...initialState,
    topOffset,
    bottomOffset,
    keyboardOffset,
    visibilityTime,
    autoHide,
    height,
    position,
    type
  });
  const { animate, animationStyle } = useAnimation(state);

  console.log({
    isVisible: state.isVisible,
    type: state.type
  });

  const onLayout = (e) =>
    updateState({
      height: e.nativeEvent.layout.height
    });

  const hide = async ({ onHide } = {}) => {
    updateState({
      isVisible: false
    });
    await animate({ toValue: 0 });
    if (isFunc(onHide)) {
      onHide();
    }
  };

  const show = async ({ onShow, ...rest } = {}) => {
    const { isVisible, height } = state;
    if (isVisible) {
      await hide();
    }
    updateState({
      ...initialState,
      /*
          Preserve the previously computed height (via onLayout).
          If the height of the component corresponding to this `show` call is different,
          onLayout will be called again and `height` state will adjust.

          This fixes an issue where a succession of calls to components with custom heights (custom Toast types)
          fails to hide them completely due to always resetting to the default component height
      */
      height,
      ...rest, // TODO make sure only allowed options are set on state
      ...(rest?.props ? { customProps: rest.props } : {}),
      isVisible: true
    });
    await animate({ toValue: 1 });
    if (isFunc(onShow)) {
      onShow();
    }
  };

  React.useImperativeHandle(ref, () => ({
    show,
    hide
  }));

  const { renderContent } = useConfig({
    props,
    state,
    show,
    hide
  });

  return (
    <Animated.View
      onLayout={onLayout}
      style={[styles.base, animationStyle, style]}
      // {...this.panResponder.panHandlers}
    >
      {renderContent()}
    </Animated.View>
  );
}

Toast = React.forwardRef(Toast);

Toast.propTypes = {
  config: PropTypes.objectOf(PropTypes.func),
  style: ViewPropTypes.style,
  topOffset: PropTypes.number,
  bottomOffset: PropTypes.number,
  keyboardOffset: PropTypes.number,
  visibilityTime: PropTypes.number,
  autoHide: PropTypes.bool,
  height: PropTypes.number,
  position: PropTypes.oneOf(['top', 'bottom']),
  type: PropTypes.string
};

Toast.defaultProps = {
  config: {},
  style: undefined,
  topOffset: initialState.topOffset,
  bottomOffset: initialState.bottomOffset,
  keyboardOffset: initialState.keyboardOffset,
  visibilityTime: initialState.visibilityTime,
  autoHide: initialState.autoHide,
  height: initialState.height,
  position: initialState.position,
  type: initialState.type
};

Toast.setRef = (ref) => (Toast._ref = ref);
Toast.show = (options) => Toast._ref.show(options);
Toast.hide = (options) => Toast._ref.hide(options);

export default Toast;

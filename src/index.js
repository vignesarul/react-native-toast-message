import React from 'react';
import { Animated, PanResponder, ViewPropTypes, Keyboard } from 'react-native';
import PropTypes from 'prop-types';

import { SuccessToast, ErrorToast, InfoToast } from './components';
import { complement } from './utils/arr';
import { useSimpleReducer } from './hooks';
import styles from './styles';

const animationConfig = {
  useNativeDriver: true,
  friction: 8
};

const defaultConfig = {
  success: ({ hide, ...rest }) => (
    <SuccessToast {...rest} onTrailingIconPress={hide} />
  ),
  error: ({ hide, ...rest }) => (
    <ErrorToast {...rest} onTrailingIconPress={hide} />
  ),
  info: ({ hide, ...rest }) => (
    <InfoToast {...rest} onTrailingIconPress={hide} />
  )
};

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
  onPress: undefined,
  onShow: undefined,
  onHide: undefined
};

function getBaseStyle(state, animatedValue) {
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
  const range = [height + 5, -offset, -(keyboardOffset + keyboardHeight)];

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: isBottom ? range : complement(range)
  });

  return [
    styles.base,
    styles[position],
    {
      transform: [{ translateY }]
    }
  ];
}

function Toast(
  {
    config: customConfig,
    style,
    topOffset,
    bottomOffset,
    keyboardOffset,
    visibilityTime,
    autoHide,
    height,
    position,
    type
  },
  ref
) {
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
  console.log({
    isVisible: state.isVisible
  });
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  const config = React.useMemo(
    () => ({
      ...defaultConfig,
      ...customConfig
    }),
    [customConfig]
  );

  const onLayout = (e) =>
    updateState({
      height: e.nativeEvent.layout.height
    });

  const animate = ({ toValue }) => {
    return new Promise((resolve) => {
      Animated.spring(animatedValue, {
        ...animationConfig,
        toValue
      }).start(() => resolve());
    });
  };

  const setOptions = (options) => {
    const { height } = state;
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
      ...options, // TODO make sure only allowed options are set on state
      ...(options?.props ? { customProps: options.props } : {})
    });
  };

  const hide = async () => {
    updateState({
      isVisible: false
    });
    await animate({ toValue: 0 });
  };

  const show = async (options) => {
    const { isVisible } = state;
    if (isVisible) {
      await hide();
    }
    setOptions(options);
    updateState({
      isVisible: true
    });
    await animate({ toValue: 1 });
  };

  React.useImperativeHandle(ref, () => ({
    show,
    hide
  }));

  const renderContent = () => {
    const renderFunc = config[type];
    if (!renderFunc) {
      // eslint-disable-next-line no-console
      console.error(
        `Type '${type}' does not exist. Make sure to add it to your 'config'. 
        You can read the documentation here: https://github.com/calintamas/react-native-toast-message/blob/master/README.md`
      );
      return null;
    }
    return renderFunc({
      ...state,
      props: { ...state.customProps },
      hide,
      show
    });
  };

  const baseStyle = getBaseStyle(state, animatedValue);

  return (
    <Animated.View
      onLayout={onLayout}
      style={[baseStyle, style]}
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

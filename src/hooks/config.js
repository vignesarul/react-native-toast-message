import React from 'react';

import { SuccessToast, ErrorToast, InfoToast } from '../components';

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

function useConfig({ props, state, show, hide }) {
  const { config: customConfig } = props;

  const config = React.useMemo(
    () => ({
      ...defaultConfig,
      ...customConfig
    }),
    [customConfig]
  );

  const renderContent = () => {
    const renderFunc = config[state.type];
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

  return {
    renderContent,
    config
  };
}

export { useConfig };

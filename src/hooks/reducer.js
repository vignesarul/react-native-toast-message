import { useCallback, useReducer } from 'react';

const reducer = (state, action) => {
  switch (action.type) {
    case 'update':
      return { ...state, ...action.payload };
    default:
      throw new Error();
  }
};

function useSimpleReducer(initialState) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateState = useCallback(
    (payload) =>
      dispatch({
        type: 'update',
        payload
      }),
    []
  );

  return [state, updateState];
}

export { useSimpleReducer };

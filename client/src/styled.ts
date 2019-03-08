import * as styledComponents from 'styled-components';

const {
  default: styled,
  css,
  createGlobalStyle,
  keyframes,
  ThemeProvider,
} = styledComponents as styledComponents.ThemedStyledComponentsModule<{}>;

export { css, createGlobalStyle, keyframes, ThemeProvider };
export default styled;

import { useContext } from 'react';
import { ThemeContext } from './themeCore';

export const useTheme = () => useContext(ThemeContext);

export default useTheme;

/* eslint-disable no-undef */
/**
 * @format
 */

import {AppRegistry, Text, TextInput} from 'react-native';
import App from './App';
import {name as appName} from './app.json';



if(TextDefaultProps) {
  Text.defaultProps.allowFontScaling = false;
}else{
    Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;

}

if(TextInputDefaultProps) {
  TextInput.defaultProps.allowFontScaling = false;
}
else{
    TextInput.defaultProps = {};
    TextInput.defaultProps.allowFontScaling = false;

}

AppRegistry.registerComponent(appName, () => App);

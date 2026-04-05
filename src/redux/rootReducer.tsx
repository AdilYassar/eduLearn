import { combineReducers } from 'redux';
import chatReducer from './reducers/chatSlice';
import themeReducer from './reducers/themeSlice';
import socialReducer from './reducers/socialSlice';

const rootReducer = combineReducers({
    chat: chatReducer,
    theme: themeReducer,
    social: socialReducer,
});

export default rootReducer;

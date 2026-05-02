import { combineReducers } from 'redux';
import chatReducer from './reducers/chatSlice';
import themeReducer from './reducers/themeSlice';
import socialReducer from './reducers/socialSlice';
import timelineReducer from './reducers/timelineSlice';
import adminReducer from './reducers/adminSlice';

const rootReducer = combineReducers({
    chat: chatReducer,
    theme: themeReducer,
    social: socialReducer,
    timeline: timelineReducer,
    admin: adminReducer,
});

export default rootReducer;

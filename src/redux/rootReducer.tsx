import { combineReducers } from "redux";
import chatReducer from "./reducers/chatSlice";

const rootReducer = combineReducers({
    chat: chatReducer,
});

export default rootReducer;

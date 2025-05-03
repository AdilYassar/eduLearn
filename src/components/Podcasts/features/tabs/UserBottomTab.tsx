


const tab = createBottomTabNavigator();
const UserBottomTab:React.FC = () =>{
    return(
        <Tab.createBottomTabNavigator
        tabBar = {props =>CustomTabBar {...props} />}
        screenOptions
    )
}
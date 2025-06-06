/* eslint-disable @typescript-eslint/no-unused-vars */
import PodcastFavouriteScreen from "../favourite/PodcastFavouriteScreen";
import PodcastHomeScreen from "../home/PodcastHomeScreen";
import PodcastSearchScreen from "../search/PodcastSearchScreen";
import React from "react";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const Tab = createBottomTabNavigator();

const UserBottomTab: React.FC = () => {
  return (
    <Tab.Navigator

      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="Home" component={PodcastHomeScreen} />
      <Tab.Screen name="Search" component={PodcastSearchScreen} />
      <Tab.Screen name="Favourite" component={PodcastFavouriteScreen} />
    </Tab.Navigator>
  );
};

export default UserBottomTab;

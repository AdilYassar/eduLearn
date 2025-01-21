import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { useCallStore } from '../serviceComponent/callStore'
import { inviteStyles } from '@components/meet/styles/inviteStyles'
import { useUserStore } from '../serviceComponent/zustandStore'
import { addHyphens } from '@components/meet/utils/Helpers'
import Icon from 'react-native-vector-icons/MaterialIcons'

const NoUserInvite = () => {

    const {sessionId} = useCallStore()
    const {user} = useUserStore()




  return (
    <View style = {inviteStyles.container}> 
      <Text style={inviteStyles.headerText} >Your Are The Only One Here {user?.name} </Text>
      <Text style = {inviteStyles.subText}>
        Share this code to invite others
      </Text>

       <View style = {inviteStyles.linkContainer}>
       <Text style = {inviteStyles.linkText}>
        call.google.com/{addHyphens(sessionId)}

        </Text>
        <TouchableOpacity style = {inviteStyles.iconButton}>
        <Icon name = "content-copy" size = {20} color = "white" />
        </TouchableOpacity>
       </View>
       <TouchableOpacity style = {inviteStyles.shareButton}>
        <Icon name = "person-add" size = {20} color = "white" />
        <Text style = {inviteStyles.shareText}>
            share invite
        </Text>
       </TouchableOpacity>
    </View>
  )
}

export default NoUserInvite
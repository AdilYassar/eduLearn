import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'

import { useUserStore } from '../../service/userStore'
import {inviteStyles} from '../../styles/inviteStyles'
import { addHyphens } from '../../utils/Helpers'
import { useLiveMeetStore } from '../../service/meetStore'
import { Copy, User2 } from 'lucide-react-native'
const NoUserInvite = () => {

    const {sessionId} = useLiveMeetStore()
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
        <Copy  size = {20} color = "#0A84FF" />
        </TouchableOpacity>
       </View>
       <TouchableOpacity style = {[inviteStyles.shareButton, {elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.25, shadowRadius: 3.84}]}>
        <User2 size = {20} color = "#fff" />
        <Text style = {inviteStyles.shareText}>
            Share invite
        </Text>
       </TouchableOpacity>
    </View>
  )
}

export default NoUserInvite
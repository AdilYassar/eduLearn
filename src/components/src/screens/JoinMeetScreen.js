import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native'
import React, { useState } from 'react'
import { joinStyles } from '../styles/joinStyles'
import { checkSession, createSession } from '../service/api/session'
import { useWS } from '../service/api/WSProvider'
import { useUserStore } from '../service/userStore'
import { useLiveMeetStore } from '../service/meetStore'
import { navigate } from '../../../utils/Navigation'
import { removeHyphens } from '../utils/Helpers'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ChevronLeft, EllipsisVertical, Video } from 'lucide-react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import LinearGradient from 'react-native-linear-gradient';
import LegalModal from '../components/ui/LegalModal';
import { useLegalModals } from '../hooks/useLegalModals';
import { 
  TechnicalSupportContent, 
  SecurityDocumentationContent, 
  EnterprisePortalContent 
} from '../components/ui/LegalContents';

const JoinMeetScreen = () => {

  const [code, setCode] = useState('');
  const { emit } = useWS();
  const {addSessionId,removeSessionId} = useLiveMeetStore();
  const {user,addSession, removeSession} = useUserStore();

  // Legal modals hook
  const {
    technicalSupportModalVisible,
    securityDocsModalVisible,
    enterprisePortalModalVisible,
    closeTechnicalSupportModal,
    closeSecurityDocsModal,
    closeEnterprisePortalModal,
    openTechnicalSupportModal,
    openSecurityDocsModal,
    openEnterprisePortalModal,
  } = useLegalModals();









  const createNewMeet = async() => {
      const sessionId = await createSession();
      if(sessionId){
        addSession(sessionId)
        addSessionId(sessionId)
        emit('prepare-session',{
          userId:user?.id,
          sessionId,
        });
        navigate('PrepareMeetScreen');
      }
  }


  const joinViaSessionId = async() => {
   const isAvailable = await checkSession(code);
   if(isAvailable){
    emit('prepare-session',{
          userId:user?.id,
          sessionId:removeHyphens(code),

        });
        addSession(code);
        addSessionId(code);
        navigate('PrepareMeetScreen');
   }else{
    removeSession(code);
    removeSessionId(code);
    setCode('');
    Alert.alert('Session Expired','The session you are trying to join has expired.');
   }
  }








  return (
    <View style={joinStyles.container}>
     <SafeAreaView />
     <View style={joinStyles.headerContainer}>
      <ChevronLeft size={RFValue(20)} color={'#000'} onPress={()=>navigate('HomeScreen')} />
      <Text style={joinStyles.headerText}>
        Join Meetings
      </Text>
      <EllipsisVertical size={RFValue(20)} color={'#000'} />
     </View>
    <LinearGradient
    style={joinStyles.gradientButton}
    colors={['#000','#EBE3E3FF']}
    start={{x:0, y:0}}
    end={{x:1, y:0}}
    >
      <TouchableOpacity style={joinStyles.button}
      activeOpacity={0.7}
      onPress={createNewMeet}
      
      >
        <Video size={RFValue(24)} color={'#000'} />
       <Text style={joinStyles.buttonText}>
        create new meeting
       </Text>

      </TouchableOpacity>
    </LinearGradient>
    <Text style={joinStyles.orText}> OR </Text>

    <View style={joinStyles.inputContainer}>
      <Text style = {joinStyles.labelText}>
        Enter The Meeting Code Provided By The Organizer
      </Text>
    <TextInput
    style={joinStyles.inputBox}
    value={code}
    onChangeText={setCode}
    returnKeyLabel='Join'
    returnKeyType='join'
   onSubmitEditing={()=>joinViaSessionId()} 
    placeholder='XXXX-XXXX-XXXX'
    placeholderTextColor={'#888'}


    />
    <Text style={joinStyles.noteText}>
      Note: This Meeting is not end-to-end encrypted, but is secured via cloud encryption.
    </Text>

    {/* Compliance Information */}
    <Text style={joinStyles.complianceHeader}>Security & Compliance Notice</Text>
    
    <Text style={joinStyles.complianceText}>
      • Enterprise-grade encryption protects all meeting communications
    </Text>
    <Text style={joinStyles.complianceText}>
      • Camera and microphone permissions are required for participation
    </Text>
    <Text style={joinStyles.complianceText}>
      • Network connectivity and bandwidth may affect meeting quality
    </Text>
    <Text style={joinStyles.complianceText}>
      • Compatible with enterprise security policies and firewalls
    </Text>
    <Text style={joinStyles.complianceText}>
      • Meeting organizer maintains full administrative control
    </Text>
    <Text style={joinStyles.complianceText}>
      • Data processing complies with international privacy regulations
    </Text>
    
    <View style={joinStyles.supportLinks}>
      <TouchableOpacity onPress={() => {
        console.log('Opening Technical Support Modal');
        openTechnicalSupportModal();
      }}>
        <Text style={joinStyles.linkText}>Technical Support</Text>
      </TouchableOpacity>
      <Text style={joinStyles.complianceText}> | </Text>
      <TouchableOpacity onPress={() => {
        console.log('Opening Security Docs Modal');
        openSecurityDocsModal();
      }}>
        <Text style={joinStyles.linkText}>Security Documentation</Text>
      </TouchableOpacity>
      <Text style={joinStyles.complianceText}> | </Text>
      <TouchableOpacity onPress={() => {
        console.log('Opening Enterprise Portal Modal');
        openEnterprisePortalModal();
      }}>
        <Text style={joinStyles.linkText}>Enterprise Portal</Text>
      </TouchableOpacity>
    </View>
    
    <Text style={joinStyles.disclaimerText}>
      Participation in this meeting constitutes acceptance of organizational meeting policies and data handling procedures. Unauthorized access or distribution of meeting content is strictly prohibited.
    </Text>
    </View>

    {/* Support Modals */}
    <LegalModal
      visible={technicalSupportModalVisible}
      title="Technical Support"
      content={<TechnicalSupportContent />}
      onAccept={closeTechnicalSupportModal}
    />
    
    <LegalModal
      visible={securityDocsModalVisible}
      title="Security Documentation"
      content={<SecurityDocumentationContent />}
      onAccept={closeSecurityDocsModal}
    />
    
    <LegalModal
      visible={enterprisePortalModalVisible}
      title="Enterprise Portal"
      content={<EnterprisePortalContent />}
      onAccept={closeEnterprisePortalModal}
    />
    </View>
  )
}

export default JoinMeetScreen
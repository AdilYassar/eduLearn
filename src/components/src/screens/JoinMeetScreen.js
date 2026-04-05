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
import { useTheme } from '../../../context/ThemeContext';
import { ThemedContainer, ThemedText } from '../../../components/ui/ThemedComponents';

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








  const { theme } = useTheme();

  return (
    <ThemedContainer style={joinStyles.container}>
     <SafeAreaView />
     <View style={[joinStyles.headerContainer, { backgroundColor: theme.background[0] || theme.card }]}>
      <ChevronLeft size={RFValue(20)} color={theme.text.primary} onPress={()=>navigate('HomeScreen')} />
      <ThemedText style={joinStyles.headerText}>
        Join Meetings
      </ThemedText>
      <EllipsisVertical size={RFValue(20)} color={theme.text.primary} />
     </View>
    <View
    style={[joinStyles.gradientButton, { 
      backgroundColor: theme.primary, 
      borderWidth: 0,
    }]}
    >
      <TouchableOpacity style={joinStyles.button}
      activeOpacity={0.7}
      onPress={createNewMeet}
      
      >
        <Video size={RFValue(24)} color="#FFFFFF" />
       <ThemedText style={[joinStyles.buttonText, { color: '#FFFFFF', fontWeight: '600' }]}>
        Create New Meeting
       </ThemedText>

      </TouchableOpacity>
    </View>
    <ThemedText style={joinStyles.orText}> OR </ThemedText>

    <View style={joinStyles.inputContainer}>
      <ThemedText style = {joinStyles.labelText}>
        Enter The Meeting Code Provided By The Organizer
      </ThemedText>
    <TextInput
    style={[joinStyles.inputBox, { color: theme.text.primary, borderColor: theme.border }]}
    value={code}
    onChangeText={setCode}
    returnKeyLabel='Join'
    returnKeyType='join'
   onSubmitEditing={()=>joinViaSessionId()} 
    placeholder='XXXX-XXXX-XXXX'
    placeholderTextColor={theme.text.secondary}


    />
    <ThemedText style={joinStyles.noteText}>
      Note: This Meeting is not end-to-end encrypted, but is secured via cloud encryption.
    </ThemedText>

    {/* Compliance Information */}
    <ThemedText style={joinStyles.complianceHeader}>Security & Compliance Notice</ThemedText>
    
    <ThemedText style={joinStyles.complianceText}>
      • Enterprise-grade encryption protects all meeting communications
    </ThemedText>
    <ThemedText style={joinStyles.complianceText}>
      • Camera and microphone permissions are required for participation
    </ThemedText>
    <ThemedText style={joinStyles.complianceText}>
      • Network connectivity and bandwidth may affect meeting quality
    </ThemedText>
    <ThemedText style={joinStyles.complianceText}>
      • Compatible with enterprise security policies and firewalls
    </ThemedText>
    <ThemedText style={joinStyles.complianceText}>
      • Meeting organizer maintains full administrative control
    </ThemedText>
    <ThemedText style={joinStyles.complianceText}>
      • Data processing complies with international privacy regulations
    </ThemedText>
    
    <View style={joinStyles.supportLinks}>
      <TouchableOpacity onPress={() => {
        console.log('Opening Technical Support Modal');
        openTechnicalSupportModal();
      }}>
        <ThemedText style={[joinStyles.linkText, { color: theme.primary }]}>Technical Support</ThemedText>
      </TouchableOpacity>
      <ThemedText style={joinStyles.complianceText}> | </ThemedText>
      <TouchableOpacity onPress={() => {
        console.log('Opening Security Docs Modal');
        openSecurityDocsModal();
      }}>
        <ThemedText style={[joinStyles.linkText, { color: theme.primary }]}>Security Documentation</ThemedText>
      </TouchableOpacity>
      <ThemedText style={joinStyles.complianceText}> | </ThemedText>
      <TouchableOpacity onPress={() => {
        console.log('Opening Enterprise Portal Modal');
        openEnterprisePortalModal();
      }}>
        <ThemedText style={[joinStyles.linkText, { color: theme.primary }]}>Enterprise Portal</ThemedText>
      </TouchableOpacity>
    </View>
    
    <ThemedText style={joinStyles.disclaimerText}>
      Participation in this meeting constitutes acceptance of organizational meeting policies and data handling procedures. Unauthorized access or distribution of meeting content is strictly prohibited.
    </ThemedText>
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
    </ThemedContainer>
  )
}

export default JoinMeetScreen
import { useState } from 'react';

export const useLegalModals = () => {
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [dataProcessingModalVisible, setDataProcessingModalVisible] = useState(false);
  const [technicalSupportModalVisible, setTechnicalSupportModalVisible] = useState(false);
  const [securityDocsModalVisible, setSecurityDocsModalVisible] = useState(false);
  const [enterprisePortalModalVisible, setEnterprisePortalModalVisible] = useState(false);

  const openPrivacyModal = () => setPrivacyModalVisible(true);
  const closePrivacyModal = () => setPrivacyModalVisible(false);

  const openTermsModal = () => setTermsModalVisible(true);
  const closeTermsModal = () => setTermsModalVisible(false);

  const openDataProcessingModal = () => setDataProcessingModalVisible(true);
  const closeDataProcessingModal = () => setDataProcessingModalVisible(false);

  const openTechnicalSupportModal = () => {
    console.log('Opening Technical Support Modal');
    setTechnicalSupportModalVisible(true);
  };
  const closeTechnicalSupportModal = () => {
    console.log('Closing Technical Support Modal');
    setTechnicalSupportModalVisible(false);
  };

  const openSecurityDocsModal = () => {
    console.log('Opening Security Docs Modal');
    setSecurityDocsModalVisible(true);
  };
  const closeSecurityDocsModal = () => {
    console.log('Closing Security Docs Modal');
    setSecurityDocsModalVisible(false);
  };

  const openEnterprisePortalModal = () => {
    console.log('Opening Enterprise Portal Modal');
    setEnterprisePortalModalVisible(true);
  };
  const closeEnterprisePortalModal = () => {
    console.log('Closing Enterprise Portal Modal');
    setEnterprisePortalModalVisible(false);
  };

  return {
    // Modal states
    privacyModalVisible,
    termsModalVisible,
    dataProcessingModalVisible,
    technicalSupportModalVisible,
    securityDocsModalVisible,
    enterprisePortalModalVisible,
    
    // Modal controls
    openPrivacyModal,
    closePrivacyModal,
    openTermsModal,
    closeTermsModal,
    openDataProcessingModal,
    closeDataProcessingModal,
    openTechnicalSupportModal,
    closeTechnicalSupportModal,
    openSecurityDocsModal,
    closeSecurityDocsModal,
    openEnterprisePortalModal,
    closeEnterprisePortalModal,
  };
};

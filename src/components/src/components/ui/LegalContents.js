import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export const PrivacyPolicyContent = () => (
  <View>
    <Text style={styles.sectionHeader}>1. Information We Collect</Text>
    <Text style={styles.paragraph}>
      We collect information you provide directly to us, such as when you create an account, join a meeting, or contact us for support. This includes:
    </Text>
    <Text style={styles.bulletPoint}>• Name and email address</Text>
    <Text style={styles.bulletPoint}>• Profile information and preferences</Text>
    <Text style={styles.bulletPoint}>• Meeting participation data</Text>
    <Text style={styles.bulletPoint}>• Device and connection information</Text>
    
    <Text style={styles.sectionHeader}>2. How We Use Your Information</Text>
    <Text style={styles.paragraph}>
      We use the information we collect to provide, maintain, and improve our services:
    </Text>
    <Text style={styles.bulletPoint}>• Facilitate video meetings and communications</Text>
    <Text style={styles.bulletPoint}>• Provide customer support and technical assistance</Text>
    <Text style={styles.bulletPoint}>• Ensure security and prevent unauthorized access</Text>
    <Text style={styles.bulletPoint}>• Comply with legal obligations</Text>
    
    <Text style={styles.sectionHeader}>3. Information Sharing</Text>
    <Text style={styles.paragraph}>
      We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy. We may share information:
    </Text>
    <Text style={styles.bulletPoint}>• With your consent</Text>
    <Text style={styles.bulletPoint}>• To comply with legal requirements</Text>
    <Text style={styles.bulletPoint}>• To protect our rights and safety</Text>
    
    <Text style={styles.sectionHeader}>4. Data Security</Text>
    <Text style={styles.paragraph}>
      We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
    </Text>
    
    <Text style={styles.sectionHeader}>5. Your Rights</Text>
    <Text style={styles.paragraph}>
      You have the right to access, update, or delete your personal information. Contact us at privacy@edulearn.com for assistance.
    </Text>
    
    <Text style={styles.contact}>
      Contact Information:{'\n'}
      Email: privacy@edulearn.com{'\n'}
      Address: EduLearn Inc., Legal Department
    </Text>
    
    <Text style={styles.lastUpdated}>Last Updated: October 2025</Text>
  </View>
);

export const TermsOfServiceContent = () => (
  <View>
    <Text style={styles.sectionHeader}>1. Acceptance of Terms</Text>
    <Text style={styles.paragraph}>
      By accessing and using EduLearn's video meeting platform, you accept and agree to be bound by the terms and provision of this agreement.
    </Text>
    
    <Text style={styles.sectionHeader}>2. Service Description</Text>
    <Text style={styles.paragraph}>
      EduLearn provides a cloud-based video conferencing platform that enables users to host and join video meetings, share content, and collaborate in real-time.
    </Text>
    
    <Text style={styles.sectionHeader}>3. User Responsibilities</Text>
    <Text style={styles.paragraph}>
      You are responsible for:
    </Text>
    <Text style={styles.bulletPoint}>• Maintaining the confidentiality of your account</Text>
    <Text style={styles.bulletPoint}>• Using the service in compliance with applicable laws</Text>
    <Text style={styles.bulletPoint}>• Respecting other users' rights and privacy</Text>
    <Text style={styles.bulletPoint}>• Not engaging in harmful or disruptive behavior</Text>
    
    <Text style={styles.sectionHeader}>4. Meeting Content</Text>
    <Text style={styles.paragraph}>
      You retain ownership of content you share during meetings. By using our service, you grant us necessary rights to transmit and display this content to meeting participants.
    </Text>
    
    <Text style={styles.sectionHeader}>5. Service Availability</Text>
    <Text style={styles.paragraph}>
      We strive to maintain high service availability but do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect service availability.
    </Text>
    
    <Text style={styles.sectionHeader}>6. Limitation of Liability</Text>
    <Text style={styles.paragraph}>
      EduLearn shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
    </Text>
    
    <Text style={styles.contact}>
      Questions about these terms?{'\n'}
      Contact: legal@edulearn.com
    </Text>
    
    <Text style={styles.lastUpdated}>Last Updated: October 2025</Text>
  </View>
);

export const DataProcessingContent = () => (
  <View>
    <Text style={styles.sectionHeader}>1. Data Controller and Processor</Text>
    <Text style={styles.paragraph}>
      This agreement governs the processing of personal data between EduLearn (Processor) and organizations using our services (Controller).
    </Text>
    
    <Text style={styles.sectionHeader}>2. Categories of Data</Text>
    <Text style={styles.paragraph}>
      We process the following categories of personal data:
    </Text>
    <Text style={styles.bulletPoint}>• Identity data (name, email, user ID)</Text>
    <Text style={styles.bulletPoint}>• Meeting participation data</Text>
    <Text style={styles.bulletPoint}>• Technical data (IP address, device information)</Text>
    <Text style={styles.bulletPoint}>• Usage data (meeting duration, features used)</Text>
    
    <Text style={styles.sectionHeader}>3. Purpose of Processing</Text>
    <Text style={styles.paragraph}>
      Personal data is processed for the following purposes:
    </Text>
    <Text style={styles.bulletPoint}>• Providing video conferencing services</Text>
    <Text style={styles.bulletPoint}>• Ensuring service security and reliability</Text>
    <Text style={styles.bulletPoint}>• Customer support and technical assistance</Text>
    <Text style={styles.bulletPoint}>• Compliance with legal obligations</Text>
    
    <Text style={styles.sectionHeader}>4. Data Retention</Text>
    <Text style={styles.paragraph}>
      We retain personal data only for as long as necessary to fulfill the purposes outlined in this agreement, typically:
    </Text>
    <Text style={styles.bulletPoint}>• Meeting metadata: 90 days</Text>
    <Text style={styles.bulletPoint}>• Account information: Until account deletion</Text>
    <Text style={styles.bulletPoint}>• Support records: 3 years</Text>
    
    <Text style={styles.sectionHeader}>5. International Transfers</Text>
    <Text style={styles.paragraph}>
      Data may be transferred to countries outside your jurisdiction. We ensure appropriate safeguards are in place, including Standard Contractual Clauses.
    </Text>
    
    <Text style={styles.sectionHeader}>6. Security Measures</Text>
    <Text style={styles.paragraph}>
      We implement industry-standard security measures including encryption, access controls, and regular security assessments.
    </Text>
    
    <Text style={styles.contact}>
      Data Protection Officer:{'\n'}
      Email: dpo@edulearn.com{'\n'}
      For data subject requests and inquiries
    </Text>
    
    <Text style={styles.lastUpdated}>Last Updated: October 2025</Text>
  </View>
);

export const TechnicalSupportContent = () => (
  <View>
    <Text style={styles.sectionHeader}>Getting Help</Text>
    <Text style={styles.paragraph}>
      Our technical support team is here to help you resolve any issues with EduLearn's video conferencing platform.
    </Text>
    
    <Text style={styles.sectionHeader}>Contact Methods</Text>
    <Text style={styles.bulletPoint}>• Email: support@edulearn.com</Text>
    <Text style={styles.bulletPoint}>• Phone: +1-800-EDULEARN</Text>
    <Text style={styles.bulletPoint}>• Live Chat: Available in-app</Text>
    <Text style={styles.bulletPoint}>• Enterprise Portal: priority.edulearn.com</Text>
    
    <Text style={styles.sectionHeader}>Common Issues & Solutions</Text>
    
    <Text style={styles.subHeader}>Audio/Video Quality</Text>
    <Text style={styles.bulletPoint}>• Check your internet connection (minimum 1 Mbps)</Text>
    <Text style={styles.bulletPoint}>• Close other bandwidth-intensive applications</Text>
    <Text style={styles.bulletPoint}>• Use wired connection when possible</Text>
    <Text style={styles.bulletPoint}>• Update your browser or mobile app</Text>
    
    <Text style={styles.subHeader}>Connection Problems</Text>
    <Text style={styles.bulletPoint}>• Verify firewall settings allow EduLearn domains</Text>
    <Text style={styles.bulletPoint}>• Check corporate VPN settings</Text>
    <Text style={styles.bulletPoint}>• Try switching between WiFi and mobile data</Text>
    
    <Text style={styles.subHeader}>Browser Compatibility</Text>
    <Text style={styles.bulletPoint}>• Chrome 88+ (recommended)</Text>
    <Text style={styles.bulletPoint}>• Firefox 85+</Text>
    <Text style={styles.bulletPoint}>• Safari 14+</Text>
    <Text style={styles.bulletPoint}>• Edge 88+</Text>
    
    <Text style={styles.sectionHeader}>Enterprise Support</Text>
    <Text style={styles.paragraph}>
      Enterprise customers receive priority support with guaranteed response times:
    </Text>
    <Text style={styles.bulletPoint}>• Critical issues: 1 hour response</Text>
    <Text style={styles.bulletPoint}>• High priority: 4 hour response</Text>
    <Text style={styles.bulletPoint}>• Normal priority: 24 hour response</Text>
    
    <Text style={styles.contact}>
      Need immediate assistance?{'\n'}
      Call: +1-800-EDULEARN{'\n'}
      Enterprise Portal: priority.edulearn.com
    </Text>
    
    <Text style={styles.lastUpdated}>Available 24/7 for Enterprise Customers</Text>
  </View>
);

export const SecurityDocumentationContent = () => (
  <View>
    <Text style={styles.sectionHeader}>Security Overview</Text>
    <Text style={styles.paragraph}>
      EduLearn implements enterprise-grade security measures to protect your meetings and data.
    </Text>
    
    <Text style={styles.sectionHeader}>Encryption Standards</Text>
    <Text style={styles.bulletPoint}>• AES-256 encryption for data at rest</Text>
    <Text style={styles.bulletPoint}>• TLS 1.3 for data in transit</Text>
    <Text style={styles.bulletPoint}>• End-to-end encryption for meeting content</Text>
    <Text style={styles.bulletPoint}>• RSA-2048 key exchange</Text>
    
    <Text style={styles.sectionHeader}>Access Controls</Text>
    <Text style={styles.paragraph}>
      Multi-layered access controls ensure only authorized users can join meetings:
    </Text>
    <Text style={styles.bulletPoint}>• Meeting passwords and waiting rooms</Text>
    <Text style={styles.bulletPoint}>• Single Sign-On (SSO) integration</Text>
    <Text style={styles.bulletPoint}>• Multi-factor authentication (MFA)</Text>
    <Text style={styles.bulletPoint}>• Role-based permissions</Text>
    
    <Text style={styles.sectionHeader}>Compliance Certifications</Text>
    <Text style={styles.bulletPoint}>• SOC 2 Type II certified</Text>
    <Text style={styles.bulletPoint}>• ISO 27001 compliant</Text>
    <Text style={styles.bulletPoint}>• GDPR compliant</Text>
    <Text style={styles.bulletPoint}>• HIPAA eligible</Text>
    <Text style={styles.bulletPoint}>• FedRAMP authorized (in progress)</Text>
    
    <Text style={styles.sectionHeader}>Infrastructure Security</Text>
    <Text style={styles.paragraph}>
      Our cloud infrastructure is built with security-first principles:
    </Text>
    <Text style={styles.bulletPoint}>• Redundant data centers with 99.99% uptime</Text>
    <Text style={styles.bulletPoint}>• DDoS protection and intrusion detection</Text>
    <Text style={styles.bulletPoint}>• Regular penetration testing</Text>
    <Text style={styles.bulletPoint}>• 24/7 security monitoring</Text>
    
    <Text style={styles.sectionHeader}>Data Protection</Text>
    <Text style={styles.bulletPoint}>• Data residency controls</Text>
    <Text style={styles.bulletPoint}>• Automatic data purging</Text>
    <Text style={styles.bulletPoint}>• Backup and disaster recovery</Text>
    <Text style={styles.bulletPoint}>• Zero-knowledge architecture options</Text>
    
    <Text style={styles.sectionHeader}>Incident Response</Text>
    <Text style={styles.paragraph}>
      We maintain a comprehensive incident response plan with immediate notification procedures for security events affecting customer data.
    </Text>
    
    <Text style={styles.contact}>
      Security Questions?{'\n'}
      Email: security@edulearn.com{'\n'}
      Security Portal: security.edulearn.com
    </Text>
    
    <Text style={styles.lastUpdated}>Security Standards & Compliance</Text>
  </View>
);

export const EnterprisePortalContent = () => (
  <View>
    <Text style={styles.sectionHeader}>Portal Overview</Text>
    <Text style={styles.paragraph}>
      The EduLearn Enterprise Portal provides administrators with comprehensive tools to manage users, meetings, and organizational settings.
    </Text>
    
    <Text style={styles.sectionHeader}>Key Features</Text>
    
    <Text style={styles.subHeader}>User Management</Text>
    <Text style={styles.bulletPoint}>• Bulk user provisioning and deprovisioning</Text>
    <Text style={styles.bulletPoint}>• Role-based access control</Text>
    <Text style={styles.bulletPoint}>• SSO configuration and management</Text>
    <Text style={styles.bulletPoint}>• User activity monitoring</Text>
    
    <Text style={styles.subHeader}>Meeting Analytics</Text>
    <Text style={styles.bulletPoint}>• Usage reports and dashboards</Text>
    <Text style={styles.bulletPoint}>• Meeting quality analytics</Text>
    <Text style={styles.bulletPoint}>• Participant engagement metrics</Text>
    <Text style={styles.bulletPoint}>• Custom reporting and exports</Text>
    
    <Text style={styles.subHeader}>Security & Compliance</Text>
    <Text style={styles.bulletPoint}>• Security policy configuration</Text>
    <Text style={styles.bulletPoint}>• Audit logs and compliance reports</Text>
    <Text style={styles.bulletPoint}>• Data retention policy management</Text>
    <Text style={styles.bulletPoint}>• Privacy settings and controls</Text>
    
    <Text style={styles.sectionHeader}>Getting Started</Text>
    <Text style={styles.paragraph}>
      To access the Enterprise Portal:
    </Text>
    <Text style={styles.bulletPoint}>• Visit portal.edulearn.com</Text>
    <Text style={styles.bulletPoint}>• Sign in with your administrator credentials</Text>
    <Text style={styles.bulletPoint}>• Complete the initial setup wizard</Text>
    <Text style={styles.bulletPoint}>• Configure your organization settings</Text>
    
    <Text style={styles.sectionHeader}>Admin Roles</Text>
    <Text style={styles.bulletPoint}>• Super Admin: Full organizational control</Text>
    <Text style={styles.bulletPoint}>• User Admin: User management and provisioning</Text>
    <Text style={styles.bulletPoint}>• Security Admin: Security and compliance settings</Text>
    <Text style={styles.bulletPoint}>• Reports Admin: Analytics and reporting access</Text>
    
    <Text style={styles.sectionHeader}>Support & Training</Text>
    <Text style={styles.paragraph}>
      Enterprise customers receive:
    </Text>
    <Text style={styles.bulletPoint}>• Dedicated customer success manager</Text>
    <Text style={styles.bulletPoint}>• Administrator training sessions</Text>
    <Text style={styles.bulletPoint}>• 24/7 priority technical support</Text>
    <Text style={styles.bulletPoint}>• Regular product updates and roadmap reviews</Text>
    
    <Text style={styles.contact}>
      Enterprise Portal Access:{'\n'}
      URL: portal.edulearn.com{'\n'}
      Support: enterprise@edulearn.com{'\n'}
      Phone: +1-800-EDU-ENTERPRISE
    </Text>
    
    <Text style={styles.lastUpdated}>Advanced Administration & Analytics</Text>
  </View>
);

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: RFValue(20),
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: RFValue(8),
    fontFamily: 'Roboto-Bold',
  },
  lastUpdated: {
    fontSize: RFValue(12),
    color: '#6B7280',
    marginBottom: RFValue(24),
    fontStyle: 'italic',
    fontFamily: 'OpenSans-Regular',
  },
  sectionHeader: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#1F2937',
    marginTop: RFValue(20),
    marginBottom: RFValue(12),
    fontFamily: 'Roboto-Medium',
  },
  subHeader: {
    fontSize: RFValue(14),
    fontWeight: '600',
    color: '#374151',
    marginTop: RFValue(12),
    marginBottom: RFValue(8),
    fontFamily: 'Roboto-Medium',
  },
  paragraph: {
    fontSize: RFValue(12),
    color: '#374151',
    lineHeight: RFValue(18),
    marginBottom: RFValue(12),
    fontFamily: 'OpenSans-Regular',
  },
  bulletPoint: {
    fontSize: RFValue(12),
    color: '#374151',
    lineHeight: RFValue(18),
    marginBottom: RFValue(6),
    marginLeft: RFValue(8),
    fontFamily: 'OpenSans-Regular',
  },
  contact: {
    fontSize: RFValue(12),
    color: '#1F2937',
    lineHeight: RFValue(18),
    marginTop: RFValue(24),
    padding: RFValue(16),
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    fontFamily: 'OpenSans-Medium',
  },
});

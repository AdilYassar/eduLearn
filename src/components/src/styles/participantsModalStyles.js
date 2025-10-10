import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export const participantsModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    minHeight: '40%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: RFValue(18),
    fontWeight: '600',
    color: '#333',
    fontFamily: 'OpenSans-Medium',
  },
  closeButton: {
    padding: 5,
  },
  participantsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  participantDetails: {
    flex: 1,
  },
  participantName: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#333',
    fontFamily: 'OpenSans-Medium',
  },
  participantStatus: {
    fontSize: RFValue(12),
    color: '#666',
    marginTop: 2,
    fontFamily: 'OpenSans-Regular',
  },
  participantControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlIcon: {
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: RFValue(14),
    color: '#666',
    fontFamily: 'OpenSans-Regular',
  },
});

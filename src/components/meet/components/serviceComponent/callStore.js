/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { asyncStorage } from './storage';

export const useCallStore = create(
    persist(
        (set, get) => ({
            sessionId: null,
            participants: [],
            micOn: false,
            videoOn: false,
            clear:()=>{
                set({
                    sessionId:null,
                    participants:[]
                })
            },
            // Add a session ID
            addSessionId: (id) => {
                set({ sessionId: id });
            },

            // Remove the session ID
            removeSessionId: () => {
                set({ sessionId: null });
            },

            // Add a participant
            addParticipant: (participant) => {
                const { participants } = get();
                if (!participants.find((p) => p.userId === participant.userId)) {
                    set({ participants: [...participants, participant] });
                }
            },

            // Remove a participant
            removeParticipant: (participantId) => {
                const { participants } = get();
                set({
                    participants: participants.filter((p) => p.userId !== participantId),
                });
            },

            // Update a participant's state
            updateParticipant: (updatedParticipant) => {
                const { participants } = get();
                set({
                    participants: participants.map((p) =>
                        p.userId === updatedParticipant.userId
                            ? {
                                  ...p,
                                  micOn: updatedParticipant.micOn !== undefined ? updatedParticipant.micOn : p.micOn,
                                  videoOn: updatedParticipant.videoOn !== undefined ? updatedParticipant.videoOn : p.videoOn,
                                  streamURL: updatedParticipant.streamURL || p.streamURL,
                              }
                            : p
                    ),
                });
            },

            // Set stream URL for a participant
            setStreamURL: (participantId, streamURL) => {
                const { participants } = get();
                const updatedParticipants = participants.map((p) => {
                    if (p.userId === participantId) {
                        return { ...p, streamURL };
                    }
                    return p;
                });
                set({ participants: updatedParticipants });
            },

            // Initialize current user as participant
            initializeCurrentUser: (user, localStream) => {
                const { participants } = get();
                const currentUserParticipant = {
                    userId: user.id,
                    name: user.name,
                    photo: user.photo,
                    micOn: true,
                    videoOn: true,
                    streamURL: localStream,
                    isCurrentUser: true
                };
                
                // Add current user if not already present
                if (!participants.find(p => p.userId === user.id)) {
                    set({ participants: [currentUserParticipant, ...participants] });
                }
            },

            // Get other participants (excluding current user)
            getOtherParticipants: () => {
                const { participants } = get();
                return participants.filter(p => !p.isCurrentUser);
            },

            // Update participants from server session info
            updateParticipantsFromServer: (serverParticipants) => {
                if (Array.isArray(serverParticipants)) {
                    set({ participants: serverParticipants });
                }
            },

            // Clear all participants
            clearParticipants: () => {
                set({ participants: [] });
            },

            // Toggle mic or video state
            toggle: (type) => {
                if (type === 'mic') {
                    set((state) => ({ micOn: !state.micOn }));
                } else if (type === 'video') {
                    set((state) => ({ videoOn: !state.videoOn }));
                }
            },
        }),
        {
            name: 'live-call-storage', // Storage key name
            storage: createJSONStorage(() => asyncStorage), // Use AsyncStorage for storage
        }
    )
);
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
                                  micOn: updatedParticipant.micOn,
                                  videoOn: updatedParticipant.videoOn,
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
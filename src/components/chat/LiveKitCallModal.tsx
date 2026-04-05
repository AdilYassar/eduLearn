import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Dimensions,
  Platform,
  NativeModules,
  Animated,
  Easing,
} from 'react-native';
import Modal from 'react-native-modal';
import { Room, RoomEvent } from 'livekit-client';
import { registerGlobals, AudioSession } from '@livekit/react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import ENV_CONFIG from '../../config/envConfig';

interface LiveKitCallModalProps {
  isVisible: boolean;
  onClose: () => void;
  userName: string;
}

registerGlobals();

type CallState = 'connecting' | 'idle' | 'agent_speaking' | 'user_speaking';

const { width: SCREEN_W } = Dimensions.get('window');
const BAR_COUNT = 30;
const AVATAR_SIZE = 92;
const RING_SIZE = 116;
const RING_RADIUS = 54;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const STATE_CONFIG = {
  connecting: {
    label: 'Connecting…',
    sublabel: 'Starting session',
    dotColor: '#6366f1',
    ringColor: '#6366f1',
    ringDash: RING_CIRCUMFERENCE * 0.35,
    glowColor: 'rgba(99,102,241,0.22)',
    avatarGradientTop: '#1e1b4b',
    avatarGradientBot: '#4338ca',
    waveColor: '#6366f1',
    waveAmplitude: 6,
  },
  idle: {
    label: 'Connected',
    sublabel: 'Say something…',
    dotColor: 'rgba(255,255,255,0.3)',
    ringColor: 'rgba(99,102,241,0.35)',
    ringDash: RING_CIRCUMFERENCE * 0.85,
    glowColor: 'rgba(99,102,241,0.08)',
    avatarGradientTop: '#1e1b4b',
    avatarGradientBot: '#312e81',
    waveColor: 'rgba(255,255,255,0.15)',
    waveAmplitude: 3,
  },
  agent_speaking: {
    label: 'Emery is speaking',
    sublabel: 'AI Learning Assistant',
    dotColor: '#34d399',
    ringColor: '#34d399',
    ringDash: RING_CIRCUMFERENCE * 0.2,
    glowColor: 'rgba(52,211,153,0.22)',
    avatarGradientTop: '#064e3b',
    avatarGradientBot: '#059669',
    waveColor: '#34d399',
    waveAmplitude: 22,
  },
  user_speaking: {
    label: 'Listening…',
    sublabel: 'Speak clearly',
    dotColor: '#a78bfa',
    ringColor: '#a78bfa',
    ringDash: RING_CIRCUMFERENCE * 0.5,
    glowColor: 'rgba(167,139,250,0.2)',
    avatarGradientTop: '#1e1b4b',
    avatarGradientBot: '#7c3aed',
    waveColor: '#a78bfa',
    waveAmplitude: 18,
  },
};

const LiveKitCallModal: React.FC<LiveKitCallModalProps> = ({ isVisible, onClose, userName }) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [callState, setCallState] = useState<CallState>('connecting');
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [timerSecs, setTimerSecs] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const barAnims = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(4))).current;

  const ringAnim = useRef(new Animated.Value(RING_CIRCUMFERENCE * 0.85)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const dotScaleAnim = useRef(new Animated.Value(1)).current;
  const avatarPulse = useRef(new Animated.Value(1)).current;
  const sheetSlide = useRef(new Animated.Value(400)).current;
  const endBtnScale = useRef(new Animated.Value(1)).current;

  const cfg = STATE_CONFIG[callState];

  useEffect(() => {
    if (isVisible) {
      Animated.spring(sheetSlide, { toValue: 0, useNativeDriver: true, tension: 70, friction: 12 }).start();
      startAudioSessionAndConnect();
      startWaveAnimation();
      startEndBtnPulse();
    } else {
      cleanupCall();
    }
    return () => cleanupCall();
  }, [isVisible]);

  useEffect(() => {
    Animated.timing(ringAnim, {
      toValue: cfg.ringDash,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: false }).start(() => {
      glowAnim.setValue(0);
    });

    if (callState !== 'connecting') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotScaleAnim, { toValue: 1.5, duration: 600, useNativeDriver: true }),
          Animated.timing(dotScaleAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    }

    if (callState === 'agent_speaking' || callState === 'user_speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(avatarPulse, { toValue: 1.06, duration: 800, useNativeDriver: true }),
          Animated.timing(avatarPulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      avatarPulse.stopAnimation();
      avatarPulse.setValue(1);
    }
  }, [callState]);

  const startEndBtnPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(endBtnScale, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(endBtnScale, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  const startWaveAnimation = () => {
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = setInterval(() => {
      phaseRef.current += 0.1;
      const amplitude = STATE_CONFIG[callState]?.waveAmplitude ?? 4;
      barAnims.forEach((anim, i) => {
        const wave = Math.sin(phaseRef.current + i * 0.45) * 0.5 + 0.5;
        const wave2 = Math.sin(phaseRef.current * 1.3 + i * 0.3) * 0.5 + 0.5;
        const h = 4 + (wave * 0.6 + wave2 * 0.4) * amplitude;
        Animated.timing(anim, { toValue: h, duration: 80, useNativeDriver: false }).start();
      });
    }, 80);
  };

  useEffect(() => {
    startWaveAnimation();
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [callState]);

  const startTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setTimerSecs(s => s + 1), 1000);
  };

  const cleanupCall = () => {
    if (room) {
      room.disconnect().catch(() => {});
      setRoom(null);
    }
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (animRef.current) { clearInterval(animRef.current); animRef.current = null; }
    setTimerSecs(0);
    setCallState('connecting');
    setMuted(false);

    if (Platform.OS === 'android') {
      try {
        const { AudioManager } = NativeModules;
        if (AudioManager?.setSpeakerphoneOn) AudioManager.setSpeakerphoneOn(false);
      } catch {}
    }
    AudioSession.stopAudioSession();
  };

  const startAudioSessionAndConnect = async () => {
    try {
      if (Platform.OS === 'ios') {
        await AudioSession.setAppleAudioConfiguration({
          audioCategory: 'playAndRecord',
          audioMode: 'spokenAudio',
          options: { duckOthers: false, defaultToSpeaker: true, interruptionMode: 'duckOthers' },
        });
        await AudioSession.startAudioSession();
      } else if (Platform.OS === 'android') {
        try {
          const { AudioManager } = NativeModules;
          if (AudioManager) {
            await AudioManager.setSpeakerphoneOn(true);
            const STREAM_MUSIC = 3;
            const maxVol = await AudioManager.getStreamMaxVolume(STREAM_MUSIC);
            await AudioManager.setStreamVolume(STREAM_MUSIC, maxVol, true);
          }
        } catch {}
        await AudioSession.setAppleAudioConfiguration({
          audioCategory: 'playAndRecord',
          audioMode: 'spokenAudio',
          options: { duckOthers: false, defaultToSpeaker: true, interruptionMode: 'duckOthers' },
        });
        await AudioSession.startAudioSession();
      }
      connectToRoom();
    } catch {
      setCallState('idle');
    }
  };

  const connectToRoom = async () => {
    try {
      try {
        await fetch(`${ENV_CONFIG.SOCIAL_API_URL}/livekit/dispatch-agent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomName: 'playground-TkVi-UDFQ', agentName: 'Emery-2338' }),
        });
      } catch {}

      const tokenRes = await fetch(`${ENV_CONFIG.SOCIAL_API_URL}/livekit/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: 'playground-TkVi-UDFQ', participantName: userName || 'student' }),
      });
      if (!tokenRes.ok) throw new Error('Token failed');
      const tokenData = await tokenRes.json();
      if (tokenData.status !== 'success') throw new Error('Token error');

      const newRoom = new Room({
        adaptiveStream: false,
        publishDefaults: { audioPreset: { maxBitrate: 32000 } },
      });

      newRoom.on(RoomEvent.Connected, () => {
        setCallState('idle');
        startTimer();
        newRoom.localParticipant.setMicrophoneEnabled(true);
        if (Platform.OS === 'android') {
          try { NativeModules.AudioManager?.setSpeakerphoneOn(true); } catch {}
        }
      });

      newRoom.on(RoomEvent.ParticipantConnected, (p) => {
        if (p.identity.includes('agent') || p.name?.includes('Emery')) {
          setCallState('agent_speaking');
          setTimeout(() => setCallState('idle'), 3000);
        }
      });

      newRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const agentSpeaking = speakers.some(p => p.identity !== newRoom.localParticipant.identity);
        const userSpeaking = speakers.some(p => p.identity === newRoom.localParticipant.identity);
        if (agentSpeaking) {
          setCallState('agent_speaking');
          if (Platform.OS === 'android') {
            try { NativeModules.AudioManager?.setSpeakerphoneOn(true); } catch {}
          }
        } else if (userSpeaking) {
          setCallState('user_speaking');
        } else {
          setCallState('idle');
        }
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === 'audio' && Platform.OS === 'android') {
          try { NativeModules.AudioManager?.setSpeakerphoneOn(true); } catch {}
        }
      });

      newRoom.on(RoomEvent.Disconnected, () => { onClose(); });

      await newRoom.connect(ENV_CONFIG.LIVEKIT_URL, tokenData.data.token, { autoSubscribe: true });
      await newRoom.localParticipant.setMicrophoneEnabled(true);
      setRoom(newRoom);
    } catch {
      setCallState('idle');
    }
  };

  const toggleMute = async () => {
    if (!room) return;
    const next = !muted;
    setMuted(next);
    await room.localParticipant.setMicrophoneEnabled(!next);
  };

  const toggleSpeaker = async () => {
    const next = !speakerOn;
    setSpeakerOn(next);
    if (Platform.OS === 'android') {
      try { await NativeModules.AudioManager?.setSpeakerphoneOn(next); } catch {}
    }
  };

  const endCall = () => {
    if (room) room.disconnect();
    onClose();
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Modal
      isVisible={isVisible}
      style={styles.modal}
      backdropOpacity={0.72}
      backdropColor="#000"
      onBackdropPress={endCall}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={380}
      animationOutTiming={280}
      useNativeDriver
    >
      <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetSlide }] }]}>
        {/* Glow */}
        <View style={[styles.glow, { backgroundColor: cfg.glowColor }]} />

        {/* Handle */}
        <View style={styles.handle} />

        {/* Avatar + ring */}
        <Animated.View style={[styles.avatarWrap, { transform: [{ scale: avatarPulse }] }]}>
          <Svg width={RING_SIZE} height={RING_SIZE} style={StyleSheet.absoluteFill}>
            <Circle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
              stroke="rgba(255,255,255,0.06)" strokeWidth={2} fill="none"
            />
            <AnimatedCircle
              cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={RING_RADIUS}
              stroke={cfg.ringColor}
              strokeWidth={2.5}
              fill="none"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={ringAnim as any}
              strokeLinecap="round"
              rotation={-90}
              origin={`${RING_SIZE / 2},${RING_SIZE / 2}`}
            />
          </Svg>
          <View style={[styles.avatar, { backgroundColor: cfg.avatarGradientBot }]}>
            <Text style={styles.avatarText}>AI</Text>
          </View>
        </Animated.View>

        {/* Name */}
        <Text style={styles.agentName}>Emery</Text>
        <Text style={styles.agentSub}>AI Learning Assistant</Text>

        {/* Status pill */}
        <View style={styles.statusPill}>
          <Animated.View style={[styles.statusDot, {
            backgroundColor: cfg.dotColor,
            transform: [{ scale: dotScaleAnim }],
          }]} />
          <Text style={styles.statusText}>{cfg.label}</Text>
        </View>

        {/* Waveform */}
        <View style={styles.waveform}>
          {barAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[styles.bar, {
                height: anim,
                backgroundColor: cfg.waveColor,
                opacity: anim.interpolate({ inputRange: [4, 26], outputRange: [0.4, 1], extrapolate: 'clamp' }),
              }]}
            />
          ))}
        </View>

        {/* Timer */}
        {callState !== 'connecting' && (
          <Text style={styles.timer}>{formatTime(timerSecs)}</Text>
        )}
        {callState === 'connecting' && (
          <Text style={styles.timer}>⎯ ⎯ ⎯</Text>
        )}

        {/* Controls */}
        <View style={styles.controls}>
          {/* Mute */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={toggleMute} activeOpacity={0.75}>
            <View style={[styles.ctrlCircle, muted && styles.ctrlCircleActive, muted && { borderColor: '#ef4444' }]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={muted ? '#ef4444' : 'rgba(255,255,255,0.7)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Line x1="1" y1="1" x2="23" y2="23" stroke={muted ? '#ef4444' : 'none'} strokeWidth={2} />
                <Line x1="9" y1="9" x2="9" y2="12" />
                <Line x1="15" y1="9.34" x2="15" y2="12" />
              </Svg>
            </View>
            <Text style={[styles.ctrlLabel, muted && { color: '#ef4444' }]}>{muted ? 'Unmute' : 'Mute'}</Text>
          </TouchableOpacity>

          {/* End Call */}
          <Animated.View style={{ transform: [{ scale: endBtnScale }] }}>
            <TouchableOpacity style={styles.endBtn} onPress={endCall} activeOpacity={0.85}>
              <Svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <Line x1="1" y1="1" x2="23" y2="23" />
                <Line x1="16.72" y1="11.06" x2="16.72" y2="11.06" />
                <Line x1="11" y1="5" x2="11" y2="3" />
              </Svg>
            </TouchableOpacity>
          </Animated.View>

          {/* Speaker */}
          <TouchableOpacity style={styles.ctrlBtn} onPress={toggleSpeaker} activeOpacity={0.75}>
            <View style={[styles.ctrlCircle, !speakerOn && styles.ctrlCircleActive]}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={!speakerOn ? '#a78bfa' : 'rgba(255,255,255,0.7)'} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <Line x1="11" y1="5" x2="6" y2="9" />
                <Line x1="2" y1="9" x2="2" y2="15" />
                <Line x1="6" y1="9" x2="6" y2="15" />
                <Line x1="6" y1="15" x2="11" y2="19" />
                <Line x1="11" y1="5" x2="11" y2="19" />
              </Svg>
            </View>
            <Text style={[styles.ctrlLabel, !speakerOn && { color: '#a78bfa' }]}>
              {speakerOn ? 'Speaker' : 'Earpiece'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

import { Circle as RNSVGCircle } from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(RNSVGCircle);

const styles = StyleSheet.create({
  modal: { margin: 0, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#0d0d18',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 44,
    alignItems: 'center',
    overflow: 'hidden',
    paddingTop: 12,
  },
  glow: {
    position: 'absolute',
    top: -50,
    width: 260,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 2,
    marginBottom: 28,
  },
  avatarWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
  agentName: {
    color: '#f0eeff',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  agentSub: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: 12,
    marginTop: 3,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 24,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontWeight: '500',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 52,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  bar: {
    width: 4,
    borderRadius: 2,
  },
  timer: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: 13,
    letterSpacing: 2,
    marginBottom: 28,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  ctrlBtn: {
    alignItems: 'center',
    gap: 7,
  },
  ctrlCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlCircleActive: {
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderColor: 'rgba(167,139,250,0.4)',
  },
  ctrlLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  endBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#dc2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 10,
  },
});

export default LiveKitCallModal;
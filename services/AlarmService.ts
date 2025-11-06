import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export class AlarmService {
  private static sound: Audio.Sound | null = null;

  static async playAlarmSound() {
    if (Platform.OS === 'web') {
      this.playWebAlarm();
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3' },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );

      this.sound = sound;
      await sound.playAsync();

      this.triggerVibration();
    } catch (error) {
      console.error('Error playing alarm:', error);
    }
  }

  private static playWebAlarm() {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.5;

    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
    }, 5000);
  }

  static async stopAlarmSound() {
    if (this.sound) {
      try {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
      } catch (error) {
        console.error('Error stopping alarm:', error);
      }
    }
  }

  static async triggerVibration() {
    if (Platform.OS === 'web') {
      if (navigator.vibrate) {
        navigator.vibrate([500, 200, 500, 200, 500]);
      }
      return;
    }

    try {
      for (let i = 0; i < 5; i++) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } catch (error) {
      console.error('Error triggering vibration:', error);
    }
  }
}

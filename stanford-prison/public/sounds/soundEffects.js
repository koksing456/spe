// Sound effect paths
export const SOUND_PATHS = {
  ambient: {
    main: '/sounds/ambient.mp3',
    tense: '/sounds/ambient-tense.mp3',
    dark: '/sounds/ambient-dark.mp3'
  },
  ui: {
    hover: '/sounds/hover.mp3',
    click: '/sounds/click.mp3',
    transition: '/sounds/transition.mp3',
    reveal: '/sounds/reveal.mp3',
    discover: '/sounds/discover.mp3'
  },
  sequence: {
    intro: '/sounds/intro.mp3',
    buildup: '/sounds/buildup.mp3',
    tension: '/sounds/tension.mp3',
    revelation: '/sounds/revelation.mp3'
  },
  easter_eggs: {
    secret: '/sounds/secret.mp3',
    unlock: '/sounds/unlock.mp3',
    achievement: '/sounds/achievement.mp3'
  }
};

// Volume levels for different sound categories
const VOLUME_LEVELS = {
  ambient: 0.3,
  ui: 0.2,
  sequence: 0.4,
  easter_eggs: 0.25
};

// Crossfade duration in milliseconds
const CROSSFADE_DURATION = 2000;

class SoundManager {
  constructor() {
    this.sounds = {};
    this.currentAmbient = null;
    this.isEnabled = false;
  }

  async initialize() {
    // Load all sounds
    for (const category in SOUND_PATHS) {
      this.sounds[category] = {};
      for (const sound in SOUND_PATHS[category]) {
        const audio = new Audio(SOUND_PATHS[category][sound]);
        audio.volume = VOLUME_LEVELS[category];
        this.sounds[category][sound] = audio;
      }
    }

    // Set up ambient sound loops
    Object.values(this.sounds.ambient).forEach(audio => {
      audio.loop = true;
    });
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  playUI(soundName) {
    if (!this.isEnabled) return;
    const sound = this.sounds.ui[soundName];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }

  async crossfadeAmbient(newAmbientName) {
    if (!this.isEnabled) return;
    
    const newAmbient = this.sounds.ambient[newAmbientName];
    if (!newAmbient) return;

    if (this.currentAmbient) {
      // Fade out current ambient
      const fadeOutDuration = CROSSFADE_DURATION;
      const fadeOutSteps = 20;
      const fadeOutInterval = fadeOutDuration / fadeOutSteps;
      const volumeStep = this.currentAmbient.volume / fadeOutSteps;

      for (let i = 0; i < fadeOutSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, fadeOutInterval));
        this.currentAmbient.volume = Math.max(0, this.currentAmbient.volume - volumeStep);
      }
      this.currentAmbient.pause();
    }

    // Fade in new ambient
    newAmbient.volume = 0;
    newAmbient.play();
    const fadeInDuration = CROSSFADE_DURATION;
    const fadeInSteps = 20;
    const fadeInInterval = fadeInDuration / fadeInSteps;
    const volumeStep = VOLUME_LEVELS.ambient / fadeInSteps;

    for (let i = 0; i < fadeInSteps; i++) {
      await new Promise(resolve => setTimeout(resolve, fadeInInterval));
      newAmbient.volume = Math.min(VOLUME_LEVELS.ambient, newAmbient.volume + volumeStep);
    }

    this.currentAmbient = newAmbient;
  }

  playSequence(sequenceName) {
    if (!this.isEnabled) return;
    const sound = this.sounds.sequence[sequenceName];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }

  playEasterEgg(eggName) {
    if (!this.isEnabled) return;
    const sound = this.sounds.easter_eggs[eggName];
    if (sound) {
      sound.currentTime = 0;
      sound.play();
    }
  }

  stopAll() {
    Object.values(this.sounds).forEach(category => {
      Object.values(category).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    });
    this.currentAmbient = null;
  }
}

export const soundManager = new SoundManager(); 
// AUDIO
class AudioController {
  constructor() {
    this.themeTracks = {}; // Holds all theme tracks
    this.soundEffects = {}; // Holds all sound effects
    this.volume = 0.7; // The default volume is 1
  }

  // Add a theme track
  addThemeTrack(trackName, audioURL) {
    const themeTrack = new Audio(audioURL);
    this.themeTracks[trackName] = themeTrack;
  }

  // Add a sound effect
  addSoundEffect(effectName, audioURL) {
    const soundEffect = new Audio(audioURL);
    this.soundEffects[effectName] = soundEffect;
  }

  // Play a theme track
  playThemeTrack(trackName) {
    const themeTrack = this.themeTracks[trackName];
    if (themeTrack) {
      themeTrack.loop = true;
      themeTrack.volume = this.volume; // Set the volume to the current volume
      themeTrack.play();
    }
  }

  // Stop playing a theme track
  stopThemeTrack(trackName) {
    const themeTrack = this.themeTracks[trackName];
    if (themeTrack) {
      themeTrack.pause();
      themeTrack.currentTime = 0;
    }
  }

  // Play a sound effect
  playSoundEffect(effectName) {
    const soundEffect = this.soundEffects[effectName];
    if (soundEffect) {
      soundEffect.volume = this.volume; // Set the volume to the current volume
      soundEffect.play();
    }
  }

  // Stop a sound effect
  stopSoundEffect(effectName) {
    const soundEffect = this.soundEffects[effectName];
    if (soundEffect) {
      soundEffect.pause();
    }
  }

  // Set the volume
  setVolume(volume) {
    this.volume = volume;

    // Update the volume of all theme tracks and sound effects
    for (const [trackName, themeTrack] of Object.entries(this.themeTracks)) {
      themeTrack.volume = this.volume;
    }

    for (const [effectName, soundEffect] of Object.entries(this.soundEffects)) {
      soundEffect.volume = this.volume;
    }
  }
}
class GameSound {
  constructor() {
    this.audioController = new AudioController();
  }

  // Add theme tracks and sound effects
  addAudioAssets() {

    this.audioController.addThemeTrack('theme1', './audio/funbeat1.mp3');


    this.audioController.addSoundEffect('effect1', './audio/sfx_exp_short_hard2.wav');

	
  }

  // Start playing a theme track
  playTheme(theme) {
    this.audioController.playThemeTrack(theme);

  }
  // Stop playing the theme track
  stopTheme(theme) {
    this.audioController.stopThemeTrack(theme);
  }
  // Play a sound effect
  playEffect(effect) {
    this.audioController.playSoundEffect(effect);
  }
  // Stop playing an effect
  stopEffect(effect) {
    this.audioController.stopSoundEffect(effect);
  }
}

gameSound = new GameSound();
gameSound.addAudioAssets();
console.log("audio loaded");

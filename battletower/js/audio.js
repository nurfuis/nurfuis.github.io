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
    this.audioController.addThemeTrack('theme1', './audio/sitar.mp3');
    this.audioController.addThemeTrack('theme2', './audio/battleThemeA.mp3');
    this.audioController.addThemeTrack('theme3', './audio/themeD.mp3');
    this.audioController.addThemeTrack('theme4', './audio/battleThemeC.mp3');
    this.audioController.addThemeTrack('theme5', './audio/nightB.mp3');
    
    this.audioController.addSoundEffect('effect1', './audio/menuSelectA.mp3');
    this.audioController.addSoundEffect('effect2', './audio/menuSelectB.mp3');
    this.audioController.addSoundEffect('effect3', './audio/menuSelectC.mp3');
    this.audioController.addSoundEffect('effect4', './audio/menuSelectD.mp3');	
    this.audioController.addSoundEffect('effect5', './audio/menu.mp3');
    this.audioController.addSoundEffect('effect6', './audio/menuSelectF.mp3');
    this.audioController.addSoundEffect('effect7', './audio/clicks4.mp3');
	
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



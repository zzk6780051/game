// 音乐
class Music {
  constructor(name) {
    this.audio = new Audio();
    this.load(name);
  }
  load(name) {
    this.audio.src = `../plainGame/mp3/${name}.mp3`;
  }
  play() {
    if (this.audio.readyState === 4) {
      this.audio.play();
    }
  }
  pause() {
    this.audio.pause();
  }
}

export default Music;

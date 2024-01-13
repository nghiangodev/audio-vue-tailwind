<template>
  <div class="ml-[245px] mb-[100px]">
    <div class="px-[20px] py-[40px]">
      <h2 class="text-white mb-[20px]">Spotify Playlists</h2>
      <div class="overflow-hidden pt-4 flex gap-2">
        <div @click="playAudio(playlist.id)" v-for="playlist in playlists" :key="playlist.id"
             class="group min-w-[140px] w-[160px] p-[15px] bg-gray-900 rounded-lg transition duration-300 hover:bg-gray-800">
          <img :src="playlist.track.image" class="w-[130px] h-[130px] object-cover rounded-lg mb-2" :alt="'Playlist Image ' + playlist.track.id"/>
          <div class="relative">
            <span class="absolute
                group-hover:bg-[#1db954]
                group-hover:p-[10px]
                group-hover:rounded
                right-12 top-neg-60
                top-[-40px]
                opacity-0 transition-all
                ease-in-out
                duration-400
                group-hover:opacity-100" :class="{
                'bg-[#1db954] ':  isIdPlay ===  playlist.id && isPlay,
                'p-[10px] ':  isIdPlay ===  playlist.id && isPlay,
                'rounded ':  isIdPlay ===  playlist.id && isPlay,
                'opacity-100 ':  isIdPlay ===  playlist.id && isPlay,
                }">
              <font-awesome-icon class="text-white" size="xl" :icon=" isIdPlay ===  playlist.id && isPlay ? 'pause' : 'play'"/>
            </span>
          </div>
          <h4 class="text-white text-lg font-semibold mb-2">{{ playlist.track.title }}</h4>
          <p class="text-gray-400 text-sm w-[200px]">{{ playlist.track.description }}</p>
          <div class="audio-wrapper">
            <audio ref="audioPlayer" preload="auto" :src="playlist.track.audioSrc" @ended="playNext" @loadeddata="initPlayer(playlist.id)"></audio>
          </div>
        </div>
      </div>
    </div>
    <div v-if="currentPlaylist"
         class="preview bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bottom-0 right-0 left-0  fixed  py-4 px-10 flex justify-between items-center">
      <div class="container mx-auto mb-0 gap-4 flex items-center">
        <button @click="playPrevious" class="!bg-none !bg-transparent !px-1">
          <font-awesome-icon class="text-white" size="lg" icon="caret-left"/>
        </button>
        <button @click="togglePlayPause" class="!bg-none !bg-transparent !px-1">
          <font-awesome-icon class="text-white" size="lg" :icon="isPlay ? 'pause' : 'play'"/>
        </button>
        <button @click="playNext" class="!bg-none !bg-transparent !px-1">
          <font-awesome-icon class="text-white" size="lg" icon="caret-right"/>
        </button>
        <img v-if="currentPlaylist" :src="currentPlaylist.track.image" class="w-[40px] h-[40px] object-cover" :alt="'Playlist Image ' + currentPlaylist.track.id"/>
        <span class="w-100 overflow-hidden inline-block whitespace-nowrap overflow-ellipsis" v-if="currentPlaylist">{{ currentPlaylist.track.title }}</span>
        <span>{{ formatTime(currentTime) }}</span>
        <div class="audio-player relative w-2/3 mx-auto">
          <div class="time-play-indicator absolute bottom-0 left-0 right-0">
            <div class="progress-bar relative h-1 bg-gray-300" @click="seekTo">
              <div class="progress h-full bg-green-500" :style="{ width: progressBarWidth }"></div>
              <div class="indicator absolute top-0 w-5 h-1 bg-green-500" :style="{ left: playIndicatorPosition }"></div>
            </div>
          </div>
        </div>
        <span>{{ formatTime(totalLength) }}</span>
        <div class="relative" @mouseleave="hideVolumeSlider">
          <button  @mouseover="showVolumeSlider = true"
                   @mousefocus="showVolumeSlider = true"
                   @blur="hideVolumeSlider" tabindex="0" @click="toggleMute" class="relative">
            <font-awesome-icon class="text-white" size="lg" :icon="showSoundIcon"/>
          </button>
          <div v-show="showVolumeSlider"  @mouseover="cancelHideVolumeSlider"
               @mouseleave="scheduleHideVolumeSlider" class="absolute bottom-[30px] w-full bg-white p-2 rounded shadow-md h-20 flex flex-col">
            <input type="range"  @mouseover="cancelHideVolumeSlider"
                   @blur="hideVolumeSlider"
                   @mouseleave="scheduleHideVolumeSlider"
                   @mousefocus="cancelHideVolumeSlider"
                   tabindex="0" min="0" max="1" step="0.01" v-model="volume" @input="updateAudioVolume" class="vertical-range w-1/2 h-full appearance-none rounded-md focus:outline-none focus:ring focus:border-blue-300
  thumb:-webkit-appearance-none thumb:appearance-none thumb:w-4 thumb:h-full thumb:rounded-full thumb:bg-blue-500 thumb:cursor-pointer
  track:w-1/2 track:h-full track:cursor-pointer track:bg-gradient-to-r from-gray-300 via-gray-300 to-gray-300 track:rounded-md
  focus:outline-none"/>
          </div>
        </div>
        <button @click="toggleShuffle" class="!bg-none !bg-transparent !px-1">
          <font-awesome-icon class="text-white" :class="{'text-yellow-200': isShuffle}" size="lg" icon="shuffle"/>
        </button>
        <button @click="toggleRepeat" class="!bg-none !bg-transparent !px-1">
          <font-awesome-icon class="text-white" :class="{'text-yellow-200': isRepeat}" size="lg" icon="repeat"/>
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import {nextTick, onBeforeUnmount, ref} from 'vue'

export default {
  name: 'AudioPage',
  data() {
    return {
      isPlaying: false,
      player: null,
      progressBarMargin: 0,
      currentTime: 0,
      totalLength: 0,
      isPlay: false,
      isIdPlay: 0,
      playlists: [
        {
          id: 1,
          track: {
            id: 3,
            title: 'Gucci Gang',
            description: 'Lil Pump',
            image: '/public/images/lilpump.jpg',
            audioSrc: '/public/audio/8578.mp3',
          },
        },
        {
          id: 2,
          track: {
            id: 4,
            title: 'Váy cưới em như bông tuyết',
            description: 'Chinese song',
            image: '/public/images/dress.jpg',
            audioSrc: '/public/audio/asb.mp3',
          },
        },
      ],
      audioPlayers: {},
      currentPlaylistId: null,
      isShuffle: false,
      isRepeat: false,
      isCurrentPlaylistId: 0,
      volume: 1,
      isMuted: false,
      showVolumeToolbar: false,
      showVolumeSlider: false,
      showSoundIcon: 'volume-high',
      hideVolumeTimeout: null
    }
  },
  computed: {
    progressBarWidth() {
      return `${(this.currentTime / this.totalLength) * 98.1}%`
    },
    playIndicatorPosition() {
      return `${(this.currentTime / this.totalLength) * 98.1}%`
    },
    currentPlaylist() {
      return this.playlists.find(playlist => playlist.id === this.currentPlaylistId)
    },
  },
  methods: {
    playAudio(playlistId) {
      if (this.currentPlaylistId !== playlistId) {
        this.stopCurrentPlaylist()
      }

      this.isIdPlay = playlistId

      const audioPlayer = this.audioPlayers[playlistId]

      if (audioPlayer) {
        if (audioPlayer.paused) {
          this.isPlay = true
          audioPlayer.play()
          this.isCurrentPlaylistId = playlistId
        } else {
          this.isPlay = false
          audioPlayer.pause()
        }
        this.currentPlaylistId = playlistId
      }
    },
    stopCurrentPlaylist() {
      const currentAudioPlayer = this.audioPlayers[this.currentPlaylistId]
      if (currentAudioPlayer) {
        currentAudioPlayer.pause()
        currentAudioPlayer.currentTime = 0
      }
    },
    initPlayer(playlistId) {
      this.audioPlayers[playlistId] = new Audio(this.playlists.find(p => p.id === playlistId).track.audioSrc)
      this.audioPlayers[playlistId].addEventListener('timeupdate', () => this.timeCal(playlistId))
      this.audioPlayers[playlistId].addEventListener('ended', () => {
        this.isPlaying = false

        if (!this.isRepeat && !this.isShuffle) {
          return false
        }

        this.playNext()
      })

      this.audioPlayers[playlistId].addEventListener('loadeddata', () => {
        this.setupAudioEventListener(playlistId)
      })
    },
    togglePlayPause() {
      const audioPlayer = this.audioPlayers[this.currentPlaylistId]

      if (audioPlayer) {
        if (audioPlayer.paused) {
          this.isPlay = true
          audioPlayer.play()
        } else {
          this.isPlay = false
          audioPlayer.pause()
        }
        this.isPlaying = !this.isPlaying
      }
    },
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const secondsInt = Math.floor(seconds % 60)
      return `${String(minutes).padStart(2, '0')}:${String(secondsInt).padStart(2, '0')}`
    },
    timeCal(playlistId) {
      const audioPlayer = this.audioPlayers[playlistId]

      if (audioPlayer) {
        this.currentTime = audioPlayer.currentTime
        this.totalLength = audioPlayer.duration
        this.progressBarMargin = `${(this.currentTime / this.totalLength) * 100}%`
      }
    },
    toggleShuffle() {
      this.isShuffle = !this.isShuffle
    },
    toggleRepeat() {
      this.isShuffle = false
      this.isRepeat = !this.isRepeat
    },
    playNext() {
      this.stopCurrentPlaylist()
      const currentIndex = this.playlists.findIndex(playlist => playlist.id === this.currentPlaylistId)
      let nextIndex

      if (this.isRepeat) {
        nextIndex = currentIndex
      } else {
        nextIndex = (currentIndex + 1) % this.playlists.length
      }

      this.currentPlaylistId = this.playlists[nextIndex].id
      this.playAudio(this.currentPlaylistId)
    },
    playPrevious() {
      this.stopCurrentPlaylist()
      const currentIndex = this.playlists.findIndex(playlist => playlist.id === this.currentPlaylistId)
      let previousIndex

      if (this.isRepeat) {
        previousIndex = currentIndex
      } else {
        previousIndex = (currentIndex - 1 + this.playlists.length) % this.playlists.length
      }

      this.currentPlaylistId = this.playlists[previousIndex].id
      this.playAudio(this.currentPlaylistId)
    },
    seekTo(event) {
      const progressBar = event.currentTarget
      const clickPosition = event.clientX - progressBar.getBoundingClientRect().left
      const totalWidth = progressBar.clientWidth
      const seekPercentage = clickPosition / totalWidth
      const seekTime = seekPercentage * this.totalLength

      const audioPlayer = this.audioPlayers[this.currentPlaylistId]
      if (audioPlayer) {
        audioPlayer.currentTime = seekTime
      }
    },
    setupAudioEventListener(playlistId) {
      const audioPlayer = this.audioPlayers[playlistId]

      if (audioPlayer && audioPlayer.addEventListener) {

        const checkEnded = () => {
          this.checkEnded(playlistId)
          return false
        }

        audioPlayer.addEventListener('timeupdate', checkEnded)

        onBeforeUnmount(() => {
          audioPlayer.removeEventListener('timeupdate', checkEnded)
        })
      } else {
        console.error('Unable to add event listener: audioPlayer not found or does not support addEventListener.')
      }
    },
    checkEnded(playlistId) {
      const audioPlayer = this.audioPlayers[playlistId]

      if (audioPlayer.currentTime === audioPlayer.duration) {

        if (this.repeat) {
          audioPlayer.currentTime = 0
        } else {
          audioPlayer.pause()
          this.isPlaying = false
          return false
        }
      }
    },
    toggleMute() {
      this.isMuted = !this.isMuted
      if (this.isMuted) {
        this.volume = 0
      } else {
        this.volume = 1
      }
      this.updateAudioVolume()
      this.trackingIconSound()
    },
    updateAudioVolume() {
      const audioPlayer = this.audioPlayers[this.currentPlaylistId]
      if (audioPlayer) {
        audioPlayer.volume = this.isMuted ? 0 : this.volume
      }
      this.trackingIconSound()
    },
    trackingIconSound() {
      switch (this.volume * 1) {
        case  1:
          this.showSoundIcon = 'volume-high'
          break
        case 0:
          this.showSoundIcon = 'volume-xmark'
          break
        default:
          this.showSoundIcon = 'volume-low'
          break
      }
    },
    hideVolumeSlider() {
      this.hideVolumeTimeout = setTimeout(() => {
        this.showVolumeSlider = false;
      }, 100); // Adjust the delay as needed
    },
    cancelHideVolumeSlider() {
      clearTimeout(this.hideVolumeTimeout);
    },
    scheduleHideVolumeSlider() {
      this.hideVolumeTimeout = setTimeout(() => {
        this.hideVolumeSlider();
      }, 100);
    },
  },
}
</script>
<style>
@import "../style/index.scss";
</style>
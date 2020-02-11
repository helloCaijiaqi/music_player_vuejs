<template>
<div class="player-wrap">
        <div class="circle" ref="outBtn" @click="outBtnClick" @mouseover="outBtnMouseover" @mouseleave="outBtnMouseleave"><span ref="spanImg">open</span></div>
        <div class="player">
            <div class="controler">
                <audio src="" ref="audioObj" @loadeddata="audioObjLoadeddata" @ended="audioObjEnded"></audio>
                <a href="javascript:" class="btn prev" ref="prev" @click.stop="prevBtnClick"><span>prev</span></a>
                <div class="play-wrap">
                    <div class="picture"></div>
                    <a href="##" class="play" ref="play" @click.stop="playBtnClick" @mouseover="playBtnMouseover" @mouseleave="playBtnMouseleave">播放</a>
                </div>
                <a href="##" class="btn next" ref="next" @click.stop="nextBtnClick"><span>next</span></a>
            </div>
            <div class="process">
                <div class="song-name" ref="songName">香水百合</div>
                <div class="process-bar" ref="processBar" @click.stop="processBarElClick">
                    <div class="bar-cover"></div>
                    <div class="point" @mousedown.prevent="pointElMousedown"></div>
                </div>
                <div class="time-duration">
                    <span ref="currentTime">00:00</span>/
                    <span ref="duration">00:00</span>
                </div>
            </div>
            <div class="others" ref="others">
                <div class="volume-wrap" ref="volumeWrap">
                    <a href="javascript:" class="linkVolume" ref="linkVolume" @click.stop="linkVolumeObjClick" @mouseover="linkVolumeObjMouseover" @mouseleave="linkVolumeObjMouseleave">声音</a>
                    <div class="volume" ref="volume" id="volume">
                        <div class="volume-bar" ref="volumeBar" @click.stop="volumeBarElClick">
                            <div class="volume-cover"></div>
                            <div class="volume-point" @mousedown.prevent="volumePointElMousedown"></div>
                        </div>
                    </div>
                </div>
                <div class="paly-mode"><a href="javascript:" class="mode" ref="mode" @click.stop="modeChangeBtnClick" @mouseover="modeChangeBtnMouseover" @mouseleave="modeChangeBtnMouseleave">模式</a></div>
            </div>
        </div>
    </div>
</template>

<script>
let publicPath = '../assets/musics'
export default {
  name: 'MusicPlayer',
  data(){
    return {
       musicListMeta : [],
       musicList : [],
       nowPlayMusicIndex : 0,
       mode :'loop'
    }
  },
  methods:{
    outBtnClick(){
       let wrapWidth = parseInt(window.getComputedStyle(this.$refs.outBtn.parentNode).width)
       let outBtnWidth = parseInt(window.getComputedStyle(this.$refs.outBtn).width)
       let result = wrapWidth - outBtnWidth
       if(this.nowRight <= 0){
            this.timer = setInterval(() => {
                this.nowRight+=10
                this.$refs.outBtn.parentNode.style.right = -this.nowRight + 'px'
                if(this.nowRight >= result){
                    this.$refs.outBtn.parentNode.style.right = -result + 'px'
                    clearInterval(this.timer)
                }
            },10)          
       }else{
            this.timer = setInterval(() => {
                this.nowRight-=10
                this.$refs.outBtn.parentNode.style.right = -this.nowRight + 'px'
                if(this.nowRight <= 0){
                    this.$refs.outBtn.parentNode.style.right = '0px'
                    clearInterval(this.timer)
                }
            },10)  
       }  
    },
    outBtnMouseover(){
      this.spanImgEl.style.backgroundImage = `url(http://localhost:3000/images/openover.png)`
    },
    outBtnMouseleave(){
      this.spanImgEl.style.backgroundImage = this.spanImg
    },
    playBtnClick(){
       this.flag = !this.flag
       this.playOrPause(this.flag)
    },
    playBtnMouseover(){
      this.playBtn.style.backgroundPositionX = this.playBtnImagePositionX - 40 + 'px'
    },
    playBtnMouseleave(){
      this.playBtn.style.backgroundPositionX = this.playBtnImagePositionX + 'px'
    },
    playOrPause(flag){
      if(flag){
            this.audioObj.play()
            this.playBtn.style.backgroundPositionY = this.playBtnImagePositionY + 39 + 'px'
            this.pointIFMouseDownFlag = false
            this.setProcessTimer()
        }else{
            this.audioObj.pause()
            this.playBtn.style.backgroundPositionY = this.playBtnImagePositionY + 'px'
            clearInterval(this.processTimer)
        }
    },
    setProcessTimer () {
        clearInterval(this.processTimer)
        this.processTimer = setInterval(() => {
            if(this.pointIFMouseDownFlag){     
                return
            }
            (this.degIndex<360)? this.degIndex+=2 : this.clearDegIndex()
            this.pictureEl.style.transform = `rotate(${this.degIndex}deg)`
            this.currentTimeHtml.innerHTML = this.timeFactory(this.audioObj.currentTime)
            this.setPointPosition ()
        }, 100);
    },
    clearDegIndex () {
        this.degIndex = 0
    },
    setPointPosition () {
        let processBarWidth = parseInt(window.getComputedStyle(this.processBarEl).width)
        let pointLeftPosition = parseInt( (processBarWidth) * (this.audioObj.currentTime/this.audioObj.duration) )
        this.processCoverEl.style.width =  pointLeftPosition  + 'px'
        this.pointEl.style.left = pointLeftPosition - 5 +'px'
    },
    audioObjLoadeddata (){
        this.currentTimeHtml.innerHTML = '00:00'
        this.processCoverEl.style.width = '0px'
        this.pointEl.style.left = '-5px'
        let result = this.timeFactory(this.audioObj.duration)
        this.durationHtml.innerHTML = result
        if(this.musicList[this.nowPlayMusicIndex]){
          this.songNameObj.innerHTML = this.musicList[this.nowPlayMusicIndex].name
        }
    },
    audioObjEnded(){
        if(this.mode == 'loop'){
            this.musicList = [...this.musicListMeta]
            this.changeSong('next')
            this.clearDegIndex()
        }else if(this.mode == 'repeat'){
            this.changeSong('repeat')
            this.clearDegIndex()
        }else if(this.mode == 'random'){
            this.musicList = this.shuffle(this.musicList)
            this.changeSong('next')
            this.clearDegIndex()
        }
    },
    changeSong (nOrPOrN) {
        switch (nOrPOrN) {
            case 'next':
                (this.nowPlayMusicIndex >= this.musicList.length-1)? this.nowPlayMusicIndex = 0:this.nowPlayMusicIndex++
                this.audioObj.setAttribute('src',encodeURI(this.musicList[this.nowPlayMusicIndex].src))
                this.flag = true
                this.playOrPause(this.flag)
                break;
            case 'prev':
                (this.nowPlayMusicIndex <= 0)?this.nowPlayMusicIndex = this.musicList.length-1:this.nowPlayMusicIndex--
                this.audioObj.setAttribute('src',encodeURI(this.musicList[this.nowPlayMusicIndex].src)) 
                this.flag = true
                this.playOrPause(this.flag)
                break;
            case 'repeat':
                this.nowPlayMusicIndex = this.nowPlayMusicIndex
                this.audioObj.setAttribute('src',encodeURI(this.musicList[this.nowPlayMusicIndex].src))
                this.flag = true
                this.playOrPause(this.flag)
                break;
        }
    },
    nextBtnClick(){
      this.changeSong('next')
      this.clearDegIndex()
    },
    prevBtnClick(){
      this.changeSong('prev')
      this.clearDegIndex()
    },
    btnDisplayChange (DomEl) {
        let imagePositon = parseInt(window.getComputedStyle(DomEl).backgroundPositionX)
        DomEl.addEventListener('mouseover',() => {
            DomEl.style.backgroundPositionX = imagePositon + 122 +'px'
        })
        DomEl.addEventListener('mouseleave',() => {
            DomEl.style.backgroundPositionX = imagePositon +'px'
        })
    },
     setCurrentTime (time) {
        this.audioObj.currentTime = time
        this.currentTimeHtml.innerHTML = this.timeFactory(time)
    },
    processBarElClick(e){
        let processBarWidth =  parseInt(window.getComputedStyle(this.processBarEl).width)
        let othersWidth = parseInt(window.getComputedStyle(this.othersEl).width)
        let mouseLeft = parseInt( e.clientX - (document.body.offsetWidth - othersWidth - processBarWidth) -15)
        let time = this.audioObj.duration * (mouseLeft / processBarWidth)
        this.setCurrentTime(time)  
        this.setPointPosition ()
    },
    pointElMousedown(e){
        this.pointIFMouseDownFlag = !this.pointIFMouseDownFlag
        let pointLeftPosition =  parseInt(window.getComputedStyle(this.pointEl).left)
        let processBarWidth =  parseInt(window.getComputedStyle(this.processBarEl).width)
        let mouseDownX = e.clientX
        let totalMoveDur = 0
        document.onmousemove = (e) => {
            let moveDur = e.clientX - mouseDownX
            totalMoveDur = moveDur + pointLeftPosition
            if(totalMoveDur < -5){
                totalMoveDur = -5
            }
            if(totalMoveDur > (processBarWidth - 5)){
                totalMoveDur = processBarWidth - 5
            }
            this.processCoverEl.style.width =  totalMoveDur + 5 + 'px'
            this.pointEl.style.left = totalMoveDur +'px'
            let time = this.audioObj.duration * (( totalMoveDur + 5 )/ processBarWidth)
            this.currentTimeHtml.innerHTML = this.timeFactory(time)
            document.onmouseup = () => {
                document.onmousemove = null
                this.setCurrentTime(time)
                this.pointIFMouseDownFlag = !this.pointIFMouseDownFlag
                document.onmouseup = null
            }
        }     
    },
    linkVolumeObjClick(){
      this.volumeDisplayFlag = !this.volumeDisplayFlag
        if(this.volumeDisplayFlag){
            this.volumeEl.style.display = 'block'
            this.setVolume(this.audioObj.volume) 
        }else{
            this.volumeEl.style.display = 'none'
        }   
    },
    linkVolumeObjMouseover(){
      this.linkVolumeObj.style.backgroundPositionX = this.linkVolumeObjImgPositionX - 29 +'px'
    },
    linkVolumeObjMouseleave(){
      this.linkVolumeObj.style.backgroundPositionX = this.linkVolumeObjImgPositionX + 'px'
    },
    setVolume (volume) {
      if(volume < 0){
          volume = 0
      }
      if(volume > 1){
          volume = 1
      }
      this.audioObj.volume = volume
      let volumeBarHeight =  parseInt( window.getComputedStyle(this.volumeBarEl).height )
      let volumeDuration = volume * volumeBarHeight
      this.volumePointEl.style.bottom = volumeDuration - 5 + 'px'
      this.volumeCoverEl.style.height = volumeDuration + 'px'
    },
    volumeBarElClick(e){
      let volumeBarHeight = parseInt( window.getComputedStyle(this.volumeBarEl).height )
      let volumeDuration =  document.documentElement.clientHeight - e.clientY - 67 
      let volume = (volumeDuration / volumeBarHeight).toFixed(2)
      this.setVolume(volume)
    },
    volumePointElMousedown(e){
      let pointBottomPosition =  parseInt(window.getComputedStyle(this.volumePointEl).bottom)
      let volumeBarHeight = parseInt( window.getComputedStyle(this.volumeBarEl).height )
      let mouseDownY = document.documentElement.clientHeight - e.clientY - 67
      let totalMoveDur = 0
      document.onmousemove = (e) => {
          let moveDur = document.documentElement.clientHeight - e.clientY - 67 - mouseDownY
          totalMoveDur = moveDur + pointBottomPosition
          if(totalMoveDur < -5){
              totalMoveDur = -5
          }
          if(totalMoveDur > (volumeBarHeight - 5)){
              totalMoveDur = volumeBarHeight - 5
          }
          let volume = (( totalMoveDur + 5 )/ volumeBarHeight).toFixed(2)
          this.setVolume(volume)
          document.onmouseup = () => {
              document.onmousemove = null
              document.onmouseup = null
          }
      }
    },
    setMode (modeNowFlag) {
      switch(modeNowFlag){
          case 0:
              this.mode = 'loop'
              this.modeChangeBtn.style.backgroundPositionX = '-1px'
              this.modeChangeBtn.style.backgroundPositionY = '-341px'
              this.modeChangeBtnImgPositionX = -1
              break;
          case 1:
              this.mode = 'repeat'
              this.modeChangeBtn.style.backgroundPositionX = '-64px'
              this.modeChangeBtn.style.backgroundPositionY = '-341px'
              this.modeChangeBtnImgPositionX = -64
              // -91
              break;
          case 2:
              this.mode = 'random'
              this.modeChangeBtn.style.backgroundPositionX = '-64px'
              this.modeChangeBtn.style.backgroundPositionY = '-245px'
              this.modeChangeBtnImgPositionX = -64
              // -91
              break;
      }
    },
    modeChangeBtnClick(){
        this.modeNowFlag++
        if(this.modeNowFlag > 2){
            this.modeNowFlag = 0
        }
        this.setMode(this.modeNowFlag)
    },
    modeChangeBtnMouseover(){
        if(this.mode == 'loop'){
            this.modeChangeBtn.style.backgroundPositionX = this.modeChangeBtnImgPositionX - 30 +'px'
        }else if(mode == 'repeat'){
            this.modeChangeBtn.style.backgroundPositionX = this.modeChangeBtnImgPositionX - 27 +'px'
        }else if(mode == 'random'){
            this.modeChangeBtn.style.backgroundPositionX = this.modeChangeBtnImgPositionX - 27 +'px'
        }
    },
    modeChangeBtnMouseleave(){
        this.modeChangeBtn.style.backgroundPositionX = this.modeChangeBtnImgPositionX + 'px'
    },
    timeFactory(secondNum){
        let minute = parseInt(secondNum/60)
        let second = parseInt(secondNum%60)
        if(minute>=10){ 
            minute = minute
            if(second>=10){ second = second}
            else{second = '0' + second}
        }else{
            minute = '0' + minute
            if(second>=10){second = second}
            else{second = '0' + second}
        }   
       return minute + ':' + second
    },
    shuffle(arr) {
        let len = arr.length;
        for (let i = 0; i < len - 1; i++) {
            let index = parseInt(Math.random() * (len - i));
            let temp = arr[index];
            arr[index] = arr[len - i - 1];
            arr[len - i - 1] = temp;
         }
        return arr;
    }
  },
  mounted(){
    this.$axios({
      method:'get',
      url:'http://localhost:3000/api',
      responseTypr:'json'
    }).then((res)=>{
      if(res.status==200){
        this.musicListMeta = res.data.musiclist
        this.musicList = [...this.musicListMeta]
        this.audioObj = this.$refs.audioObj
        this.audioObj.setAttribute('src',this.musicList[this.nowPlayMusicIndex].src)
      }
    })
    this.timer = null
    this.nowRight = 0
    this.spanImgEl = this.$refs.spanImg
    this.spanImg = window.getComputedStyle(this.spanImgEl).backgroundImage
    this.playBtn = this.$refs.play
    this.pictureEl = this.playBtn.parentElement.children[0]
    this.flag = false
    this.playBtnImagePositionY = parseInt(window.getComputedStyle(this.playBtn).backgroundPositionY)
    this.playBtnImagePositionX = parseInt(window.getComputedStyle(this.playBtn).backgroundPositionX)
    this.processTimer = null
    this.degIndex = 0
    this.currentTimeHtml = this.$refs.currentTime
    this.processBarEl = this.$refs.processBar
    this.processCoverEl = this.processBarEl.children[0]
    this.pointEl = this.processBarEl.children[1]
    this.othersEl = this.$refs.others
    this.pointIFMouseDownFlag = false
    this.songNameObj = this.$refs.songName
    this.durationHtml = this.$refs.duration
    this.nextBtn = this.$refs.next
    this.prevBtn = this.$refs.prev
    this.btnDisplayChange(this.nextBtn)
    this.btnDisplayChange(this.prevBtn)
    this.linkVolumeObj = this.$refs.linkVolume
    this.volumeEl = this.$refs.volume
    this.volumeDisplayFlag = false
    this.linkVolumeObjImgPositionX = parseInt(window.getComputedStyle(this.linkVolumeObj).backgroundPositionX)
    document.onclick = (e) => {
        if(e.target.id=='volume'){
            return
        }
        if(this.volumeDisplayFlag){
            this.volumeDisplayFlag = false
            this.volumeEl.style.display = 'none'
        }
    }
    this.volumeBarEl = this.$refs.volumeBar
    this.volumeCoverEl = this.volumeBarEl.children[0]
    this.volumePointEl = this.volumeBarEl.children[1]
    this.modeNowFlag = 0
    this.modeChangeBtn = this.$refs.mode
    this.modeChangeBtnImgPositionX = parseInt(window.getComputedStyle(this.modeChangeBtn).backgroundPositionX)
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  a{
    text-decoration-line: none;
  }
  .player-wrap{
      display: flex;
      flex-wrap: nowrap;
      position: fixed;
      width: 40%;
      bottom: 5px;
      right:0;
      color: #f3f3f3;
  }
  .circle{
      flex: 1;
      height: 50px;
      min-width: 50px;
      border-radius: 50% 0 0 50%/50%;
      background-color: #2d2d2d;
      box-sizing: border-box;
      border-top: 1px #1e1e1e solid;
      box-shadow: 0 -3px 3px #d8d8d8;
      cursor: pointer;
      text-indent: -999999px;
  }
  .circle span{
      height: 20px;
      width: 20px;
      margin-top: 14px;
      display: block;
      background-image: url(../assets/images/openleave.png);
  }
  .player{
      display:flex;
      flex-wrap: nowrap;
      flex: 11;
      height: 50px;
      background-color: #2d2d2d;
      box-sizing: border-box;
      border: 1px #1e1e1e solid;
      box-shadow: 0 -3px 3px #d8d8d8;
  }
  .controler{
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-around ;
      flex:3;
      height: 100%;
  }
  .play-wrap{
      position: relative;
  }
  .picture{
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-image: url(../assets/images/play.png);
  }
  .btn{
      width: 30px;
      height: 30px;
      margin: 9px 0;
      text-indent: -999999px;
  }
  .next{
      background-image: url(../assets/images/playbar.png);
      background-position: 73px -129px;
      /* 195 */
  }
  .prev{
      background-image: url(../assets/images/playbar.png);
      background-position: 1px -129px; 
      /* 123  */
  }
  .play{
      position: absolute;
      display: block;
      left: 1px;
      top: 0px;
      margin: 6.5px;
      width: 35px;
      height: 35px;
      text-indent: -99999px;
      background-image: url(../assets/images/playbar.png);
      background-position: -1px -204px;
      opacity: 0.9;
  }
  .process{
      margin-left: 10px;
      flex: 6;
      display: flex;
      flex-direction: column;
  }
  .song-name{
      min-width: 100px;
      font-size: 11px;
      font-family: Arial;
      text-align: center;
      line-height: 20px;
      opacity: 0.9;
  }
  .process-bar{
      width: 100%;
      height: 8px;
      border-radius: 10px;
      background-color: darkgray;
      position: relative;
      cursor: pointer;
  }
  .bar-cover{
      box-sizing: border-box;
      border: darkgray 1px solid;
      border-radius: 10px;
      height:8px;
      width: 0px;
      background-color: #c70c0c;
      opacity: 0.5;
  }
  .point{
      height: 10px;
      width: 10px;
      border-radius: 50%;
      background-color: #c70c0c;
      position: absolute;
      left:-5px;
      top: -1px;
      box-sizing: border-box;
      border: 2px #f3f3f3 solid;
  }
  .time-duration{
      min-width: 100px;
      line-height: 20px;
      font-size: 11px;
      font-family: Arial;
      text-align: center;
      opacity: 0.9;
  }
  .others{
      flex: 3;
      display: flex;
      justify-content: center;
      min-width: 70px;
  }
  .volume-wrap{
      position: relative;
  }
  .linkVolume{
      display: block;
      width: 30px;
      height: 30px;
      text-indent: -99999px;
      margin:9px 0 0 5px;
      background-image: url(../assets/images/playbar.png);
      background-position: 1px -245px;
      /* -28 */
  }
  .volume{
      display: none;
      border-radius: 5px;
      width:40px;
      height: 100px;
      background-color: #2d2d2d;
      box-sizing: border-box;
      border: 1px #1e1e1e solid;
      box-shadow: 2px -2px 2px #d8d8d8;
      position: absolute;
      left:0;
      top:-102px;
  }
  .volume-bar{
      position: relative;
      margin-left: 15px;
      margin-top: 10px;
      border-radius: 10px;
      cursor: pointer;
      width: 8px;
      height: 80px;
      background-color:darkgray ;
  }
  .volume-cover{
      position: absolute;
      box-sizing: border-box;
      border: darkgray 1px solid;
      border-radius: 10px;
      height:0;
      width: 8px;
      left:0;
      bottom: 0;
      background-color: #c70c0c;
      opacity: 0.5;
  }
  .volume-point{
      height: 10px;
      width: 10px;
      border-radius: 50%;
      background-color: #c70c0c;
      box-sizing: border-box;
      border: 2px #f3f3f3 solid;
      position: absolute;
      left: -1px;
      bottom: -5px;
  }
  .player-wrap .others a{
      color:#f3f3f3;
      text-decoration-line: none;
  }
  .mode{
      display: block;
      width: 30px;
      height: 30px;
      text-indent: -99999px;
      margin:9px 0 0 5px;
      background-image: url(../assets/images/playbar.png);
      background-position: -1px -341px;
      /* -31 */
  }
</style>

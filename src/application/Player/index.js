import React, { useRef, useState, useEffect } from 'react';
import MiniPlayer from './mini-player';
import {
  changePlayingState,
  changeShowPlayList,
  changeCurrentIndex,
  changeCurrentSong,
  changePlayList,
  changePlayMode,
  changeFullScreen
} from "./store/actionCreators";
import { connect } from 'react-redux';
import { isEmptyObject, getSongUrl, findIndex, shuffle} from '../../api/utils';
import NormalPlayer from "./normalPlayer";
import { playMode } from '../../api/config';
import Toast from '../../baseUI/Toast/index';

function Player(props) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentPlayingLyric, setPlayingLyric] = useState("");
  const [modeText, setModeText] = useState("");

  let percent = isNaN(currentTime / duration) ? 0 : currentTime / duration;

  const {
    playing,
    currentSong:immutableCurrentSong,
    currentIndex,
    playList:immutablePlayList,
    mode,
    sequencePlayList: immutableSequencePlayList,
    fullScreen
  } = props;

  const {
    togglePlayingDispatch,
    togglePlayListDispatch,
    changeCurrentIndexDispatch,
    changeCurrentDispatch,
    changePlayListDispatch,
    changeModeDispatch,
    toggleFullScreenDispatch
  } = props;

  const playList = immutablePlayList.toJS();
  const currentSong = immutableCurrentSong.toJS();
  const sequencePlayList = immutableSequencePlayList.toJS();

  const [preSong, setPreSong] =useState({});

  const audioRef = useRef();
  const toastRef = useRef();

  const songReady = useRef(true);

  useEffect(() => {
    changeCurrentIndexDispatch(0);
  }, [changeCurrentIndexDispatch])

  useEffect(() => {
    if (
      !playList.length ||
      currentIndex === -1 ||
      !playList[currentIndex] ||
      playList[currentIndex].id === preSong.id
    )
      return;
    if (!songReady.current) {
      alert("操作过快！");
      return;
    }
    songReady.current = false;
    let current = playList[currentIndex];
    changeCurrentDispatch(current);
    setPreSong(current);
    audioRef.current.src = getSongUrl(current.id);
    setTimeout(() => {
      songReady.current = true;
    }, 1000);
    togglePlayingDispatch(true);
    setCurrentTime(0);
    setDuration((current.dt / 1000) | 0);
  }, [changeCurrentDispatch, currentIndex, playList, preSong.id, togglePlayingDispatch]);

  useEffect(() => {
    playing ? audioRef.current.play() : audioRef.current.pause();
  });

  const updateTime = e => {
    setCurrentTime(e.target.currentTime);
  }

  const clickPlaying = (e, state) => {
    e.stopPropagation();
    togglePlayingDispatch(state);
  }

  const handleEnd = () => {
    if (mode === playMode.loop) {
      handleLoop();
    } else {
      handleNext();
    }
  }

  // 切换到下一首
  const handleNext = () => {
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    if (mode === playMode.loop) {
      handleLoop();
      return;
    }
    let index = currentIndex + 1;
    if (index === playList.length) index = 0;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  }

  // 一首歌循环
  const handleLoop = () => {
    audioRef.current.currentTime = 0;
    changePlayingState(true);
    audioRef.current.play();
  }

  // 切换到上一首
  const handlePrev = () => {
    if (playList.length === 1) {
      handleLoop();
      return;
    }
    let index = currentIndex - 1;
    if (index < 0) index = playList.length - 1;
    if (!playing) togglePlayingDispatch(true);
    changeCurrentIndexDispatch(index);
  }

  const onProgressChange = curPercent => {
    const newTime = curPercent * duration;
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
    if (!playing) {
      togglePlayingDispatch(true);
    }
  };

  // 切换播放模式
  const changeMode = () => {
    let newMode = (mode + 1) % 3;
    if (newMode === 0) {
      // 顺序模式
      changePlayListDispatch(sequencePlayList);
      let index = findIndex(currentSong, sequencePlayList);
      changeCurrentIndexDispatch(index);
      setModeText("顺序循环");
    } else if (newMode === 1) {
      // 单曲循环
      changePlayListDispatch(sequencePlayList);
      setModeText("单曲循环");
    } else if (newMode === 2) {
      // 随机播放
      let newList = shuffle(sequencePlayList);
      let index = findIndex(currentSong, newList);
      changePlayListDispatch(newList);
      changeCurrentIndexDispatch(index);
      setModeText("随机播放");
    }
    changeModeDispatch(newMode);
    toastRef.current.show();
  }

  return (
    <div>
      {isEmptyObject(currentSong) ? null : (
        <NormalPlayer
          song={currentSong}
          fullScreen={fullScreen}
          toggleFullScreen={toggleFullScreenDispatch}
          playing={playing}
          clickPlaying={clickPlaying}
          duration={duration}
          currentTime={currentTime}
          percent={percent}
          onProgressChange={onProgressChange}
          handlePrev={handlePrev}
          handleNext={handleNext}
          mode={mode}
          changeMode={changeMode}
        ></NormalPlayer>
      )}
      {isEmptyObject(currentSong) ? null : (
        <MiniPlayer
          playing={playing}
          full={fullScreen}
          song={currentSong}
          percent={percent}
          clickPlaying={clickPlaying}
          setFullScreen={toggleFullScreenDispatch}
          togglePlayList={togglePlayListDispatch}
        >
        </MiniPlayer>
      )}

      <audio
        ref={audioRef}
        onTimeUpdate={updateTime}
        onEnded={handleEnd}
        // onError={handleError}
      >
      </audio>
      <Toast text={modeText} ref={toastRef}></Toast>
    </div>
  )
}

const mapStateToProps = state => ({
  fullScreen: state.getIn(["player", "fullScreen"]),
  playing: state.getIn(["player", "playing"]),
  currentSong: state.getIn(["player", "currentSong"]),
  showPlayList: state.getIn(["player", "showPlayList"]),
  mode: state.getIn(["player", "mode"]),
  currentIndex: state.getIn(["player", "currentIndex"]),
  playList: state.getIn(["player", "playList"]),
  sequencePlayList: state.getIn(["player", "sequencePlayList"])
});

const mapDispatchToProps = dispatch => {
  return {
    togglePlayingDispatch(data) {
      dispatch(changePlayingState(data));
    },
    toggleFullScreenDispatch(data) {
      dispatch(changeFullScreen(data));
    },
    togglePlayListDispatch(data) {
      dispatch(changeShowPlayList(data));
    },
    changeCurrentIndexDispatch(index) {
      dispatch(changeCurrentIndex(index));
    },
    changeCurrentDispatch(data) {
      dispatch(changeCurrentSong(data));
    },
    changeModeDispatch(data) {
      dispatch(changePlayMode(data));
    },
    changePlayListDispatch(data) {
      dispatch(changePlayList(data));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Player));

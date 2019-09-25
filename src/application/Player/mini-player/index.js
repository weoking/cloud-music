import React, { useRef, useEffect} from 'react';
import { CSSTransition } from 'react-transition-group';
import { getName } from '../../../api/utils';
import { MiniPlayerContainer } from './style';
import { useCallback } from 'react';


function MiniPlayer(props) {
  const { full, song, playing, percent } = props;
  const { clickPlaying, setFullScreen, togglePlayList } = props;

  return (
    <CSSTransition
      in={!full}
      timeout={400}
      classNames="mini"
    >
      <MiniPlayerContainer>
        <div className="icon">
          <div className="imgWrapper">
            <img className={`play ${playing ? "" : "pause"}`}  src={song.al.picUrl} width="40" height="40" alt="img"/>
          </div>
        </div>
        <div className="text">
          <h2 className="name">{song.name}</h2>
          <p className="desc">{getName(song.ar)}</p>
        </div>
        <div className="control">
          { playing ?
            <i className="icon-mini iconfont icon-pause">&#xe614;</i> :
            <i className="icon-mini iconfont icon-play">&#xe607;</i>
          }
        </div>
        <div className="control">
          <i className="iconfont">&#xe617;</i>
        </div>
      </MiniPlayerContainer>
    </CSSTransition>
  )
}

export default React.memo(MiniPlayer)

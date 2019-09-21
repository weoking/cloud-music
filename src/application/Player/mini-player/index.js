import React, { useRef } from 'react';
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
            <img className={`play ${playing ? "" : "pause"}`} width="40" height="40" alt="img"/>
          </div>
        </div>
        <div className="text">
          <h2 className="name">song</h2>
          <p className="desc">desc</p>
        </div>
        <div className="control">
          control
        </div>
        <div className="control">
          <i className="iconfont">&#xe617;</i>
        </div>
      </MiniPlayerContainer>
    </CSSTransition>
  )
}

export default React.memo(MiniPlayer)
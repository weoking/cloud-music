import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container } from './style';
import Header from '../../baseUI/header/index';
import { ImgWrapper, CollectButton, SongListWrapper, BgLayer } from './style';
import Scroll from '../../baseUI/scroll';
import { EnterLoading } from '../Singers/style';
import Loading from '../../baseUI/loading';
import { CSSTransition } from 'react-transition-group';
import SongsList from '../SongsList/';
import MusicNote from '../../baseUI/music-note';
import { connect } from 'react-redux';
import { changeEnterLoading, getSingerInfo } from './store/actionCreators';
import { HEADER_HEIGHT } from '../../api/config';

function Singer(props) {
  const [showStatus, setShowStatus] = useState(true);
  const initialHeight = useRef(0);

  const {
    artist: immutableArtist,
    songs: immutableSongs,
    loading,
    songsCount
  } = props;
  const OFFSET = 5;

  const artist = immutableArtist.toJS();
  const songs = immutableSongs.toJS();

  const header = useRef();
  const songScroll = useRef();
  const imageWrapper = useRef();
  const songScrollWrapper = useRef();
  const layer = useRef();
  const collectButton = useRef();

  const { getSingerDataDispatch } = props;


  useEffect(() => {
    const id = props.match.params.id;
    getSingerDataDispatch(id);
    let h = imageWrapper.current.offsetHeight;
    initialHeight.current = h;
    songScrollWrapper.current.style.top = `${h - OFFSET}px`
    layer.current.style.top = `${h - OFFSET}px`;
    songScroll.current.refresh();
  }, [getSingerDataDispatch, props.match.params.id]);

  const setShowStatusFalse = useCallback(() => {
    setShowStatus(false);
  }, []);

  const handleScroll = pos => {
    let height = initialHeight.current;
    const newY = pos.y;
    const imageDOM = imageWrapper.current;
    const buttonDOM = collectButton.current;
    const headerDOM = header.current;
    const layerDOM = layer.current;
    const minScrollY = -(height - OFFSET) + HEADER_HEIGHT;

    const percent = Math.abs(newY / height);
    if (newY > 0) {
      imageDOM.style["transform"] = `scale(${1 + percent})`;
      buttonDOM.style["transform"] = `translate3d(0, ${newY}px, 0)`;
      layerDOM.style.top = `${height - OFFSET + newY}px`;
    } else if (newY >= minScrollY) {
      layerDOM.style.top = `${height - OFFSET - Math.abs(newY)}px`;
      layerDOM.style.zIndex = 1;
      imageDOM.style.paddingTop = "75%";
      imageDOM.style.height = 0;
      imageDOM.style.zIndex = -1;
      buttonDOM.style["transform"] = `translate3d(0, ${newY}px 0)`;
      buttonDOM.style["opacity"] = `${1 - percent * 2}`;
    } else if (newY < minScrollY) {
      layerDOM.style.top = `${HEADER_HEIGHT - OFFSET}px`;
      layerDOM.style.zIndex = 1;
      headerDOM.style.zIndex = 100;
      imageDOM.style.height = `${HEADER_HEIGHT}px`;
      imageDOM.style.paddingTop = 0;
      imageDOM.style.zIndex = 99;
    }

  }

  return (
    <CSSTransition
      in={showStatus}
      timeout={300}
      classNames="fly"
      appear={true}
      unmountOnExit
      onExited={() => props.history.goBack()}
    >
      <Container>
        <Header
          handleClick={setShowStatusFalse}
          title={artist.name}
          ref={header}
        ></Header>
        <ImgWrapper ref={imageWrapper} bgUrl={artist.picUrl}>
          <div className="filter"></div>
        </ImgWrapper>
        <CollectButton ref={collectButton}>
          <i className="iconfont">&#xe620;</i>
          <span className="text">收藏</span>
        </CollectButton>
        <BgLayer ref={layer}></BgLayer>
        <SongListWrapper ref={songScrollWrapper} play={songsCount}>
          <Scroll onScroll={handleScroll} ref={songScroll}>
            <SongsList
              songs={songs}
              showCollect={false}
              usePageSplit={false}
            ></SongsList>
          </Scroll>
        </SongListWrapper>
        {loading ? (
          <EnterLoading style={{ zIndex: 100}}>
            <Loading></Loading>
          </EnterLoading>
        ) : null}
        <MusicNote></MusicNote>
      </Container>
    </CSSTransition>
  );
}

const mapStateToProps = state => ({
  artist: state.getIn(["singerInfo", "artist"]),
  songs: state.getIn(["singerInfo", "songsOfArtist"]),
  loading: state.getIn(["singerInfo", "loading"]),
  // songsCount: state.getIn(["player", "playerList"]).size
})

const mapDispatchToProps = dispatch => {
  return {
    getSingerDataDispatch(id) {
      dispatch(changeEnterLoading(true));
      dispatch(getSingerInfo(id));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singer));
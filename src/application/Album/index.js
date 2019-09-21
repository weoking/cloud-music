import React, { useState, useEffect, useRef}from 'react';
import { Container } from './style';
import { CSSTransition } from 'react-transition-group';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { changeEnterLoading, getAlbumList, changePullUpLoading, changeScrollY} from './store/actionCreators'
import { EnterLoading } from './../Singers/style';
import Loading from '../../baseUI/loading';
import Header from '../../baseUI/header/index';
import AlbumDetail from '../../components/album-detail';
import MusicNote from '../../baseUI/music-note';
import Scroll from '../../baseUI/scroll';
import { HEADER_HEIGHT } from '../../api/config';
import style from '../../assets/global-style';

function Album(props) {
  const [showStatus, setShowStatus] = useState(true);
  const [title, setTitle] = useState("歌单");
  const [isMarquee, setIsMarquee] = useState(false);

  const musicNoteRef = useRef();
  const headerEl = useRef();

  const id = props.match.params.id;

  const { currentAlbum, enterLoading, pullUpLoading, songsCount } = props;
  const { getAlbumDataDispatch, changePullUpLoadingStateDispatch } = props;

  useEffect(() => {
    const pathName = props.history.location.pathname;
    let urlStr = "";
    if (/recommend/.test(pathName)) {
      urlStr = "/recommend";
    } else if (/rank/.test(pathName)) {
      urlStr = "/rank";
    }
    getAlbumDataDispatch(id, urlStr)
  }, [getAlbumDataDispatch, id, props.history.location.pathname])

  const handleBack = () => {
    setShowStatus(false);
  };

  const handlePullUp = () => {
    changePullUpLoadingStateDispatch(true);
    changePullUpLoadingStateDispatch(false);
  }

  const handleScroll = (pos) => {
    const minScrollY = -HEADER_HEIGHT;
    let percent = Math.abs(pos.y / minScrollY);
    let headerDom = headerEl.current;
    if (pos.y < minScrollY) {
      headerDom.style.backgroundColor = style["theme-color"];
      headerDom.style.opacity = Math.min(1, (percent - 1) / 2);
      setTitle(props.currentAlbum.name);
      setIsMarquee(true);
    } else {
      headerDom.style.backgroundColor = "";
      headerDom.style.opacity = 1;
      setTitle("歌单");
      setIsMarquee(false);
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
        <Header ref={headerEl} title={title} handleClick={handleBack} isMarquee={isMarquee}></Header>
        {
          Object.keys(currentAlbum).length !== 0 ? (
            <Scroll
              onScroll={(pos) => handleScroll(pos)}
              pullUp={() => handlePullUp()}
              pullUpLoading={pullUpLoading}
              bounceTop={false}
            >
              <AlbumDetail currentAlbum={currentAlbum} pullUpLoading={pullUpLoading}></AlbumDetail>
            </Scroll>
          ) : null
        }
        { enterLoading ? <EnterLoading><Loading></Loading></EnterLoading> : null}
        <MusicNote></MusicNote>
      </Container>
    </CSSTransition>
  )
}

const mapStateToProps = (state) => ({
  currentAlbum: state.getIn(['album', 'currentAlbum']).toJS(),
  pullUpLoading: state.getIn(['album', 'pullUpLoading']),
  enterLoading: state.getIn(['album', 'enterLoading']),
  startIndex: state.getIn(['album', 'startIndex']),
  totalCount: state.getIn(['album', 'totalCount']),
  //songsCount: state.getIn(['player', 'playerList']).size
});

const mapDispatchToProps = (dispatch) => {
  return {
    getAlbumDataDispatch(id, fromURL) {
      dispatch(changeEnterLoading(true));
      dispatch(getAlbumList(id, fromURL));
    },
    changePullUpLoadingStateDispatch(state) {
      dispatch(changePullUpLoading(state));
    },
    changeScrollYDispatch(y) {
      dispatch(changeScrollY(y));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(withRouter(Album)));
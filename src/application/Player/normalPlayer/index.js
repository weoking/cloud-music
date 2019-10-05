import React, { useRef }from "react";
import { getName } from "../../../api/utils";
import {
  NormalPlayerContainer,
  Top,
  Middle,
  Bottom,
  Operators,
  CDWrapper,
} from "./style";
import { CSSTransition } from 'react-transition-group';
import animations from "create-keyframe-animation";
import { prefixStyle } from "../../../api/utils";

function NormalPlayer(props){
  const { song, fullScreen } = props;
  const { toggleFullScreen } = props;

  const normalPlayerRef = useRef();
  const CDWrapperRef = useRef();
  const transform = prefixStyle("transform");

  const enter = () => {
    normalPlayerRef.current.style.display = "block";
    const { x, y, scale } = _getPosAndScale();
    let animation = {
      0: {
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      },
      60: {
        transform: `translate3d(0, 0, 0) scale(1.1)`
      },
      100: {
        transform: `translate3d(0, 0, 0) scale(1)`
      }
    };
    animations.registerAnimation({
      name: "move",
      animation,
      presets: {
        duration: 400,
        easing: "linear"
      }
    });
    animations.runAnimation(CDWrapperRef.current, "move");
  };

  const _getPosAndScale = () => {
    const targetWidth = 40;
    const paddingLeft = 40;
    const paddingBottom = 30;
    const paddingTop = 80;
    const width = window.innerWidth * 0.8;
    const scale = targetWidth / width;
    const x = -(window.innerWidth / 2 - paddingLeft);
    const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
    return {
      x,
      y,
      scale
    };
  };

  const afterEnter = () => {
    const CDWrapperDom = CDWrapperRef.current;
    animations.unregisterAnimation("move");
    CDWrapperDom.style.animation = "";
  };

  const leave = () => {
    if (!CDWrapperRef.current) return;
    const CDWrapperDom = CDWrapperRef.current;
    CDWrapperDom.style.transition = "all 0.4s";
    const { x, y, scale } = _getPosAndScale();
    CDWrapperDom.style[transform] = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
  };

  const afterLeave = () => {
    if (!CDWrapperRef.current) return;
    const cdWrapperDom = CDWrapperRef.current;
    cdWrapperDom.style.transition = "";
    cdWrapperDom.style[transform] = "";
    // 一定要注意现在要把normalPlayer这个DOM给隐藏掉，因为CSSTransition的工作只是把动画执行一遍 
    // 不置为none现在全屏播放器页面还是存在
    normalPlayerRef.current.style.display = "none";
  };

  return (
    <CSSTransition
      classNames="normal"
      in={fullScreen}
      timeout={400}
      mountOnEnter
      onEnter={enter}
      onEntered={afterEnter}
      onExit={leave}
      onExited={afterLeave}
    >
      <NormalPlayerContainer ref={normalPlayerRef}>
        <div className="background">
          <img
            src={song.al.picUrl + "?param=300x300"}
            width="100%"
            height="100%"
            alt="歌曲图片"
          />
        </div>
        <div className="background layer"></div>
        <Top className="top">
          <div className="back" onClick={() => toggleFullScreen(false)}>
            <i className="iconfont icon-back">&#xe621;</i>
          </div>
          <h1 className="title">{song.name}</h1>
          <h1 className="subtitle">{getName(song.ar)}</h1>
        </Top>
        <Middle ref={CDWrapperRef}>
          <CDWrapper>
            <div className="cd">
              <img
                className="image play"
                src={song.al.picUrl + "?param=400x400"}
                alt=""
              />
            </div>
          </CDWrapper>
        </Middle>
        <Bottom className="bottom">
          <Operators>
            <div className="icon i-left">
              <i className="iconfont">&#xe62e;</i>
            </div>
            <div className="icon i-left">
              <i className="iconfont">&#xe62b;</i>
            </div>
            <div className="icon i-center">
              <i className="iconfont">&#xe614;</i>
            </div>
            <div className="icon i-right">
              <i className="iconfont">&#xe62c;</i>
            </div>
            <div className="icon i-right">
              <i className="iconfont">&#xe61e;</i>
            </div>
          </Operators>
        </Bottom>
      </NormalPlayerContainer>
    </CSSTransition>

  )
}

export default React.memo(NormalPlayer);

import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle} from 'react';
import PropTypes from 'prop-types';
import BScroll from 'better-scroll';
import styled from 'styled-components';

const ScrollContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`

const Scroll = forwardRef((props, ref) => {
  const [bScroll, setBScroll] = useState();
  const scrollContainerRef = useRef();

  const { direction, click, refresh, pullUpLoading, pullDownLoading, bounceTop, bounceBottom } = props;
  const { pullUp, pullDown, onScroll } = props

  // 创建scroll实例
  useEffect(() => {
    const scroll = new BScroll(scrollContainerRef.current, {
      scrollX: direction === "horizental",
      scrollY: direction === "vertical",
      probeType: 3,
      click: click,
      bounce: {
        top: bounceTop,
        bottom: bounceBottom
      }
    });
    setBScroll(scroll);
    return () => {
      setBScroll(null);
    }
  }, [bounceBottom, bounceTop, click, direction]);

  // 每次渲染刷新实例
  useEffect(() => {
    if (refresh && bScroll) {
      bScroll.refresh();
    }
  });

  // 绑定scroll事件
  useEffect(() => {
    if (!bScroll || !onScroll) return;
    bScroll.on('scroll', (scroll) => {
      onScroll(scroll);
    })
    return () => {
      bScroll.off('scroll');
    }
  }, [onScroll, bScroll]);

  // 调用上拉刷新的函数
  useEffect(() => {
    if (!bScroll || !pullUp) return;
    bScroll.on('scrollEnd', () => {
      if (bScroll.y <= bScroll.maxScrollY + 100) {
        pullUp();
      }
    });
    return () => {
      bScroll.off('scrollEnd');
    }
  }, [pullUp, bScroll]);

  // 调用下拉刷新的函数
  useEffect(() => {
    if (!bScroll || !pullDown) return;
    bScroll.on('touchEnd', (pos) => {
      if (pos.y > 50) {
        pullDown();
      }
    });
    return () => {
      bScroll.off('touchEnd');
    }
  }, [pullDown, bScroll]);

  // 向外暴露方法
  useImperativeHandle(ref, () => ({
    refresh() {
      if (bScroll) {
        bScroll.refresh();
        bScroll.scrollTo(0, 0);
      }
    },

    getBScroll() {
      if (bScroll) {
        return bScroll;
      }
    }
  }));

  return (
    <ScrollContainer ref={scrollContainerRef}>
      {props.children}
    </ScrollContainer>
  );

})

Scroll.propTypes = {
  direction: PropTypes.oneOf(['vertical', 'horizental']), // 滚动的方向
  click: true, // 是否支持点击
  refresh: PropTypes.bool, // 是否刷新
  onScroll: PropTypes.func, // 滑动触发的回调函数
  pullUp: PropTypes.func, // 上拉加载逻辑
  pullDown: PropTypes.func, // 下拉加载逻辑
  pullUpLoading: PropTypes.bool, // 是否显示上拉动画
  pullDownLoading: PropTypes.bool, // 是否显示下拉动画
  bounceTop: PropTypes.bool, //是否支持向上吸顶
  bounceBottom: PropTypes.bool, //是否支持向下吸底
};

Scroll.defaultProps = {
  direction: "vertical",
  click: true,
  refresh: true,
  onScroll: null,
  pullUpLoading: false,
  pullDownLoading: false,
  pullUp: null,
  pullDown: null,
  bounceTop: true,
  bounceBottom: true
};

export default Scroll;



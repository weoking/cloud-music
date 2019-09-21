import React, { useState, useEffect, useContext} from 'react';
import Horizen from '../../baseUI/horizen-item';
import Scroll from '../../baseUI/scroll/index';
import Loading from '../../baseUI/loading';
import { categoryTypes, alphaTypes } from '../../api/config';
import {
  NavContainer,
  ListContainer,
  List,
  ListItem,
  EnterLoading
} from './style';
import {
  getSingerList,
  getHotSingerList,
  changeEnterLoading,
  changePageCount,
  refreshMoreSingerList,
  changePullUpLoading,
  changePullDownLoading,
  refreshMoreHotSingerList
} from './store/actionCreators';
import { connect } from 'react-redux';
import LazyLoad, { forceCheck } from 'react-lazyload';
import { CategoryDataContext, CHANGE_ALPHA, CHANGE_CATEGORY } from './data';
import { renderRoutes } from 'react-router-config';
import { withRouter } from 'react-router-dom';

function Singers(props) {
  const { updateDispatch, getHotSingerDispatch, pullUpRefreshDispatch, pullDownRefreshDispatch} = props;
  
  const singerList = props.singerList.toJS();
  const { pageCount, pullUpLoading, pullDownLoading, enterLoading } = props;
  const { data, dispatch } = useContext(CategoryDataContext);
  const { category, alpha } = data.toJS();
    
  let handleUpdateAlpha = (val) => {
    dispatch({ type: CHANGE_ALPHA, data: val });
    updateDispatch(category, val);
  }

  let handleUpdateCategory = (val) => {
    dispatch({ type: CHANGE_CATEGORY, data: val });
    updateDispatch(val, alpha);
  }

  let handlePullUp = () => {
    pullUpRefreshDispatch(category, alpha, category === '', pageCount);
  }

  let handlePullDown = () => {
    pullDownRefreshDispatch(category, alpha);
  }

  useEffect(() => {
    if (!singerList.size) {
      getHotSingerDispatch()
    }
  }, [getHotSingerDispatch, singerList.size])

  const enterDetail = (id) => {
    props.history.push(`/singers/${id}`);
  }


  const renderSingerList = () => {
    return (
      <List>
        {
          singerList.map((item, index) => {
            return (
              <ListItem key={item.accountId+""+index} onClick={() => enterDetail(item.id)}>
                <div className="img_wrapper">
                  <LazyLoad placeholder={<img width="100%" height="100%" src={require('./singer.png')} alt="music"/>}>
                    <img src={`${item.picUrl}?param=300x300`} width="100%" height="100%" alt="music" />
                  </LazyLoad>
                </div>
                <span className="name">{item.name}</span>
              </ListItem>
            )
          })
        }
      </List>
    )
  };

  return (
    <div>
      <NavContainer>
        <Horizen
          list={categoryTypes}
          title={"分类(默认热门):"}
          handleClick={(item) => handleUpdateCategory(item.key)}
          oldVal={category}></Horizen>
        <Horizen
          list={alphaTypes}
          title={"首字母:"}
          handleClick={(item) => handleUpdateAlpha(item.key)}
          oldVal={alpha}></Horizen>
      </NavContainer>
      <ListContainer>
        <Scroll
          pullUp={ handlePullUp }
          pullDown={ handlePullDown }
          pullUpLoading={ pullUpLoading }
          pullDownLoading={pullDownLoading}
          onScroll={forceCheck}
        >
          {renderSingerList()}
        </Scroll>
      </ListContainer>
      { enterLoading ? <EnterLoading><Loading></Loading></EnterLoading> : null }
      { renderRoutes(props.route.routes) }
    </div>
  )
}

const mapStateToProps = (state) => ({
  singerList: state.getIn(['singers', 'singerList']),
  enterLoading: state.getIn(['singers', 'enterLoading']),
  pullUpLoading: state.getIn(['singers', 'pullUpLoading']),
  pullDownLoading: state.getIn(['singers', 'pullDownLoading']),
  pageCount: state.getIn(['singers', 'pageCount']),
})

const mapDispatchToProps = (dispatch) => {
  return {
    getHotSingerDispatch() {
      dispatch(getHotSingerList());
    },
    updateDispatch(category, alpha) {
      dispatch(changePageCount(0));
      dispatch(changeEnterLoading(true));
      dispatch(getSingerList(category, alpha));
    },
    pullUpRefreshDispatch(category, alpha, hot, count) {
      dispatch(changePullUpLoading(true));
      dispatch(changePageCount(count + 1));
      if (hot) {
        dispatch(refreshMoreHotSingerList());
      } else {
        dispatch(refreshMoreSingerList(category, alpha));
      }
    },
    pullDownRefreshDispatch(category, alpha) {
      dispatch(changePullDownLoading(true));
      dispatch(changePageCount(0));
      if (category === '' && alpha === '') {
        dispatch(getHotSingerList());
      } else {
        dispatch(getSingerList(category, alpha));
      }
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.memo(Singers));
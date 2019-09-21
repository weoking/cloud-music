import React, { useState, useEffect }from 'react';
import { SongList, SongItem } from "./style";
import { connect } from 'react-redux';
import { ONE_PAGE_COUNT } from '../../api/config';
import { getName } from '../../api/utils';

const SongsList = React.forwardRef((props, refs) => {

  const [startIndex, setStartIndex] = useState(0);

  const { songs, collectCount, showCollect, loading = false, usePageSplit } = props;

  const { musicAnimation } = props;
  const totalCount = songs.length;

  useEffect(() => {
    if (!loading) return;
    if (startIndex + 1 + ONE_PAGE_COUNT >= totalCount)
      return;
    setStartIndex(startIndex + ONE_PAGE_COUNT);
  }, [loading, startIndex, totalCount]);

  const selectItem = (e, index) => {
    
  }

  let songList = (list) => {
    let res = [];
    let end = usePageSplit ? startIndex + ONE_PAGE_COUNT : list.length;
    for (let i = 0; i < end; i++) {
      if (i >= list.length) break;
      let item = list[i];
      res.push(
        <li key={item.id} onClick={(e) => selectItem(e, i)}>
          <span className="index">{i + 1}</span>
          <div className="info">
            <span>{item.name}</span>
            <span>
              { item.ar ? getName(item.ar): getName(item.artists) } - { item.al ? item.al.name : item.album.name}
            </span>
          </div>
        </li>
      )
    }
    return res;
  };
  
  const collect = (count) => {
    return (
      <div className="add_list">
        <i className="iconfont">&#xe620;</i>
        <span>收藏({Math.floor(count/1000)/10}万)</span>
      </div>
    )
  };

  return (
    <SongList ref={refs} showBackground={props.showBackground}>
      <div className="first_line">
        <div className="play_all">
          <i className="iconfont">&#xe614;</i>
          <span>播放全部<span className="sum">(共{totalCount}首)</span></span>
        </div>
        { showCollect ? collect(collectCount) : null}
      </div>
      <SongItem>
        {songList(songs)}
      </SongItem>
    </SongList>
  )
});

export default React.memo(SongsList);
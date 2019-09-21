import React, { useRef, useState, useEffect } from 'react';
import MiniPlayer from './mini-player';

function Player(props) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentPlayingLyric, setPlayingLyric] = useState("");
  const [modeText, setModeText] = useState("");
  
  return (
    <MiniPlayer
      
    >
    </MiniPlayer>
  )
}

export default React.memo(Player);
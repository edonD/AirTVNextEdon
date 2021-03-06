import React, { useState, useRef } from "react";
import styled from "styled-components";
import ReactPlayer from "react-player";
import { makeStyles } from "@material-ui/core/styles";
import { useEffect } from "react";
import Controls from "./Controls";
import _ from "lodash";
import { connect } from "react-redux";

const useStyles = makeStyles((theme) => ({
  playerWrapper: {
    width: "100%",
    position: "relative",
    // "&:hover": {
    //   "& $controlsWrapper": {
    //     visibility: "visible",
    //   },
    // },
  },

  controlsWrapper: {
    visibility: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(1,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  topControls: {
    display: "flex",
    justifyContent: "flex-end",
    padding: 0,
  },
  middleControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomWrapper: {
    display: "flex",
    flexDirection: "column",

    background: "rgba(123,0,0,0.6)",
    // height: 60,
    padding: theme.spacing(2),
  },

  bottomControls: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    // height:40,
  },

  button: {
    margin: theme.spacing(1),
  },
  controlIcons: {
    color: "#777",

    fontSize: 50,
    transform: "scale(0.9)",
    "&:hover": {
      color: "#fff",
      transform: "scale(1)",
    },
  },

  bottomIcons: {
    color: "#999",
    "&:hover": {
      color: "#fff",
    },
  },

  volumeSlider: {
    width: 100,
  },
}));

const format = (seconds) => {
  if (isNaN(seconds)) {
    return `00:00`;
  }
  const date = new Date(seconds * 1000);
  const hh = date.getUTCHours();
  const mm = date.getUTCMinutes();
  const ss = date.getUTCSeconds().toString().padStart(2, "0");
  if (hh) {
    return `${hh}:${mm.toString().padStart(2, "0")}:${ss}`;
  }
  return `${mm}:${ss}`;
};

let count = 0;

const mapStatetoProps = (state) => ({
  playing: _.get(state, `liveTV.channelPlaying`, ""),
});

const mapDispatchtoProps = (dispatch) => {
  return {};
};
let screenful;
function TestComponent({ className, testURL }) {
  useEffect(() => {
    const initScreenful = async () => {
      screenful = (await import("screenfull")).default;
    };
    initScreenful();
  }, []);

  const Url =
    "https://abc-iview-mediapackagestreams-2.akamaized.net/out/v1/6e1cc6d25ec0480ea099a5399d73bc4b/index.m3u8";

  const classes = useStyles();
  const [timeDisplayFormat, setTimeDisplayFormat] = React.useState("normal");
  const [bookmarks, setBookmarks] = useState([]);
  const [state, setState] = useState({
    pip: false,
    playing: true,
    controls: false,
    light: false,

    muted: true,
    played: 0,
    duration: 0,
    playbackRate: 1.0,
    volume: 1,
    loop: false,
    seeking: false,
  });

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const controlsRef = useRef(null);
  const canvasRef = useRef(null);
  const {
    playing,
    controls,
    light,
    muted,
    loop,
    playbackRate,
    pip,
    played,
    seeking,
    volume,
  } = state;

  const handlePlayPause = () => {
    setState({ ...state, playing: !state.playing });
  };

  const handleRewind = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10);
  };

  const handleFastForward = () => {
    playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10);
  };

  const handleError = (event) => {
    console.log("Error " + event.target.error.message);
  };

  const handleProgress = (changeState) => {
    if (count > 3) {
      controlsRef.current.style.visibility = "hidden";
      count = 0;
    }
    if (controlsRef.current.style.visibility === "visible") {
      count += 1;
    }
    if (!state.seeking) {
      setState({ ...state, ...changeState });
    }
  };

  const handleSeekChange = (e, newValue) => {
    console.log({ newValue });
    setState({ ...state, played: parseFloat(newValue / 100) });
  };

  const handleSeekMouseDown = (e) => {
    setState({ ...state, seeking: true });
  };

  const handleSeekMouseUp = (e, newValue) => {
    console.log({ value: e.target });
    setState({ ...state, seeking: false });
    // // console.log(sliderRef.current.value);
    playerRef.current.seekTo(newValue / 100, "fraction");
  };

  const handleDuration = (duration) => {
    setState({ ...state, duration });
  };

  const handleVolumeSeekDown = (e, newValue) => {
    setState({ ...state, seeking: false, volume: parseFloat(newValue / 100) });
  };
  const handleVolumeChange = (e, newValue) => {
    setState({
      ...state,
      volume: parseFloat(newValue / 100),
      muted: newValue === 0 ? true : false,
    });
  };

  const toggleFullScreen = () => {
    screenful.toggle(playerContainerRef.current);
  };

  const handleMouseMove = () => {
    console.log("mousemove");
    controlsRef.current.style.visibility = "visible";
    count = 0;
  };

  const hanldeMouseLeave = () => {
    controlsRef.current.style.visibility = "visible";
    count = 0;
  };

  const handleDisplayFormat = () => {
    setTimeDisplayFormat(
      timeDisplayFormat === "normal" ? "remaining" : "normal"
    );
  };

  const handlePlaybackRate = (rate) => {
    setState({ ...state, playbackRate: rate });
  };

  const hanldeMute = () => {
    setState({ ...state, muted: !state.muted });
  };

  const addBookmark = () => {
    const canvas = canvasRef.current;
    canvas.width = 160;
    canvas.height = 90;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      playerRef.current.getInternalPlayer(),
      0,
      0,
      canvas.width,
      canvas.height
    );
    const dataUri = canvas.toDataURL();
    canvas.width = 0;
    canvas.height = 0;
    const bookmarksCopy = [...bookmarks];
    bookmarksCopy.push({
      time: playerRef.current.getCurrentTime(),
      display: format(playerRef.current.getCurrentTime()),
      image: dataUri,
    });
    setBookmarks(bookmarksCopy);
  };

  const currentTime =
    playerRef && playerRef.current
      ? playerRef.current.getCurrentTime()
      : "00:00";

  const duration =
    playerRef && playerRef.current ? playerRef.current.getDuration() : "00:00";
  const elapsedTime =
    timeDisplayFormat === "normal"
      ? format(currentTime)
      : `-${format(duration - currentTime)}`;

  const totalDuration = format(duration);

  return (
    <Container
      onMouseMove={handleMouseMove}
      onMouseLeave={hanldeMouseLeave}
      ref={playerContainerRef}
      style={{ height: "91vh" }}
    >
      <ReactPlayer
        className={className}
        ref={playerRef}
        width='100%'
        height='100%'
        url={Url}
        pip={pip}
        playing={playing}
        controls={false}
        light={light}
        loop={loop}
        playbackRate={playbackRate}
        volume={volume}
        muted={muted}
        onError={(e) => console.log("onError", e.target.error.message)}
        onProgress={handleProgress}
        config={{
          file: {
            attributes: {
              crossorigin: "anonymous",
            },
          },
        }}
      />

      <Controls
        ref={controlsRef}
        onSeek={handleSeekChange}
        onSeekMouseDown={handleSeekMouseDown}
        onSeekMouseUp={handleSeekMouseUp}
        onDuration={handleDuration}
        onRewind={handleRewind}
        onPlayPause={handlePlayPause}
        onFastForward={handleFastForward}
        playing={playing}
        played={played}
        elapsedTime={elapsedTime}
        totalDuration={totalDuration}
        onMute={hanldeMute}
        muted={muted}
        onVolumeChange={handleVolumeChange}
        onVolumeSeekDown={handleVolumeSeekDown}
        onChangeDispayFormat={handleDisplayFormat}
        playbackRate={playbackRate}
        onPlaybackRateChange={handlePlaybackRate}
        onToggleFullScreen={toggleFullScreen}
        volume={volume}
        onBookmark={addBookmark}
      />
    </Container>
  );
}

const AbsolutelyPositionedPlayer = styled(TestComponent)`
  position: absolute;
  top: 0;
  left: 0;
`;

const RelativePositionWrapper = styled.div`
  position: relative;
  height: 100%;
`;

const Container = styled.div`
  width: 100%;
  position: relative;
`;

const ResponsiveStyledPlayer = (props) => (
  <RelativePositionWrapper>
    <AbsolutelyPositionedPlayer testURL={props.playing} />
  </RelativePositionWrapper>
);

export default connect(
  mapStatetoProps,
  mapDispatchtoProps
)(ResponsiveStyledPlayer);

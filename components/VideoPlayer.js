"use client";

import { useState, useEffect, useRef } from "react";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiSettings,
  FiSkipForward,
  FiSkipBack,
  FiRefreshCw,
} from "react-icons/fi";

export default function VideoPlayer({
  sourceType = "youtube",
  sourceUrl,
  playbackToken,
  watermark,
  onTimeUpdate,
  initialTime = 0,
}) {
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);

  const videoUrl =
    sourceType === "hosted" && playbackToken
      ? `${sourceUrl}?token=${playbackToken}`
      : sourceUrl;

  const handleContextMenu = (e) => e.preventDefault();

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    let videoId = null;
    const urlObj = new URL(url, "https://example.com");
    const pathname = urlObj.pathname;
    const searchParams = urlObj.searchParams;

    if (pathname.includes("/embed/")) {
      videoId = pathname.split("/embed/")[1].split("?")[0];
    } else if (pathname.includes("/youtu.be/")) {
      videoId = pathname.split("/youtu.be/")[1].split("?")[0];
    } else if (pathname.includes("/watch")) {
      videoId = searchParams.get("v");
    }

    if (videoId && videoId.length === 11) {
      return videoId;
    }
    return null;
  };

  const handleError = (e) => {
    setError("فشل تشغيل الفيديو. تأكد من رابط الفيديو.");
  };

  const handleTimeUpdate = () => {
    if (playerRef.current && onTimeUpdate) {
      onTimeUpdate(playerRef.current.getCurrentTime());
    }
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      const videoDuration = playerRef.current.getDuration();
      setProgress((currentTime / videoDuration) * 100);
      setDuration(videoDuration);
    }
  };
  const handleProgressChange = (e) => {
    if (playerRef.current) {
      const newTime = (e.target.value / 100) * duration;
      playerRef.current.seekTo(newTime, true);
      setProgress(e.target.value);
    }
  };

  useEffect(() => {
    if (sourceType === "youtube") {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        const videoId = getYouTubeVideoId(sourceUrl);
        if (!videoId) {
          setError("رابط يوتيوب غير صحيح");
          return;
        }

        playerRef.current = new window.YT.Player(playerContainerRef.current, {
          height: "100%",
          width: "300%",
          videoId: videoId,
          playerVars: {
            controls: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            iv_load_policy: 3,
            fs: 0,
            disablekb: 1,
            enablejsapi: 1,
            start: initialTime,
          },
          events: {
            onReady: (event) => {
              event.target.playVideo();
              setInterval(handleTimeUpdate, 1000);
              event.target.setSize("100%", "100%");
            },
            onError: (event) => {
              setError("فشل تشغيل فيديو يوتيوب. تحقق من الرابط أو الاتصال.");
            },
          },
        });
      };
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [sourceType, sourceUrl, initialTime]);

  const toggleMute = () => {
    if (playerRef.current) {
      if (isMuted) {
        playerRef.current.unMute();
      } else {
        playerRef.current.mute();
      }
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackRate = (rate) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRate(rate);
    }
  };

  const forward = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime + 10, true);
    }
  };

  const rewind = () => {
    if (playerRef.current) {
      const currentTime = playerRef.current.getCurrentTime();
      playerRef.current.seekTo(currentTime - 10, true);
    }
  };

  const replay = () => {
    if (playerRef.current) {
      playerRef.current.seekTo(0, true);
      playerRef.current.playVideo();
    }
  };

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 border border-red-200">
        <h3 className="text-sm font-medium text-red-800">خطأ في التشغيل</h3>
        <p className="mt-2 text-sm text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          حاول مرة أخرى
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative bg-black rounded-lg overflow-hidden youtube-container"
      style={{ aspectRatio: "16 / 9" }}
      onContextMenu={handleContextMenu}
    >
      {sourceType === "youtube" ? (
        <div
          ref={playerContainerRef}
          className="youtube-player"
          style={{
            position: "relative",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "20%",
              background: "transparent",
              zIndex: 2,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          />
        </div>
      ) : (
        <video
          controls
          width="100%"
          onError={handleError}
          onTimeUpdate={handleTimeUpdate}
          onContextMenu={handleContextMenu}
        >
          <source src={videoUrl} type="video/mp4" />
          المتصفح لا يدعم تشغيل الفيديو.
        </video>
      )}
      {watermark && (
        <div
          style={{
            width: "100%",
            position: "absolute",
            top: "0",
            left: "0",
            color: "rgba(255, 255, 255, 0.7)",
            fontSize: "12px",
            background: "rgba(0, 0, 0, 10)",
            padding: "12px 8px",
            borderRadius: "4px",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: 100,
          }}
        >
          {watermark}
        </div>
      )}
      {sourceType === "youtube" && (
        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black bg-opacity-50 flex flex-col gap-2 z-[1001]">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: "#4f46e5" }}
          />
          <div className="flex justify-center gap-3">
            <button
              onClick={replay}
              className="bg-blue-600 text-white p-1 cursor-pointer rounded-full hover:bg-blue-700 transition"
            >
              <FiRefreshCw size={20} />
            </button>
            <button
              onClick={rewind}
              className="bg-gray-600 text-white p-1 cursor-pointer rounded-full hover:bg-gray-700 transition"
            >
              <FiSkipBack size={20} />
            </button>
            <button
              onClick={() => playerRef.current?.playVideo()}
              className="bg-indigo-600 text-white p-1 cursor-pointer rounded-full hover:bg-indigo-700 transition"
            >
              <FiPlay size={20} />
            </button>
            <button
              onClick={() => playerRef.current?.pauseVideo()}
              className="bg-red-600 text-white p-1 cursor-pointer rounded-full hover:bg-red-700 transition"
            >
              <FiPause size={20} />
            </button>
            <button
              onClick={forward}
              className="bg-gray-600 text-white p-1 cursor-pointer rounded-full hover:bg-gray-700 transition"
            >
              <FiSkipForward size={20} />
            </button>
            <button
              onClick={toggleMute}
              className={`bg-green-600 text-white p-1 cursor-pointer rounded-full hover:bg-gray-700 transition ${
                isMuted ? "bg-green-600" : ""
              }`}
            >
              {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
            </button>
            <select
              onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
              value={playbackRate}
              className="bg-gray-600 text-white p-1 cursor-pointer rounded-full hover:bg-gray-700 transition appearance-none text-center"
            >
              <option value="1">1x</option>
              <option value="1.5">1.5x</option>
              <option value="2">2x</option>
            </select>
              
          </div>
          
        </div>
      )}
    </div>
  );
}

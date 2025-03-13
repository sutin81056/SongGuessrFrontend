import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import YouTube from "react-youtube";
import { Button } from "../components/ui/button";

// const socket = io("http://localhost:5000");
const socket = io("https://courteous-exploration-production.up.railway.app", {
  transports: ["websocket"],
});

export default function GuessSongGame() {
  const [videoId, setVideoId] = useState("");
  const [isHidden, setIsHidden] = useState(true); // 控制影片 & 標題是否隱藏
  const [currentDJ, setCurrentDJ] = useState("");
  const [users, setUsers] = useState([]);
  const [videoTitle, setVideoTitle] = useState("");
  const [username, setUsername] = useState("");
  const playerRef = useRef(null);

  useEffect(() => {
    // 讓使用者輸入暱稱
    const name = prompt("請輸入你的暱稱:");
    if (name) {
      setUsername(name);
      socket.emit("newUser", name);
    }
  }, []);

  useEffect(() => {
    // 監聽後端廣播的新歌
    socket.on("newSong", ({ videoId, dj, title }) => {
      setVideoId(videoId);
      setVideoTitle(title);
      setCurrentDJ(dj);
      setIsHidden(true); // 新歌曲播放時強制隱藏影片 & 標題
    });

    // 監聽使用者清單變化
    socket.on("updateUsers", (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off("newSong");
      socket.off("updateUsers");
    };
  }, []);

  const playNewSong = async () => {
    // 讓 DJ 貼上 YouTube 影片網址
    const url = prompt("請貼上 YouTube 影片網址:");
    if (url) {
      const match =
        url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/) ||
        url.match(/(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/) ||
        url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/);

      if (match && match[1]) {
        const videoId = match[1];
        const title = await fetchVideoTitle(videoId);
        socket.emit("newSong", { videoId, dj: username, title });
      } else {
        alert("無效的 YouTube 影片網址！");
      }
    }
  };

  const fetchVideoTitle = async (videoId) => {
    // 透過 NoEmbed API 取得影片標題
    try {
      const response = await fetch(
        `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
      );
      const data = await response.json();
      return data.title || "Unknown Title";
    } catch {
      return "Unknown Title";
    }
  };

  const onReady = (event) => {
    playerRef.current = event.target;
  };

  return (
    <div className="flex">
      {/* 遊戲主要區塊 */}
      <div className="flex flex-col items-center gap-4 p-6 w-3/4">
        <h1 className="text-2xl font-bold">🎵 Guess the Song Game 🎵</h1>

        {videoId && (
          <div className="flex flex-col items-center">
            {/* 影片名稱，只有揭曉後才顯示 */}
            {!isHidden && (
              <p className="text-lg font-semibold mb-2">
                Now Playing: {videoTitle}
              </p>
            )}

            {/* YouTube 影片嵌入區塊 */}
            <div
              className="transition-all duration-500"
              style={{
                width: isHidden ? "1px" : "800px", // 隱藏時縮小到 1px
                height: isHidden ? "1px" : "450px", // 隱藏時縮小到 1px
                overflow: "hidden",
              }}
            >
              <YouTube
                videoId={videoId}
                opts={{
                  playerVars: { autoplay: 1, controls: 1, modestbranding: 1 },
                }}
                onReady={onReady}
                className="w-full h-full"
              />
            </div>

            {/* 「揭曉」按鈕 */}
            {isHidden && (
              <Button
                onClick={() => setIsHidden(false)}
                className="bg-red-500 mt-2"
              >
                👁 揭曉影片
              </Button>
            )}
          </div>
        )}

        {/* 選擇新歌曲按鈕 */}
        <Button onClick={playNewSong} className="bg-green-500">
          選擇新歌曲 (DJ: {currentDJ || "N/A"})
        </Button>
      </div>

      {/* 在線名單區塊 */}
      <div className="w-1/4 p-4 bg-gray-100">
        <h2 className="text-xl font-bold mb-2">在線名單</h2>
        <ul>
          {users.map((user, index) => (
            <li key={index} className="p-1">
              {user.name} {/* 修正：顯示使用者名稱而不是 ID */}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

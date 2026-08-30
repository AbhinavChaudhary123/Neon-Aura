import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import api from "../services/api";

const C = createContext(null);

export const usePlayer = () => useContext(C);

export function PlayerProvider({ children }) {
  const [audio] = useState(() => new Audio());

  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);

  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);

  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const queueRef = useRef([]);
  const indexRef = useRef(0);
  const shuffleRef = useRef(false);
  const repeatRef = useRef(false);

  /* -----------------------------
     KEEP REFS UPDATED
  ----------------------------- */

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    shuffleRef.current = shuffle;
  }, [shuffle]);

  useEffect(() => {
    repeatRef.current = repeat;
  }, [repeat]);

  useEffect(() => {
    audio.volume = volume;
  }, [audio, volume]);

  /* -----------------------------
     PLAY SONG
  ----------------------------- */

  const playSong = (
    song,
    list = queueRef.current,
    songIndex = -1
  ) => {
    if (!song || !song.audioUrl) {
      console.error("Invalid song:", song);
      return;
    }

    const newQueue =
      list && list.length > 0 ? list : [song];

    let newIndex = songIndex;

    if (newIndex < 0) {
      newIndex = newQueue.findIndex(
        (item) => item._id === song._id
      );
    }

    if (newIndex < 0) {
      newIndex = 0;
    }

    setQueue(newQueue);
    queueRef.current = newQueue;

    setIndex(newIndex);
    indexRef.current = newIndex;

    setCurrent(song);

    setProgress(0);
    setDuration(0);

    audio.pause();

    audio.src = song.audioUrl;

    audio.load();

    audio
      .play()
      .then(() => {
        setPlaying(true);
      })
      .catch((error) => {
        console.error("Audio play failed:", error);
        setPlaying(false);
      });

    api
      .post(`/songs/${song._id}/play`)
      .catch(() => {});
  };

  /* -----------------------------
     LOAD
  ----------------------------- */

  const load = (song, list = queueRef.current) => {
    playSong(song, list);
  };

  /* -----------------------------
     PLAY / PAUSE
  ----------------------------- */

  const toggle = () => {
    if (!current) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => {
        setPlaying(true);
      })
      .catch((error) => {
        console.error("Resume failed:", error);
        setPlaying(false);
      });
  };

  /* -----------------------------
     NEXT
  ----------------------------- */

  const next = () => {
    const list = queueRef.current;

    if (!list || list.length === 0) {
      console.log("Queue is empty");
      return;
    }

    let nextIndex;

    if (shuffleRef.current && list.length > 1) {
      do {
        nextIndex = Math.floor(
          Math.random() * list.length
        );
      } while (nextIndex === indexRef.current);
    } else {
      nextIndex =
        (indexRef.current + 1) % list.length;
    }

    playSong(
      list[nextIndex],
      list,
      nextIndex
    );
  };

  /* -----------------------------
     PREVIOUS
  ----------------------------- */

  const prev = () => {
    const list = queueRef.current;

    if (!list || list.length === 0) {
      console.log("Queue is empty");
      return;
    }

    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      setProgress(0);
      return;
    }

    const previousIndex =
      (indexRef.current - 1 + list.length) %
      list.length;

    playSong(
      list[previousIndex],
      list,
      previousIndex
    );
  };

  /* -----------------------------
     SEEK
  ----------------------------- */

  const seek = (value) => {
    const time = Number(value);

    if (!Number.isFinite(time)) return;

    audio.currentTime = time;
    setProgress(time);
  };

  /* -----------------------------
     VOLUME
  ----------------------------- */

  const handleVolume = (value) => {
    const newVolume = Number(value);

    if (!Number.isFinite(newVolume)) return;

    setVolume(newVolume);
    audio.volume = newVolume;
  };

  /* -----------------------------
     SHUFFLE
  ----------------------------- */

  const toggleShuffle = () => {
    setShuffle((value) => !value);
  };

  /* -----------------------------
     REPEAT
  ----------------------------- */

  const toggleRepeat = () => {
    setRepeat((value) => !value);
  };

  /* -----------------------------
     AUDIO EVENTS
  ----------------------------- */

  useEffect(() => {
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(
        Number.isFinite(audio.duration)
          ? audio.duration
          : 0
      );
    };

    const handleEnded = () => {
      const list = queueRef.current;

      if (!list.length) {
        setPlaying(false);
        return;
      }

      /* Repeat */
      if (repeatRef.current) {
        audio.currentTime = 0;

        audio
          .play()
          .then(() => setPlaying(true))
          .catch(() => setPlaying(false));

        return;
      }

      /* Shuffle */
      if (
        shuffleRef.current &&
        list.length > 1
      ) {
        let randomIndex;

        do {
          randomIndex = Math.floor(
            Math.random() * list.length
          );
        } while (
          randomIndex === indexRef.current
        );

        playSong(
          list[randomIndex],
          list,
          randomIndex
        );

        return;
      }

      /* Normal next */
      const nextIndex =
        (indexRef.current + 1) % list.length;

      playSong(
        list[nextIndex],
        list,
        nextIndex
      );
    };

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    );

    audio.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    audio.addEventListener(
      "ended",
      handleEnded
    );

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      );

      audio.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      audio.removeEventListener(
        "ended",
        handleEnded
      );
    };
  }, [audio]);

  /* -----------------------------
     CONTEXT
  ----------------------------- */

  return (
    <C.Provider
      value={{
        current,

        /* Compatibility with old Player */
        song: current,

        playing,
        progress,
        duration,
        volume,

        queue,
        index,

        load,
        playSong,

        toggle,
        next,
        prev,
        seek,

        setVolume: handleVolume,

        shuffle,
        repeat,

        toggleShuffle,
        toggleRepeat,

        /* Compatibility aliases */
        setShuffle,
        setRepeat,
      }}
    >
      {children}
    </C.Provider>
  );
}
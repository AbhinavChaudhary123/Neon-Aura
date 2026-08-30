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

  /* =====================================================
     KEEP REFS UPDATED
     ===================================================== */

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

  /* =====================================================
     PLAY SONG
     ===================================================== */

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
      list && list.length > 0
        ? [...list]
        : [song];

    let newIndex = songIndex;

    if (newIndex < 0) {
      newIndex = newQueue.findIndex(
        (item) => item?._id === song?._id
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
        console.error(
          "Audio play failed:",
          error
        );

        setPlaying(false);
      });

    /* Record play */
    api
      .post(`/songs/${song._id}/play`)
      .catch(() => {});
  };

  /* =====================================================
     LOAD
     ===================================================== */

  const load = (
    song,
    list = queueRef.current
  ) => {
    playSong(song, list);
  };

  /* =====================================================
     PLAY / PAUSE
     ===================================================== */

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
        console.error(
          "Resume failed:",
          error
        );

        setPlaying(false);
      });
  };

  /* =====================================================
     NEXT
     ===================================================== */

  const next = () => {
    const list = queueRef.current;

    if (!list || list.length === 0) {
      return;
    }

    const nextIndex =
      (indexRef.current + 1) % list.length;

    playSong(
      list[nextIndex],
      list,
      nextIndex
    );
  };

  /* =====================================================
     PREVIOUS
     ===================================================== */

  const prev = () => {
    const list = queueRef.current;

    if (!list || list.length === 0) {
      return;
    }

    /*
      If current song has played more than
      3 seconds, restart it.
    */

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

  /* =====================================================
     SEEK
     ===================================================== */

  const seek = (value) => {
    const time = Number(value);

    if (!Number.isFinite(time)) {
      return;
    }

    audio.currentTime = time;
    setProgress(time);
  };

  /* =====================================================
     VOLUME
     ===================================================== */

  const handleVolume = (value) => {
    const newVolume = Number(value);

    if (!Number.isFinite(newVolume)) {
      return;
    }

    const safeVolume = Math.min(
      1,
      Math.max(0, newVolume)
    );

    setVolume(safeVolume);
    audio.volume = safeVolume;
  };

  /* =====================================================
     SHUFFLE
     ===================================================== */

  const toggleShuffle = () => {
    const currentlyShuffled =
      shuffleRef.current;

    /* ---------------------------------------------
       TURN SHUFFLE OFF
       --------------------------------------------- */

    if (currentlyShuffled) {
      setShuffle(false);
      shuffleRef.current = false;

      return;
    }

    const list = [...queueRef.current];

    if (list.length <= 1) {
      setShuffle(true);
      shuffleRef.current = true;

      return;
    }

    const currentIndex =
      indexRef.current;

    const currentSong =
      list[currentIndex];

    if (!currentSong) {
      setShuffle(true);
      shuffleRef.current = true;

      return;
    }

    /*
      Remove current song.
      It stays at the front of
      the shuffled queue.
    */

    const remainingSongs = list.filter(
      (_, i) => i !== currentIndex
    );

    /*
      Fisher-Yates shuffle
    */

    for (
      let i = remainingSongs.length - 1;
      i > 0;
      i--
    ) {
      const randomIndex =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        remainingSongs[i],
        remainingSongs[randomIndex],
      ] = [
        remainingSongs[randomIndex],
        remainingSongs[i],
      ];
    }

    /*
      Current song first,
      everything else shuffled.
    */

    const shuffledQueue = [
      currentSong,
      ...remainingSongs,
    ];

    setQueue(shuffledQueue);
    queueRef.current = shuffledQueue;

    /*
      Current song is now index 0.
    */

    setIndex(0);
    indexRef.current = 0;

    setShuffle(true);
    shuffleRef.current = true;
  };

  /* =====================================================
     REPEAT
     ===================================================== */

  const toggleRepeat = () => {
    setRepeat((value) => {
      const newValue = !value;

      repeatRef.current = newValue;

      return newValue;
    });
  };

  /* =====================================================
     AUDIO EVENTS
     ===================================================== */

  useEffect(() => {
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      const audioDuration =
        Number.isFinite(audio.duration)
          ? audio.duration
          : 0;

      setDuration(audioDuration);
    };

    const handleEnded = () => {
      const list = queueRef.current;

      if (!list || list.length === 0) {
        setPlaying(false);
        return;
      }

      /* ---------------------------------------------
         REPEAT CURRENT SONG
         --------------------------------------------- */

      if (repeatRef.current) {
        audio.currentTime = 0;

        audio
          .play()
          .then(() => {
            setPlaying(true);
          })
          .catch(() => {
            setPlaying(false);
          });

        return;
      }

      /* ---------------------------------------------
         NORMAL / SHUFFLED NEXT
         --------------------------------------------- */

      const nextIndex =
        (indexRef.current + 1) %
        list.length;

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

      audio.pause();
    };
  }, [audio]);

  /* =====================================================
     CONTEXT
     ===================================================== */

  return (
    <C.Provider
      value={{
        current,

        /* Compatibility */
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
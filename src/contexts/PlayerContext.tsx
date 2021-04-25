import { createContext, ReactNode, useContext, useState } from 'react';

type Episode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
};

type PlayerContextData = {
  clearPlayerState: () => void;
  currentEpisodeIndex: number;
  episodeList: Array<Episode>;
  hasNext: boolean;
  hasPrevious: boolean;
  isLooping: boolean;
  isPlaying: boolean;
  isShuffling: boolean;
  play: (episode: Episode) => void;
  playList: (list: Array<Episode>, index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleLoop: () => void;
  togglePlay: () => void;
  toggleShuffle: () => void;
  setPlayingState: (state: boolean) => void;
};

type PlayerContextProviderProps = {
  children: ReactNode;
};

export const PlayerContext = createContext({} as PlayerContextData);

export function PlayerContextProvider(props: PlayerContextProviderProps) {
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [episodeList, setEpisodeList] = useState([]);
  const [isLooping, setIsLooping] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const hasNext = isShuffling || currentEpisodeIndex + 1 < episodeList.length;
  const hasPrevious = currentEpisodeIndex > 0;

  function clearPlayerState() {
    setCurrentEpisodeIndex(0);
    setEpisodeList([]);
  }

  function play(episode: Episode) {
    setCurrentEpisodeIndex(0);
    setEpisodeList([episode]);
    setIsPlaying(true);
  }

  function playList(list: Array<Episode>, index: number) {
    setCurrentEpisodeIndex(index);
    setEpisodeList(list);
    setIsPlaying(true);
  }

  function playNext() {
    if (isShuffling) {
      const nextRandomEpisodesIndex = Math.floor(
        Math.random() * episodeList.length
      );

      setCurrentEpisodeIndex(nextRandomEpisodesIndex);
    } else if (hasNext) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  }

  function playPrevious() {
    if (hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  }

  function toggleLoop() {
    setIsLooping(!isLooping);
  }

  function togglePlay() {
    setIsPlaying(!isPlaying);
  }

  function toggleShuffle() {
    setIsShuffling(!isShuffling);
  }

  function setPlayingState(state: boolean) {
    setIsPlaying(state);
  }

  return (
    <PlayerContext.Provider
      value={{
        clearPlayerState,
        currentEpisodeIndex,
        episodeList,
        hasNext,
        hasPrevious,
        isLooping,
        isPlaying,
        isShuffling,
        play,
        playList,
        playNext,
        playPrevious,
        setPlayingState,
        toggleLoop,
        togglePlay,
        toggleShuffle
      }}
    >
      {props.children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  return useContext(PlayerContext);
};
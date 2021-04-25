import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';

import styles from './style.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const {
    clearPlayerState,
    currentEpisodeIndex,
    episodeList,
    hasNext,
    hasPrevious,
    isLooping,
    isPlaying,
    isShuffling,
    playNext,
    playPrevious,
    setPlayingState,
    toggleLoop,
    togglePlay,
    toggleShuffle
  } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const episode = episodeList[currentEpisodeIndex];

  useEffect(
    function () {
      if (!audioRef.current) {
        return;
      }

      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    },
    [isPlaying]
  );

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext();
    } else {
      clearPlayerState();
    }
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;

    setProgress(amount);
  }

  function setupProgressListener() {
    audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', function () {
      setProgress(Math.floor(audioRef.current.currentTime));
    });
  }

  return (
    <div className={styles.playerContainer}>
      <header>
        <img alt="Tocando agora" src="/playing.svg" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            alt={episode.title}
            src={episode.thumbnail}
            width={592}
            height={592}
            objectFit="cover"
          />

          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>

          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                handleStyle={{ backgroundColor: '#04d361', borderWidth: 4 }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                trackStyle={{ backgroundColor: '#04d361' }}
              />
            ) : (
              <div className={styles.emptySlider}></div>
            )}
          </div>

          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && (
          <audio
            autoPlay
            ref={audioRef}
            loop={isLooping}
            onEnded={handleEpisodeEnded}
            onLoadedMetadata={setupProgressListener}
            onPause={() => setPlayingState(false)}
            onPlay={() => setPlayingState(true)}
            src={episode.url}
          />
        )}

        <div className={styles.buttons}>
          <button
            className={isShuffling ? styles.isActive : ''}
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
          >
            <img alt="Embaralhar" src="/shuffle.svg" />
          </button>

          <button disabled={!episode || !hasPrevious} onClick={playPrevious}>
            <img alt="Tocar anterior" src="/play-previous.svg" />
          </button>

          <button
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <img alt="Tocar" src="/pause.svg" />
            ) : (
              <img alt="Tocar" src="/play.svg" />
            )}
          </button>

          <button disabled={!episode || !hasNext} onClick={playNext}>
            <img alt="Tocar próxima" src="/play-next.svg" />
          </button>

          <button
            className={isLooping ? styles.isActive : ''}
            disabled={!episode}
            onClick={toggleLoop}
          >
            <img alt="Repetir" src="/repeat.svg" />
          </button>
        </div>
      </footer>
    </div>
  );
}
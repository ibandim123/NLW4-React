import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import styles from './home.module.scss';
import { usePlayer } from '../contexts/PlayerContext';
import api from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
};

type HomeProps = {
  allEpisodes: Array<Episode>;
  latestEpisodes: Array<Episode>;
};

export default function Home(props: HomeProps) {
  const { allEpisodes, latestEpisodes } = props;
  const { play, playList } = usePlayer();

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Podcastr</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map(function (episode, index) {
            return (
              <li key={episode.id}>
                <Image
                  alt={episode.title}
                  src={episode.thumbnail}
                  width={192}
                  height={192}
                  objectFit="cover"
                />
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a>{episode.title}</a>
                  </Link>

                  <p>{episode.members}</p>

                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button onClick={() => playList(episodeList, index)}>
                  <img alt="Tocar episódio" src="/play-green.svg" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos episódios</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {allEpisodes.map(function (episode, index) {
              return (
                <tr key={episode.id}>
                  <td style={{ width: 72 }}>
                    <Image
                      alt={episode.title}
                      src={episode.thumbnail}
                      width={120}
                      height={120}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button
                      onClick={() =>
                        playList(episodeList, index + latestEpisodes.length)
                      }
                    >
                      <img alt="Tocar episódio" src="/play-green.svg" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const response = await api.get('episodes', {
    params: {
      _limit: 12,
      _order: 'desc',
      _sort: 'published_at'
    }
  });

  const episodes = response.data.map(function (episode) {
    return {
      id: episode.id,
      title: episode.title,
      members: episode.members,
      thumbnail: episode.thumbnail,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
        locale: ptBR
      }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationToTimeString(
        Number(episode.file.duration)
      ),
      url: episode.file.url
    };
  });

  const allEpisodes = episodes.slice(2, episodes.length);
  const latestEpisodes = episodes.slice(0, 2);

  return {
    props: {
      allEpisodes,
      latestEpisodes
    },
    revalidate: 60 * 60 * 8
  };
};
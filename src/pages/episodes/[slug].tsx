import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';
import api from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
};

type EpisodeProps = {
  episode: Episode;
};

export default function Episodes(props: EpisodeProps) {
  const { episode } = props;
  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <button>
          <Link href="/">
            <img alt="Voltar" src="/arrow-left.svg" />
          </Link>
        </button>

        <Image
          src={episode.thumbnail}
          width={700}
          height={160}
          objectFit="cover"
        />

        <button type="button" onClick={() => play(episode)}>
          <img alt="Tocar episódio" src="/play.svg" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>

        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      ></div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const response = await api.get('episodes', {
    params: {
      _limit: 2,
      _order: 'desc',
      _sort: 'published_at'
    }
  });

  const paths = response.data.map(function (episode) {
    return {
      params: {
        slug: episode.id
      }
    };
  });

  return {
    fallback: 'blocking',
    paths
  };
};

export const getStaticProps: GetStaticProps = async ctx => {
  const slug = ctx.params.slug;

  const response = await api.get(`/episodes/${slug}`);
  const episode = {
    id: response.data.id,
    title: response.data.title,
    members: response.data.members,
    thumbnail: response.data.thumbnail,
    publishedAt: format(parseISO(response.data.published_at), 'd MMM yy', {
      locale: ptBR
    }),
    duration: Number(response.data.file.duration),
    durationAsString: convertDurationToTimeString(
      Number(response.data.file.duration)
    ),
    description: response.data.description,
    url: response.data.file.url
  };

  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24
  };
};
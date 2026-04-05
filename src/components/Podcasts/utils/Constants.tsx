import {Platform} from 'react-native';

export enum Colors {
  primary = '#e695a4',
  background = '#000',
  text = '#FFFFFF',
  backgroundDark = '#121212',
  backgroundLight = '#1F1F1F',
  inactive = '#B3B3B3',
}
export enum Fonts {
  Regular = 'Satoshi-Regular',
  Medium = 'Satoshi-Medium',
  Light = 'Satoshi-Light',
  Black = 'Satoshi-Black',
  Bold = 'Satoshi-Bold',
}

export const BOTTOM_TAB_HEIGHT = Platform.OS == 'ios' ? 90 : 70;

export const convertPodcast = (podcast: any) => {
  return {
    id: podcast.id,
    url: podcast.audio_uri,
    title: podcast.title,
    artist: podcast.artist.name,
    artwork: podcast.artwork,
  };
};

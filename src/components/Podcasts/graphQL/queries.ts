import {gql} from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation AuthenticateUserWithPassword($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          email
          createdAt
          name
          isAdmin
          id
          favoritePodcastsCount
        }
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation RegisterUser($name: String!, $email: String!, $password: String!) {
    registerUser(name: $name, email: $email, password: $password) {
      user {
        email
        name
        createdAt
        id
        isAdmin
        favoritePodcastsCount
      }
    }
  }
`;

export const GET_PODCASTS = gql`
  query Podcast($where: PodcastWhereInput!, $userId: ID!) {
    podcasts(where: $where) {
      id
      category
      video_uri
      artwork
      artist {
        bio
        id
        name
        photo
      }
      lyricist
      title
      type
      audio_uri
      favoritedBy(where: {id: {equals: $userId}}) {
        id
      }
    }
  }
`;

export const MARK_FAVOURITE = gql`
  mutation MarkPodcastAsFavorite($userId: ID!, $podcastId: ID!) {
    updateUser(
      where: {id: $userId}
      data: {favoritePodcasts: {connect: {id: $podcastId}}}
    ) {
      id
      name
      favoritePodcasts {
        id
        title
      }
    }
  }
`;

export const UNMARK_FAVOURITE = gql`
  mutation UnmarkPodcastAsFavorite($userId: ID!, $podcastId: ID!) {
    updateUser(
      where: {id: $userId}
      data: {favoritePodcasts: {disconnect: {id: $podcastId}}}
    ) {
      id
      favoritePodcasts {
        id
        title
      }
    }
  }
`;

export const GET_USER_FAVOURITE = gql`
  query GetUserFavoritePodcasts($userId: ID!) {
    user(where: {id: $userId}) {
      id
      name
      favoritePodcasts {
        id
        category
        video_uri
        artwork
        artist {
          bio
          id
          name
          photo
        }
        lyricist
        title
        type
        audio_uri
        favoritedBy(where: {id: {equals: $userId}}) {
          id
        }
      }
    }
  }
`;

export const GET_TRENDING_AND_TOPPICKS = gql`
  query GetTrendingAndTopPicks($userId: ID!) {
    trending: podcasts(take: 5, skip: 3) {
      id
      category
      video_uri
      artwork
      artist {
        bio
        id
        name
        photo
      }
      lyricist
      title
      type
      audio_uri
      favoritedBy(where: {id: {equals: $userId}}) {
        id
      }
    }

    topPicks: podcasts(take: 3) {
      id
      category
      video_uri
      artwork
      artist {
        bio
        id
        name
        photo
      }
      lyricist
      title
      type
      audio_uri
      favoritedBy(where: {id: {equals: $userId}}) {
        id
      }
    }
  }
`;

export const AI_PICK = gql`
  query GetRecommendedPodcasts($userId: ID!) {
    getRecommendedPodcasts(userId: $userId) {
      id
      category
      video_uri
      artwork
      artist {
        bio
        id
        name
        photo
      }
      lyricist
      title
      type
      audio_uri
    }
  }
`;

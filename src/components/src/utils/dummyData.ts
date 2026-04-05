/* eslint-disable @typescript-eslint/no-unused-vars */
interface User {
  name: string;
  speaking?: boolean;
  micOn: boolean;
  videoOn: boolean;
  photo: string;
}

type Gender = 'men' | 'women';

const getRandomImage = (gender: Gender): string => {
  const num = Math.floor(Math.random() * 99) + 1;
  return `https://randomuser.me/api/portraits/${gender}/${num}.jpg`;
};

export const user = {
  name: 'Adil',
  speaking: true,
  micOn: false,
  videoOn: true,
  photo: getRandomImage('men'),
};

export const peopleData = [
  {
    name: 'Sheroza',
    speaking: true,
    micOn: false,
    videoOn: true,
    photo: getRandomImage('women'),
  },
  {name: 'Bob', micOn: false, videoOn: false, photo: getRandomImage('men')},
  {
    name: 'Yassar',
    micOn: true,
    videoOn: true,

    photo: getRandomImage('men'),
  },
  {name: 'David', micOn: false, videoOn: true, photo: getRandomImage('men')},
  {
    name: 'Eve',
    micOn: false,
    videoOn: false,
    photo: getRandomImage('women'),
  },
  {name: 'Frank', micOn: true, videoOn: true, photo: getRandomImage('men')},
  {
    name: 'Grace',
    micOn: false,
    videoOn: true,
    photo: getRandomImage('women'),
  },
  {name: 'Hank', micOn: true, videoOn: false, photo: getRandomImage('men')},
  {name: 'Ivy', micOn: false, videoOn: true, photo: getRandomImage('women')},
];

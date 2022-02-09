const imgOne = [
  {
    type: "button",
    name: "egg",
    image: "images/level/initial/egg.png",
    x: 524,
    y: 488,
    width: 60,
    height: 64,
    sx: 0,
    sy: 0,
    swidth: 60,
    sheight: 64
  },
];

const textOne = [
  {
    name: "eggsCount",
    text: '4',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 656,
    y: 534,
    animation: false,
  },
  {
    name: "levelEnd",
    text: '25',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 920,
    y: 534,
    animation: false,
  },
  {
    name: "goldEnd",
    text: '+75',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: 'yellow',
    x: 1026,
    y: 630,
    animation: false,
  },
  {
    name: "goldTime",
    text: '01:00',
    fontSize: '30px Vag_Rounded-Bold CY',
    color: 'yellow',
    x: 842,
    y: 682,
    animation: false,
  },
  {
    name: "silverEnd",
    text: '+25',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 1026,
    y: 766,
    animation: false,
  },
  {
    name: "silverTimer",
    text: '02:00',
    fontSize: '30px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 838,
    y: 816,
    animation: false,
  },
];

const imgTwo = [
  {
    type: "button",
    name: "chicken",
    image: "images/pets/chicken/death.png",
    x: 510,
    y: 552,
    width: 100,
    height: 100,
    sx: 0,
    sy: 0,
    swidth: 64,
    sheight: 64
  },
  {
    type: "button",
    name: "egg",
    image: "images/level/initial/egg.png",
    x: 524,
    y: 488,
    width: 60,
    height: 64,
    sx: 0,
    sy: 0,
    swidth: 60,
    sheight: 64
  },
];

const textTwo = [
  {
    name: "eggsCount",
    text: '6',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 656,
    y: 534,
    animation: false,
  },
  {
    name: "chickenCount",
    text: '3',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 656,
    y: 628,
    animation: false,
  },
  {
    name: "levelEnd",
    text: '40',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 920,
    y: 534,
    animation: false,
  },
  {
    name: "goldEnd",
    text: '+120',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: 'yellow',
    x: 1008,
    y: 630,
    animation: false,
  },
  {
    name: "goldTime",
    text: '01:30',
    fontSize: '30px Vag_Rounded-Bold CY',
    color: 'yellow',
    x: 842,
    y: 682,
    animation: false,
  },
  {
    name: "silverEnd",
    text: '+40',
    fontSize: '46px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 1026,
    y: 766,
    animation: false,
  },
  {
    name: "silverTimer",
    text: '02:40',
    fontSize: '30px Vag_Rounded-Bold CY',
    color: '#fff',
    x: 838,
    y: 816,
    animation: false,
  },
];

export const levelInitial = {
  '1': {
    img: imgOne,
    text: textOne,
  },
  '2': {
    img: imgTwo,
    text: textTwo,
  }
};


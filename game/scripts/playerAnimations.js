const makeStandingFrames = (rootFrame = 1) => {
  return {
    duration: 300,
    frames: [
      {
        time: 0,
        frame: rootFrame,
      },
    ],
  };
};
const makeWalkingFrames = (rootFrame = 1) => {
  return {
    duration: 400,
    frames: [
      {
        time: 0,
        frame: rootFrame,
      },
      {
        time: 100,
        frame: rootFrame - 1,
      },
      {
        time: 200,
        frame: rootFrame,
      },
      {
        time: 300,
        frame: rootFrame + 1,
      },
    ],
  };
};

const STAND_DOWN = makeStandingFrames(1);
const STAND_RIGHT = makeStandingFrames(7);
const STAND_UP = makeStandingFrames(4);
const STAND_LEFT = makeStandingFrames(10);

const WALK_DOWN = makeWalkingFrames(1);
const WALK_RIGHT = makeWalkingFrames(7);
const WALK_UP = makeWalkingFrames(4);
const WALK_LEFT = makeWalkingFrames(10);
const SPIN = {
  duration: 500,
  frames: [
    {
      time: 0,
      frame: 1,
    },
    {
      time: 100,
      frame: 4,
    },
    {
      time: 200,
      frame: 7,
    },
    {
      time: 300,
      frame: 10,
    },
    {
      time: 400,
      frame: 12,
    },
  ],
};
const DANCE = {
  duration: 8400,
  frames: [
    {
      time: 0,
      frame: 1,
    },
    {
      time: 200,
      frame: 0,
    },
    {
      time: 300,
      frame: 1,
    },
    {
      time: 500,
      frame: 11,
    },
    {
      time: 700,
      frame: 9,
    },
    {
      time: 900,
      frame: 10,
    },
    {
      time: 1100,
      frame: 2,
    },
    {
      time: 1300,
      frame: 1,
    },
    {
      time: 1600,
      frame: 2,
    },
    {
      time: 1700,
      frame: 1,
    },
    {
      time: 1900,
      frame: 6,
    },
    {
      time: 2100,
      frame: 8,
    },
    {
      time: 2300,
      frame: 7,
    },
    {
      time: 2500,
      frame: 0,
    },
    {
      time: 2700,
      frame: 1,
    },
    {
      time: 3000,
      frame: 12,
    },
    {
      time: 3200,
      frame: 13,
    },
    {
      time: 3400,
      frame: 14,
    },
    {
      time: 3600,
      frame: 13,
    },
    {
      time: 3800,
      frame: 14,
    },
    {
      time: 4000,
      frame: 13,
    },
    {
      time: 4200,
      frame: 14,
    },
    {
      time: 4400,
      frame: 1,
    },
    {
      time: 4600,
      frame: 7,
    },
    {
      time: 5000,
      frame: 10,
    },
    {
      time: 5400,
      frame: 4,
    },
    {
      time: 5800,
      frame: 11,
    },
    {
      time: 6200,
      frame: 6,
    },
    {
      time: 6400,
      frame: 9,
    },
    {
      time: 6800,
      frame: 8,
    },
    {
      time: 7000,
      frame: 12,
    },
    {
      time: 7200,
      frame: 13,
    },
    {
      time: 7400,
      frame: 14,
    },
    {
      time: 7600,
      frame: 1,
    },
  ],
};
const PICK_UP_DOWN = {
  duration: 10,
  frames: [
    {
      time: 0,
      frame: 12,
    },
  ],
};
const ATTACK_LEFT = {
  duration: 350,
  frames: [
    {
      time: 0,
      frame: 6,
    },
    {
      time: 50,
      frame: 7,
    },
    {
      time: 250,
      frame: 8,
    },
    {
      time: 300,
      frame: 0,
    },
  ],
};
const ATTACK_UP = {
  duration: 350,
  frames: [
    {
      time: 0,
      frame: 3,
    },
    {
      time: 50,
      frame: 4,
    },
    {
      time: 250,
      frame: 5,
    },
    {
      time: 300,
      frame: 3,
    },
  ],
};
const ATTACK_RIGHT = {
  duration: 350,
  frames: [
    {
      time: 0,
      frame: 9,
    },
    {
      time: 50,
      frame: 10,
    },
    {
      time: 250,
      frame: 9,
    },
    {
      time: 300,
      frame: 11,
    },
  ],
};
const ATTACK_DOWN = {
  duration: 250,
  frames: [
    {
      time: 0,
      frame: 0,
    },
    {
      time: 50,
      frame: 2,
    },
    {
      time: 250,
      frame: 1,
    },
    {
      time: 300,
      frame: 2,
    },
  ],
};

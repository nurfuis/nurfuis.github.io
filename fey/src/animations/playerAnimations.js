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

export const STAND_DOWN = makeStandingFrames(1);
export const STAND_RIGHT = makeStandingFrames(7);
export const STAND_UP = makeStandingFrames(4);
export const STAND_LEFT = makeStandingFrames(10);

export const WALK_DOWN = makeWalkingFrames(1);
export const WALK_RIGHT = makeWalkingFrames(7);
export const WALK_UP = makeWalkingFrames(4);
export const WALK_LEFT = makeWalkingFrames(10);

export const PICK_UP_DOWN = {
  duration: 10,
  frames: [
    {
      time: 0,
      frame: 12,
    },
  ],
};
export const ATTACK_LEFT = {
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
export const ATTACK_UP = {
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
export const ATTACK_RIGHT = {
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
export const ATTACK_DOWN = {
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

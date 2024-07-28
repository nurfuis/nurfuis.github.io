const makeIdleFrames = (rootFrame=0) => {
    return {
      duration: 600,
      frames: [
        {
          time: 0,
          frame: rootFrame,
        },
        {
            time: 300,
            frame: rootFrame + 1,
          }
      ]
    }
  }

const makeHopingFrames = (rootFrame = 0) => {
  return {
    duration: 500,
    frames: [
      {
        time: 0,
        frame: rootFrame,
      },
      {
        time: 100,
        frame: rootFrame + 1,
      },
      {
        time: 200,
        frame: rootFrame + 2,
      },
      {
        time: 300,
        frame: rootFrame + 1,
      },
      {
        time: 400,
        frame: rootFrame,
      },      
    ],
  };
};
export const IDLE_DOWN = makeIdleFrames(0);
export const IDLE_RIGHT = makeIdleFrames(9);
export const IDLE_UP = makeIdleFrames(3);
export const IDLE_LEFT = makeIdleFrames(6);

export const HOP_DOWN = makeHopingFrames(0);
export const HOP_RIGHT = makeHopingFrames(9);
export const HOP_UP = makeHopingFrames(3);
export const HOP_LEFT = makeHopingFrames(6);

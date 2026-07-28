export const IMAGE_RULES = {
  CHANNEL: {
    label: "Channel Banner",
    ratio: 16 / 9,
    description: "Required 16:9 landscape image",
  },

  SERIES: {
    label: "Series Poster",
    ratio: 2 / 3,
    description: "Required 2:3 portrait poster",
  },

  MOVIE: {
    label: "Movie Poster",
    ratio: 2 / 3,
    description: "Required 2:3 portrait poster",
  },

  ENTERTAINMENT: {
    label: "Entertainment Image",
    ratio: 2 / 3,
    description: "Required 2:3 portrait poster",
  },

  ADVERTISEMENT: {
    label: "Advertisement Banner",
    ratio: 16 / 9,
    description: "Required 16:9 landscape image",
  },
} as const;

export type ImageCategory = keyof typeof IMAGE_RULES;

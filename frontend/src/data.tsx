export interface Photo {
    id: number;
    src: string;
    alt: string;
    aspectRatio: string;
  }
  
  export interface PhotoGroup {
    date: string;
    subDate: string;
    photos: Photo[];
  }
  
  export const photoData_: PhotoGroup[] = [
    {
      date: "May 2024",
      subDate: "Tue, May 7, 2024",
      photos: [
        {
          id: 1,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "A scenic mountain view",
          aspectRatio: "4/3",
        },
        {
          id: 2,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "City skyline during sunset",
          aspectRatio: "16/9",
        },
        {
          id: 3,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "A cozy coffee shop interior",
          aspectRatio: "4/3",
        },
        {
          id: 4,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "A forest path covered with autumn leaves",
          aspectRatio: "3/4",
        },
        {
          id: 5,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "Flat-lay of tech gadgets",
          aspectRatio: "4/3",
        },
        {
          id: 6,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "Flat-lay of tech gadgets",
          aspectRatio: "4/3",
        },
        {
          id: 7,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "Flat-lay of tech gadgets",
          aspectRatio: "4/3",
        },
      ],
    },
    {
      date: "April 2024",
      subDate: "Mon, Apr 15, 2024",
      photos: [
        {
          id: 6,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "A serene beach view",
          aspectRatio: "16/9",
        },
        {
          id: 7,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "A modern office workspace",
          aspectRatio: "4/3",
        },
        {
          id: 8,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "A starry night sky",
          aspectRatio: "1/1",
        },
      ],
    },
    {
      date: "December 2023",
      subDate: "Sun, Dec 28, 2023",
      photos: [
        {
          id: 9,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "Snow-covered mountains",
          aspectRatio: "3/4",
        },
        {
          id: 10,
          src: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df",
          alt: "A warm winter fireplace",
          aspectRatio: "4/3",
        },
      ],
    },
  ];
  
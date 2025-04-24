import React from "react";

export const AlbumsIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-foreground"
    {...props}
  >
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H6V4h6v7l2.5-1.88L17 11V4h1v16zm-4.33-6L17 18H7l2.5-3.2 1.67 2.18 2.5-2.98z"></path>
  </svg>
));

export const FavouritesIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-foreground"
    {...props}
  >
    <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"></path>
  </svg>
));

export const RemoveFavouritesIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-foreground"
    {...props}
  >
    <path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z" />
    <line
      x1="4"
      y1="4"
      x2="20"
      y2="20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
));

export const TrashIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-foreground"
    {...props}
  >
    <path d="M15 4V3H9v1H4v2h1v13c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V6h1V4h-5zm2 15H7V6h10v13zM9 8h2v9H9zm4 0h2v9h-2z"></path>
  </svg>
));

export const PhotosIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-foreground"
    {...props}
  >
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"></path>
  </svg>
));

export const CheckCircleIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    width="24px"
    height="24px"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="text-foreground"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    <path
      d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
      className="fill-muted"
    />
  </svg>
));

export const SpinnerIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg
    ref={ref}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
));

export const EmptyAlbumIcon = React.forwardRef<SVGSVGElement,React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="220" height="204" fill="none">
    <g clip-path="url(#clip0)">
      <path fill="#3A3A3A" d="M14 44h192v112H14z" />
      <ellipse cx="110" cy="46" rx="12" ry="4" fill="#555" />
      <ellipse cx="110" cy="154" rx="12" ry="4" fill="#555" />
      <path fill="#1E1E1E" d="M18 48h90v104H18zM112 48h90v104h-90z" />
      <circle cx="98.5" cy="66.5" r="2.5" fill="#777" />
      <circle cx="121.5" cy="66.5" r="2.5" fill="#777" />
      <circle cx="98.5" cy="98.5" r="2.5" fill="#777" />
      <circle cx="121.5" cy="98.5" r="2.5" fill="#777" />
      <circle cx="98.5" cy="130.5" r="2.5" fill="#777" />
      <circle cx="121.5" cy="130.5" r="2.5" fill="#777" />
      <mask id="a" maskUnits="userSpaceOnUse" x="98" y="56" width="24" height="12">
        <path d="M122 68a11.998 11.998 0 00-12-12 11.998 11.998 0 00-12 12h24z" fill="#555" />
      </mask>
      <g mask="url(#a)">
        <circle cx="110" cy="68" r="11.5" stroke="#999" />
      </g>
      <mask id="b" maskUnits="userSpaceOnUse" x="98" y="88" width="24" height="12">
        <path d="M122 100a11.998 11.998 0 00-12-12 11.998 11.998 0 00-12 12h24z" fill="#555" />
      </mask>
      <g mask="url(#b)">
        <circle cx="110" cy="100" r="11.5" stroke="#999" />
      </g>
      <mask id="c" maskUnits="userSpaceOnUse" x="98" y="120" width="24" height="12">
        <path d="M122 132c0-3.183-1.264-6.235-3.515-8.485a11.996 11.996 0 00-16.97 0A11.997 11.997 0 0098 132h24z" fill="#555" />
      </mask>
      <g mask="url(#c)">
        <circle cx="110" cy="132" r="11.5" stroke="#999" />
      </g>
      <path fill="#2A2A2A" d="M22 100h33v33H22zM39 56h53v40H39zM59 100h33v44H59zM128 56h33v44h-33zM165 67h33v33h-33zM128 104h53v40h-53z" />
    </g>
    <defs>
      <clipPath id="clip0">
        <path fill="#000" d="M0 0h220v204H0z" />
      </clipPath>
    </defs>
  </svg>
));

export const EmptyPhotosIcon = React.forwardRef<SVGSVGElement, React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="646" height="328" fill="none">
  <defs/>
  <path fill="#999" fill-rule="evenodd" d="M499 98.198c0 20.547 16.654 37.202 37.199 37.202 20.544 0 37.199-16.654 37.199-37.201 0-20.544-16.655-37.199-37.199-37.199C515.654 60.999 499 77.654 499 98.198" clip-rule="evenodd"/>
  <path fill="#555" fill-rule="evenodd" d="M645.18 165.094c-.818-6.153-6.073-10.904-12.451-10.904-1.339 0-2.629.214-3.84.601-.636-10.316-9.2-18.487-19.676-18.487a19.75 19.75 0 00-4.625.551c-3.529-5.335-9.58-8.855-16.455-8.855-10.89 0-19.719 8.828-19.719 19.719 0 1.597.195 3.148.554 4.635-.458-.05-.922-.081-1.394-.081-6.944 0-12.574 5.63-12.574 12.575 0 .083.011.163.013.246h90.167z" clip-rule="evenodd"/>
  <path fill="#444" fill-rule="evenodd" d="M145.18 205.094c-.818-6.153-6.073-10.904-12.451-10.904-1.339 0-2.629.214-3.84.601-.636-10.316-9.2-18.487-19.676-18.487a19.75 19.75 0 00-4.625.551c-3.529-5.335-9.58-8.855-16.455-8.855-10.89 0-19.719 8.828-19.719 19.719 0 1.597.195 3.148.554 4.635-.458-.05-.922-.081-1.394-.081-6.944 0-12.574 5.63-12.574 12.575 0 .083.01.163.013.246h90.167z" clip-rule="evenodd"/>
  <path fill="#444" fill-rule="evenodd" d="M586 157.953c-3.484-26.202-25.862-46.433-53.018-46.433-5.704 0-11.193.911-16.35 2.562-2.709-43.928-39.176-78.722-83.786-78.722a84.06 84.06 0 00-19.693 2.345C398.125 14.99 372.361 0 343.086 0c-46.373 0-83.966 37.593-83.966 83.966 0 6.8.829 13.407 2.358 19.739a54.094 54.094 0 00-5.935-.345c-29.569 0-53.543 23.971-53.543 53.543 0 .353.046.696.054 1.05H586z" clip-rule="evenodd" opacity=".9"/>
  <path fill="#555" fill-rule="evenodd" d="M360 221.08c-3.267-24.564-24.245-43.53-49.704-43.53-5.348 0-10.494.854-15.328 2.402-2.54-41.183-36.728-73.802-78.55-73.802-6.36 0-12.539.773-18.462 2.198C183.867 87.053 159.714 73 132.268 73c-43.475 0-78.718 35.243-78.718 78.718 0 6.375.778 12.569 2.21 18.505a50.85 50.85 0 00-5.563-.323C22.476 169.9 0 192.373 0 220.096c0 .332.043.653.051.984H360z" clip-rule="evenodd"/>
  <path fill="#555" fill-rule="evenodd" d="M465.209 136H461l.811 157H472V142.521c0-3.603-3.039-6.521-6.791-6.521" clip-rule="evenodd"/>
  <path fill="#222" fill-rule="evenodd" d="M463.958 136H260.433a4.433 4.433 0 00-4.433 4.429V293h212V140.041a4.04 4.04 0 00-4.042-4.041" clip-rule="evenodd"/>
  <path fill="#555" fill-rule="evenodd" d="M472 292H253v16h214.315c2.588 0 4.685-2.053 4.685-4.587V292z" clip-rule="evenodd"/>
  <mask id="a" width="223" height="17" x="155" y="291" maskUnits="userSpaceOnUse">
    <path fill="#555" fill-rule="evenodd" d="M155 291.506h222.362v16.492H155v-16.492z" clip-rule="evenodd"/>
  </mask>
  <g mask="">
    <path fill="#444" fill-rule="evenodd" d="M377.362 291.506H156.564a1.57 1.57 0 00-1.566 1.576v10.188c0 2.612 2.101 4.728 4.691 4.728h212.983c2.593 0 4.69-2.116 4.69-4.728v-11.764z" clip-rule="evenodd"/>
  </g>
  <path fill="#333" fill-rule="evenodd" d="M453.834 148H270.162a3.161 3.161 0 00-3.162 3.16v126.68a3.164 3.164 0 003.162 3.16h183.672a3.167 3.167 0 003.166-3.16V151.16a3.165 3.165 0 00-3.166-3.16" clip-rule="evenodd"/>
  <path fill="#777" fill-rule="evenodd" d="M281.607 299h-32.214c-4.082 0-7.393-3.135-7.393-7h47c0 3.865-3.311 7-7.393 7" clip-rule="evenodd"/>
  <path fill="#666" fill-rule="evenodd" d="M276 179a4 4 0 100-8 4 4 0 000 8zM276 160a4 4 0 100-8 4 4 0 000 8z" clip-rule="evenodd"/>
  <path fill="#666" d="M291 152h129v8H291z"/>
  <path fill="#666" fill-rule="evenodd" d="M276 191a4 4 0 100-8 4 4 0 000 8zM276 203a4 4 0 100-8 4 4 0 000 8zM276 215a4 4 0 100-8 4 4 0 000 8z" clip-rule="evenodd"/>
  <path fill="#444" d="M472 230h82v98h-82z"/>
  <path fill="#555" d="M452 220h82v98h-82z"/>
  <path fill="#666" d="M432 200h82v98h-82z"/>
  <path fill="#222" fill-rule="evenodd" d="M440.584 213h-7a.5.5 0 010-1h7a.5.5 0 010 1zm-6.237-2l-.002-.778a.5.5 0 00-.5-.499c-.618 0-1.389-1.469-1.718-2.472a12.043 12.043 0 00-1.479-2.884l-1.379-1.976c-.343-.353-.355-.912-.027-1.244a1.05 1.05 0 01.744-.326h.001c.272 0 .536.116.712.292l1.528 1.861a.5.5 0 00.886-.317V195.5c0-.511.517-.986 1.064-.998.513.011.9.44.9.998v2.042c0 .012.006.022.007.033V201a.5.5 0 001 0v-3.501c.514.046.791.431.885.598V201a.5.5 0 101 0v-2.569c.77-.009 1 .468 1.058.643V201a.5.5 0 001 0v-1.481c.755.064.976.406.976 2.481v4.875c0 .616-.188 1.205-.542 1.704l-.848 1.194a.508.508 0 00-.091.289V211h-5.175z" clip-rule="evenodd"/>
  <path fill="#999" fill-rule="evenodd" d="M440.585 213h-7a.5.5 0 010-1h7a.5.5 0 010 1zm-6.237-2l-.002-.778a.5.5 0 00-.5-.499c-.618 0-1.389-1.469-1.718-2.472a12.043 12.043 0 00-1.479-2.884l-1.379-1.976c-.343-.353-.355-.912-.027-1.244a1.05 1.05 0 01.744-.326h.001c.272 0 .536.116.712.292l1.528 1.861a.5.5 0 00.886-.317V195.5c0-.511.517-.986 1.064-.998.513.011.9.44.9.998v2.042c0 .012.006.022.007.033V201a.5.5 0 001 0v-3.501c.514.046.791.431.885.598V201a.5.5 0 101 0v-2.569c.77-.009 1 .468 1.058.643V201a.5.5 0 001 0v-1.481c.755.064.976.406.976 2.481v4.875c0 .616-.188 1.205-.542 1.704l-.848 1.194a.508.508 0 00-.091.289V211h-5.175zm7.298.439a1.493 1.493 0 00-1.061-.439h-.062v-.778l.755-1.064c.475-.67.726-1.459.726-2.283V202c0-.099-.007-.173-.009-.266a12.574 12.574 0 00-.011-.35c-.099-2.34-.774-2.805-2.109-2.873-.281-.553-.939-1.176-2.139-1.071a2.136 2.136 0 00-1.448-.907.49.49 0 00-.203-.045h-.007v-.988c0-1.099-.825-1.976-1.9-1.998-1.118.023-2.064.938-2.064 1.998v5.761l-.672-.817a2.031 2.031 0 00-1.454-.623h-.001c-.541 0-1.058.221-1.455.623-.708.717-.699 1.902-.032 2.58l1.329 1.913a11.084 11.084 0 011.352 2.636c.153.467.909 2.589 2.166 3.058l.001.393a1.48 1.48 0 00-.347.094 1.493 1.493 0 00-.916 1.382 1.493 1.493 0 00.916 1.382c.18.076.377.118.584.118h7a1.493 1.493 0 001.061-.439 1.499 1.499 0 000-2.122z" clip-rule="evenodd"/>
  <defs>
    <linearGradient id="paint0_linear" x1="517.6" x2="517.6" y1="98.2" y2="135.4" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FFD23D"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
    <linearGradient id="paint1_linear" x1="555" x2="555" y1="128" y2="165.094" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EFF0F2"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
    <linearGradient id="paint2_linear" x1="55" x2="55" y1="168" y2="205.094" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EFF0F2"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
    <linearGradient id="paint3_linear" x1="202" x2="202" y1="0" y2="157.953" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EFF0F2"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
    <linearGradient id="paint4_linear" x1="90" x2="90" y1="147.04" y2="221.08" gradientUnits="userSpaceOnUse">
      <stop stop-color="#EFF0F2"/>
      <stop offset="1" stop-color="#fff"/>
    </linearGradient>
  </defs>
</svg>
));

export const EmptyFavouritesIcon = React.forwardRef<SVGSVGElement,React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="132" height="132" fill="none">
    <path d="M117 26H15v102h102V26z" fill="#1E1E1E" />
    <path
      d="M99.68 87.392c0-1.25-.29-2.79-2.791-6.64a7.919 7.919 0 010-8.467c2.502-3.85 2.79-5.389 2.79-6.64 0-1.25-.288-2.79-2.79-6.64l-10.2-14.626C82.166 37.836 74.564 33.506 66 33.506s-16.166 4.33-20.689 10.873l-10.2 14.627c-2.502 3.849-2.79 5.388-2.79 6.64 0 1.25.288 2.79 2.79 6.639a7.919 7.919 0 010 8.468c-2.502 3.849-2.79 5.389-2.79 6.64 0 1.25.288 2.79 2.79 6.64a7.919 7.919 0 010 8.467c-2.502 3.849-2.79 5.389-2.79 6.64 0 1.251.288 2.79 2.79 6.639a7.919 7.919 0 010 8.468H96.89a7.919 7.919 0 010-8.468c2.502-3.849 2.79-5.388 2.79-6.639 0-1.251-.288-2.791-2.79-6.64a7.919 7.919 0 010-8.468c2.502-3.849 2.79-5.292 2.79-6.64z"
      fill="#555"
    />
    <path
      d="M47.717 57.658c0 10.104 8.18 18.284 18.283 18.284 10.104 0 18.283-8.18 18.283-18.283H47.717z"
      fill="#333"
    />
    <path
      d="M104.491 128v-4.715c0-12.51-6.063-24.25-16.359-31.37L65.52 76.038 42.906 91.915c-10.2 7.217-16.359 18.86-16.359 31.37V128"
      fill="#666"
    />
    <path
      d="M50.604 86.43v11.162c0 8.468 6.832 15.397 15.396 15.397 8.468 0 15.396-6.832 15.396-15.397V86.43"
      stroke="#333"
      stroke-miterlimit="10"
    />
    <path
      d="M113.487 11.018l1.402 8.334c.1.605.39 1.163.831 1.596.44.433 1.007.717 1.62.813l8.49 1.314a2.967 2.967 0 011.628.81 2.9 2.9 0 01.835 1.598 2.85 2.85 0 01-.277 1.774c-.281.546-.73.99-1.284 1.266l-7.627 3.852c-.543.28-.983.72-1.26 1.259a2.87 2.87 0 00-.284 1.749l1.394 8.332a2.862 2.862 0 01-.291 1.756c-.281.54-.728.977-1.277 1.252a2.966 2.966 0 01-3.393-.529l-6.105-5.977a2.977 2.977 0 00-3.417-.53l-7.627 3.852a2.965 2.965 0 01-3.394-.522 2.899 2.899 0 01-.839-1.58 2.857 2.857 0 01.254-1.76l3.848-7.522a2.85 2.85 0 00.264-1.754 2.89 2.89 0 00-.826-1.58l-6.105-5.977a2.898 2.898 0 01-.841-1.596 2.857 2.857 0 01.271-1.774 2.898 2.898 0 011.28-1.271 2.965 2.965 0 011.797-.28l8.49 1.315a2.975 2.975 0 001.794-.284 2.908 2.908 0 001.278-1.27l3.848-7.52a2.9 2.9 0 011.276-1.271 2.966 2.966 0 013.416.529c.441.432.732.991.831 1.596z"
      fill="#888"
    />
  </svg>
));

export const EmptyTrashIcon = React.forwardRef<SVGSVGElement,React.SVGProps<SVGSVGElement>>((props, ref) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="none">
    <ellipse cx="100" cy="145" rx="36" ry="12" fill="#999" />
    <ellipse cx="100" cy="55" rx="48" ry="12" fill="#999" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M52.108 55.813L64 145c0 6.627 16.118 12 36 12s36-5.373 36-12l11.892-89.187C146.22 62.06 125.417 67 100 67s-46.22-4.939-47.892-11.187z"
      fill="#1E1E1E"
    />
    <mask
      id="a"
      maskUnits="userSpaceOnUse"
      x="52"
      y="55"
      width="96"
      height="102"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M52.108 55.813L64 145c0 6.627 16.118 12 36 12s36-5.373 36-12l11.892-89.187C146.22 62.06 125.417 67 100 67s-46.22-4.939-47.892-11.187z"
        fill="#5F6368"
      />
    </mask>
    <g clip-path="url(#clip0)" stroke="#fff" mask="url(#a)">
      <path d="M-6.773 109.396L99.293 215.462M3.834 98.79L109.9 204.856M14.44 88.183l106.066 106.066M25.047 77.577l106.066 106.066M35.653 66.97l106.066 106.066M46.26 56.363l106.066 106.066M56.867 45.757l106.066 106.066M67.473 35.15l106.066 106.066M78.08 24.544L184.146 130.61M88.686 13.937l106.066 106.066M99.293 3.33l106.066 106.066M99.293 4.038L-6.773 110.104M109.9 14.644L3.834 120.71M120.506 25.251L14.44 131.317M131.113 35.857L25.047 141.923M141.719 46.464L35.653 152.53M152.326 57.071L46.26 163.137M162.933 67.677L56.867 173.743M173.539 78.284L67.473 184.35M184.146 88.89L78.08 194.956M194.752 99.497L88.686 205.563M205.359 110.104L99.293 216.17" />
    </g>
    <defs>
      <clipPath id="clip0">
        <path
          fill="#fff"
          transform="rotate(-45 128.917 63.478)"
          d="M0 0h151.5v151.5H0z"
        />
      </clipPath>
    </defs>
  </svg>
));
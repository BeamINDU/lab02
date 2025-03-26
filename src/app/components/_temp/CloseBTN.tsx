import React from "react";

interface CloseButtonProps {
  onClick: () => void;
}

const CloseBTN: React.FC<CloseButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="right-2 w-7 h-7 flex items-center justify-center rounded-xl  active:scale-90 transition-transform"
      aria-label="Close"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1L13 13M1 13L13 1"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
};

export default CloseBTN;

// import React from "react";

// interface CloseButtonProps {
//   onClick: () => void;
// }

// const CloseBTN: React.FC<CloseButtonProps> = ({ onClick }) => {
//   return (
//     <>
//     <button
//       onClick={onClick}
//       className="right-2 w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-200 active:scale-90 transition-transform"
//       aria-label="Close"
//     >
//       <img src="/icons_close.png" alt="CloseIcon"  />
//     </button>
//     </>
//   );
// };

// export default CloseBTN;

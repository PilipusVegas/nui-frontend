// import { useEffect, useState } from 'react';

// const useIsMobile = () => {
//   const getIsMobile = () => {
//     if (typeof window === 'undefined') return false; 
//     return window.innerWidth <= 768;
//   };

//   const [isMobile, setIsMobile] = useState(getIsMobile);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;

//     const handleResize = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   return isMobile;
// };

// export default useIsMobile;

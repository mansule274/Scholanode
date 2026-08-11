
const isDev = import.meta.env.VITE_ENV === 'development';


  const BASE_URL = isDev 
  ? import.meta.env.VITE_API_LOCAL_URL
  :  import.meta.env.VITE_API_PRODUCTION_URL

  export default BASE_URL;
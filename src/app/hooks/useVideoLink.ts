import axiosInstance from "../utils/axiosInstance";

export const useVideoLink =()=> {
    const getVideoLink = async (videoLink: string): Promise<string> => {
      if (process.env.NEXT_PUBLIC_SIGNED_URLS === "true" && videoLink) {
        try {
          const response = await axiosInstance.get(videoLink);
          return response?.data?.result || "";
        } catch (error) {
          console.error("Error fetching signed URL:", error);
          return "";
        }
      } else {
        return videoLink;
      }
    };
    
    return { getVideoLink };
  }
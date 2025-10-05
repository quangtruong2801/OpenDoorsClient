
import { FaFacebook, FaLinkedin, FaTwitter, FaInstagram, FaTiktok } from "react-icons/fa";

export const SOCIAL_OPTIONS = [
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin, color: "#0077B5" },
  { key: "facebook", label: "Facebook", icon: FaFacebook, color: "#1877F2" },
  { key: "twitter", label: "Twitter", icon: FaTwitter, color: "#1DA1F2" },
  { key: "instagram", label: "Instagram", icon: FaInstagram, color: "#C13584" },
  { key: "tiktok", label: "TikTok", icon: FaTiktok, color: "#000" },
] as const;

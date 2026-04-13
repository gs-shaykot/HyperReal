// still showing ⚠ Blocked cross-origin request from 192.168.0.100 to /_next/* resource. To allow this, configure "allowedDevOrigins" in next.config
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', 
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      }
    ]
  },
  allowedDevOrigins: ['http://192.168.0.100:3000']
};

export default nextConfig;

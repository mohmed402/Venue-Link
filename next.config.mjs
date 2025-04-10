const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lsckknmunnakdtjfamuz.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;

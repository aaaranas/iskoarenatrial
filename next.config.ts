import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options */
    images: {
	remotePatterns: [
	    {
		hostname: "ik.imagekit.io",
		protocol: "https",
	    },
	    {
		// Supabase Storage — avatars and media uploads
		hostname: "*.supabase.co",
		protocol: "https",
	    },
	]	
    },
};

export default nextConfig;

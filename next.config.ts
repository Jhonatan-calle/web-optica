import type { NextConfig } from "next";

function hostImagenes(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

const host = hostImagenes();

const nextConfig: NextConfig = {
  images: host
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: host,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : {},
};

export default nextConfig;
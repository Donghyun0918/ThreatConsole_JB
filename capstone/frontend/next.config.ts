import type { NextConfig } from "next";

// T-Pot nginx 리버스프록시 서브경로. /threat-console 아래에 전체 앱을 격리.
const basePath = "/threat-console";

const nextConfig: NextConfig = {
  basePath,
  async rewrites() {
    return [
      {
        source: "/user",
        destination: "/",
      },
    ];
  },
};

export default nextConfig;

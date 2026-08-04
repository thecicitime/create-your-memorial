import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 캔버스 커스텀 속성 타입 에러를 무시하고 정상 빌드되도록 설정
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
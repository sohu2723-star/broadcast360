import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import type { OpenNextConfig } from "@opennextjs/aws/types/open-next";

const base = defineCloudflareConfig();

const config: OpenNextConfig = {
  ...base,
  default: { ...base.default, minify: true },
};

export default config;

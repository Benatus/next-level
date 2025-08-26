const domain = process.env.SUPABASE_URL.replace("https://", "").replace("/");
module.exports = {
  images: {
    domains: [domain],
  },
};

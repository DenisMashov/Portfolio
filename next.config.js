module.exports = {
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap', // gerçek sitemap endpoint'in burası
      },
    ]
  },
}

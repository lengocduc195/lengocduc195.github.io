module.exports = {
  branch: 'gh-pages',
  repo: 'https://github.com/yourusername/your-repo-name.git', // Thay thế bằng URL repo của bạn
  dotfiles: true,
  silent: false,
  message: 'Deploy to GitHub Pages [skip ci]',
  user: {
    name: 'GitHub Actions',
    email: 'actions@github.com'
  }
};

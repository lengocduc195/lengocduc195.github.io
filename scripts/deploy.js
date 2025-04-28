const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục out tồn tại
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  console.error('Error: "out" directory does not exist. Run "npm run export" first.');
  process.exit(1);
}

// Đảm bảo file .nojekyll tồn tại
const nojekyllPath = path.join(outDir, '.nojekyll');
if (!fs.existsSync(nojekyllPath)) {
  console.log('Creating .nojekyll file...');
  fs.writeFileSync(nojekyllPath, '');
}

try {
  // Khởi tạo git trong thư mục out
  console.log('Initializing git repository in "out" directory...');
  execSync('git init', { cwd: outDir });

  // Cấu hình git user
  console.log('Configuring git user...');
  execSync('git config user.name "GitHub Actions"', { cwd: outDir });
  execSync('git config user.email "actions@github.com"', { cwd: outDir });

  // Thêm tất cả các file
  console.log('Adding files to git...');
  execSync('git add -A', { cwd: outDir });

  // Commit các thay đổi
  console.log('Committing changes...');
  execSync('git commit -m "Deploy to GitHub Pages"', { cwd: outDir });

  // Đẩy lên branch gh-pages
  console.log('Pushing to gh-pages branch...');

  // Sử dụng HTTPS với token (thay YOUR_GITHUB_TOKEN bằng token của bạn nếu cần)
  // Hoặc bạn có thể nhập username và password khi được yêu cầu
  execSync(
    'git push -f https://github.com/lengocduc195/lengocduc195.github.io.git HEAD:gh-pages',
    {
      cwd: outDir,
      stdio: 'inherit' // Hiển thị output và cho phép nhập input
    }
  );

  // Sử dụng SSH (đã comment)
  // execSync(
  //   'git push -f git@github.com:lengocduc195/lengocduc195.github.io.git HEAD:gh-pages',
  //   { cwd: outDir }
  // );

  console.log('Successfully deployed to GitHub Pages!');
} catch (error) {
  console.error(`Deployment failed: ${error.message}`);
  process.exit(1);
}

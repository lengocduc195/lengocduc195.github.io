# Hướng dẫn Build và Triển khai GitHub Personal Page

Tài liệu này cung cấp hướng dẫn chi tiết về cách build và triển khai trang web cá nhân của bạn lên GitHub Pages.

## Tổng quan

GitHub Pages là một dịch vụ hosting tĩnh miễn phí cho các trang web cá nhân, tổ chức hoặc dự án trực tiếp từ repository GitHub. Tài liệu này sẽ hướng dẫn bạn cách:

1. Chuẩn bị dự án Next.js cho việc triển khai tĩnh
2. Build dự án
3. Triển khai lên GitHub Pages
4. Cấu hình tên miền tùy chỉnh (tùy chọn)

## Yêu cầu

- Một tài khoản GitHub
- Git được cài đặt trên máy tính của bạn
- Node.js (phiên bản 18.x hoặc cao hơn)
- npm hoặc yarn

## Chuẩn bị dự án Next.js

### 1. Cấu hình Next.js cho xuất tĩnh

Mở file `next.config.js` và đảm bảo rằng bạn đã cấu hình xuất tĩnh:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Nếu bạn triển khai vào thư mục con (không phải domain gốc)
  // basePath: '/repository-name',
};

module.exports = nextConfig;
```

### 2. Cập nhật package.json

Đảm bảo rằng file `package.json` của bạn có script để triển khai:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "deploy": "touch out/.nojekyll && gh-pages -d out -t true"
}
```

### 3. Cài đặt gh-pages

```bash
npm install --save-dev gh-pages
# hoặc
yarn add --dev gh-pages
```

## Build dự án

### 1. Build ứng dụng Next.js

```bash
npm run build
# hoặc
yarn build
```

Lệnh này sẽ tạo ra một thư mục `out` chứa các file HTML, CSS, JavaScript tĩnh.

### 2. Tạo file .nojekyll

GitHub Pages sử dụng Jekyll để xử lý các trang web. Tuy nhiên, chúng ta không cần Jekyll vì Next.js đã xử lý việc build. Tạo một file `.nojekyll` trong thư mục `out`:

```bash
touch out/.nojekyll
```

Script `deploy` trong `package.json` đã bao gồm lệnh này.

## Triển khai lên GitHub Pages

### 1. Tạo repository trên GitHub

1. Đăng nhập vào GitHub
2. Tạo một repository mới với tên `username.github.io` (thay `username` bằng tên người dùng GitHub của bạn)
3. Nếu bạn muốn sử dụng repository hiện có, hãy bỏ qua bước này

### 2. Cấu hình Git

Nếu bạn chưa cấu hình Git trong dự án:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repository-name.git
git push -u origin main
```

### 3. Triển khai với gh-pages

```bash
npm run deploy
# hoặc
yarn deploy
```

Lệnh này sẽ:
1. Tạo file `.nojekyll` trong thư mục `out`
2. Đẩy nội dung của thư mục `out` lên nhánh `gh-pages` của repository

### 4. Cấu hình GitHub Pages

1. Truy cập repository của bạn trên GitHub
2. Chuyển đến tab "Settings"
3. Cuộn xuống phần "GitHub Pages"
4. Trong phần "Source", chọn nhánh `gh-pages` và thư mục gốc (`/`)
5. Nhấp vào "Save"

## Cấu hình tên miền tùy chỉnh (tùy chọn)

### 1. Mua tên miền

Mua tên miền từ nhà cung cấp dịch vụ tên miền như Namecheap, GoDaddy, Google Domains, v.v.

### 2. Cấu hình DNS

#### Sử dụng Apex domain (example.com)

Thêm các bản ghi A trỏ đến các địa chỉ IP của GitHub Pages:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

#### Sử dụng subdomain (www.example.com)

Thêm bản ghi CNAME trỏ đến `username.github.io`.

### 3. Cấu hình trong GitHub

1. Trong repository, tạo file `CNAME` trong thư mục `public` với nội dung là tên miền của bạn:

```
example.com
```

2. Trong phần "Settings" > "GitHub Pages" > "Custom domain", nhập tên miền của bạn và nhấp vào "Save"
3. Đánh dấu vào "Enforce HTTPS" nếu có thể

## Kiểm tra triển khai

Sau khi triển khai, trang web của bạn sẽ có sẵn tại:

- `https://username.github.io` (nếu repository có tên là `username.github.io`)
- `https://username.github.io/repository-name` (nếu repository có tên khác)
- Tên miền tùy chỉnh của bạn (nếu đã cấu hình)

## Cập nhật trang web

Để cập nhật trang web, chỉ cần thực hiện các thay đổi, commit chúng và chạy lại lệnh deploy:

```bash
git add .
git commit -m "Update website"
git push
npm run deploy
```

## Khắc phục sự cố

### 1. Các trang 404 khi điều hướng

Next.js sử dụng định tuyến phía máy chủ, nhưng GitHub Pages là hosting tĩnh. Để khắc phục:

1. Sử dụng `next/link` cho điều hướng nội bộ
2. Cân nhắc sử dụng một file 404.html tùy chỉnh
3. Đối với các trang động, hãy sử dụng cách tiếp cận xuất tĩnh với `getStaticPaths`

### 2. Hình ảnh không hiển thị

Đảm bảo rằng bạn đã cấu hình `unoptimized: true` trong phần `images` của `next.config.js`.

### 3. Lỗi khi triển khai

Nếu bạn gặp lỗi khi chạy `npm run deploy`:

1. Kiểm tra quyền truy cập repository
2. Đảm bảo rằng bạn đã cài đặt `gh-pages`
3. Kiểm tra xem thư mục `out` có tồn tại không

## Tối ưu hóa

### 1. Sử dụng GitHub Actions

Thay vì triển khai thủ công, bạn có thể sử dụng GitHub Actions để tự động hóa quy trình:

1. Tạo thư mục `.github/workflows` trong dự án
2. Tạo file `deploy.yml` với nội dung:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: out
          branch: gh-pages
```

### 2. Tối ưu hóa hiệu suất

1. Sử dụng Next.js Image Optimization khi có thể
2. Tối ưu hóa các bundle JavaScript với code splitting
3. Sử dụng Static Generation cho các trang có thể

## Tài nguyên bổ sung

- [Tài liệu GitHub Pages](https://docs.github.com/en/pages)
- [Tài liệu Next.js về Static Exports](https://nextjs.org/docs/advanced-features/static-html-export)
- [Cấu hình tên miền tùy chỉnh với GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [GitHub Actions cho GitHub Pages](https://github.com/marketplace/actions/deploy-to-github-pages)

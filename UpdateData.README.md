# Hướng dẫn cập nhật dữ liệu cho trang web

Dưới đây là hướng dẫn chi tiết về cách cập nhật dữ liệu cho các phần khác nhau của trang web, bao gồm blogs, products, projects, journeys và các loại dữ liệu khác.

## 1. Cấu trúc thư mục dữ liệu

Tất cả dữ liệu được lưu trữ trong thư mục `public/assets/data/` với cấu trúc như sau:

```
public/
  └── assets/
      └── data/
          ├── about.json
          ├── blogs/
          │   ├── blog1.json
          │   ├── blog2.json
          │   └── ...
          ├── products/
          │   ├── product1.json
          │   ├── product2.json
          │   └── ...
          ├── projects/
          │   ├── project1.json
          │   ├── project2.json
          │   └── ...
          ├── publications/
          │   ├── publication1.json
          │   ├── publication2.json
          │   └── ...
          ├── ranks.json
          └── technologies.json
```

## 2. Quy trình cập nhật dữ liệu

### 2.1. Cập nhật Blogs

1. **Tạo file JSON mới** trong thư mục `public/assets/data/blogs/` với tên file phù hợp (ví dụ: `ai-ethics-challenges.json`).

2. **Cấu trúc dữ liệu blog**:
   ```json
   {
     "id": "unique-blog-id",
     "title": "Tiêu đề blog",
     "description": "Mô tả ngắn gọn về blog",
     "author": "Tên tác giả",
     "date": "YYYY-MM-DD",
     "content": "Nội dung blog ở định dạng Markdown",
     "topics": ["Topic 1", "Topic 2"],
     "technologies": ["Technology 1", "Technology 2"],
     "readingTime": "X min read",
     "images": [
       {
         "url": "/images/blogs/image1.jpg",
         "caption": "Chú thích cho hình ảnh"
       }
     ],
     "related": [
       {
         "title": "Tiêu đề blog liên quan",
         "url": "/blogs/related-blog-slug"
       }
     ],
     "notableObservations": [
       "Observation 1",
       "Observation 2"
     ],
     "unexpectedInsights": [
       "Insight 1",
       "Insight 2"
     ]
   }
   ```

3. **Lưu ý về trường dữ liệu**:
   - `id`: Định danh duy nhất cho blog
   - `content`: Nội dung blog ở định dạng Markdown
   - `notableObservations` và `unexpectedInsights`: Không bắt buộc, có thể có một trong hai hoặc cả hai
   - Hình ảnh cho blogs nên được lưu trong thư mục `public/images/blogs/`

### 2.2. Cập nhật Projects

1. **Tạo file JSON mới** trong thư mục `public/assets/data/projects/` với tên file phù hợp.

2. **Cấu trúc dữ liệu project**:
   ```json
   {
     "id": "unique-project-id",
     "title": "Tên dự án",
     "description": "Mô tả ngắn gọn về dự án",
     "date": "YYYY-MM-DD",
     "company": "Tên công ty (nếu có)",
     "lab": "Tên phòng lab (nếu có)",
     "topics": ["Topic 1", "Topic 2"],
     "technologies": ["Technology 1", "Technology 2"],
     "tags": ["Tag 1", "Tag 2"],
     "main_image": {
       "url": "/images/projects/main-image.jpg",
       "caption": "Chú thích cho hình ảnh chính"
     },
     "images": [
       {
         "url": "/images/projects/image1.jpg",
         "caption": "Chú thích cho hình ảnh"
       }
     ],
     "content": [
       {
         "type": "text",
         "text": "Đoạn văn bản ở định dạng Markdown"
       },
       {
         "type": "image",
         "url": "/images/projects/content-image.jpg",
         "caption": "Chú thích cho hình ảnh trong nội dung"
       }
     ],
     "githubUrl": "https://github.com/yourusername/project-repo",
     "demoUrl": "https://youtube.com/watch?v=demo-video",
     "productUrl": "https://project-website.com",
     "unexpectedInsights": [
       "Insight 1",
       "Insight 2"
     ]
   }
   ```

3. **Lưu ý về trường dữ liệu**:
   - `main_image`: Hình ảnh chính hiển thị trong danh sách dự án
   - `content`: Mảng các phần tử nội dung, mỗi phần tử có thể là văn bản hoặc hình ảnh
   - Hình ảnh cho projects nên được lưu trong thư mục `public/images/projects/`

### 2.3. Cập nhật Products

1. **Tạo file JSON mới** trong thư mục `public/assets/data/products/` với tên file phù hợp.

2. **Cấu trúc dữ liệu product**:
   ```json
   {
     "id": "unique-product-id",
     "name": "Tên sản phẩm",
     "description": "Mô tả ngắn gọn về sản phẩm",
     "date": "YYYY-MM-DD",
     "company": "Tên công ty",
     "topics": ["Topic 1", "Topic 2"],
     "technologies": ["Technology 1", "Technology 2"],
     "main_image": {
       "url": "/images/products/main-image.jpg",
       "caption": "Chú thích cho hình ảnh chính"
     },
     "images": [
       {
         "url": "/images/products/image1.jpg",
         "caption": "Chú thích cho hình ảnh"
       }
     ],
     "content": [
       {
         "type": "text",
         "text": "Đoạn văn bản ở định dạng Markdown"
       },
       {
         "type": "image",
         "url": "/images/products/content-image.jpg",
         "caption": "Chú thích cho hình ảnh trong nội dung"
       }
     ],
     "productUrl": "https://product-website.com",
     "demoUrl": "https://youtube.com/watch?v=demo-video",
     "githubUrl": "https://github.com/yourusername/product-repo"
   }
   ```

3. **Lưu ý về trường dữ liệu**:
   - `productUrl`: Liên kết đến trang web sản phẩm
   - `demoUrl`: Liên kết đến video demo trên YouTube
   - Hình ảnh cho products nên được lưu trong thư mục `public/images/products/`

### 2.4. Cập nhật Publications

1. **Tạo file JSON mới** trong thư mục `public/assets/data/publications/` với tên file phù hợp.

2. **Cấu trúc dữ liệu publication**:
   ```json
   {
     "id": "unique-publication-id",
     "title": "Tiêu đề bài báo",
     "authors": ["Author 1", "Author 2"],
     "venue": "Tên hội nghị hoặc tạp chí",
     "year": 2023,
     "type": "conference",
     "abstract": "Tóm tắt bài báo",
     "topics": ["Topic 1", "Topic 2"],
     "technologies": ["Technology 1", "Technology 2"],
     "paperUrl": "https://link-to-paper.pdf",
     "codeUrl": "https://github.com/yourusername/paper-code",
     "demoUrl": "https://youtube.com/watch?v=demo-video",
     "citation": "Trích dẫn đầy đủ theo định dạng APA hoặc IEEE",
     "content": [
       {
         "type": "text",
         "text": "Đoạn văn bản ở định dạng Markdown"
       },
       {
         "type": "image",
         "url": "/images/publications/image1.jpg",
         "caption": "Chú thích cho hình ảnh"
       }
     ],
     "main_image": {
       "url": "/images/publications/main-image.jpg",
       "caption": "Chú thích cho hình ảnh chính"
     }
   }
   ```

3. **Lưu ý về trường dữ liệu**:
   - `type`: Có thể là "conference", "journal", hoặc "workshop"
   - `paperUrl`: Liên kết đến bài báo PDF
   - Hình ảnh cho publications nên được lưu trong thư mục `public/images/publications/`

### 2.5. Cập nhật About

1. **Chỉnh sửa file** `public/assets/data/about.json`.

2. **Cấu trúc dữ liệu about**:
   ```json
   {
     "name": "Tên của bạn",
     "title": "Chức danh",
     "bio": "Tiểu sử ngắn",
     "slogan": "Slogan hiển thị trên trang chủ",
     "slogan_footer": "Slogan hiển thị ở footer",
     "avatar": "/images/avatar.jpg",
     "email": "your.email@example.com",
     "social": {
       "github": "https://github.com/yourusername",
       "linkedin": "https://linkedin.com/in/yourusername",
       "twitter": "https://twitter.com/yourusername"
     },
     "education": [
       {
         "degree": "Tên bằng cấp",
         "institution": "Tên trường",
         "year": "2018-2022"
       }
     ],
     "experience": [
       {
         "position": "Chức vụ",
         "company": "Tên công ty",
         "period": "2022-Present",
         "description": "Mô tả công việc"
       }
     ]
   }
   ```

## 3. Quy trình build và deploy

Sau khi cập nhật dữ liệu, bạn cần build lại trang web để các thay đổi có hiệu lực:

1. **Build trang web**:
   ```bash
   npm run build
   ```

2. **Kiểm tra trang web ở môi trường local**:
   ```bash
   npm run start
   ```

3. **Deploy trang web** (tùy thuộc vào nền tảng hosting của bạn):
   ```bash
   # Ví dụ với Vercel
   vercel --prod
   
   # Hoặc với Netlify
   netlify deploy --prod
   ```

## 4. Lưu ý quan trọng

1. **Định dạng hình ảnh**:
   - Nên sử dụng định dạng JPG hoặc WebP cho hình ảnh để tối ưu kích thước
   - Kích thước hình ảnh nên phù hợp (không quá lớn để tránh tải chậm)
   - Đặt hình ảnh trong thư mục tương ứng: `/images/blogs/`, `/images/projects/`, `/images/products/`, `/images/publications/`

2. **Định dạng nội dung**:
   - Nội dung văn bản hỗ trợ định dạng Markdown
   - Có thể sử dụng các thẻ HTML cơ bản trong nội dung Markdown

3. **Slug URL**:
   - Slug URL được tạo tự động từ ID hoặc tiêu đề
   - Nên sử dụng ID ngắn gọn, dễ nhớ và không có ký tự đặc biệt

4. **Notable Observations và Unexpected Insights**:
   - Các trường này không bắt buộc nhưng rất hữu ích để hiển thị trên trang chủ
   - Mỗi mục nên ngắn gọn, súc tích và đáng nhớ

5. **Liên kết giữa các mục**:
   - Sử dụng trường `related` để liên kết giữa các bài viết, dự án liên quan
   - Đảm bảo URL trong trường `related` chính xác

## 5. Xử lý lỗi thường gặp

1. **Lỗi 404 khi truy cập trang chi tiết**:
   - Kiểm tra xem ID hoặc slug URL có chính xác không
   - Đảm bảo file JSON đã được tạo đúng cách

2. **Hình ảnh không hiển thị**:
   - Kiểm tra đường dẫn hình ảnh có chính xác không
   - Đảm bảo hình ảnh đã được tải lên thư mục đúng

3. **Lỗi khi build trang web**:
   - Kiểm tra cú pháp JSON (dấu phẩy, ngoặc)
   - Đảm bảo tất cả các trường bắt buộc đều có giá trị

4. **Lỗi "Page is missing param in generateStaticParams()"**:
   - Đây là lỗi liên quan đến Next.js khi sử dụng `output: 'export'`
   - Đảm bảo rằng tất cả các slug URL đều được xử lý trong hàm `generateStaticParams()`
   - Sau khi thêm dữ liệu mới, hãy build lại trang web để cập nhật các tham số tĩnh

Bằng cách tuân thủ hướng dẫn này, bạn có thể dễ dàng cập nhật và quản lý nội dung trên trang web của mình một cách hiệu quả.

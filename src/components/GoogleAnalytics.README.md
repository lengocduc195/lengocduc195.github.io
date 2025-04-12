# Hướng dẫn sử dụng Google Analytics

Tài liệu này cung cấp hướng dẫn chi tiết về cách sử dụng và tùy chỉnh tính năng Google Analytics trong dự án của bạn.

## Tổng quan

Hệ thống phân tích dữ liệu của chúng ta bao gồm hai phần chính:
1. **Google Analytics 4 (GA4)** - Hệ thống phân tích dữ liệu của Google
2. **Hệ thống phân tích tùy chỉnh** - Lưu trữ dữ liệu cục bộ trong thư mục `analytics-data`

## Cài đặt Google Analytics 4

### 1. Tạo tài khoản Google Analytics

1. Truy cập [Google Analytics](https://analytics.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Nhấp vào "Bắt đầu đo lường"
4. Tạo một tài khoản mới (hoặc sử dụng tài khoản hiện có)
5. Tạo một property mới (chọn "Web")
6. Nhập thông tin trang web của bạn
7. Nhận **Measurement ID** (bắt đầu bằng "G-")

### 2. Cấu hình trong dự án

Mở file `src/components/GoogleAnalytics.tsx` và thay thế ID đo lường mẫu bằng ID thực tế của bạn:

```typescript
// Thay thế bằng ID Google Analytics thực tế của bạn
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; 
```

## Các tính năng đã triển khai

### 1. Theo dõi lượt xem trang tự động

Component `GoogleAnalytics.tsx` tự động theo dõi lượt xem trang mỗi khi người dùng điều hướng trong ứng dụng Next.js của bạn. Không cần thêm code nào khác.

### 2. Theo dõi sự kiện tùy chỉnh

Bạn có thể theo dõi các sự kiện tùy chỉnh bằng cách sử dụng hàm `gtag` trong các component của mình:

```javascript
// Ví dụ: Theo dõi khi người dùng tải CV
const handleDownloadCV = () => {
  if (window.gtag) {
    window.gtag('event', 'download_cv', {
      'event_category': 'engagement',
      'event_label': 'CV Download',
    });
  }
  // Tiếp tục với logic tải xuống
};
```

### 3. Theo dõi thời gian đọc

Để theo dõi thời gian người dùng dành cho mỗi trang, bạn có thể sử dụng sự kiện tùy chỉnh:

```javascript
// Khi component unmount hoặc người dùng rời trang
useEffect(() => {
  const startTime = Date.now();
  
  return () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // in seconds
    if (window.gtag && timeSpent > 1) {
      window.gtag('event', 'time_spent', {
        'event_category': 'engagement',
        'event_label': window.location.pathname,
        'value': timeSpent
      });
    }
  };
}, []);
```

## Theo dõi mối quan tâm của người dùng

### 1. Sử dụng thuộc tính data-interest

Thêm thuộc tính `data-interest` vào các phần tử HTML để theo dõi mối quan tâm của người dùng:

```jsx
<div data-interest="react">Nội dung về React</div>
```

### 2. Sử dụng component InterestTracker

```jsx
import InterestTracker from '@/components/InterestTracker';

// Trong component của bạn
<InterestTracker interest="react">
  <div>Nội dung về React</div>
</InterestTracker>
```

### 3. Gửi sự kiện mối quan tâm đến Google Analytics

Khi người dùng tương tác với các phần tử có thuộc tính `data-interest`, hệ thống sẽ tự động gửi sự kiện đến Google Analytics:

```javascript
// Đã được triển khai trong Analytics.tsx
if (window.gtag) {
  window.gtag('event', 'interest_shown', {
    'event_category': 'interests',
    'event_label': interest
  });
}
```

## Xem và phân tích dữ liệu

### 1. Bảng điều khiển Google Analytics

1. Đăng nhập vào [Google Analytics](https://analytics.google.com/)
2. Chọn property của bạn
3. Xem các báo cáo trong phần "Reports"

### 2. Báo cáo thời gian thực

1. Trong Google Analytics, chọn "Realtime" từ menu bên trái
2. Xem người dùng đang hoạt động trên trang web của bạn trong thời gian thực

### 3. Báo cáo sự kiện

1. Trong Google Analytics, chọn "Events" từ menu bên trái
2. Xem các sự kiện tùy chỉnh đã được gửi từ trang web của bạn

## Tùy chỉnh nâng cao

### 1. Theo dõi người dùng cụ thể

Nếu bạn có hệ thống xác thực, bạn có thể theo dõi người dùng cụ thể (lưu ý các quy định về quyền riêng tư):

```javascript
// Sau khi người dùng đăng nhập
if (window.gtag) {
  window.gtag('set', 'user_properties', {
    user_id: 'anonymous_id_123', // Không sử dụng thông tin nhận dạng cá nhân
    user_role: 'subscriber',
    user_plan: 'premium'
  });
}
```

### 2. Theo dõi chuyển đổi

Để theo dõi các mục tiêu chuyển đổi (như đăng ký, mua hàng):

```javascript
// Khi người dùng hoàn thành một hành động quan trọng
if (window.gtag) {
  window.gtag('event', 'conversion', {
    'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL', // Từ Google Ads
    'value': 25.0,
    'currency': 'USD',
    'transaction_id': 'ORDER_ID'
  });
}
```

### 3. Tích hợp với Google Tag Manager

Để quản lý nhiều thẻ và sự kiện phân tích một cách linh hoạt hơn, bạn có thể tích hợp Google Tag Manager:

1. Tạo tài khoản [Google Tag Manager](https://tagmanager.google.com/)
2. Thay thế code trong `GoogleAnalytics.tsx` bằng code tích hợp Tag Manager
3. Cấu hình các thẻ và kích hoạt trong giao diện Tag Manager

## Tuân thủ quy định về quyền riêng tư

### 1. GDPR và CCPA

Để tuân thủ các quy định về quyền riêng tư như GDPR (EU) và CCPA (California):

1. Thêm banner chấp thuận cookie
2. Chỉ kích hoạt Google Analytics sau khi người dùng đồng ý
3. Cung cấp tùy chọn từ chối theo dõi

```javascript
// Ví dụ: Chỉ kích hoạt GA sau khi có sự đồng ý
if (userConsent && window.gtag) {
  window.gtag('consent', 'update', {
    'analytics_storage': 'granted'
  });
} else {
  window.gtag('consent', 'update', {
    'analytics_storage': 'denied'
  });
}
```

### 2. Ẩn danh hóa IP

Để tăng cường quyền riêng tư của người dùng:

```javascript
// Trong GoogleAnalytics.tsx
gtag('config', GA_MEASUREMENT_ID, {
  page_path: pathname,
  anonymize_ip: true // Ẩn danh hóa địa chỉ IP
});
```

## Khắc phục sự cố

### 1. Dữ liệu không xuất hiện trong Google Analytics

- Kiểm tra xem ID đo lường có chính xác không
- Đợi 24-48 giờ để dữ liệu xuất hiện
- Kiểm tra xem có trình chặn quảng cáo nào đang chặn Google Analytics không
- Sử dụng [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) để gỡ lỗi

### 2. Sự kiện tùy chỉnh không được ghi lại

- Kiểm tra console trong trình duyệt để xem lỗi
- Xác minh rằng `window.gtag` tồn tại trước khi gọi nó
- Kiểm tra xem sự kiện có đúng định dạng không

## Tài nguyên bổ sung

- [Tài liệu Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Sự kiện được đề xuất cho GA4](https://support.google.com/analytics/answer/9267735)
- [Hướng dẫn về quyền riêng tư của Google Analytics](https://support.google.com/analytics/answer/9019185)
- [Google Analytics Academy](https://analytics.google.com/analytics/academy/)

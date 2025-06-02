'use client';

import React from 'react';

// Component hiển thị văn bản có định dạng trích dẫn
export default function FormattedText({ text, className = "" }: { text: string, className?: string }) {
  // Mẫu regex để tìm các câu trích dẫn trong dấu nháy đơn hoặc kép
  const formatText = () => {
    if (!text) return text;

    // Tìm các câu trích dẫn có dấu nháy đơn
    // Sử dụng regex phức tạp hơn để tránh nhận diện nhầm các từ có dấu nháy đơn như "wasn't", "don't", v.v.
    // Chỉ nhận diện các câu trích dẫn có ít nhất 5 ký tự và không phải là từ viết tắt
    const parts: React.ReactNode[] = [];
    const singleQuoteRegex = /(?<!\w)'([^']{5,})'(?!\w)/g;
    let lastIndex = 0;
    let match;

    while ((match = singleQuoteRegex.exec(text)) !== null) {
      // Thêm văn bản trước câu trích dẫn
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      // Thêm câu trích dẫn đã được định dạng trên dòng riêng
      parts.push(
        <div key={`quote-${match.index}`} className="my-4">
          <blockquote className="block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-4 border-l-4 border-blue-500 dark:border-blue-400 italic text-gray-700 dark:text-gray-300 font-medium rounded-r-md shadow-sm">
            '{match[1]}'
          </blockquote>
        </div>
      );

      // Cập nhật vị trí hiện tại
      lastIndex = match.index + match[0].length;
    }

    // Thêm phần còn lại của văn bản
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // Xử lý các câu trích dẫn có dấu nháy kép trong kết quả đã xử lý
    const finalParts: React.ReactNode[] = [];

    // Duyệt qua các phần đã xử lý
    parts.forEach((part, index) => {
      if (typeof part === 'string') {
        // Tìm các câu trích dẫn có dấu nháy kép
        // Chỉ nhận diện các câu trích dẫn có ít nhất 5 ký tự
        const doubleQuoteRegex = /"([^"]{5,})"/g;
        let stringPart = part;
        let doubleQuoteMatch;
        let doubleQuoteLastIndex = 0;
        const doubleQuoteParts: React.ReactNode[] = [];

        while ((doubleQuoteMatch = doubleQuoteRegex.exec(stringPart)) !== null) {
          // Thêm văn bản trước câu trích dẫn
          if (doubleQuoteMatch.index > doubleQuoteLastIndex) {
            doubleQuoteParts.push(stringPart.substring(doubleQuoteLastIndex, doubleQuoteMatch.index));
          }

          // Thêm câu trích dẫn đã được định dạng trên dòng riêng
          doubleQuoteParts.push(
            <div key={`double-quote-${index}-${doubleQuoteMatch.index}`} className="my-4">
              <blockquote className="block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-6 py-4 border-l-4 border-blue-500 dark:border-blue-400 italic text-gray-700 dark:text-gray-300 font-medium rounded-r-md shadow-sm">
                "{doubleQuoteMatch[1]}"
              </blockquote>
            </div>
          );

          // Cập nhật vị trí hiện tại
          doubleQuoteLastIndex = doubleQuoteMatch.index + doubleQuoteMatch[0].length;
        }

        // Thêm phần còn lại của văn bản
        if (doubleQuoteLastIndex < stringPart.length) {
          doubleQuoteParts.push(stringPart.substring(doubleQuoteLastIndex));
        }

        // Thêm các phần đã xử lý vào kết quả cuối cùng
        finalParts.push(...doubleQuoteParts);
      } else {
        // Giữ nguyên các phần không phải là chuỗi (đã được định dạng)
        finalParts.push(part);
      }
    });

    return finalParts;
  };

  return (
    <div className={`whitespace-pre-line ${className}`}>
      {formatText()}
    </div>
  );
}

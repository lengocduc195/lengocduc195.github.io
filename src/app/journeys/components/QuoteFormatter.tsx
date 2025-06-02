'use client';

// Hàm này sẽ tìm và định dạng các câu trích dẫn trong văn bản
export function formatQuotes(text: string): React.ReactNode {
  if (!text) return text;

  // Mẫu regex để tìm các câu trích dẫn trong dấu nháy đơn hoặc kép
  const singleQuoteRegex = /'([^']+)'/g;
  const doubleQuoteRegex = /"([^"]+)"/g;
  
  // Tìm các câu trích dẫn có dạng: Someone said: 'quote'
  const colonQuoteRegex = /([^.!?]+)(?:said|says|shared)(?:[^:]*):[\s]*['"]([^'"]+)['"]/gi;
  
  // Mảng để lưu trữ các phần của văn bản và các câu trích dẫn đã được định dạng
  const parts: React.ReactNode[] = [];
  
  // Xử lý các câu trích dẫn có dạng: Someone said: 'quote'
  let lastIndex = 0;
  let match;
  
  // Tạo bản sao của văn bản để xử lý
  let remainingText = text;
  
  // Tìm và xử lý các câu trích dẫn có dạu nháy đơn
  const processedParts: React.ReactNode[] = [];
  let currentIndex = 0;
  
  // Xử lý các câu trích dẫn có dấu nháy đơn
  while ((match = singleQuoteRegex.exec(remainingText)) !== null) {
    // Thêm văn bản trước câu trích dẫn
    if (match.index > currentIndex) {
      processedParts.push(remainingText.substring(currentIndex, match.index));
    }
    
    // Thêm câu trích dẫn đã được định dạng
    processedParts.push(
      <span key={`quote-${match.index}`} className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 my-2 border-l-4 border-blue-500 dark:border-blue-400 italic text-gray-700 dark:text-gray-300 font-medium rounded-r-md shadow-sm">
        '{match[1]}'
      </span>
    );
    
    // Cập nhật vị trí hiện tại
    currentIndex = match.index + match[0].length;
  }
  
  // Thêm phần còn lại của văn bản
  if (currentIndex < remainingText.length) {
    processedParts.push(remainingText.substring(currentIndex));
  }
  
  // Xử lý các câu trích dẫn có dấu nháy kép trong kết quả đã xử lý
  const finalParts: React.ReactNode[] = [];
  
  // Duyệt qua các phần đã xử lý
  processedParts.forEach((part, index) => {
    if (typeof part === 'string') {
      // Tìm các câu trích dẫn có dấu nháy kép
      let stringPart = part;
      let doubleQuoteMatch;
      let doubleQuoteLastIndex = 0;
      const doubleQuoteParts: React.ReactNode[] = [];
      
      while ((doubleQuoteMatch = doubleQuoteRegex.exec(stringPart)) !== null) {
        // Thêm văn bản trước câu trích dẫn
        if (doubleQuoteMatch.index > doubleQuoteLastIndex) {
          doubleQuoteParts.push(stringPart.substring(doubleQuoteLastIndex, doubleQuoteMatch.index));
        }
        
        // Thêm câu trích dẫn đã được định dạng
        doubleQuoteParts.push(
          <span key={`double-quote-${index}-${doubleQuoteMatch.index}`} className="inline-block bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 px-4 py-2 my-2 border-l-4 border-blue-500 dark:border-blue-400 italic text-gray-700 dark:text-gray-300 font-medium rounded-r-md shadow-sm">
            "{doubleQuoteMatch[1]}"
          </span>
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
  
  return <>{finalParts}</>;
}

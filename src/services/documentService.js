const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const documentService = {
  // Upload documents for a booking with progress tracking
  uploadDocuments: async (bookingId, files, uploadedBy, venueId = 86, onProgress = null) => {
    try {
      const totalFiles = files.length;
      let uploadedCount = 0;
      const results = [];

      // Upload files one by one to track progress
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        // Update progress for current file
        if (onProgress) {
          onProgress({
            current: uploadedCount,
            total: totalFiles,
            currentFile: file.name,
            status: 'uploading'
          });
        }

        const formData = new FormData();
        formData.append("bookingId", bookingId);
        formData.append("uploadedBy", uploadedBy);
        formData.append("venueId", venueId);
        formData.append(`document_0`, file); // Single file per request

        console.log(`Uploading file ${i + 1}/${totalFiles}:`, file.name);

        const response = await fetch(`${BASE_URL}/api/upload/bookingDocuments`, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          console.error('Upload response error:', {
            status: response.status,
            statusText: response.statusText,
            error: result.error
          });
          throw new Error(result.error || `HTTP ${response.status}: Document upload failed for ${file.name}`);
        }

        results.push(result);
        uploadedCount++;

        // Update progress after successful upload
        if (onProgress) {
          onProgress({
            current: uploadedCount,
            total: totalFiles,
            currentFile: file.name,
            status: uploadedCount === totalFiles ? 'completed' : 'uploading'
          });
        }
      }

      // Return combined results
      return {
        success: true,
        message: `Successfully uploaded ${uploadedCount} document(s)`,
        documents: results.flatMap(r => r.documents || []),
        count: uploadedCount
      };

    } catch (error) {
      console.error('Document upload service error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Get all documents for a booking
  getDocuments: async (bookingId) => {
    if (!bookingId) {
      throw new Error("Booking ID is required");
    }

    try {
      const response = await fetch(`${BASE_URL}/api/upload/bookingDocuments/${bookingId}`, {
        method: "GET",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch documents");
      }

      return result;
    } catch (error) {
      console.error('Document service getDocuments error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Delete a document
  deleteDocument: async (documentId) => {
    if (!documentId) {
      throw new Error("Document ID is required");
    }

    try {
      const response = await fetch(`${BASE_URL}/api/upload/bookingDocuments/${documentId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete document");
      }

      return result;
    } catch (error) {
      console.error('Document service deleteDocument error:', error);
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
      throw error;
    }
  },

  // Format file size for display
  formatFileSize: (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  },

  // Get file extension from filename
  getFileExtension: (filename) => {
    return filename.split('.').pop().toLowerCase();
  },

  // Get file icon based on extension
  getFileIcon: (extension) => {
    const iconMap = {
      pdf: "📄",
      doc: "📝",
      docx: "📝",
      xls: "📊",
      xlsx: "📊",
      ppt: "📊",
      pptx: "📊",
      txt: "📄",
      jpg: "🖼️",
      jpeg: "🖼️",
      png: "🖼️",
      gif: "🖼️",
      zip: "📦",
      rar: "📦",
      default: "📁"
    };
    return iconMap[extension] || iconMap.default;
  },

  // Validate file type and size
  validateFile: (file, maxSizeMB = 10) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/zip',
      'application/x-rar-compressed'
    ];

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { valid: false, error: `File size must be less than ${maxSizeMB}MB` };
    }

    return { valid: true };
  }
}; 
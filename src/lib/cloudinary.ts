// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME = 'dg9yh82rf';
const CLOUDINARY_UPLOAD_PRESET = 'rihaab';

export const CLOUDINARY_CONFIG = {
  CLOUD_NAME: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME,
  UPLOAD_PRESET: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || CLOUDINARY_UPLOAD_PRESET,
  API_KEY: process.env.REACT_APP_CLOUDINARY_API_KEY || '',
  API_SECRET: process.env.REACT_APP_CLOUDINARY_API_SECRET || '',
};

// Helper function to get resource type from file
export const getResourceTypeFromFile = (file: File): 'video' | 'image' | 'raw' => {
  if (file.type.startsWith('video/')) {
    return 'video';
  } else if (file.type.startsWith('image/')) {
    return 'image';
  } else {
    return 'raw';
  }
};

// Cloudinary upload function
export const uploadToCloudinary = async (
  file: File, 
  resourceType: 'video' | 'image' | 'raw' | 'auto' = 'auto'
): Promise<{ url: string; publicId: string; duration?: number }> => {
  if (!file) {
    throw new Error('File is required');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
  
  // Auto-detect resource type if 'auto' is specified
  let actualResourceType: 'video' | 'image' | 'raw' = 'raw';
  if (resourceType === 'auto') {
    actualResourceType = getResourceTypeFromFile(file);
  } else {
    actualResourceType = resourceType;
  }
  
  formData.append('resource_type', actualResourceType);
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/upload`, 
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.secure_url || !data.public_id) {
      throw new Error('Invalid response from Cloudinary');
    }
    
    // For videos, try to get duration from Cloudinary response
    let duration: number | undefined;
    if (actualResourceType === 'video' && data.duration) {
      duration = data.duration;
    }
    
    return {
      url: data.secure_url,
      publicId: data.public_id,
      duration
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId: string, resourceType: 'video' | 'image' | 'raw' = 'raw'): Promise<boolean> => {
  if (!publicId) {
    throw new Error('Public ID is required');
  }

  try {
    const response = await fetch(`/api/cloudinary/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId,
        resourceType
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Delete failed: ${response.status} - ${errorText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return false;
  }
};

// Function to get Cloudinary URL with transformations
export const getCloudinaryUrl = (
  publicId: string, 
  transformations: string = '', 
  resourceType: 'video' | 'image' | 'raw' = 'image'
): string => {
  if (!publicId) {
    throw new Error('Public ID is required');
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.CLOUD_NAME}`;
  const resourcePath = resourceType;
  
  if (transformations) {
    return `${baseUrl}/${resourcePath}/upload/${transformations}/${publicId}`;
  }
  
  return `${baseUrl}/${resourcePath}/upload/${publicId}`;
};

// Utility function to check if a URL is from Cloudinary
export const isCloudinaryUrl = (url: string): boolean => {
  return url.includes('res.cloudinary.com');
};

// Utility function to extract public ID from Cloudinary URL
export const extractPublicIdFromUrl = (url: string): string | null => {
  if (!isCloudinaryUrl(url)) {
    return null;
  }
  
  try {
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex !== -1 && uploadIndex + 1 < urlParts.length) {
      return urlParts[uploadIndex + 1];
    }
  } catch (error) {
    console.error('Error extracting public ID:', error);
  }
  
  return null;
};

// Utility function to get optimized image URL
export const getOptimizedImageUrl = (publicId: string, width?: number, height?: number, quality: number = 80): string => {
  let transformations = `f_auto,q_${quality}`;
  if (width) transformations += `,w_${width}`;
  if (height) transformations += `,h_${height}`;
  
  return getCloudinaryUrl(publicId, transformations, 'image');
};

// Utility function to get video thumbnail URL
export const getVideoThumbnailUrl = (publicId: string, width: number = 300, height: number = 200): string => {
  const transformations = `f_auto,w_${width},h_${height},c_fill`;
  return getCloudinaryUrl(publicId, transformations, 'video');
};

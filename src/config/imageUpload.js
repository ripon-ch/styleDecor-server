const axios = require('axios');
const FormData = require('form-data');

/**
 * Upload image to ImageBB
 * @param {Buffer|String} imageData - Image buffer or base64 string
 * @param {String} imageName - Optional image name
 * @returns {Promise<String>} - Image URL
 */
const uploadToImageBB = async (imageData, imageName = 'upload') => {
  try {
    const apiKey = process.env.IMAGEBB_API_KEY;
    
    if (!apiKey) {
      throw new Error('ImageBB API key not configured');
    }
    
    const formData = new FormData();
    
    // Convert buffer to base64 if needed
    let imageBase64 = imageData;
    if (Buffer.isBuffer(imageData)) {
      imageBase64 = imageData.toString('base64');
    }
    
    formData.append('image', imageBase64);
    formData.append('name', imageName);
    
    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${apiKey}`,
      formData,
      {
        headers: formData.getHeaders()
      }
    );
    
    if (response.data && response.data.data) {
      return response.data.data.url; // Full URL of uploaded image
    }
    
    throw new Error('Failed to upload image to ImageBB');
  } catch (error) {
    console.error('ImageBB upload error:', error.message);
    throw new Error('Image upload failed: ' + error.message);
  }
};

module.exports = { uploadToImageBB };
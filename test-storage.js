// Test script to verify Supabase storage bucket exists and works
const { createClient } = require('@supabase/supabase-js');

async function testStorage() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    // Check if bucket exists
    console.log('🔍 Checking if invoice-ocr bucket exists...');
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('invoice-ocr');
    
    if (bucketError) {
      console.log('❌ Bucket does not exist, creating it...');
      const { data: createData, error: createError } = await supabase.storage.createBucket('invoice-ocr', {
        public: false,
        fileSizeLimit: 20 * 1024 * 1024, // 20 MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg'],
      });
      
      if (createError) {
        console.error('❌ Failed to create bucket:', createError.message);
        return;
      }
      console.log('✅ Bucket created successfully');
    } else {
      console.log('✅ Bucket exists');
    }
    
    // Test upload
    console.log('🧪 Testing file upload...');
    const testContent = 'test content';
    const testKey = 'test/test.txt';
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('invoice-ocr')
      .upload(testKey, testContent, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Upload failed:', uploadError.message);
      return;
    }
    
    console.log('✅ Upload successful:', uploadData.path);
    
    // Test signed URL
    console.log('🔗 Testing signed URL generation...');
    const { data: signedData, error: signError } = await supabase.storage
      .from('invoice-ocr')
      .createSignedUrl(testKey, 60);
    
    if (signError) {
      console.error('❌ Signed URL failed:', signError.message);
      return;
    }
    
    console.log('✅ Signed URL generated:', signedData.signedUrl);
    
    // Clean up test file
    console.log('🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from('invoice-ocr')
      .remove([testKey]);
    
    if (deleteError) {
      console.log('⚠️ Failed to delete test file:', deleteError.message);
    } else {
      console.log('✅ Test file deleted');
    }
    
    console.log('🎉 All storage tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testStorage();

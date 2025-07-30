#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

function cleanupSkinAnalysisUploads() {
  try {
    if (!fs.existsSync(uploadsDir)) {
      console.log('Uploads directory does not exist. Nothing to clean up.');
      return;
    }

    const files = fs.readdirSync(uploadsDir);
    const skinAnalysisFiles = files.filter(file => 
      file.startsWith('skin-analysis-') && 
      (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png') || file.endsWith('.gif') || file.endsWith('.webp'))
    );

    if (skinAnalysisFiles.length === 0) {
      console.log('No skin analysis files found to clean up.');
      return;
    }

    console.log(`Found ${skinAnalysisFiles.length} skin analysis files to remove:`);
    
    let removedCount = 0;
    skinAnalysisFiles.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`✓ Removed: ${file}`);
        removedCount++;
      } catch (error) {
        console.error(`✗ Failed to remove ${file}:`, error.message);
      }
    });

    console.log(`\nCleanup complete! Removed ${removedCount} out of ${skinAnalysisFiles.length} files.`);
    
    // Check if uploads directory is now empty (excluding subdirectories)
    const remainingFiles = fs.readdirSync(uploadsDir).filter(file => 
      !fs.statSync(path.join(uploadsDir, file)).isDirectory()
    );
    
    if (remainingFiles.length === 0) {
      console.log('Uploads directory is now empty.');
    } else {
      console.log(`Uploads directory still contains ${remainingFiles.length} other files.`);
    }

  } catch (error) {
    console.error('Error during cleanup:', error.message);
    process.exit(1);
  }
}

// Run cleanup if this script is executed directly
if (require.main === module) {
  cleanupSkinAnalysisUploads();
}

module.exports = { cleanupSkinAnalysisUploads }; 
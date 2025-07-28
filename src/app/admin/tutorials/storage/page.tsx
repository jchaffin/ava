'use client'

import React from 'react'
import { AdminLayout } from '@/components'
import { Button } from '@/components/ui'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import {
  HardDrive,
  Folder,
  Upload,
  Download,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowLeft,
  FileText,
  Database,
  Globe,
} from 'lucide-react'
import toast from 'react-hot-toast'

const StorageSetupTutorial: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/tutorials/storage')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }
  }, [user, isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-theme-primary">
        {/* Header */}
        <div className="shadow-sm border-b border-theme">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/admin/tutorials')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tutorials
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-theme-primary">Local Storage Setup</h1>
                  <p className="mt-1 text-sm text-theme-muted">
                    Complete guide to setting up local file storage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6 mb-8">
            <div className="flex items-center mb-4">
              <HardDrive className="w-8 h-8 text-theme-primary mr-3" />
              <h2 className="text-2xl font-bold text-theme-primary">Local Storage Overview</h2>
            </div>
            <p className="text-theme-muted mb-4">
              This application uses local file storage for managing images and assets. 
              Files are stored directly on your server&apos;s file system, making it simple 
              to set up and manage without external dependencies.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-3 bg-theme-tertiary rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-theme-primary">No External Dependencies</span>
              </div>
              <div className="flex items-center p-3 bg-theme-tertiary rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-theme-primary">Easy Setup</span>
              </div>
              <div className="flex items-center p-3 bg-theme-tertiary rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm font-medium text-theme-primary">Full Control</span>
              </div>
            </div>
          </div>

          {/* Directory Structure */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6 mb-8">
            <div className="flex items-center mb-4">
              <Folder className="w-8 h-8 text-theme-primary mr-3" />
              <h2 className="text-2xl font-bold text-theme-primary">Directory Structure</h2>
            </div>
            <div className="bg-theme-tertiary rounded-lg p-4 font-mono text-sm">
              <div className="text-theme-primary">public/</div>
              <div className="ml-4 text-theme-primary">├── uploads/</div>
              <div className="ml-8 text-theme-muted">├── general/</div>
              <div className="ml-8 text-theme-muted">├── products/</div>
              <div className="ml-8 text-theme-muted">└── temp/</div>
              <div className="ml-4 text-theme-primary">└── images/</div>
              <div className="ml-8 text-theme-primary">└── products/</div>
              <div className="ml-12 text-theme-muted">├── [product-id-1]/</div>
              <div className="ml-16 text-theme-muted">├── main.jpg</div>
              <div className="ml-16 text-theme-muted">├── 1.jpg</div>
              <div className="ml-16 text-theme-muted">└── 2.jpg</div>
              <div className="ml-12 text-theme-muted">└── [product-id-2]/</div>
              <div className="ml-16 text-theme-muted">└── ...</div>
            </div>
          </div>

          {/* Setup Steps */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6 mb-8">
            <div className="flex items-center mb-4">
              <Settings className="w-8 h-8 text-theme-primary mr-3" />
              <h2 className="text-2xl font-bold text-theme-primary">Setup Steps</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-theme-primary text-theme-secondary rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">Create Upload Directories</h3>
                  <p className="text-theme-muted mt-1">
                    Ensure the following directories exist in your project:
                  </p>
                  <div className="bg-theme-tertiary rounded-lg p-3 mt-2 font-mono text-sm">
                    <div>mkdir -p public/uploads/general</div>
                    <div>mkdir -p public/uploads/products</div>
                    <div>mkdir -p public/uploads/temp</div>
                    <div>mkdir -p public/images/products</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-theme-primary text-theme-secondary rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">Set Permissions</h3>
                  <p className="text-theme-muted mt-1">
                    Make sure the web server has write permissions to these directories:
                  </p>
                  <div className="bg-theme-tertiary rounded-lg p-3 mt-2 font-mono text-sm">
                    <div>chmod 755 public/uploads</div>
                    <div>chmod 755 public/images</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-theme-primary text-theme-secondary rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">Environment Variables</h3>
                  <p className="text-theme-muted mt-1">
                    Add the following to your .env.local file (optional):
                  </p>
                  <div className="bg-theme-tertiary rounded-lg p-3 mt-2 font-mono text-sm">
                    <div>UPLOAD_DIR=public/uploads</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-theme-primary text-theme-secondary rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-theme-primary">Test Upload</h3>
                  <p className="text-theme-muted mt-1">
                    Go to the Local Storage Management page and try uploading a test file to verify everything is working.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => router.push('/admin/s3')}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Test Upload
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6 mb-8">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-theme-primary mr-3" />
              <h2 className="text-2xl font-bold text-theme-primary">Features</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Upload className="w-5 h-5 text-theme-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-theme-primary">File Upload</h4>
                    <p className="text-sm text-theme-muted">
                      Upload files with automatic organization into folders
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Download className="w-5 h-5 text-theme-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-theme-primary">File Download</h4>
                    <p className="text-sm text-theme-muted">
                      Download files directly from the admin interface
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Database className="w-5 h-5 text-theme-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-theme-primary">Storage Statistics</h4>
                    <p className="text-sm text-theme-muted">
                      View total files, storage usage, and directory information
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Folder className="w-5 h-5 text-theme-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-theme-primary">Folder Management</h4>
                    <p className="text-sm text-theme-muted">
                      Organize files into folders and subfolders
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Globe className="w-5 h-5 text-theme-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-theme-primary">Direct Access</h4>
                    <p className="text-sm text-theme-muted">
                      Files are directly accessible via web URLs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-theme-primary mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-theme-primary">Easy Configuration</h4>
                    <p className="text-sm text-theme-muted">
                      Simple setup with no external service dependencies
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6 mb-8">
            <div className="flex items-center mb-4">
              <Info className="w-8 h-8 text-theme-primary mr-3" />
              <h2 className="text-2xl font-bold text-theme-primary">Best Practices</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-theme-primary">Regular Backups</h4>
                  <p className="text-sm text-theme-muted">
                    Regularly backup your upload directories to prevent data loss
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-theme-primary">Disk Space Monitoring</h4>
                  <p className="text-sm text-theme-muted">
                    Monitor disk space usage to prevent storage issues
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-theme-primary">File Organization</h4>
                  <p className="text-sm text-theme-muted">
                    Use consistent naming conventions and folder structures
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-theme-primary">Security</h4>
                  <p className="text-sm text-theme-muted">
                    Ensure proper file permissions and validate uploaded file types
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-8 h-8 text-theme-primary mr-3" />
              <h2 className="text-2xl font-bold text-theme-primary">Troubleshooting</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-theme-primary">Upload Fails</h4>
                <p className="text-sm text-theme-muted mb-2">
                  Check that the upload directories exist and have proper write permissions.
                </p>
                <div className="bg-theme-tertiary rounded-lg p-3 font-mono text-sm">
                  <div>ls -la public/uploads/</div>
                  <div>chmod 755 public/uploads/</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-theme-primary">Files Not Accessible</h4>
                <p className="text-sm text-theme-muted mb-2">
                  Ensure the web server can read the files and the paths are correct.
                </p>
                <div className="bg-theme-tertiary rounded-lg p-3 font-mono text-sm">
                  <div>chmod 644 public/uploads/*</div>
                  <div>chown www-data:www-data public/uploads/</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-theme-primary">Storage Full</h4>
                <p className="text-sm text-theme-muted mb-2">
                  Check disk space and clean up unnecessary files.
                </p>
                <div className="bg-theme-tertiary rounded-lg p-3 font-mono text-sm">
                  <div>df -h</div>
                  <div>du -sh public/uploads/*</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default StorageSetupTutorial 
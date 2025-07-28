'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminLayout } from '@/components'
import { Button, Input } from '@/components/ui'
import { useAuth } from '@/context'
import {
  Cloud,
  Upload,
  Trash2,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Folder,
  File,
  HardDrive,
  Database,
  Globe,
  Shield,
  Settings,
  Plus,
  Search,
  Filter,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  FolderOpen,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Dialog } from '@headlessui/react'

interface LocalStorageStats {
  totalFiles: number
  totalSize: string
  bucketName: string
  region: string
  cdnEnabled: boolean
  cdnDomain?: string
  uploadDir?: string
  productImagesDir?: string
}

interface S3File {
  key: string
  size: number
  lastModified: string
  url: string
  type: string
  folder: string
}

interface LocalStorageConfig {
  bucketName: string
  region: string
  cdnDomain?: string
  bucketConfigured: boolean
  accessKeyConfigured: boolean
  secretKeyConfigured: boolean
  uploadDir?: string
  productImagesDir?: string
}

const AdminS3Management: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<LocalStorageStats | null>(null)
  const [files, setFiles] = useState<S3File[]>([])
  const [config, setConfig] = useState<LocalStorageConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadModal, setUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'products' | 'uploads' | 'other'>('all')
  const [selectedFile, setSelectedFile] = useState<S3File | null>(null)
  const [filePreviewModal, setFilePreviewModal] = useState(false)
  const [currentPath, setCurrentPath] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [configModal, setConfigModal] = useState(false)
  const [s3Config, setS3Config] = useState({
    bucketName: '',
    region: '',
    accessKeyId: '',
    secretAccessKey: '',
    cdnDomain: ''
  })
  const [showAccessKey, setShowAccessKey] = useState(false)
  const [showSecretKey, setShowSecretKey] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated || !user?.id) {
      router.push('/signin?callbackUrl=/admin/s3')
      return
    }

    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.')
      router.push('/')
      return
    }

    fetchS3Data()
  }, [user, isAuthenticated, isLoading, router])

  const fetchS3Data = async () => {
    try {
      setLoading(true)
      
      // Fetch S3 stats and configuration
      const [statsResponse, filesResponse, configResponse] = await Promise.all([
        fetch('/api/admin/s3/stats'),
        fetch('/api/admin/s3/files'),
        fetch('/api/admin/s3/config')
      ])

      const statsData = await statsResponse.json()
      const filesData = await filesResponse.json()
      const configData = await configResponse.json()

      if (statsData.success) setStats(statsData.data)
      if (filesData.success) setFiles(filesData.data)
      if (configData.success) setConfig(configData.data)

    } catch (error) {
      console.error('Error fetching S3 data:', error)
      toast.error('Failed to fetch S3 data')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!uploadFile) return

    try {
      setUploadProgress(0)
      const formData = new FormData()
      formData.append('file', uploadFile)

      const response = await fetch('/api/admin/s3/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        toast.success('File uploaded successfully')
        setUploadModal(false)
        setUploadFile(null)
        setUploadProgress(0)
        fetchS3Data() // Refresh data
      } else {
        toast.error(data.message || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    }
  }

  const handleFileDelete = async (fileKey: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/admin/s3/files/${encodeURIComponent(fileKey)}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast.success('File deleted successfully')
        fetchS3Data() // Refresh data
      } else {
        toast.error(data.message || 'Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast.error('Failed to delete file')
    }
  }

  const handleFileDownload = async (file: S3File) => {
    try {
      const response = await fetch(`/api/admin/s3/files/${encodeURIComponent(file.key)}/download`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.key.split('/').pop() || 'download'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading file:', error)
      toast.error('Failed to download file')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getFileIcon = (type: string, isFolder: boolean = false) => {
    if (isFolder) return '📁'
    if (type.startsWith('image/')) return '🖼️'
    if (type.startsWith('video/')) return '🎥'
    if (type.startsWith('audio/')) return '🎵'
    if (type.includes('pdf')) return '📄'
    if (type.includes('zip') || type.includes('rar')) return '📦'
    return '📄'
  }

  // Extract folders from files data
  const getFolders = () => {
    const folderMap = new Map<string, { name: string; path: string; fileCount: number; totalSize: number }>()
    
    files.forEach(file => {
      const pathParts = file.key.split('/')
      if (pathParts.length > 1) {
        // Create folders for each level of the path
        for (let i = 1; i < pathParts.length; i++) {
          const folderPath = pathParts.slice(0, i).join('/')
          const folderName = pathParts[i - 1]
          
          if (!folderMap.has(folderPath)) {
            folderMap.set(folderPath, {
              name: folderName,
              path: folderPath,
              fileCount: 0,
              totalSize: 0
            })
          }
          
          const folder = folderMap.get(folderPath)!
          // Count files in this specific folder level
          if (i === pathParts.length - 1) {
            folder.fileCount++
            folder.totalSize += file.size
          }
        }
      }
    })
    
    // Count subfolders for each folder
    const folderWithSubfolderCount = Array.from(folderMap.values()).map(folder => {
      const subfolderCount = Array.from(folderMap.values()).filter(subfolder => {
        const subfolderPathParts = subfolder.path.split('/')
        const folderPathParts = folder.path.split('/')
        return subfolderPathParts.length === folderPathParts.length + 1 && 
               subfolder.path.startsWith(folder.path + '/')
      }).length
      
      return {
        ...folder,
        subfolderCount
      }
    })
    
    return folderWithSubfolderCount
  }

  // Get files for a specific folder
  const getFilesInFolder = (folderPath: string) => {
    return files.filter(file => {
      const filePathParts = file.key.split('/')
      const filePath = filePathParts.slice(0, -1).join('/')
      const fileName = filePathParts[filePathParts.length - 1]
      
      return filePath === folderPath && fileName.includes('.')
    })
  }

  // Get subfolders for a specific folder
  const getSubfolders = (parentPath: string) => {
    const allFolders = getFolders()
    return allFolders.filter(folder => {
      const folderPathParts = folder.path.split('/')
      const folderParentPath = folderPathParts.slice(0, -1).join('/')
      return folderParentPath === parentPath
    })
  }

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const isFolderExpanded = (folderPath: string) => {
    return expandedFolders.has(folderPath)
  }

  const handleSaveConfig = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(s3Config),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('S3 configuration saved successfully')
        setConfigModal(false)
        fetchS3Data() // Refresh data
      } else {
        toast.error(data.message || 'Failed to save configuration')
      }
    } catch (error) {
      console.error('Error saving S3 config:', error)
      toast.error('Failed to save configuration')
    }
  }

  const fetchS3Config = async () => {
    try {
      const response = await fetch('/api/admin/s3/config')
      const data = await response.json()

      if (data.success) {
        setS3Config({
          bucketName: data.data.bucketName || '',
          region: data.data.region || '',
          accessKeyId: data.data.accessKeyId || '',
          secretAccessKey: data.data.secretAccessKey || '',
          cdnDomain: data.data.cdnDomain || ''
        })
      }
    } catch (error) {
      console.error('Error fetching S3 config:', error)
    }
  }

  // Get root level folders
  const getRootFolders = () => {
    const allFolders = getFolders()
    return allFolders.filter(folder => {
      const folderPathParts = folder.path.split('/')
      return folderPathParts.length === 1
    })
  }

  // Render tree view recursively
  const renderTreeItem = (folder: any, level: number = 0) => {
    const isExpanded = isFolderExpanded(folder.path)
    const subfolders = getSubfolders(folder.path)
    const files = getFilesInFolder(folder.path)
    
    return (
      <div key={folder.path}>
        <div 
          className="flex items-center py-2 px-4 hover:bg-theme-tertiary cursor-pointer"
          style={{ paddingLeft: `${level * 20 + 16}px` }}
          onClick={() => toggleFolder(folder.path)}
        >
          <div className="flex items-center flex-1">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
            )}
            <span className="text-lg mr-2">📁</span>
            <span className="text-sm font-medium text-theme-primary">{folder.name}</span>
            <span className="text-sm text-theme-muted ml-2">
              ({files.length} files{subfolders.length > 0 ? `, ${subfolders.length} folders` : ''})
            </span>
          </div>
        </div>
        
        {isExpanded && (
          <div>
            {/* Show subfolders */}
            {subfolders.map((subfolder: any) => renderTreeItem(subfolder, level + 1))}
            
            {/* Show files */}
            {files.map((file: any) => (
              <div 
                key={file.key}
                className="flex items-center py-1 px-4 hover:bg-theme-tertiary"
                style={{ paddingLeft: `${(level + 1) * 20 + 16}px` }}
              >
                <span className="text-lg mr-2">{getFileIcon(file.type)}</span>
                <span className="text-sm text-theme-primary">{file.key.split('/').pop()}</span>
                <span className="text-sm text-theme-muted ml-2">({formatFileSize(file.size)})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (isLoading || loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-theme-secondary">Loading S3 Management...</p>
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
              <div>
                <h1 className="text-3xl font-bold text-theme-primary">Local Storage Management</h1>
                <p className="mt-1 text-sm text-theme-muted">
                  Manage your local file storage and assets
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="secondary" onClick={fetchS3Data}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button variant="secondary" onClick={() => setUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* S3 Configuration Status */}
          {config && (
            <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-theme-primary">Local Storage Configuration</h3>
                <Button variant="secondary" size="sm" onClick={async () => {
                  await fetchS3Config()
                  setConfigModal(true)
                }}>
                  <Settings className="w-4 h-4 mr-2" />
                  View Info
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <HardDrive className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-primary">Storage Type</p>
                    <p className="text-sm text-theme-muted">{config.bucketName}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <Globe className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-primary">Location</p>
                    <p className="text-sm text-theme-muted">{config.region}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <Folder className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-primary">Upload Directory</p>
                    <p className="text-sm text-theme-muted">{config.uploadDir || 'public/uploads'}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <Database className="w-5 h-5 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-primary">Product Images</p>
                    <p className="text-sm text-theme-muted">{config.productImagesDir || 'public/images/products'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <File className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-secondary">Total Files</p>
                    <p className="text-2xl font-bold text-theme-primary">{stats.totalFiles}</p>
                  </div>
                </div>
              </div>

              <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <HardDrive className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-secondary">Total Size</p>
                    <p className="text-2xl font-bold text-theme-primary">{stats.totalSize}</p>
                  </div>
                </div>
              </div>

              <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <HardDrive className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-secondary">Storage Type</p>
                    <p className="text-lg font-bold text-theme-primary">{stats.bucketName}</p>
                  </div>
                </div>
              </div>

              <div className="bg-theme-secondary rounded-lg shadow border border-theme p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 p-2 bg-theme-tertiary rounded-lg">
                    <Folder className="w-6 h-6 text-theme-primary" />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-theme-secondary">Storage Location</p>
                    <span className="text-sm font-medium text-theme-primary">
                      Local File System
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* Search and Filter */}
          <div className="bg-theme-secondary rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search files and folders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-theme rounded-lg bg-theme-tertiary shadow-sm focus:outline-none focus:ring-0 text-theme-primary placeholder:text-theme-muted"
              />
              


              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-theme-muted">
                  {getRootFolders().length} root folders
                </span>
              </div>
            </div>
          </div>

          {/* File Browser */}
          <div className="bg-theme-secondary rounded-lg shadow border border-theme overflow-hidden">
            <div className="px-6 py-4 border-b border-theme">
              <h3 className="text-lg font-medium text-theme-primary">Local File Storage</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {/* Tree View of Local Directories */}
              <div className="p-4">
                {/* Public Root */}
                <div className="space-y-1">
                  <div 
                    className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                    onClick={() => toggleFolder('public')}
                  >
                    <div className="flex items-center flex-1">
                      {isFolderExpanded('public') ? (
                        <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                      )}
                      <Folder className="w-5 h-5 mr-2 text-theme-primary" />
                      <span className="text-sm font-medium text-theme-primary">public/</span>
                      <span className="text-sm text-theme-muted ml-2">(Main assets directory)</span>
                    </div>
                  </div>
                  
                  {isFolderExpanded('public') && (
                    <div className="ml-6 space-y-1">
                      {/* Uploads */}
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                        onClick={() => toggleFolder('public/uploads')}
                      >
                        <div className="flex items-center flex-1">
                          {isFolderExpanded('public/uploads') ? (
                            <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                          )}
                          <Upload className="w-5 h-5 mr-2 text-theme-primary" />
                          <span className="text-sm font-medium text-theme-primary">uploads/</span>
                          <span className="text-sm text-theme-muted ml-2">(User uploaded files)</span>
                        </div>
                      </div>

                      {/* Images */}
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                        onClick={() => toggleFolder('public/images')}
                      >
                        <div className="flex items-center flex-1">
                          {isFolderExpanded('public/images') ? (
                            <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                          )}
                          <File className="w-5 h-5 mr-2 text-theme-primary" />
                          <span className="text-sm font-medium text-theme-primary">images/</span>
                          <span className="text-sm text-theme-muted ml-2">(Static images and assets)</span>
                        </div>
                      </div>

                      {isFolderExpanded('public/images') && (
                        <div className="ml-6 space-y-1">
                          {/* Product Images */}
                          <div 
                            className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                            onClick={() => toggleFolder('public/images/products')}
                          >
                            <div className="flex items-center flex-1">
                              {isFolderExpanded('public/images/products') ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                              )}
                              <File className="w-5 h-5 mr-2 text-theme-primary" />
                              <span className="text-sm font-medium text-theme-primary">products/</span>
                              <span className="text-sm text-theme-muted ml-2">(Product images and galleries)</span>
                            </div>
                          </div>

                          {/* Logos */}
                          <div 
                            className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                            onClick={() => toggleFolder('public/images/logos')}
                          >
                            <div className="flex items-center flex-1">
                              {isFolderExpanded('public/images/logos') ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                              )}
                              <File className="w-5 h-5 mr-2 text-theme-primary" />
                              <span className="text-sm font-medium text-theme-primary">logos/</span>
                              <span className="text-sm text-theme-muted ml-2">(Brand logos and icons)</span>
                            </div>
                          </div>

                          {/* Content */}
                          <div 
                            className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                            onClick={() => toggleFolder('public/images/content')}
                          >
                            <div className="flex items-center flex-1">
                              {isFolderExpanded('public/images/content') ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                              )}
                              <File className="w-5 h-5 mr-2 text-theme-primary" />
                              <span className="text-sm font-medium text-theme-primary">content/</span>
                              <span className="text-sm text-theme-muted ml-2">(Website content images)</span>
                            </div>
                          </div>

                          {/* Gallery */}
                          <div 
                            className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                            onClick={() => toggleFolder('public/images/gallery')}
                          >
                            <div className="flex items-center flex-1">
                              {isFolderExpanded('public/images/gallery') ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                              )}
                              <File className="w-5 h-5 mr-2 text-theme-primary" />
                              <span className="text-sm font-medium text-theme-primary">gallery/</span>
                              <span className="text-sm text-theme-muted ml-2">(Image gallery)</span>
                            </div>
                          </div>

                          {/* Home */}
                          <div 
                            className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                            onClick={() => toggleFolder('public/images/home')}
                          >
                            <div className="flex items-center flex-1">
                              {isFolderExpanded('public/images/home') ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                              )}
                              <File className="w-5 h-5 mr-2 text-theme-primary" />
                              <span className="text-sm font-medium text-theme-primary">home/</span>
                              <span className="text-sm text-theme-muted ml-2">(Homepage images)</span>
                            </div>
                          </div>

                          {/* Info */}
                          <div 
                            className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                            onClick={() => toggleFolder('public/images/info')}
                          >
                            <div className="flex items-center flex-1">
                              {isFolderExpanded('public/images/info') ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                              )}
                              <File className="w-5 h-5 mr-2 text-theme-primary" />
                              <span className="text-sm font-medium text-theme-primary">info/</span>
                              <span className="text-sm text-theme-muted ml-2">(Information images)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Assets */}
                      <div 
                        className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                        onClick={() => toggleFolder('public/assets')}
                      >
                        <div className="flex items-center flex-1">
                          {isFolderExpanded('public/assets') ? (
                            <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                          )}
                          <File className="w-5 h-5 mr-2 text-theme-primary" />
                          <span className="text-sm font-medium text-theme-primary">assets/</span>
                          <span className="text-sm text-theme-muted ml-2">(CSS, JS, and other assets)</span>
                        </div>
                      </div>

                      {isFolderExpanded('public/assets') && (
                        <div className="ml-6 space-y-1">
                          {/* Icons */}
                          <div 
                            className="flex items-center py-2 px-3 hover:bg-theme-tertiary cursor-pointer rounded-lg"
                            onClick={() => toggleFolder('public/assets/icons')}
                          >
                            <div className="flex items-center flex-1">
                              {isFolderExpanded('public/assets/icons') ? (
                                <ChevronDown className="w-4 h-4 mr-2 text-theme-primary" />
                              ) : (
                                <ChevronRight className="w-4 h-4 mr-2 text-theme-primary" />
                              )}
                              <File className="w-5 h-5 mr-2 text-theme-primary" />
                              <span className="text-sm font-medium text-theme-primary">icons/</span>
                              <span className="text-sm text-theme-muted ml-2">(SVG icons)</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <Dialog open={uploadModal} onClose={() => setUploadModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-theme-secondary rounded-lg shadow-lg p-6 z-10 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold text-theme-primary mb-4">Upload File</Dialog.Title>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Upload to: {currentPath || 'Root'}
              </label>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-theme-primary mb-2">
                Select File
              </label>
              <input
                type="file"
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="block w-full text-sm border border-theme rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-theme-primary"
              />
            </div>

            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="w-full bg-theme-tertiary rounded-full h-2">
                  <div 
                    className="bg-theme-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-theme-muted mt-1">{uploadProgress}% uploaded</p>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setUploadModal(false)}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleFileUpload}
                disabled={!uploadFile}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* S3 Configuration Modal */}
      <Dialog open={configModal} onClose={() => setConfigModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-theme-secondary rounded-lg shadow-lg p-6 z-10 max-w-2xl w-full">
            <Dialog.Title className="text-lg font-bold text-theme-primary mb-4">Local Storage Configuration</Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Storage Type
                </label>
                <input
                  type="text"
                  value="Local File System"
                  disabled
                  className="w-full px-3 py-2 border border-theme rounded-lg bg-theme-tertiary text-theme-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Upload Directory
                </label>
                <input
                  type="text"
                  value={config?.uploadDir || 'public/uploads'}
                  disabled
                  className="w-full px-3 py-2 border border-theme rounded-lg bg-theme-tertiary text-theme-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Product Images Directory
                </label>
                <input
                  type="text"
                  value={config?.productImagesDir || 'public/images/products'}
                  disabled
                  className="w-full px-3 py-2 border border-theme rounded-lg bg-theme-tertiary text-theme-muted cursor-not-allowed"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Local Storage Active
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Files are stored locally in your project&apos;s public directory.</p>
                      <p className="mt-1">No external configuration required.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="secondary" onClick={() => setConfigModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => setConfigModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* File Preview Modal */}
      <Dialog open={filePreviewModal} onClose={() => setFilePreviewModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" />
          <div className="bg-theme-secondary rounded-lg shadow-lg p-6 z-10 max-w-2xl w-full">
            <Dialog.Title className="text-lg font-bold text-theme-primary mb-4">File Preview</Dialog.Title>
            
            {selectedFile && (
              <div>
                <div className="mb-4">
                  <h4 className="font-medium text-theme-primary">{selectedFile.key}</h4>
                  <p className="text-sm text-theme-muted">
                    Size: {formatFileSize(selectedFile.size)} | 
                    Modified: {formatDate(selectedFile.lastModified)}
                  </p>
                </div>

                {selectedFile.type.startsWith('image/') ? (
                  <div className="mb-4">
                    <img 
                      src={selectedFile.url} 
                      alt={selectedFile.key}
                      className="max-w-full h-auto rounded-lg border border-theme"
                    />
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-theme-tertiary rounded-lg">
                    <p className="text-theme-muted text-center">
                      Preview not available for this file type
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setFilePreviewModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" onClick={() => handleFileDownload(selectedFile)}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </AdminLayout>
  )
}

export default AdminS3Management 
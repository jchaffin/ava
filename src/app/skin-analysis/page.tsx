'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui';
import SkinAnalysisResults from '@/components/SkinAnalysisResults';
// Remove the top-level import to avoid Node.js module resolution issues
// import * as faceapi from 'face-api.js';
import { useRouter } from 'next/navigation';
import { getProductImageUrl } from '@/utils/helpers';

interface AnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: string[];
  confidence: number;
  imageUrl?: string;
}

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  description: string;
  tags?: string[];
}

export default function SkinAnalysisPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceModelLoaded, setFaceModelLoaded] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceDetectionInterval, setFaceDetectionInterval] = useState<NodeJS.Timeout | null>(null);
  const [faceBox, setFaceBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [faceLandmarks, setFaceLandmarks] = useState<any>(null);
  const [landmarksModelLoaded, setLandmarksModelLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      console.log('Products response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Products data:', data);
        setProducts(data.data?.products || []);
        console.log('Products set:', data.data?.products?.length || 0);
      } else {
        console.error('Products API error:', response.status, response.statusText);
        // Set fallback products if API fails
        setProducts([
          {
            _id: 'fallback-1',
            name: 'Vitamin C Brightening Serum',
            price: 45.00,
            images: ['/images/products/7007/vitcserum_main.jpg'],
            category: 'serum',
            description: 'Brightening serum with 20% Vitamin C for even skin tone'
          },
          {
            _id: 'fallback-2',
            name: 'Hyaluronic Acid Hydration Serum',
            price: 38.00,
            images: ['/images/products/7006/hydserum_main.jpg'],
            category: 'serum',
            description: 'Deeply hydrating serum with hyaluronic acid'
          },
          {
            _id: 'fallback-3',
            name: 'Advanced Retinol Night Serum',
            price: 52.00,
            images: ['/images/products/700a/brserum_main.jpg'],
            category: 'serum',
            description: 'Anti-aging retinol serum for fine lines and wrinkles'
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Set fallback products if fetch fails
      setProducts([
        {
          _id: 'fallback-1',
          name: 'Vitamin C Brightening Serum',
          price: 45.00,
          images: ['/images/products/7007/vitcserum_main.jpg'],
          category: 'serum',
          description: 'Brightening serum with 20% Vitamin C for even skin tone'
        },
        {
          _id: 'fallback-2',
          name: 'Hyaluronic Acid Hydration Serum',
          price: 38.00,
          images: ['/images/products/7006/hydserum_main.jpg'],
          category: 'serum',
          description: 'Deeply hydrating serum with hyaluronic acid'
        },
        {
          _id: 'fallback-3',
          name: 'Advanced Retinol Night Serum',
          price: 52.00,
          images: ['/images/products/700a/brserum_main.jpg'],
          category: 'serum',
          description: 'Anti-aging retinol serum for fine lines and wrinkles'
        }
      ]);
    }
  };

  // Load products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Load face-api.js model when camera is started
  const loadFaceModel = async () => {
    if (!faceModelLoaded) {
      try {
        console.log('Loading face detection model...');
        const faceapi = await import('face-api.js');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        console.log('Tiny face detector loaded');
        setFaceModelLoaded(true);
      } catch (err) {
        console.error('Failed to load face detection model:', err);
        toast.error('Failed to load face detection model');
      }
    }
    
    if (!landmarksModelLoaded) {
      try {
        console.log('Loading face landmarks model...');
        const faceapi = await import('face-api.js');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        console.log('Face landmarks model loaded');
        setLandmarksModelLoaded(true);
      } catch (err) {
        console.error('Failed to load face landmarks model:', err);
        // Don't show error toast for landmarks, just log it
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setResult(null);
      } else {
        toast.error('Please select a valid image file');
      }
    }
  };

  const startCamera = async () => {
    await loadFaceModel();
    console.log('Starting camera...');
    
    // Set camera active first so the modal renders
    setIsCameraActive(true);
    
    // Wait a bit for the modal to render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      console.log('Camera stream obtained:', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Video metadata loaded, starting playback...');
          videoRef.current?.play();
          // Start real-time face detection
          startFaceDetection();
        };
        console.log('Camera modal should be visible now');
      } else {
        console.error('Video ref is null - modal may not have rendered yet');
        setIsCameraActive(false);
        toast.error('Camera failed to initialize. Please try again.');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setIsCameraActive(false);
      toast.error('Unable to access camera');
    }
  };

  const startFaceDetection = () => {
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
    }
    
    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current && faceModelLoaded) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (context && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0);
          
          try {
            // Use more lenient detection options with landmarks
            const faceapi = await import('face-api.js');
            const detection = await faceapi.detectSingleFace(
              canvas, 
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 224,
                scoreThreshold: 0.3 // Lower threshold for easier detection
              })
            );
            
            console.log('Face detection result:', detection);
            setFaceDetected(!!detection);
            
            if (detection) {
              // Calculate face box coordinates relative to video display size
              const videoElement = videoRef.current;
              const displayWidth = videoElement?.clientWidth || 640;
              const displayHeight = videoElement?.clientHeight || 480;
              const scaleX = displayWidth / video.videoWidth;
              const scaleY = displayHeight / video.videoHeight;
              
              setFaceBox({
                x: detection.box.x * scaleX,
                y: detection.box.y * scaleY,
                width: detection.box.width * scaleX,
                height: detection.box.height * scaleY
              });
              
              // Get facial landmarks only if model is loaded
              if (landmarksModelLoaded) {
                try {
                  const landmarks = await faceapi.detectFaceLandmarks(canvas);
                  setFaceLandmarks(landmarks);
                } catch (err) {
                  console.error('Face landmarks detection failed:', err);
                  setFaceLandmarks(null);
                }
              } else {
                setFaceLandmarks(null);
              }
            } else {
              setFaceBox(null);
              setFaceLandmarks(null);
            }
          } catch (error) {
            console.error('Face detection error:', error);
            setFaceDetected(false);
            setFaceBox(null);
            setFaceLandmarks(null);
          }
        }
      }
    }, 1000); // Check every 1 second to reduce load
    
    setFaceDetectionInterval(interval);
  };

  const stopCamera = () => {
    if (faceDetectionInterval) {
      clearInterval(faceDetectionInterval);
      setFaceDetectionInterval(null);
    }
    setFaceDetected(false);
    
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        // Run face detection
        const faceapi = await import('face-api.js');
        const detection = await faceapi.detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions());
        if (!detection) {
          toast.error('No face detected. Please try again with your face clearly visible.');
          return;
        }
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(blob));
            setResult(null);
            stopCamera();
          }
        }, 'image/jpeg', 0.8);
      }
    }
  };

  const analyzeSkin = async () => {
    if (!selectedImage) {
      toast.error('Please select or capture an image first');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/skin-analysis', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisResult = await response.json();
      setResult(analysisResult);
      toast.success('Analysis completed!');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get product recommendations based on analysis
  const getRecommendedProducts = () => {
    if (products.length === 0) return [];
    
    // If no analysis result, return first 6 products
    if (!result) {
      return products.slice(0, 6);
    }
    
    const recommendedProducts: Product[] = [];
    
    // Add skin type specific products
    switch (result.skinType) {
      case 'dry':
        // Look for hydrating products
        recommendedProducts.push(...products.filter(product => 
          product.name.toLowerCase().includes('hydrating') ||
          product.name.toLowerCase().includes('moisturizing') ||
          product.name.toLowerCase().includes('hyaluronic') ||
          product.description.toLowerCase().includes('hydrating')
        ));
        break;
      case 'oily':
        // Look for oil control products
        recommendedProducts.push(...products.filter(product => 
          product.name.toLowerCase().includes('oil control') ||
          product.name.toLowerCase().includes('niacinamide') ||
          product.description.toLowerCase().includes('oil control')
        ));
        break;
      case 'normal':
        // Look for general skincare products
        recommendedProducts.push(...products.filter(product => 
          product.name.toLowerCase().includes('vitamin c') ||
          product.name.toLowerCase().includes('retinol') ||
          product.description.toLowerCase().includes('brightening')
        ));
        break;
    }
    
    // Add concern specific products
    result.concerns.forEach(concern => {
      if (concern.includes('fine lines') || concern.includes('wrinkles')) {
        recommendedProducts.push(...products.filter(product => 
          product.name.toLowerCase().includes('retinol') ||
          product.name.toLowerCase().includes('anti-aging') ||
          product.description.toLowerCase().includes('wrinkle')
        ));
      }
      if (concern.includes('uneven') || concern.includes('dark spots')) {
        recommendedProducts.push(...products.filter(product => 
          product.name.toLowerCase().includes('vitamin c') ||
          product.name.toLowerCase().includes('brightening') ||
          product.description.toLowerCase().includes('even')
        ));
      }
      if (concern.includes('acne') || concern.includes('blemishes')) {
        recommendedProducts.push(...products.filter(product => 
          product.name.toLowerCase().includes('acne') ||
          product.name.toLowerCase().includes('niacinamide') ||
          product.description.toLowerCase().includes('blemish')
        ));
      }
      if (concern.includes('dehydration')) {
        recommendedProducts.push(...products.filter(product => 
          product.name.toLowerCase().includes('hydrating') ||
          product.name.toLowerCase().includes('moisturizing') ||
          product.description.toLowerCase().includes('dehydration')
        ));
      }
    });
    
    // Remove duplicates and limit to 6 products
    const uniqueProducts = recommendedProducts.filter((product, index, self) => 
      index === self.findIndex(p => p._id === product._id)
    );
    
    // If no specific recommendations found, return first 6 products
    if (uniqueProducts.length === 0) {
      return products.slice(0, 6);
    }
    
    return uniqueProducts.slice(0, 6);
  };

  const handleAddToCart = (productId: string) => {
    // In a real app, this would add to cart context
    toast.success('Product added to cart!');
  };

  return (
    <div className="min-h-screen bg-theme-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-secondary rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-4xl font-bold text-theme-primary mb-4">
              AI Skin Analysis
            </h1>
            <p className="text-lg text-theme-secondary max-w-2xl mx-auto">
              Get personalized skincare recommendations powered by artificial intelligence. 
              Upload a clear photo of your face for instant analysis.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Upload & Recommended Products */}
            <div className="space-y-6">
              {/* Image Upload Section */}
              <div className="bg-theme-secondary rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-theme-primary mb-6">
                  Upload Your Photo
                </h2>

                {!previewUrl ? (
                  <div className="space-y-4">
                    {/* File Upload */}
                    <div className="border-2 border-dashed border-theme rounded-xl p-8 text-center transition-colors">
                      <Upload className="w-12 h-12 text-theme-muted mx-auto mb-4" />
                      <p className="text-theme-secondary mb-4">
                        Drag and drop your image here, or click to browse
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-secondary px-6 py-2 rounded-lg"
                      >
                        Choose File
                      </Button>
                    </div>

                    <div className="text-center">
                      <span className="text-theme-muted">or</span>
                    </div>

                    {/* Camera Capture */}
                    <Button
                      onClick={() => {
                        console.log('Camera button clicked!');
                        console.log('isCameraActive before:', isCameraActive);
                        startCamera();
                        console.log('isCameraActive after:', isCameraActive);
                      }}
                      variant="secondary"
                      className="w-full py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Take Photo with Camera</span>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <button
                        onClick={resetAnalysis}
                        className="absolute top-2 right-2 bg-theme-secondary hover:bg-theme-tertiary text-theme-primary p-2 rounded-full transition-colors cursor-pointer border border-theme"
                      >
                        ×
                      </button>
                    </div>
                    
                    <Button
                      onClick={analyzeSkin}
                      disabled={isAnalyzing}
                      variant="primary"
                      className="w-full py-3 px-6 rounded-xl flex items-center justify-center space-x-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Analyze My Skin</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              {/* Recommended Products - Always show */}
              <div className="bg-theme-secondary rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-semibold text-theme-primary mb-6">
                  {result ? 'Personalized Recommendations' : 'Featured Products'}
                </h2>
                <div className="space-y-3">
                  {getRecommendedProducts().map((product) => {
                    console.log('Product:', product);
                    console.log('Product image:', product.images[0]);
                    console.log('Product image URL:', getProductImageUrl(product.images[0], product._id));
                    return (
                      <div key={product._id} className="flex items-center justify-between p-3 bg-theme-tertiary rounded-lg">
                        <div className="flex items-center space-x-3">
                          {product.images[0] && (
                            <img
                              src={getProductImageUrl(product.images[0], product._id)}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          )}
                          <div>
                            <h4 className="font-medium text-theme-primary text-sm">
                              {product.name}
                            </h4>
                            <p className="text-theme-secondary text-xs">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleAddToCart(product._id)}
                          variant="primary"
                          size="sm"
                          className="px-3 py-1"
                        >
                          Add
                        </Button>
                      </div>
                    );
                  })}
                </div>
                {!result && (
                  <div className="text-center mt-4">
                    <p className="text-theme-muted text-sm">
                      Get personalized recommendations after your skin analysis
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Results Section */}
            <div className="bg-theme-tertiary rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-semibold text-theme-primary mb-6">
                Analysis Results
              </h2>

              {!result ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-theme-tertiary rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-theme-muted" />
                  </div>
                  <p className="text-theme-muted">
                    Upload a photo to get your personalized skin analysis
                  </p>
                </div>
              ) : (
                <SkinAnalysisResults 
                  result={result} 
                  onReset={resetAnalysis}
                  onSave={async (result) => {
                    // In a real app, this would save to database
                    console.log('Saving analysis:', result);
                  }}
                />
              )}
            </div>
          </div>

          {/* Camera Modal */}
          {isCameraActive && (
            <>
              {/* Debug indicator */}
              <div className="fixed top-4 right-4 bg-red-500 text-white p-2 rounded z-[10000]">
                Camera Active: {isCameraActive.toString()}
              </div>
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
                <div className="bg-theme-secondary rounded-2xl p-6 max-w-md w-full mx-4 border border-theme shadow-2xl">
                  <h3 className="text-xl font-semibold text-theme-primary mb-4">
                    Take a Photo
                  </h3>
                                  <div className="relative mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover rounded-xl bg-black"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Face Detection Indicator */}
                  <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300 ${
                    faceDetected 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {faceDetected ? '✓ Face Detected' : 'No Face Detected'}
                  </div>
                  
                  {/* Model Status Indicator */}
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
                    faceModelLoaded && landmarksModelLoaded ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-white'
                  }`}>
                    {faceModelLoaded && landmarksModelLoaded ? 'Models Ready' : 'Loading Models...'}
                  </div>
                  
                  {/* Face Detection Overlay */}
                  {faceDetected && (
                    <div className="absolute inset-0 border-2 border-green-500 rounded-xl pointer-events-none animate-pulse"></div>
                  )}
                  
                  {/* Face Graph Overlay */}
                  {faceLandmarks && (
                    <svg 
                      className="absolute inset-0 pointer-events-none"
                      style={{ width: '100%', height: '100%' }}
                    >
                      {/* Face outline using jawline points */}
                      <path
                        d={faceLandmarks.positions.slice(0, 17).map((point: any, index: number) => {
                          const videoElement = videoRef.current;
                          const displayWidth = videoElement?.clientWidth || 640;
                          const displayHeight = videoElement?.clientHeight || 480;
                          const scaleX = displayWidth / (videoElement?.videoWidth || 640);
                          const scaleY = displayHeight / (videoElement?.videoHeight || 480);
                          
                          const x = point.x * scaleX;
                          const y = point.y * scaleY;
                          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                        }).join(' ')}
                        stroke="rgb(34, 197, 94)"
                        strokeWidth="2"
                        fill="none"
                        className="animate-pulse"
                      />
                      
                      {/* Graph Pattern over face area */}
                      {(() => {
                        const videoElement = videoRef.current;
                        const displayWidth = videoElement?.clientWidth || 640;
                        const displayHeight = videoElement?.clientHeight || 480;
                        const scaleX = displayWidth / (videoElement?.videoWidth || 640);
                        const scaleY = displayHeight / (videoElement?.videoHeight || 480);
                        
                        // Calculate face bounds
                        const facePoints = faceLandmarks.positions.slice(0, 17);
                        const minX = Math.min(...facePoints.map((p: any) => p.x * scaleX));
                        const maxX = Math.max(...facePoints.map((p: any) => p.x * scaleX));
                        const minY = Math.min(...facePoints.map((p: any) => p.y * scaleY));
                        const maxY = Math.max(...facePoints.map((p: any) => p.y * scaleY));
                        
                        const graphElements = [];
                        
                        // Create graph nodes (dots)
                        const nodeSpacing = 15;
                        for (let x = minX; x <= maxX; x += nodeSpacing) {
                          for (let y = minY; y <= maxY; y += nodeSpacing) {
                            graphElements.push(
                              <circle
                                key={`node-${x}-${y}`}
                                cx={x}
                                cy={y}
                                r="1.5"
                                fill="rgba(34, 197, 94, 0.6)"
                                className="animate-pulse"
                              />
                            );
                          }
                        }
                        
                        // Create connecting lines between nodes
                        for (let x = minX; x <= maxX; x += nodeSpacing) {
                          for (let y = minY; y <= maxY; y += nodeSpacing) {
                            // Connect to right neighbor
                            if (x + nodeSpacing <= maxX) {
                              graphElements.push(
                                <line
                                  key={`line-h-${x}-${y}`}
                                  x1={x}
                                  y1={y}
                                  x2={x + nodeSpacing}
                                  y2={y}
                                  stroke="rgba(34, 197, 94, 0.3)"
                                  strokeWidth="0.5"
                                />
                              );
                            }
                            // Connect to bottom neighbor
                            if (y + nodeSpacing <= maxY) {
                              graphElements.push(
                                <line
                                  key={`line-v-${x}-${y}`}
                                  x1={x}
                                  y1={y}
                                  x2={x}
                                  y2={y + nodeSpacing}
                                  stroke="rgba(34, 197, 94, 0.3)"
                                  strokeWidth="0.5"
                                />
                              );
                            }
                          }
                        }
                        
                        // Add animated scanning wave
                        const waveY = minY + ((Date.now() / 50) % (maxY - minY));
                        graphElements.push(
                          <line
                            key="scanning-wave"
                            x1={minX}
                            y1={waveY}
                            x2={maxX}
                            y2={waveY}
                            stroke="rgb(34, 197, 94)"
                            strokeWidth="2"
                            opacity="0.8"
                          />
                        );
                        
                        return graphElements;
                      })()}
                      
                      {/* Scanning dots at key facial points */}
                      {[0, 8, 16].map((index) => {
                        const point = faceLandmarks.positions[index];
                        const videoElement = videoRef.current;
                        const displayWidth = videoElement?.clientWidth || 640;
                        const displayHeight = videoElement?.clientHeight || 480;
                        const scaleX = displayWidth / (videoElement?.videoWidth || 640);
                        const scaleY = displayHeight / (videoElement?.videoHeight || 480);
                        
                        const x = point.x * scaleX;
                        const y = point.y * scaleY;
                        
                        return (
                          <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="rgb(34, 197, 94)"
                            className="animate-pulse"
                          />
                        );
                      })}
                    </svg>
                  )}
                  
                  {/* Fallback circle if no landmarks */}
                  {faceBox && !faceLandmarks && (
                    <div 
                      className="absolute border-2 border-green-400 pointer-events-none animate-pulse rounded-full"
                      style={{
                        left: `${faceBox.x}px`,
                        top: `${faceBox.y}px`,
                        width: `${faceBox.width}px`,
                        height: `${faceBox.height}px`
                      }}
                    >
                      {/* Scanning dots around the circle */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  
                  {/* 3D Target Overlay for Face Positioning */}
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    {/* 3D Target with Perspective */}
                    <div className="relative transform-gpu perspective-1000">
                      {/* 3D Outer Ring with depth and shadow */}
                      <div className="w-48 h-48 border-2 border-green-400 rounded-full animate-pulse transform rotate-x-12 rotate-y-12 shadow-2xl shadow-green-400/20"></div>
                      
                      {/* 3D Middle Ring with different depth */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-36 h-36 border-2 border-green-400/70 rounded-full rotate-x-8 rotate-y-8 shadow-lg shadow-green-400/15"></div>
                      
                      {/* 3D Inner Ring */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-green-400/50 rounded-full rotate-x-4 rotate-y-4 shadow-md shadow-green-400/10"></div>
                      
                      {/* 3D Center Dot with glow effect */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                      
                      {/* 3D Crosshair Lines with depth */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-0.5 bg-gradient-to-r from-transparent via-green-400/60 to-transparent rotate-x-12"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-0.5 h-48 bg-gradient-to-b from-transparent via-green-400/60 to-transparent rotate-y-12"></div>
                      
                      {/* 3D Position Text with backdrop */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-blue-300 text-sm font-medium">
                        <div className="bg-black/60 px-4 py-2 rounded-lg backdrop-blur-sm border border-green-400/30 rotate-x-8">
                          Position your face here
                        </div>
                      </div>
                      
                      {/* 3D Corner Guides with depth */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 border-l-2 border-t-2 border-green-400 rotate-x-12 rotate-y-12 shadow-sm"></div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 border-r-2 border-t-2 border-green-400 rotate-x-12 -rotate-y-12 shadow-sm"></div>
                      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-2 border-b-2 border-green-400 -rotate-x-12 rotate-y-12 shadow-sm"></div>
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-2 border-b-2 border-green-400 -rotate-x-12 -rotate-y-12 shadow-sm"></div>
                      
                      {/* 3D Depth Indicators */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-52 h-52 border border-green-400/20 rounded-full rotate-x-16 rotate-y-16"></div>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-56 h-56 border border-green-400/10 rounded-full rotate-x-20 rotate-y-20"></div>
                    </div>
                  </div>
                  
                  {/* Scanning Overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Scanning Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-scan"></div>
                    
                    {/* Corner Indicators */}
                    <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-green-400"></div>
                    <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-green-400"></div>
                    <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-green-400"></div>
                    <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-green-400"></div>
                    
                    {/* Scanning Grid */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="grid grid-cols-3 grid-rows-3 h-full">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border border-green-400/30"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                                  <div className="flex space-x-3">
                  <Button
                    onClick={capturePhoto}
                    variant="primary"
                    disabled={!faceDetected}
                    className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 ${
                      !faceDetected ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {faceDetected ? 'Capture Photo' : 'Position Your Face'}
                  </Button>
                  <Button
                    onClick={stopCamera}
                    variant="secondary"
                    className="flex-1 py-2 px-4 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 
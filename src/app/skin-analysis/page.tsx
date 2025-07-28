'use client';

import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui';
import SkinAnalysisResults from '@/components/SkinAnalysisResults';
import * as faceapi from 'face-api.js';

interface AnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: string[];
  confidence: number;
  imageUrl?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

// Mock product data - in a real app, this would come from your database
const mockProducts: Product[] = [
  {
    id: 'vitamin-c-serum',
    name: 'Vitamin C Brightening Serum',
    price: 45.00,
    image: '/images/products/vitcserum/vitcserum_main.jpg',
    category: 'serum',
    description: 'Brightening serum with 20% Vitamin C for even skin tone'
  },
  {
    id: 'hyaluronic-acid-serum',
    name: 'Hyaluronic Acid Hydration Serum',
    price: 38.00,
    image: '/images/products/hydserum/hydserum_main.jpg',
    category: 'serum',
    description: 'Deeply hydrating serum with hyaluronic acid'
  },
  {
    id: 'retinol-serum',
    name: 'Advanced Retinol Night Serum',
    price: 52.00,
    image: '/images/products/brserum/brserum_main.jpg',
    category: 'serum',
    description: 'Anti-aging retinol serum for fine lines and wrinkles'
  },
  {
    id: 'niacinamide-serum',
    name: 'Niacinamide Oil Control Serum',
    price: 35.00,
    image: '/images/products/iserum/iserum_main.jpg',
    category: 'serum',
    description: 'Oil control and pore-minimizing serum'
  },
  {
    id: 'gentle-cleanser',
    name: 'Gentle Daily Cleanser',
    price: 28.00,
    image: '/images/products/soothserum/soothserum_main.jpg',
    category: 'cleanser',
    description: 'Gentle foaming cleanser for all skin types'
  },
  {
    id: 'sunscreen-spf30',
    name: 'Daily Defense SPF 30',
    price: 32.00,
    image: '/images/products/collagenserum/collagenserum_main.jpg',
    category: 'sunscreen',
    description: 'Broad spectrum sunscreen with antioxidants'
  }
];

export default function SkinAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [faceModelLoaded, setFaceModelLoaded] = useState(false);

  // Load face-api.js model when camera is started
  const loadFaceModel = async () => {
    if (!faceModelLoaded) {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        setFaceModelLoaded(true);
      } catch (err) {
        toast.error('Failed to load face detection model');
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
        };
        setIsCameraActive(true);
        console.log('Camera modal should be visible now');
      } else {
        console.error('Video ref is null');
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Unable to access camera');
    }
  };

  const stopCamera = () => {
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
    if (!result) return [];
    
    const recommendations = new Set<string>();
    
    // Add base recommendations
    recommendations.add('gentle-cleanser');
    recommendations.add('sunscreen-spf30');
    
    // Add skin type specific products
    switch (result.skinType) {
      case 'dry':
        recommendations.add('hyaluronic-acid-serum');
        break;
      case 'oily':
        recommendations.add('niacinamide-serum');
        break;
      case 'normal':
        recommendations.add('vitamin-c-serum');
        recommendations.add('retinol-serum');
        break;
    }
    
    // Add concern specific products
    result.concerns.forEach(concern => {
      if (concern.includes('fine lines') || concern.includes('wrinkles')) {
        recommendations.add('retinol-serum');
      }
      if (concern.includes('uneven') || concern.includes('dark spots')) {
        recommendations.add('vitamin-c-serum');
      }
      if (concern.includes('acne') || concern.includes('blemishes')) {
        recommendations.add('niacinamide-serum');
      }
      if (concern.includes('dehydration')) {
        recommendations.add('hyaluronic-acid-serum');
      }
    });
    
    return mockProducts.filter(product => recommendations.has(product.id));
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
                        startCamera();
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

              {/* Recommended Products - Show after analysis */}
              {result && (
                <div className="bg-theme-secondary rounded-2xl shadow-xl p-6">
                  <h2 className="text-2xl font-semibold text-theme-primary mb-6">
                    Recommended Products
                  </h2>
                  <div className="space-y-3">
                    {getRecommendedProducts().map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-theme-tertiary rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
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
                          onClick={() => handleAddToCart(product.id)}
                          variant="primary"
                          size="sm"
                          className="px-3 py-1"
                        >
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Results Section */}
            <div className="bg-theme-secondary rounded-2xl shadow-xl p-6">
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
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-theme-secondary rounded-2xl p-6 max-w-md w-full mx-4 border border-theme">
                <h3 className="text-xl font-semibold text-theme-primary mb-4">
                  Take a Photo
                </h3>
                <div className="relative mb-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover rounded-xl"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={capturePhoto}
                    variant="primary"
                    className="flex-1 py-2 px-4 rounded-lg"
                  >
                    Capture
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
          )}
        </div>
      </div>
    </div>
  );
} 
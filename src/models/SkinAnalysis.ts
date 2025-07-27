import mongoose, { Schema, Document } from 'mongoose';

export interface ISkinAnalysis extends Document {
  userId: mongoose.Types.ObjectId;
  skinType: string;
  concerns: string[];
  recommendations: string[];
  confidence: number;
  imageUrl?: string;
  analysisId: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkinAnalysisSchema = new Schema<ISkinAnalysis>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skinType: {
    type: String,
    required: true,
    enum: ['normal', 'dry', 'oily', 'combination', 'sensitive']
  },
  concerns: [{
    type: String,
    required: true
  }],
  recommendations: [{
    type: String,
    required: true
  }],
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  imageUrl: {
    type: String,
    required: false
  },
  analysisId: {
    type: String,
    required: true,
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
SkinAnalysisSchema.index({ userId: 1, createdAt: -1 });

// Add methods for common queries
SkinAnalysisSchema.statics.findByUserId = function(userId: string) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

SkinAnalysisSchema.statics.findLatestByUserId = function(userId: string) {
  return this.findOne({ userId }).sort({ createdAt: -1 });
};

SkinAnalysisSchema.statics.findByAnalysisId = function(analysisId: string) {
  return this.findOne({ analysisId });
};

// Virtual for formatted date
SkinAnalysisSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Ensure virtuals are serialized
SkinAnalysisSchema.set('toJSON', { virtuals: true });
SkinAnalysisSchema.set('toObject', { virtuals: true });

// Pre-save middleware to ensure analysisId is unique
SkinAnalysisSchema.pre('save', async function(next) {
  if (this.isNew && !this.analysisId) {
    this.analysisId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export default mongoose.models.SkinAnalysis || mongoose.model<ISkinAnalysis>('SkinAnalysis', SkinAnalysisSchema); 
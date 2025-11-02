import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  restaurantId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PREPARED', 'PICKED_UP', 'DELIVERED'],
    default: 'PREPARED'
  },
  driverId: String,
  preparedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

orderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const DeliveryOrder = mongoose.model('DeliveryOrder', orderSchema);

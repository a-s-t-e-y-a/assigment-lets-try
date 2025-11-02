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
  items: [{
    itemId: String,
    name: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'PREPARED', 'CANCELLED'],
    default: 'PENDING'
  },
  acceptedAt: Date,
  preparedAt: Date,
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

export const RestaurantOrder = mongoose.model('RestaurantOrder', orderSchema);

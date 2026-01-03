import apiClient from './axiosInterceptor';
import { API_BASE_URL } from '../lib/api';

export interface PreviewCouponRequest {
  couponCode?: string;
  courseId?: string;
  planId?: string;
  subscriptionId?: string;
  categoryId: number;
  subCategoryId: number;
  orderAmount: number;
  userId: string;
  userEmail: string;
}

export interface PreviewCouponResponse {
  couponApplicable: boolean;
  couponId?: number;
  couponCode?: string;
  discountAmount: number;
  finalAmount: number;
  message: string;
}

export interface ConfirmCouponRequest {
  couponId: number;
  courseId?: string;
  planId?: string;
  subscriptionId?: string;
  userId: string;
  userEmail: string;
  orderAmount: number;
  discountAmount: number;
  finalAmount: number;
}

class CouponApiService {
  private readonly BASE_URL = `${API_BASE_URL}Coupon`;

  /**
   * Preview/validate a coupon for a subscription
   */
  async previewCoupon(data: PreviewCouponRequest): Promise<PreviewCouponResponse> {
    try {
      console.log('Calling preview coupon API with data:', data);
      const response = await apiClient.post(`${this.BASE_URL}/preview`, {
        couponCode: data.couponCode || null,
        courseId: data.courseId || null,
        planId: data.planId || null,
        subscriptionId: data.subscriptionId || null,
        categoryId: data.categoryId,
        subCategoryId: data.subCategoryId,
        orderAmount: data.orderAmount,
        userId: data.userId,
        userEmail: data.userEmail
      });
      
      console.log('Preview coupon API response:', response.data);
      
      return {
        couponApplicable: response.data.couponApplicable || false,
        couponId: response.data.couponId,
        couponCode: response.data.couponCode,
        discountAmount: response.data.discountAmount || 0,
        finalAmount: response.data.finalAmount || data.orderAmount,
        message: response.data.message || ''
      };
    } catch (error: any) {
      console.error('Error previewing coupon:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to validate coupon';
      throw new Error(errorMessage);
    }
  }

  /**
   * Confirm coupon usage after successful payment
   */
  async confirmCoupon(data: ConfirmCouponRequest): Promise<void> {
    try {
      console.log('Calling confirm coupon API with data:', data);
      const response = await apiClient.post(`${this.BASE_URL}/confirm`, {
        couponId: data.couponId,
        courseId: data.courseId || null,
        planId: data.planId || null,
        subscriptionId: data.subscriptionId || null,
        userId: data.userId,
        userEmail: data.userEmail,
        orderAmount: data.orderAmount,
        discountAmount: data.discountAmount,
        finalAmount: data.finalAmount
      });
      
      console.log('Confirm coupon API response:', response.data);
    } catch (error: any) {
      console.error('Error confirming coupon:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to confirm coupon usage';
      throw new Error(errorMessage);
    }
  }
}

// Export singleton instance
export const couponApiService = new CouponApiService();


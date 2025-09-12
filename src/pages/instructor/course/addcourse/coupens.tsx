import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../../../components/ui/alert-dialog';
import { Plus, Edit, Trash2, Calendar,  Eye, EyeOffIcon, FileIcon } from 'lucide-react';
import { Switch } from '../../../../components/ui/switch';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  minPurchase?: number;
  maxDiscount?: number;
}

export default function CourseCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'WELCOME50',
      type: 'percentage',
      value: 50,
      description: 'Welcome discount for new students',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      usageLimit: 100,
      usedCount: 25,
      isActive: true,
      minPurchase: 50,
      maxDiscount: 100
    },
    {
      id: '2',
      code: 'FLASH20',
      type: 'fixed',
      value: 20,
      description: 'Flash sale discount',
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      usageLimit: 50,
      usedCount: 12,
      isActive: false,
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    usageLimit: '',
    minPurchase: '',
    maxDiscount: '',
    isActive: true
  });

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      description: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      usageLimit: '',
      minPurchase: '',
      maxDiscount: '',
      isActive: true
    });
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData: Coupon = {
      id: editingCoupon?.id || Date.now().toString(),
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      usageLimit: Number(formData.usageLimit),
      usedCount: editingCoupon?.usedCount || 0,
      isActive: formData.isActive,
      minPurchase: formData.minPurchase ? Number(formData.minPurchase) : undefined,
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : undefined,
    };

    if (editingCoupon) {
      setCoupons(coupons.map(c => c.id === editingCoupon.id ? couponData : c));
    } else {
      setCoupons([...coupons, couponData]);
    }

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      description: coupon.description,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      usageLimit: coupon.usageLimit.toString(),
      minPurchase: coupon.minPurchase?.toString() || '',
      maxDiscount: coupon.maxDiscount?.toString() || '',
      isActive: coupon.isActive
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  const toggleCouponStatus = (id: string) => {
    setCoupons(coupons.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    // You can add a toast notification here
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code: result });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Coupons</h1>
        <p className="text-gray-600">Create and manage discount coupons for your course</p>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            {coupons.length} Total Coupons
          </Badge>
          <Badge variant="default" className="text-sm">
            {coupons.filter(c => c.isActive).length} Active
          </Badge>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Coupon Form */}
      {showForm && (
        <Card className="mb-8 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Coupon Code */}
                <div className="space-y-2">
                  <label htmlFor="code">Coupon Code *</label>
                  <div className="flex space-x-2">
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="Enter coupon code"
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={generateCouponCode}
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                {/* Discount Type */}
                <div className="space-y-2">
                  <label>Discount Type *</label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Value */}
                <div className="space-y-2">
                  <label htmlFor="value">
                    Discount Value * {formData.type === 'percentage' ? '(%)' : '($)'}
                  </label>
                  <Input
                    id="value"
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '50' : '25.00'}
                    min="0"
                    max={formData.type === 'percentage' ? '100' : undefined}
                    step={formData.type === 'fixed' ? '0.01' : '1'}
                  />
                </div>

                {/* Usage Limit */}
                <div className="space-y-2">
                  <label htmlFor="usageLimit">Usage Limit *</label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="100"
                    min="1"
                  />
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label htmlFor="startDate">Start Date *</label>
                  <div className="relative">
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label htmlFor="endDate">End Date *</label>
                  <div className="relative">
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Min Purchase (Optional) */}
                <div className="space-y-2">
                  <label htmlFor="minPurchase">Minimum Purchase ($)</label>
                  <Input
                    id="minPurchase"
                    type="number"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Max Discount (Optional for percentage) */}
                {formData.type === 'percentage' && (
                  <div className="space-y-2">
                    <label htmlFor="maxDiscount">Maximum Discount ($)</label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="100.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this coupon..."
                  rows={3}
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <label htmlFor="isActive">Active (users can use this coupon)</label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={!formData.code || !formData.value || !formData.usageLimit}
                >
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Coupons List */}
      <div className="grid gap-6">
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Plus className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No coupons created yet</h3>
              <p className="text-gray-600 mb-4">Create your first coupon to start offering discounts</p>
              <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Coupon
              </Button>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id} className={`${!coupon.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <code className="text-lg font-bold bg-gray-100 px-3 py-1 rounded">
                        {coupon.code}
                      </code>
                      <div className="flex items-center space-x-2">
                        <Badge variant={coupon.isActive ? "default" : "secondary"}>
                          {coupon.isActive ? <Eye className="w-3 h-3 mr-1" /> : <EyeOffIcon className="w-3 h-3 mr-1" />}
                          {coupon.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">
                          {coupon.type === 'percentage' ? `${coupon.value}% off` : `${coupon.value} off`}
                        </Badge>
                      </div>
                    </div>

                    {coupon.description && (
                      <p className="text-gray-600 mb-3">{coupon.description}</p>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Valid Period:</span>
                        <p>{formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">Usage:</span>
                        <p>{coupon.usedCount} / {coupon.usageLimit}</p>
                      </div>
                      {coupon.minPurchase && (
                        <div>
                          <span className="font-medium text-gray-500">Min Purchase:</span>
                          <p>${coupon.minPurchase}</p>
                        </div>
                      )}
                      {coupon.maxDiscount && (
                        <div>
                          <span className="font-medium text-gray-500">Max Discount:</span>
                          <p>${coupon.maxDiscount}</p>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Usage Progress</span>
                        <span>{Math.round((coupon.usedCount / coupon.usageLimit) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(coupon.code)}
                      title="Copy coupon code"
                    >
                      <FileIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCouponStatus(coupon.id)}
                      title={coupon.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {coupon.isActive ? <EyeOffIcon className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                      title="Edit coupon"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete the coupon "{coupon.code}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(coupon.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Statistics Summary */}
      {coupons.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Coupon Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{coupons.length}</div>
                <div className="text-sm text-blue-600">Total Coupons</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{coupons.filter(c => c.isActive).length}</div>
                <div className="text-sm text-green-600">Active Coupons</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {coupons.reduce((sum, c) => sum + c.usedCount, 0)}
                </div>
                <div className="text-sm text-purple-600">Total Uses</div>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {coupons.reduce((sum, c) => sum + c.usageLimit, 0)}
                </div>
                <div className="text-sm text-orange-600">Total Capacity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
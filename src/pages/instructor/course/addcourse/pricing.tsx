"use client";
import { useState, useEffect } from "react";
import { savePricingData, getPricingData, CoursePricingData } from "../../../../utils/firebaseCoursePricing";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Checkbox } from "../../../../components/ui/checkbox";
import { X, UserPlus, Globe, Smartphone, Lock, Users } from "lucide-react";

interface Member {
  id: string;
  email: string;
  role: string;
}


interface CourseAccess {
  website: boolean;
  app: boolean;
  private: boolean;
}


// Accept courseId as prop
export default function Pricing({ draftId, onSubmit }: { draftId: string, onSubmit?: any }) {
  const [access, setAccess] = useState<CourseAccess>({
    website: true,
    app: false,
    private: false
  });
  const [pricing, setPricing] = useState<'free' | 'paid'>('free');
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student");
  const [members, setMembers] = useState<Member[]>([]);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAccessChange = (accessType: keyof CourseAccess, checked: boolean) => {
    setAccess(prev => ({
      ...prev,
      [accessType]: checked
    }));
    
    // Clear members if private access is disabled
    if (accessType === 'private' && !checked) {
      setMembers([]);
    }
  };

  const addMember = () => {
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }
    
    // Check if email already exists
    if (members.some(member => member.email === email)) {
      setEmailError("This email is already added");
      return;
    }
    
    const newMember: Member = {
      id: Date.now().toString(),
      email: email,
      role: role
    };
    
    setMembers(prev => [...prev, newMember]);
    setEmail("");
    setEmailError("");
  };

  const removeMember = (memberId: string) => {
    setMembers(prev => prev.filter(member => member.id !== memberId));
  };

  // Load data from Firebase on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getPricingData(draftId);
        if (data) {
          setPricing(data.pricing || 'free');
          setAccess(data.access || { website: true, app: false, private: false });
          setMembers(data.members || []);
        }
      } catch (e) {
        // Optionally handle error
      }
      setLoading(false);
    };
    fetchData();
  }, [draftId]);

  const handleSubmit = async () => {
    if (!access.website && !access.app && !access.private) {
      alert("Please select at least one access option");
      return;
    }
    setIsSubmitting(true);
    try {
      await savePricingData({
        draftId: draftId,
        pricing,
        access,
        members: access.private ? members : [],
      });
      if (onSubmit) onSubmit();
    } catch (e) {
      alert("Failed to save settings. Please try again.");
    }
    setIsSubmitting(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addMember();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-blue-600" />
          Set Access for your Course
        </h3>
        {/* Pricing Selection */}
        <div className="mt-4 mb-2 flex items-center gap-4">
          <label className="font-medium text-gray-700">Pricing:</label>
          <Select value={pricing} onValueChange={v => setPricing(v as 'free' | 'paid')}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* {accessType === "paid" && (
          <div className="mb-2 flex items-center gap-4">
            <label className="font-medium text-gray-700">Price:</label>
            <Input
              type="number"
              min={0}
              step="0.01"
              placeholder="Enter price"
              // value={price}
              // onChange={(e: any) => setPrice(e.target.value)}
              className="w-32"
            />
          </div>
        )} */}
        <p className="text-gray-600 text-sm">Choose how students can access your course content</p>
      </div>

      {/* Access Options */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-4">Access Platforms</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox 
              checked={access.website}
              onCheckedChange={(checked:any) => handleAccessChange('website', checked as boolean)}
            />
            <Globe className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <label className="font-medium text-gray-700 cursor-pointer">Website</label>
              <p className="text-sm text-gray-500">Access through web browser</p>
            </div>
          </div>
          
          {/* <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox 
              checked={access.app}
              onCheckedChange={(checked:any) => handleAccessChange('app', checked as boolean)}
            />
            <Smartphone className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <label className="font-medium text-gray-700 cursor-pointer">Mobile App</label>
              <p className="text-sm text-gray-500">Access through mobile application</p>
            </div>
          </div> */}
          
          <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <Checkbox
              checked={access.private}
              onCheckedChange={(checked:any) => handleAccessChange('private', checked as boolean)}
            />
            <Lock className="h-5 w-5 text-purple-600" />
            <div className="flex-1">
              <label className="font-medium text-gray-700 cursor-pointer">Private Access</label>
              <p className="text-sm text-gray-500">Restrict access to specific members only</p>
            </div>
          </div>
        </div>
      </div>

      {/* Private Access Settings */}
      {access.private && (
        <div className="mb-6 p-4 border border-purple-200 rounded-lg bg-purple-50">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="h-5 w-5 text-purple-600" />
            <h4 className="font-medium text-gray-800">Manage Private Access</h4>
          </div>
          
          {/* Add Member Form */}
          <div className="space-y-3 mb-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="Enter member's email address"
                  value={email}
                  onChange={(e:any) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  onKeyPress={handleKeyPress}
                  className={emailError ? "border-red-500 focus:border-red-500" : ""}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1">{emailError}</p>
                )}
              </div>
              
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={addMember}
                className="px-4"
                disabled={!email.trim()}
              >
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Members List */}
          {members.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-700 text-sm mb-2">
                Added Members ({members.length})
              </h5>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-white rounded border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{member.email}</p>
                      <p className="text-xs text-gray-500 capitalize">{member.role}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMember(member.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-2">Access Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Website Access: <span className="font-medium">{access.website ? 'Enabled' : 'Disabled'}</span></p>
          <p>• App Access: <span className="font-medium">{access.app ? 'Enabled' : 'Disabled'}</span></p>
          <p>• Private Access: <span className="font-medium">{access.private ? `Enabled (${members.length} members)` : 'Disabled'}</span></p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || loading || (!access.website && !access.app && !access.private)}
          className="px-8"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : loading ? (
            'Loading...'
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
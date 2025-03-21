import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/utils/toast';
import { validateContestCode, validatePRN, fetchContestByCode } from '@/utils/contestUtils';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prn: '',
    year: '',
    batch: '',
    contestCode: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const validateForm = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.prn.trim()) {
      newErrors.prn = 'PRN is required';
    } else if (!validatePRN(formData.prn)) {
      newErrors.prn = 'Invalid PRN format';
    }
    
    if (!formData.year) {
      newErrors.year = 'Year is required';
    }
    
    if (!formData.batch.trim()) {
      newErrors.batch = 'Batch is required';
    }
    
    if (!formData.contestCode.trim()) {
      newErrors.contestCode = 'Contest code is required';
    } else if (!(await validateContestCode(formData.contestCode))) {
      newErrors.contestCode = 'Invalid contest code format or contest does not exist';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!(await validateForm())) {
      toast.error("Please fix the errors in the form");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get contest information
      const contestInfo = await fetchContestByCode(formData.contestCode);
      
      // Store registration data and contest info in sessionStorage
      sessionStorage.setItem('contestUser', JSON.stringify(formData));
      sessionStorage.setItem('contestInfo', JSON.stringify(contestInfo));
      
      setIsSubmitting(false);
      toast.success("Registration successful!");
      navigate('/instructions');
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error during registration. Please try again.");
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-100 bg-white">
        <div className="container mx-auto py-4 px-6">
          <div className="flex justify-between items-center">
            <div className="text-xl font-semibold">Arena Contest</div>
          </div>
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6 animate-fade-in">
        <div className="max-w-md w-full">
          <div className="space-y-4 text-center mb-6">
            <h1 className="text-2xl font-bold">Registration</h1>
            <p className="text-muted-foreground">
              Please complete the registration form to participate in the contest.
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-subtle border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={`form-input-highlight ${errors.name ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                />
                {errors.name && <p className="text-contest-red text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email ID</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className={`form-input-highlight ${errors.email ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                />
                {errors.email && <p className="text-contest-red text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="prn">PRN</Label>
                <Input
                  id="prn"
                  name="prn"
                  value={formData.prn}
                  onChange={handleChange}
                  placeholder="Enter your PRN"
                  className={`form-input-highlight ${errors.prn ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                />
                {errors.prn && <p className="text-contest-red text-xs mt-1">{errors.prn}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className={`w-full rounded-md border-gray-200 focus:border-primary/30 focus:ring-2 focus:ring-primary/10 h-10 px-3 py-2 text-sm ${errors.year ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                >
                  <option value="">Select Year</option>
                  <option value="First">First</option>
                  <option value="Second">Second</option>
                  <option value="Third">Third</option>
                  <option value="Fourth">Fourth</option>
                </select>
                {errors.year && <p className="text-contest-red text-xs mt-1">{errors.year}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="batch">Batch</Label>
                <Input
                  id="batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  placeholder="Enter your batch"
                  className={`form-input-highlight ${errors.batch ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                />
                {errors.batch && <p className="text-contest-red text-xs mt-1">{errors.batch}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contestCode">Contest Code</Label>
                <Input
                  id="contestCode"
                  name="contestCode"
                  value={formData.contestCode}
                  onChange={handleChange}
                  placeholder="Format: arenacnst-XXXX"
                  className={`form-input-highlight ${errors.contestCode ? 'border-contest-red/50 focus:border-contest-red/50 focus:ring-contest-red/10' : ''}`}
                />
                {errors.contestCode && <p className="text-contest-red text-xs mt-1">{errors.contestCode}</p>}
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-contest-blue text-white hover:bg-contest-blue/90 transition-colors mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2"></div>
                    <span>Registering...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span>Continue to Instructions</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;


import React, { useState } from 'react';
import { Card, Button, Input, Icon, CustomSelect, CustomDatePicker } from '../components/Common';
import { ViewState, UserRole, Member, EmergencyContact } from '@/types';
import { motion } from 'framer-motion';
import { countyOptions } from '../libs/utils';

interface AuthPageProps {
  onNavigate: (view: ViewState) => void;
  onLogin?: (email: string, pass: string, role: UserRole) => Promise<boolean>;
  onRegister?: (data: any) => Promise<boolean>;
}

export const LoginPage: React.FC<AuthPageProps> = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!onLogin) return setIsLoading(false);

    try {
      const success = await onLogin(email, password, isAdminMode ? 'ADMIN' : 'MEMBER');
      if (!success) {
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        <div className="text-center">
          <div className={`mx-auto size-16 rounded-full flex items-center justify-center mb-4 ${isAdminMode ? 'bg-gray-900' : 'bg-primary/10'}`}>
            <Icon name={isAdminMode ? "admin_panel_settings" : "lock"} className={`text-3xl ${isAdminMode ? 'text-white' : 'text-primary'}`} />
          </div>
          <h2 className="text-3xl font-black text-gray-900">
            {isAdminMode ? 'Admin Portal' : 'Welcome Back'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isAdminMode ? 'Enter your administrator credentials' : 'Sign in to access your ALM account'}
          </p>
        </div>

        <Card className={`p-8 shadow-xl border-t-4 ${isAdminMode ? 'border-gray-900' : 'border-primary'}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              required
              placeholder={isAdminMode ? "admin@alm.org" : "you@example.com"}
              icon="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                icon="lock"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="flex justify-end">
                <button type="button" className="text-sm font-medium text-primary hover:text-primary-hover">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant={'primary'}
              className={`w-full h-12 text-base shadow-lg ${isAdminMode ? 'bg-gray-900 text-white hover:bg-primary/70 shadow-gray-900/20' : 'shadow-primary/20'}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Icon name="progress_activity" className="animate-spin" /> {isAdminMode ? 'Verifying...' : 'Signing in...'}
                </span>
              ) : (isAdminMode ? 'Login as Admin' : 'Sign In')}
            </Button>

            {!isAdminMode && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span className="sr-only">Sign in with Google</span>
                    <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                    </svg>
                  </button>
                  <button type="button" className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span className="sr-only">Sign in with Facebook</span>
                    <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </form>
        </Card>

        <div className="text-center space-y-4">
          {!isAdminMode && (
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => onNavigate('AUTH_REGISTER')}
                className="font-bold text-primary hover:text-primary-hover transition-colors"
              >
                Register now
              </button>
            </p>
          )}

          <button
            onClick={() => setIsAdminMode(!isAdminMode)}
            className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-1 mx-auto"
          >
            {isAdminMode ? (
              <>
                <Icon name="arrow_back" className="text-sm" /> Back to Member Login
              </>
            ) : (
              <>
                Login as Administrator <Icon name="arrow_forward" className="text-sm" />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

interface formDataProps {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  county: string;
  profession: string;
  password: string;
  confirmPassword: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  cell?: string;
  emergencyContact: EmergencyContact
}
interface RegisterPageProps {
  onNavigate: (view: ViewState) => void;
  onRegister?: (data: Omit<Member, "id" | "status" | "membershipId" | "joinDate" | "avatar" | "membershipType" | "paymentStatus" | "nationality">) => Promise<boolean>;
}
export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate, onRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<formDataProps>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    county: '',
    profession: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    cell: '',
    emergencyContact: {
      name: '',
      relation: '',
      phone: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    try {
      if (onRegister) {
        const { confirmPassword, ...data } = formData; // Exclude confirmPassword
        const success = await onRegister({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          county: formData.county,
          occupation: formData.profession,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender as "Male" | "Female" | "Other",
          maritalStatus: formData.maritalStatus as "Single" | "Married" | "Divorced" | "Widowed",
          emergencyContact: formData.emergencyContact,
          cell: formData.cell
        });
        if (!success) setIsLoading(false);
      }
    } catch (error) {

    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl w-full space-y-8 relative z-10"
      >
        <div className="text-center">
          <div className="mx-auto size-16 rounded-full bg-accent/10 flex items-center justify-center mb-4">
            <Icon name="person_add" className="text-3xl text-accent" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">Become a Member</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join the Association of Liberians in Musanze to stay connected and supported.
          </p>
        </div>

        <Card className="p-8 shadow-xl border-t-4 border-accent">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Personal Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="First Name" required placeholder="John" icon="person" name="firstName" value={formData.firstName} onChange={handleChange} />
                <Input label="Last Name" required placeholder="Doe" icon="person" name="lastName" value={formData.lastName} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Email Address" type="email" required placeholder="you@example.com" icon="mail" name="email" value={formData.email} onChange={handleChange} />
                <Input label="Phone Number" type="tel" required placeholder="+250 ..." icon="call" name="phone" value={formData.phone} onChange={handleChange} />

              </div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <CustomSelect label="Gender" options={["Male", "Female", "Other"].map((gender) => ({ label: gender, value: gender }))}
                  value={formData.gender} onChange={(val) => handleSelectChange("gender", val)} />
                <div>
                  <CustomSelect
                    label="County of Origin (Liberia)"
                    options={countyOptions}
                    value={formData.county}
                    onChange={(val) => handleSelectChange("county", val)}
                    placeholder="Select County"
                  />
                </div>
                <CustomDatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dateOfBirth: e
                    })} />
              </div>
            </div>

            {/* Membership Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Membership Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Cell address" placeholder=' ' icon="location_city" name="cell" value={formData.cell} onChange={handleChange} />
                <Input label="Occupation / Profession" placeholder="e.g. Student, Engineer" icon="work" name="profession" value={formData.profession} onChange={handleChange} />
              </div>
            </div>

            <div className='space-y-4'>
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Emergency Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Contact Name" value={formData.emergencyContact?.name} onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact!, name: e.target.value } })} />
                <Input label="Relationship" value={formData.emergencyContact?.relation} onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact!, relation: e.target.value } })} />
                <Input label="Contact Phone" value={formData.emergencyContact?.phone} onChange={e => setFormData({ ...formData, emergencyContact: { ...formData.emergencyContact!, phone: e.target.value } })} />
              </div>
            </div>
            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Account Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Password" type="password" required placeholder="••••••••" icon="lock" name="password" value={formData.password} onChange={handleChange} />
                <Input label="Confirm Password" type="password" required placeholder="••••••••" icon="lock" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to abide by the ALM Constitution and By-Laws. I understand that membership is subject to approval.
                </label>
              </div>
            </div>

            <Button
              type="submit"
              variant="danger"
              className="w-full h-12 text-base shadow-lg shadow-accent/20"
              disabled={isLoading}
            >
              {isLoading ? 'Processing Application...' : 'Submit Application'}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600">
          Already a member?{' '}
          <button
            onClick={() => onNavigate('AUTH_LOGIN')}
            className="font-bold text-accent hover:text-red-700 transition-colors"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
};
